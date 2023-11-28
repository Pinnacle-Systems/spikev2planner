import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { month } = req.query
    let date, firstDay, lastDay;
    if (month) {
        date = new Date(month);
        firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    const data = await prisma.holiday.findMany({
        where: {
            AND: [
                {
                    date: month ? {
                        gte: new Date(firstDay)
                    } : undefined
                },
                {
                    date: month ? {
                        lte: new Date(lastDay)
                    } : undefined
                }
            ]
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.holiday.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("holiday");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.holiday.findMany({
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
    const { description, date } = await body
    const data = await prisma.holiday.create({
        data: {
            description, date: date ? new Date(date) : undefined
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { description } = await body
    const dataFound = await prisma.holiday.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!dataFound) return NoRecordFound("holiday");
    const data = await prisma.holiday.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            description
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.holiday.delete({
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
    remove
}
