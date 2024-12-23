import _ from "lodash";
import prisma from "../models/getPrisma.js";
import { convertToImportFormat } from "../utils/excelDataTransform.js";
import { getConnection } from "../utils/db.connection.js";
import moment from "moment"
import { fetchProductionDataFromErp } from "./production.js";

export async function importOrders(importedData) {
    const headerNames = ["orderno",
        "styleno",
        "buyer",
        "deliverydate",
        "size",
        "color",
        "qty",
        'sam',
        "styletype"
    ]
    const multipleOrderDetails = convertToImportFormat(importedData, headerNames);
    const orderDetails = _.groupBy(multipleOrderDetails, 'orderno');
    const orderDetailsArr = [];
    for (let [key, val] of Object.entries(orderDetails)) {
        const deliveryDate = (val[0]?.deliverydate).split("/").reverse().join("-");
        orderDetailsArr.push({
            orderNo: key,
            styleType: val[0]?.styletype,
            style: val[0]?.styleno,
            buyer: val[0]?.buyer,
            sam: val[0]?.sam,
            dDate: new Date(deliveryDate),
            quantity: val.reduce((a, c) => a + parseInt(c.qty || 0), 0),
            OrderSizeColorWiseDetails: {
                create: val.map(i => ({
                    size: i.size,
                    color: i.color,
                    qty: parseInt(i.qty || 0)
                }))
            }
        })
    }
    await prisma.$transaction(async (tx) => {
        for (let index = 0; index < orderDetailsArr.length; index++) {
            const order = orderDetailsArr[index];
            await tx.orders.create({
                data: order
            })
        }
    })
}

export async function importProduction(importedData) {
    const headerNames = [
        "orderno",
        "size",
        "color",
        "line",
        "qty",
    ]
    const multipleOrderDetails = convertToImportFormat(importedData, headerNames);
    await prisma.productionDetails.createMany({
        data: multipleOrderDetails.map(i => ({
            orderNo: i.orderno,
            size: i.size,
            color: i.color,
            line: i.line,
            qty: parseInt(i.qty)
        }))
    })
}

export async function getOrdersFromErp(startDate, endDate) {
    let connection;
    try {
        const existingOrders = await prisma.$queryRaw`select orderNo from orders`;
        let existingOrderNumbers = existingOrders.map(i => `'${i.orderNo}'`)
        connection = await getConnection();

        let result = await connection.execute(`
            SELECT A.ORDERNO as orderno,A.STYLEREFNO as styleno,A.BUYER as buyer,A.BUYERDELDATE as deliverydate,A.SIZES as "size",
            A.COLOR as color,A.PRODQTY as qty,'' sam ,'' styletype
            FROM ORDERALLOWDET A
            WHERE ${existingOrderNumbers.length > 0 ? `A.ORDERNO not in (${existingOrderNumbers.join(',')}) AND` : ""} A.BUYERDELDATE BETWEEN TO_DATE('${moment(startDate).format('DD-MM-YYYY')}','DD-MM-YYYY') 
            AND TO_DATE('${moment(endDate).format("DD-MM-YYYY")}','DD-MM-YYYY')`);
        let convertedRows = result.rows.map((row) => {
            let newRow = {};
            row.forEach((value, index) => {
                newRow[(result.metaData[index]?.name).toLocaleLowerCase()] = value;
            });
            return newRow;
        })
        await importOrders(convertedRows);
    } catch (error) {
        console.log(error)
    } finally {
        if (connection) {
            connection.close()
        }
    }
}


export async function replanOrder(orderId) {
    let createdOrder;
    await prisma.$transaction(async (tx) => {
        const dataFound = await tx.orders.findUnique({
            where: {
                id: parseInt(orderId)
            },
            include: {
                PrevOrder: {
                    select: {
                        id: true
                    }
                },
                Orders: { select: { id: true } }
            }
        })
        if (dataFound?.Orders) throw { message: "This Order Already Replanned...!!!" }
        await fetchProductionDataFromErp(tx);
        const sizeColorWiseDetails = await tx.$queryRaw`
            select sum(qty) as qty from ProductionDetails WHERE ORDERNO = ${`${dataFound.orderNo}`}
            `
        const productionQty = sizeColorWiseDetails.reduce((a, c) => a + parseFloat(c.qty || 0), 0);
        let balanceQty = dataFound.quantity - productionQty;
        if (balanceQty < 0) throw { message: "Production Aleady Completed...!!!" }
        createdOrder = await tx.orders.create({
            data: {
                orderNo: dataFound.orderNo,
                buyer: dataFound.buyer,
                dDate: dataFound.dDate ? new Date(dataFound.dDate) : undefined,
                style: dataFound.style,
                sam: dataFound.sam,
                styleType: dataFound.styleType,
                quantity: balanceQty,
                prevOrdersId: parseInt(dataFound.id),
                version: dataFound.version + 1
            }
        })
    })
    return createdOrder;
}