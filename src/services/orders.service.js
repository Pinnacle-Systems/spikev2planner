import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { read, utils } from "xlsx";
import { getOrdersFromErp, importOrders, importProduction, replanOrder } from '../queries/orders.js';
import { fetchProductionDataFromErp } from '../queries/production.js';

const prisma = new PrismaClient()

async function get(req) {
    const { lines, isGetOrdersFromERP, startDate, endDate, isGetProductionDataFromErp } = req.query;
    if (isGetOrdersFromERP) {
        if (!startDate || !endDate) return { statusCode: 1, message: "Start Date and End Date Mandatory...!!!" }
        await getOrdersFromErp(startDate, endDate)
    }
    if (isGetProductionDataFromErp) {
        await fetchProductionDataFromErp()
    }
    let data = await prisma.orders.findMany({
        where: {
            lines: lines ?
                (JSON.parse(lines)
                    ?
                    { some: {} }
                    :
                    { none: {} })
                :
                undefined
        },
        include: {
            Orders: { select: { id: true } },
            PrevOrder: {
                select: {
                    id: true
                }
            },
            lines: {
                include: {
                    learningCurveItems: true,
                    Line: {
                        select: {
                            name: true,
                            unitId: true,
                            Unit: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                }
            }
        }
    });
    const sizeColorWiseDetails = await prisma.$queryRaw`
    select * from ProductionDetails
    `
    const productionDetailsDateWise = await prisma.$queryRaw`
    select DATE_FORMAT(date,'%d-%m-%Y') as date,orderNo,line, sum(qty) as qty 
    from ProductionDetails
    group by date, orderNo, line
    `
    data = data.map(i => {
        let newItem = { ...i };
        newItem['lines'] = newItem['lines'].map(i => ({ ...i, ordersLineId: i.id }))
        let orderDetails = sizeColorWiseDetails.filter(item => item.orderNo === i.orderNo);
        newItem['lineWiseProductionData'] = orderDetails;
        newItem['productionDetailsDateWise'] = productionDetailsDateWise.filter(item => item.orderNo === i.orderNo);
        newItem["productionQty"] = orderDetails.reduce((a, c) => a + parseFloat(c.qty), 0);
        newItem["balanceQty"] = (newItem.quantity - newItem.productionQty)
        newItem["isReplanned"] = i.Orders ? true : false;
        return newItem
    })
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.orders.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    data["OrderSizeColorWiseDetails"] = await prisma.$queryRaw`
    select orders.orderno as orderNo, det.size, det.color, det.qty as qty, coalesce(sum(productionDetails.qty),0) as productionQty, 
    det.qty - coalesce(sum(productionDetails.qty),0) as balanceQty
from OrderSizeColorWiseDetails det
join orders on orders.id = det.ordersId
left join productionDetails on productionDetails.orderno = orders.orderNo and productionDetails.size = det.size and productionDetails.color = det.color
where orders.id = ${id}
group by orders.orderno, det.size, det.color,det.qty
    `
    if (!data) return NoRecordFound("orders");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.orders.findMany({
        where: {
            state: {
                country: {
                    companyId: companyId ? parseInt(companyId) : undefined,
                },
            },
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    code: {
                        contains: searchKey,
                    },
                },
                {
                    state: {
                        name: {
                            contains: searchKey
                        },
                    }
                }
            ],
        },
        select: {
            name: true, code: true, active: true, id: true,
            state: {
                select: {
                    name: true,
                    country: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    })
    return { statusCode: 0, data: data };
}


async function create(body) {
    const { orderNo, buyer, dDate, style, quantity, sam, styleType } = await body
    const data = await prisma.orders.create({
        data: {
            orderNo, buyer, dDate: dDate ? new Date(dDate) : undefined, style, quantity: quantity ? parseInt(quantity) : undefined, sam,
            styleType
        },
    });
    return { statusCode: 0, data };
}

export async function excelImport(req) {
    const { importType } = req.body;
    let file = new Uint8Array(req.file.buffer)
    let workbook = read(file, { type: "array" });
    var sheet_name_list = workbook.SheetNames;
    const importedData = utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    if (importType === "order") {
        await importOrders(importedData)
        return { statusCode: 0 }
    }
    if (importType === "production") {
        await importProduction(importedData)
        return { statusCode: 0 }
    }
}

async function update(id, body) {
    const { orderNo, buyer, dDate, style, quantity, sam, styleType, isReplanOrder } = await body
    const dataFound = await prisma.orders.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("orders");
    if (isReplanOrder) {
        const data = await replanOrder(id)
        return { statusCode: 0, data }
    }
    const data = await prisma.orders.update({
        where: {
            id: parseInt(id),
        },
        data: {
            orderNo, buyer, dDate: dDate ? new Date(dDate) : undefined, style, quantity: quantity ? parseInt(quantity) : undefined, sam, styleType
        },
    })
    return { statusCode: 0, data };
};

async function updateMany(req) {
    const { orders } = await req.body
    await prisma.$transaction(async (tx) => {
        for (let index = 0; index < orders.length; index++) {
            const order = orders[index];
            const data = await tx.orders.findUnique({
                where: {
                    id: parseInt(order.id),
                },
                include: {
                    Orders: { select: { id: true } }
                }
            })
            if (data.Orders) {
                let orderLines = order.lines.filter(i => i.id);
                for (let index = 0; index < orderLines.length; index++) {
                    const orderLine = orderLines[index];
                    await tx.orderLines.update({
                        where: {
                            id: parseInt(orderLine.ordersLineId)
                        },
                        data: {
                            endDate: new Date(orderLine.endDate)
                        }
                    })
                }
            } else {
                await tx.orders.update({
                    where: {
                        id: parseInt(order.id),
                    },
                    data: {
                        lines: {
                            deleteMany: {},
                            create: order.lines.map(line => {
                                return {
                                    lineId: parseInt(line.id), pcs: parseInt(line.pcs), startDate: new Date(line.startDate),
                                    endDate: new Date(line.endDate), days: parseInt(line.days),
                                    learningCurveItems: {
                                        create: (line?.learningCurveItems || []).map(orderLine => ({ percentage: parseFloat(orderLine.percentage || 0) }))
                                    }
                                }
                            }),
                        },
                    }
                })
            }
        }
    })
    return { statusCode: 0, data: "Updated Successfull" };
};

async function remove(id) {
    const data = await prisma.orders.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    updateMany,
    remove
}
