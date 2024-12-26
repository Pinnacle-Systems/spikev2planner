import moment from "moment";
import prisma from "../models/getPrisma.js";
import { getConnection, runOracleQuery } from "../utils/db.connection.js";

export async function getProductionDataFromErp(params) {
    let connection;
    try {
        connection = await getConnection();
        let sql = `SELECT A.ORDERNO,D.SIZENAME "size",E.COLORNAME color,F.SHORTCODE line,SUM(B.PRODQTY) productionQty
                    FROM GTGP A JOIN GTGPDET B ON  A.GTGPID=B.GTGPID
                    JOIN GTCOMPMAST C ON C.GTCOMPMASTID=A.COMPCODE
                    JOIN GTSIZEMAST  D ON D.GTSIZEMASTID=B.SIZES
                    JOIN GTCOLORMAST E ON E.GTCOLORMASTID=B.COLOR
                    JOIN GTLINEMAST F ON F.GTLINEMASTID=A.LINENAME
                    WHERE B.PRODQTY >0 AND A.TPROCESSNAME = 'SEWING'
                    group by A.ORDERNO, D.SIZENAME, E.COLORNAME, F.SHORTCODE
                    ORDER BY 1,2,3`
        if (params?.orderNo) {
            sql = `SELECT A.ORDERNO,D.SIZENAME "size",E.COLORNAME color,F.SHORTCODE line,SUM(B.PRODQTY) productionQty
                    FROM GTGP A JOIN GTGPDET B ON  A.GTGPID=B.GTGPID
                    JOIN GTCOMPMAST C ON C.GTCOMPMASTID=A.COMPCODE
                    JOIN GTSIZEMAST  D ON D.GTSIZEMASTID=B.SIZES
                    JOIN GTCOLORMAST E ON E.GTCOLORMASTID=B.COLOR
                    JOIN GTLINEMAST F ON F.GTLINEMASTID=A.LINENAME
                    WHERE B.PRODQTY >0 AND A.TPROCESSNAME = 'SEWING' and A.ORDERNO = '${params.orderNo}' 
                    group by A.ORDERNO, D.SIZENAME, E.COLORNAME, F.SHORTCODE
                    ORDER BY 1,2,3`
        }
        let result = await connection.execute(sql);
        let convertedRows = result.rows.map((row) => {
            let newRow = {};
            row.forEach((value, index) => {
                newRow[(result.metaData[index]?.name).toLocaleLowerCase()] = value;
            });
            return newRow;
        })
        return convertedRows;
    } catch (error) {
        console.log(error)
    } finally {
        if (connection) {
            connection.close()
        }
    }
}
export async function getProductionDataFromErpLineDateWise(params) {
    let connection;
    try {
        connection = await getConnection();
        let sql = `SELECT A.docdate "date",A.ORDERNO,F.SHORTCODE line,SUM(B.PRODQTY) productionQty
                    FROM GTGP A JOIN GTGPDET B ON  A.GTGPID=B.GTGPID
                    JOIN GTCOMPMAST C ON C.GTCOMPMASTID=A.COMPCODE
                    JOIN GTSIZEMAST  D ON D.GTSIZEMASTID=B.SIZES
                    JOIN GTCOLORMAST E ON E.GTCOLORMASTID=B.COLOR
                    JOIN GTLINEMAST F ON F.GTLINEMASTID=A.LINENAME
                    WHERE B.PRODQTY >0 and A.ORDERNO = '${params.orderNo}' AND A.TPROCESSNAME = 'SEWING'
                    group by A.ORDERNO, F.SHORTCODE,A.docdate
                    ORDER BY 1,2,3`
        let result = await connection.execute(sql);
        let convertedRows = result.rows.map((row) => {
            let newRow = {};
            row.forEach((value, index) => {
                newRow[(result.metaData[index]?.name).toLocaleLowerCase()] = value;
            });
            return newRow;
        })
        return convertedRows;
    } catch (error) {
        console.log(error)
    } finally {
        if (connection) {
            connection.close()
        }
    }
}


