import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { convertToImportFormat } from '../utils/excelDataTransform.js';
import { read, utils } from "xlsx";
import _ from 'lodash';
import { convertDateDisplayFormatToDBFormat, excelDateToJSDate } from '../utils/helper.js';

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
    let file = new Uint8Array(req.file.buffer)
    let workbook = read(file, { type: "array" });
    var sheet_name_list = workbook.SheetNames;
    const importedData = utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    const headerNames = importedData;
    const multipleOrderDetails = convertToImportFormat(importedData, headerNames);
    const orderDetails = _.groupBy(multipleOrderDetails, 'orderno');
    const orderDetailsArr = [];
    for (let [key, val] of Object.entries(orderDetails)) {
        orderDetailsArr.push({
            orderNo: key,
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
    return { statusCode: 0 }
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
                    // connectOrCreate: {
                    //     data:
                    //         order.lines.map(line => {
                    //             return { id: line.id, pcs: parseInt(line.pcs), startDate: new Date(line.startDate), endDate: new Date(line.endDate), days: parseInt(line.days) }

                    //         })
                    // }
                    deleteMany: {},
                    // connectOrCreate:{},
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

    // const dataFound = await prisma.orders.findUnique({
    //     where: {
    //         id: parseInt(id)
    //     },
    // })
    // if (!dataFound) return NoRecordFound("orders");
    // const data = await prisma.orders.update({
    //     where: {
    //         id: parseInt(id),
    //     },
    //     data: {
    //         orderNo, buyer, dDate: dDate ? new Date(dDate) : undefined, style, quantity: quantity ? parseInt(quantity) : undefined, sam, 
    //         lines : lines.map(line => {return {id: line.id, pcs: parseInt(line.pcs), startDate: new Date(line.startDate), endDate: new Date(line.endDate), days: new Date(line.days)}})
    //     },
    // })
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
