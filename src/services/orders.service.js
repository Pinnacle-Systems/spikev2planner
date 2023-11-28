import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

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
