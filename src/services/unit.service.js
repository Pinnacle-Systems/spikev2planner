import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { exclude } from '../utils/helper.js';

const prisma = new PrismaClient()

async function get(req) {
    const data = await prisma.unit.findMany();
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.unit.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            line: true
        }
    })
    if (!data) return NoRecordFound("unit");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.unit.findMany({
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

function convertLineIntoDbFormat(line) {
    let newLine = {};
    newLine["name"] = line["name"];
    newLine["styleType"] = line["styleType"];
    newLine["inCharge"] = line["inCharge"];
    newLine["capacity"] = parseInt(line["capacity"]);
    newLine["efficiency"] = parseInt(line["efficiency"]);
    return newLine
}

async function create(body) {
    const { name, location, lines } = await body
    const data = await prisma.unit.create({
        data: {
            name,
            location,
            line: {
                createMany: {
                    data: lines.map(line => {
                        return convertLineIntoDbFormat(line)
                    })
                }
            }
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, location, lines } = await body
    const dataFound = await prisma.unit.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!dataFound) return NoRecordFound("unit");

    const data = await prisma.unit.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name,
            location,
        },
    })
    lines.forEach(async (l) => {
        let updatingRecord = await prisma.line.findUnique({
            where: {
                id: l.id ? parseInt(l.id) : 0
            }
        })
        if (updatingRecord) {
            await prisma.line.update({
                where: {
                    id: parseInt(l.id)
                },
                data: convertLineIntoDbFormat(l)
            })
        } else {
            await prisma.line.create({
                data: {
                    unitId: parseInt(id),
                    ...convertLineIntoDbFormat(l)
                }
            })
        }
    })

    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.unit.delete({
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
