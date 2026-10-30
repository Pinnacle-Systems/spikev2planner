import _ from "lodash";
import prisma from "../models/getPrisma.js";
import { convertToImportFormat } from "../utils/excelDataTransform.js";
import { getConnection } from "../utils/db.connection.js";
import moment from "moment"
import { fetchProductionDataFromErp } from "./production.js";
import { getDateFromDateTimeFormat } from "../utils/dateHelper.js";

export async function importOrders(importedData) {
    let connection;
    connection = await getConnection();

    const headerNames = ["orderno",
        "styleno",
        "buyer",
        "deliverydate",
        "size",
        "color",
        "qty",
        'sam',
        "styletype",
        "styleitem"
    ]
    const multipleOrderDetails = convertToImportFormat(importedData, headerNames);
    console.log(multipleOrderDetails, "multipleOrderDetails")
    const orderDetails = _.groupBy(multipleOrderDetails, (item) => {
        return `${item['orderno']}--${item['styleitem'] || ''}--${item['deliverydate']}`;
    });
    const orderDetailsArr = [];
    for (let [key, val] of Object.entries(orderDetails)) {
        const [orderNo, styleItem, rawDeliveryDate] = key.split("--");
        const deliveryDate = rawDeliveryDate
            ? new Date(rawDeliveryDate.split("/").reverse().join("-"))
            : new Date();

        orderDetailsArr.push({
            orderNo,
            styleType: val[0]?.styletype,
            style: val[0]?.styleno,
            styleItem: styleItem || val[0]?.styleitem,
            buyer: val[0]?.buyer,
            sam: val[0]?.sam,
            dDate: deliveryDate,
            quantity: val.reduce((a, c) => a + parseInt(c.qty || 0), 0),
            erpQty: (val.reduce((a, c) => a + parseInt(c.qty || 0), 0)).toString(),
            prevQuantity: val.reduce((a, c) => a + parseInt(c.qty || 0), 0),
            OrderSizeColorWiseDetails: {
                create: val.map(i => ({
                    size: i.size,
                    color: i.color,
                    qty: parseInt(i.qty || 0)
                }))
            }
        });
    }

    let existingOrders = [];

    await prisma.$transaction(async (tx) => {
        for (let index = 0; index < orderDetailsArr.length; index++) {
            const order = orderDetailsArr[index];
            existingOrders = await tx.orders.findMany({
                where: {
                    orderNo: order.orderNo,
                    styleItem: order.styleItem || null
                },
                include: {
                    lines: true
                }
            });

            if (existingOrders.length === 0) {
                // Brand new order -> create
                await tx.orders.create({
                    data: order
                });
            } else {
                // Existing order found -> safely update details while preserving schedule
                for (const existing of existingOrders) {
                    const isAllocated = (existing.lines || []).length > 0;

                    if (!isAllocated) {
                        // Unallocated: update all details & size/color breakdown safely
                        await tx.orders.update({
                            where: { id: existing.id },
                            data: {
                                dDate: order.dDate,
                                // style: order.style,
                                // styleType: order.styleType,
                                // buyer: order.buyer,
                                // sam: order.sam,
                                quantity: order.quantity,
                                prevQuantity: existing.version === 1 ? existing.quantity : order.quantity,
                                erpQty: String(order.quantity),
                                version: (existing.version || 1) + 1,
                                OrderSizeColorWiseDetails: {
                                    deleteMany: {},
                                    create: order.OrderSizeColorWiseDetails.create
                                },
                                status: "AMANDMENT"

                            }
                        });
                    } else {
                        // Already allocated: update master quantity & details without breaking lines schedule
                        await tx.orders.update({
                            where: { id: existing.id },
                            data: {
                                // quantity: order.quantity,
                                // dDate: order.dDate,
                                // buyer: order.buyer,
                                // sam: order.sam,
                                quantity: order.quantity,
                                prevQuantity: existing.version === 1 ? existing.quantity : order.quantity,
                                erpQty: String(order.quantity),
                                version: (existing.version || 1) + 1,
                                erpQty: String(order.quantity),
                                OrderSizeColorWiseDetails: {
                                    deleteMany: {},
                                    create: order.OrderSizeColorWiseDetails.create
                                },
                                status: "AMANDMENT"
                            }
                        });
                    }
                }
            }
        }
    })

    console.log(existingOrders, "existingOrders")

    if (existingOrders.length === 0) {
        try {
            const sqlQuery = `
        INSERT INTO GTNORDERENTRYLP
            (ORDERNO, COLOR, STYLENAME, SIZES, QTY)
        VALUES
            (:b1, :b2, :b3, :b4, :b5)
    `;

            for (const order of importedData) {
                await connection.execute(sqlQuery, {
                    b1: order.orderno,
                    b2: order.color,
                    b3: order.styleitem,
                    b4: order.size,
                    b5: order.qty
                });
            }

            await connection.commit();
            console.log("All orders saved successfully");

        } catch (error) {
            console.error("Error saving orders:", error.message);
            await connection.rollback();

        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    if (existingOrders.length && existingOrders.length !== 0) {
        try {
            const sqlQuery = `
        UPDATE GTNORDERENTRYLP
        SET QTY = :b1
        WHERE ORDERNO = :b2
          AND COLOR = :b3
          AND STYLENAME = :b4
          AND SIZES = :b5
    `;

            for (const order of importedData) {
                await connection.execute(sqlQuery, {
                    b1: order.qty,
                    b2: order.orderno,
                    b3: order.color,
                    b4: order.styleitem,
                    b5: order.size
                });
            }

            await connection.commit();

            console.log("All orders updated successfully");

        } catch (error) {
            console.error("Error updating orders:", error.message);

            await connection.rollback();

        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }



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

        let sql;

        //         sql = `
        // SELECT * FROM (
        // SELECT A.ORDERNO AS ORDERNO,A.STYLEREFNO AS STYLENO, A.STYLEITEM,A.BUYER AS BUYER,TO_CHAR(A.BUYERDELDATE,'yyyy-mm-dd') AS DELIVERYDATE,A.SIZES AS "size",
        // A.COLOR AS COLOR,
        // A.PRODQTY,
        // NVL((
        // SELECT SUM(BB.PRODQTY) PRODUCTIONQTY
        // FROM GTGINPROD AA JOIN GTGINPRODDET BB ON  AA.GTGINPRODID=BB.GTGINPRODID
        // JOIN GTGINPRODSUBDET GG ON GG.GTGINPRODID=AA.GTGINPRODID AND BB.GTGINPRODDETID=GG.GTGINPRODDETID
        // JOIN GTCOMPMAST CC ON CC.GTCOMPMASTID=AA.COMPCODE
        // JOIN GTSIZEMAST  DD ON DD.SIZENAME =GG.SIZES
        // JOIN GTCOLORMAST EE ON EE.GTCOLORMASTID=GG.COLOR1
        // JOIN GTLINEMAST FF ON FF.GTLINEMASTID=GG.LINENO
        // JOIN GTPROCESSMAST HH ON HH.GTPROCESSMASTID=AA.PREVPROCESS
        // WHERE BB.PRODQTY >0 AND BB.ORDERNO = A.ORDERNO AND HH.PROCESSNAME = 'SEWING' AND DD.SIZENAME = A.SIZES AND EE.COLORNAME = A.COLOR
        // ),0) SEWINGDONE,
        // A.PRODQTY
        // -
        // NVL((
        // SELECT SUM(BB.PRODQTY) PRODUCTIONQTY
        // FROM GTGINPROD AA JOIN GTGINPRODDET BB ON  AA.GTGINPRODID=BB.GTGINPRODID
        // JOIN GTGINPRODSUBDET GG ON GG.GTGINPRODID=AA.GTGINPRODID AND BB.GTGINPRODDETID=GG.GTGINPRODDETID
        // JOIN GTCOMPMAST CC ON CC.GTCOMPMASTID=AA.COMPCODE
        // JOIN GTSIZEMAST  DD ON DD.SIZENAME=GG.SIZES
        // JOIN GTCOLORMAST EE ON EE.GTCOLORMASTID=GG.COLOR1
        // JOIN GTLINEMAST FF ON FF.GTLINEMASTID=GG.LINENO
        // JOIN GTPROCESSMAST HH ON HH.GTPROCESSMASTID=AA.PREVPROCESS
        // WHERE BB.PRODQTY >0 AND BB.ORDERNO = A.ORDERNO AND HH.PROCESSNAME = 'SEWING' AND DD.SIZENAME = A.SIZES AND EE.COLORNAME = A.COLOR
        // ),0)
        // AS QTY,  
        // '' SAM ,'' STYLETYPE
        // FROM ORDERALLOWDET A
        //              WHERE  
        //              ${existingOrderNumbers.length > 0 ? `(A.ORDERNO, A.BUYERDELDATE) NOT IN (${existingOrderNumbers}) AND` : ""} 
        //              A.BUYERDELDATE BETWEEN TO_DATE('${moment(startDate).format('DD-MM-YYYY')}','DD-MM-YYYY') 
        //             AND TO_DATE('${moment(endDate).format("DD-MM-YYYY")}','DD-MM-YYYY') AND
        //          A.COMPCODE = 'SPK'
        //            ) AAA
        //             WHERE AAA.QTY > 0
        // `


        sql = `
SELECT * FROM (
SELECT A.ORDERNO AS ORDERNO,A.STYLEREFNO AS STYLENO, A.STYLEITEM,A.BUYER AS BUYER,TO_CHAR(A.BUYERDELDATE,'yyyy-mm-dd') AS DELIVERYDATE,A.SIZES AS "size",
A.COLOR AS COLOR,A.STATUS,
A.PRODQTY,
NVL((
SELECT SUM(BB.PRODQTY) PRODUCTIONQTY
FROM GTGINPROD AA JOIN GTGINPRODDET BB ON  AA.GTGINPRODID=BB.GTGINPRODID
JOIN GTGINPRODSUBDET GG ON GG.GTGINPRODID=AA.GTGINPRODID AND BB.GTGINPRODDETID=GG.GTGINPRODDETID
JOIN GTCOMPMAST CC ON CC.GTCOMPMASTID=AA.COMPCODE
JOIN GTSIZEMAST  DD ON DD.SIZENAME =GG.SIZES
JOIN GTCOLORMAST EE ON EE.GTCOLORMASTID=GG.COLOR1
JOIN GTLINEMAST FF ON FF.GTLINEMASTID=GG.LINENO
JOIN GTPROCESSMAST HH ON HH.GTPROCESSMASTID=AA.PREVPROCESS
WHERE BB.PRODQTY >0 AND BB.ORDERNO = A.ORDERNO AND HH.PROCESSNAME = 'SEWING' AND DD.SIZENAME = A.SIZES AND EE.COLORNAME = A.COLOR
),0) SEWINGDONE,
A.PRODQTY
-
NVL((
SELECT SUM(BB.PRODQTY) PRODUCTIONQTY
FROM GTGINPROD AA JOIN GTGINPRODDET BB ON  AA.GTGINPRODID=BB.GTGINPRODID
JOIN GTGINPRODSUBDET GG ON GG.GTGINPRODID=AA.GTGINPRODID AND BB.GTGINPRODDETID=GG.GTGINPRODDETID
JOIN GTCOMPMAST CC ON CC.GTCOMPMASTID=AA.COMPCODE
JOIN GTSIZEMAST  DD ON DD.SIZENAME=GG.SIZES
JOIN GTCOLORMAST EE ON EE.GTCOLORMASTID=GG.COLOR1
JOIN GTLINEMAST FF ON FF.GTLINEMASTID=GG.LINENO
JOIN GTPROCESSMAST HH ON HH.GTPROCESSMASTID=AA.PREVPROCESS
WHERE BB.PRODQTY >0 AND BB.ORDERNO = A.ORDERNO AND HH.PROCESSNAME = 'SEWING' AND DD.SIZENAME = A.SIZES AND EE.COLORNAME = A.COLOR
),0)
AS QTY,  
'' SAM ,'' STYLETYPE
FROM ORDERALLOWDETLP A
             WHERE  
            A.STATUS IS NULL AND
             A.BUYERDELDATE BETWEEN TO_DATE('${moment(startDate).format('DD-MM-YYYY')}','DD-MM-YYYY') 
            AND TO_DATE('${moment(endDate).format("DD-MM-YYYY")}','DD-MM-YYYY') AND
         A.COMPCODE = 'SPK'
           ) AAA
            WHERE AAA.QTY > 0
`
        console.log(sql, "sql for get order")
        let result = await connection.execute(sql);
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