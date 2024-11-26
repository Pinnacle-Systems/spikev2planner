import prisma from "../models/getPrisma.js";
import { getConnection } from "./db.connection.js";

export async function getOrdersFromErp() {
    let connection;
    try {
        const existingOrders = await prisma.$queryRaw`select orderNo from orders`;
        let existingOrderNumbers = existingOrders.map(i => `'${i.orderNo}'`)
        connection = await getConnection();

        let result = await connection.execute(`
            SELECT A.ORDERNO as orderno,A.STYLEREFNO as styleno,A.BUYER as buyer,A.BUYERDELDATE as deliverydate,A.SIZES as "size",
            A.COLOR as color,A.shipqty as qty,'' sam ,'' styletype
            FROM ORDERALLOWDET A
            WHERE A.ORDERNO not in (${existingOrderNumbers.join(',')}) and rowNum < 3`);
        let convertedRows = result.rows.map((row) => {
            let newRow = {};
            row.forEach((value, index) => {
                newRow[(result.metaData[index]?.name).toLocaleLowerCase()] = value;
            });
            return newRow;
        })
        console.log(convertedRows)
    } catch (error) {
        console.log(error)
    } finally {
        if (connection) {
            connection.close()
        }
    }
}

getOrdersFromErp()