import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { read, utils } from "xlsx";
import { getOrdersFromErp, importOrders, importProduction } from '../queries/orders.js';
import { getProductionDataFromErpLineDateWise, getProductionQty, getProductionQtyLineWise } from '../queries/production.js';

const prisma = new PrismaClient()

async function get(req) {
    const { lines, isGetOrdersFromERP } = req.query;
    if (isGetOrdersFromERP) {
        await getOrdersFromErp()
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
    // let sizeColorWiseDetails = await prisma.$queryRaw`
    //  select orders.orderno as orderNo, det.size, det.color,sum(det.qty) as qty
    // from OrderSizeColorWiseDetails det
    // join orders on orders.id = det.ordersId
    // group by orders.orderno, det.size, det.color
    // `
    // sizeColorWiseDetails = await getProductionQtyLineWise(sizeColorWiseDetails);
    // data[index]["OrderSizeColorWiseDetails"] = sizeColorWiseDetails.filter(item => item.orderNo === i.orderNo);
    for (let index = 0; index < data.length; index++) {
        const i = data[index];
        data[index]["lineWiseProductionData"] = await getProductionDataFromErpLineDateWise({ orderNo: i.orderNo })
    }
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.orders.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    let sizeColorWiseDetails = await prisma.$queryRaw`
    select orders.orderno as orderNo, det.size, det.color, sum(det.qty) as qty
from OrderSizeColorWiseDetails det
join orders on orders.id = det.ordersId
where orders.orderno = ${data.orderNo}
group by orders.orderno, det.size, det.color
        `
    data["OrderSizeColorWiseDetails"] = await getProductionQty(sizeColorWiseDetails, data.orderNo);
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
    const { orderNo, buyer, dDate, style, quantity, sam, styleType } = await body
    const dataFound = await prisma.orders.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!dataFound) return NoRecordFound("orders");
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
    orders.forEach(async (order) => {
        await prisma.orders.update({
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