export async function getProductionQtyLineWise(sizeColorWiseDetails, orderNo) {
    const productionData = await getProductionDataFromErp({ orderNo });
    const getProductionData = (orderNo, size, color) => productionData.filter(prod => prod.orderno == orderNo && prod.size == size && prod.color == color);
    let data = [];
    for (let index = 0; index < sizeColorWiseDetails.length; index++) {
        let sizeColorWiseDetail = sizeColorWiseDetails[index];
        let lineWise = getProductionData(sizeColorWiseDetail.orderNo, sizeColorWiseDetail.size, sizeColorWiseDetail.color);
        for (let i = 0; i < lineWise.length; i++) {
            const line = lineWise[i];
            data.push({
                ...sizeColorWiseDetail, line: line.line,
                productionQty: line.productionqty,
                balanceQty: parseFloat(sizeColorWiseDetail?.qty || 0) - parseFloat(line.productionqty || 0)
            });
        }
    }
    return data
}
export async function getProductionQty(sizeColorWiseDetails, orderNo) {
    const productionData = await getProductionDataFromErp({ orderNo });
    const getProductionData = (orderNo, size, color) => productionData.filter(prod => prod.orderno == orderNo && prod.size == size && prod.color == color).reduce((a, c) => a + parseFloat(c.productionqty), 0);
    for (let index = 0; index < sizeColorWiseDetails.length; index++) {
        let sizeColorWiseDetail = sizeColorWiseDetails[index];
        sizeColorWiseDetails[index]['productionQty'] = getProductionData(sizeColorWiseDetail.orderNo, sizeColorWiseDetail.size, sizeColorWiseDetail.color);
        sizeColorWiseDetails[index]['balanceQty'] = parseFloat(sizeColorWiseDetails[index]['qty'] || 0) - parseFloat(sizeColorWiseDetails[index]['productionQty'] || 0)
    }
    return sizeColorWiseDetails
}



export async function fetchProductionDataFromErp(txObj) {
    const existingOrders = await prisma.orders.findMany({ select: { orderNo: true, dDate: true } });
    if (existingOrders.length == 0) {
        throw { message: "No Existing Orders...!!!" }
    }
    let existingOrderNumbers = existingOrders.map(i => `('${i.orderNo}',TO_DATE('${moment(i.dDate).format("DD-MM-YYYY")}','DD-MM-YYYY'))`).join(',');
    const sql = `
               SELECT TO_CHAR(A.DOCDATE,'yyyy-mm-dd')"date",A.ORDERNO,D.SIZENAME "size",E.COLORNAME COLOR,F.SHORTCODE LINE,SUM(B.PRODQTY) PRODUCTIONQTY,TO_CHAR(AA.DELDATE,'yyyy-mm-dd') "deldate"
FROM GTGP A JOIN GTGPDET B ON  A.GTGPID=B.GTGPID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID=A.COMPCODE
JOIN GTSIZEMAST  D ON D.GTSIZEMASTID=B.SIZES
JOIN GTCOLORMAST E ON E.GTCOLORMASTID=B.COLOR
JOIN GTLINEMAST F ON F.GTLINEMASTID=A.LINENAME
JOIN
(
SELECT MAX(AAA.BUYERDELDATE) DELDATE,AAA.ORDERNO,AAA.COLOR,AAA.SIZES FROM ORDERALLOWDET AAA
GROUP BY AAA.ORDERNO,AAA.COLOR,AAA.SIZES 
) AA ON AA.ORDERNO = A.ORDERNO AND AA.COLOR = E.COLORNAME
AND AA.SIZES = D.SIZENAME
WHERE B.PRODQTY > 0 AND  (A.ORDERNO, AA.DELDATE) IN (${existingOrderNumbers}) AND A.TPROCESSNAME = 'SEWING'
GROUP BY A.ORDERNO, D.SIZENAME, E.COLORNAME, F.SHORTCODE,A.DOCDATE,AA.DELDATE
ORDER BY 1,2,3 
    `;

    const data = await runOracleQuery(sql);
    if (!data) {
        throw { message: "Production Data Sync Failed...!!!" }
    }
    if (txObj) {
        await txObj.productionDetails.deleteMany({});
        await txObj.productionDetails.createMany({
            data: data.map(i => ({
                orderNo: i.orderno, date: new Date(i.date), size: i.size, color: i.color, line: i.line,
                qty: parseInt(i.productionqty),
                deliveryDate: new Date(i.deldate)
            }))
        })
    } else {
        await prisma.$transaction(async (tx) => {
            await tx.productionDetails.deleteMany({});
            await tx.productionDetails.createMany({
                data: data.map(i => ({
                    orderNo: i.orderno, date: new Date(i.date), size: i.size, color: i.color, line: i.line,
                    qty: parseInt(i.productionqty),
                    deliveryDate: new Date(i.deldate)
                }))
            })
        })
    }

}