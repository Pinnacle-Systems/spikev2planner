import _ from "lodash";
import prisma from "../models/getPrisma.js";
import { convertToImportFormat } from "../utils/excelDataTransform.js";
import { getConnection } from "../utils/db.connection.js";
import moment from "moment"
import { fetchProductionDataFromErp } from "./production.js";
import { getDateFromDateTimeFormat } from "../utils/dateHelper.js";

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
    const orderDetails = _.groupBy(multipleOrderDetails, (item) => {
        return `${item['orderno']}--${item['deliverydate']}`;
    });
    const orderDetailsArr = [];
    for (let [key, val] of Object.entries(orderDetails)) {
        let orderNo = key.split("--")[0];
        const deliveryDate = new Date((key.split("--")[1]).split("/").reverse().join("-"));
        orderDetailsArr.push({
            orderNo,
            styleType: val[0]?.styletype,
            style: val[0]?.styleno,
            buyer: val[0]?.buyer,
            sam: val[0]?.sam,
            dDate: deliveryDate,
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
            const data = await tx.orders.findMany({ where: { orderNo: order.orderNo, dDate: order.dDate } });
            if (data.length > 0) continue;
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

        const existingOrders = await prisma.orders.findMany({ select: { orderNo: true, dDate: true } });
        let existingOrderNumbers = existingOrders.map(i => `('${i.orderNo}',TO_DATE('${moment(i.dDate).format("DD-MM-YYYY")}','DD-MM-YYYY'))`).join(',');
        connection = await getConnection();
        let result = await connection.execute(`
           SELECT * FROM (
SELECT A.ORDERNO AS ORDERNO,A.STYLEREFNO AS STYLENO,A.BUYER AS BUYER,TO_CHAR(A.BUYERDELDATE,'yyyy-mm-dd') AS DELIVERYDATE,A.SIZES AS "size",
A.COLOR AS COLOR,
A.PRODQTY,
NVL((
SELECT SUM(BB.PRODQTY) PRODUCTIONQTY
FROM GTGP AA JOIN GTGPDET BB ON  AA.GTGPID=BB.GTGPID
JOIN GTCOMPMAST CC ON CC.GTCOMPMASTID=AA.COMPCODE
JOIN GTSIZEMAST  DD ON DD.GTSIZEMASTID=BB.SIZES
JOIN GTCOLORMAST EE ON EE.GTCOLORMASTID=BB.COLOR
JOIN GTLINEMAST FF ON FF.GTLINEMASTID=AA.LINENAME
WHERE BB.PRODQTY >0 AND AA.ORDERNO = A.ORDERNO AND AA.TPROCESSNAME = 'SEWING' AND DD.SIZENAME = A.SIZES AND EE.COLORNAME = A.COLOR
),0) SEWINGDONE,
A.PRODQTY
-
NVL((
SELECT SUM(BB.PRODQTY) PRODUCTIONQTY
FROM GTGP AA JOIN GTGPDET BB ON  AA.GTGPID=BB.GTGPID
JOIN GTCOMPMAST CC ON CC.GTCOMPMASTID=AA.COMPCODE
JOIN GTSIZEMAST  DD ON DD.GTSIZEMASTID=BB.SIZES
JOIN GTCOLORMAST EE ON EE.GTCOLORMASTID=BB.COLOR
JOIN GTLINEMAST FF ON FF.GTLINEMASTID=AA.LINENAME
WHERE BB.PRODQTY >0 AND AA.ORDERNO = A.ORDERNO AND AA.TPROCESSNAME = 'SEWING' AND DD.SIZENAME = A.SIZES AND EE.COLORNAME = A.COLOR
),0)
AS QTY,  
'' SAM ,'' STYLETYPE
FROM ORDERALLOWDET A
             WHERE  
             ${existingOrderNumbers.length > 0 ? `(A.ORDERNO, A.BUYERDELDATE) NOT IN (${existingOrderNumbers}) AND` : ""} 
             A.BUYERDELDATE BETWEEN TO_DATE('${moment(startDate).format('DD-MM-YYYY')}','DD-MM-YYYY') 
            AND TO_DATE('${moment(endDate).format("DD-MM-YYYY")}','DD-MM-YYYY')
           ) AAA
            WHERE AAA.QTY > 0
            `);
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
            select sum(qty) as qty from ProductionDetails 
            WHERE ORDERNO = ${`${dataFound.orderNo}`} 
            AND DATE_FORMAT(DELIVERYDATE,'%Y-%m-%d') = ${`${getDateFromDateTimeFormat(dataFound.dDate)}`}
            AND DATE_FORMAT(DATE,'%Y-%m-%d') > ${`${getDateFromDateTimeFormat(dataFound.createdAt)}`}
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
    },
        {
            maxWait: 5000, // 5 seconds max wait to connect to prisma
            timeout: 20000, // 20 seconds
        }
    )
    return createdOrder;
}