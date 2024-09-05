import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { read, utils } from "xlsx";
import { importOrders, importProduction } from '../queries/orders.js';

const prisma = new PrismaClient()

async function get(req) {
    const { lines } = req.query;
    // console.log("lines", typeof (JSON.parse(lines)));
    const data = await prisma.orders.findMany({
        where: {
            lines: lines ?
                (JSON.parse(lines)
                    ?
                    { some: {} }
                    :
                    { none: {} })
                :
                undefined
        }
        ,
        include: {
            // lines: true
            lines: {
                include: {
                    Line: {
                        select: {
                            name: true,
                            Unit: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.orders.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            OrderSizeColorWiseDetails: true
        }
    })
    data["OrderSizeColorWiseDetails"] = await prisma.$queryRaw`
    select orders.orderno, det.size, det.color, sum(det.qty) as qty, sum(productionDetails.qty) as productionQty, sum(det.qty) - sum(productionDetails.qty) as balanceQty
from OrderSizeColorWiseDetails det
join orders on orders.id = det.ordersId
left join productionDetails on productionDetails.orderno = orders.orderNo and productionDetails.size = det.size and productionDetails.color = det.color
where orders.orderno = ${data.orderNo}
group by orders.orderno, det.size, det.color
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
    const { orderNo, buyer, dDate, style, quantity, sam } = await body
    const data = await prisma.orders.create({
        data: {
            orderNo, buyer, dDate: dDate ? new Date(dDate) : undefined, style, quantity: quantity ? parseInt(quantity) : undefined, sam
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
    const { orderNo, buyer, dDate, style, quantity, sam } = await body
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
            orderNo, buyer, dDate: dDate ? new Date(dDate) : undefined, style, quantity: quantity ? parseInt(quantity) : undefined, sam,
        },
    })
    return { statusCode: 0, data };
};

async function updateMany(req) {
    const { orders } = await req.body
    orders.forEach(async (order) => {
        const data = await prisma.orders.update({
            where: {
                id: parseInt(order.id),
            },
            data: {
                lines: {
                    deleteMany: {},
                    createMany: {
                        data:
                            order.lines.map(line => {
                                return { id: line.id, pcs: parseInt(line.pcs), startDate: new Date(line.startDate), endDate: new Date(line.endDate), days: parseInt(line.days) }

                            })
                    }
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
