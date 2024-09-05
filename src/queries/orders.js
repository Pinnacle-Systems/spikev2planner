import _ from "lodash";
import prisma from "../models/getPrisma.js";
import { convertToImportFormat } from "../utils/excelDataTransform.js";
import { excelDateToJSDate } from "../utils/helper.js";

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
        orderDetailsArr.push({
            orderNo: key,
            styleType: val[0]?.styletype,
            style: val[0]?.styleno,
            buyer: val[0]?.buyer,
            sam: val[0]?.sam,
            dDate: new Date(excelDateToJSDate(val[0]?.deliverydate)),
            quantity: val.reduce((a, c) => a + parseInt(c.qty), 0),
            OrderSizeColorWiseDetails: {
                create: val.map(i => ({
                    size: i.size,
                    color: i.color,
                    qty: parseInt(i.qty)
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