import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { getDateArray, getFirstNonHoliday } from '../utils/dateHelper.js';
import { getLinesFromERP, getPlannedOrdersReport } from '../queries/lines.js';

const prisma = new PrismaClient()

async function get(req) {
    const { month, isReport, selectedUnits, startDate, endDate, isGetLinesFromERP, type } = req.query;
    if (type === 'planned') {
        const data = await getPlannedOrdersReport();
        return { statusCode: 0, data }
    }
    if (isGetLinesFromERP) {
        const data = await getLinesFromERP();
        return { statusCode: 0, data }
    }
    if (isReport) {
        const data = await prisma.line.findMany({
            where: {
                unitId: (selectedUnits && (selectedUnits.length > 0)) ? {
                    in: selectedUnits.map(i => parseInt(i))
                } : undefined
            }
        });
        let fromDate = new Date(startDate);
        fromDate.setHours(0, 0, 0, 0);
        let toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 99);
        let reportData = await prisma.orderLines.findMany({
            where: {
                Line: {
                    unitId: (selectedUnits && (selectedUnits.length > 0)) ? {
                        in: selectedUnits.map(i => parseInt(i))
                    } : undefined
                },
            },
            include: {
                learningCurveItems: true,
                Line: true,
                Orders: {
                    select: {
                        orderNo: true,
                        style: true
                    }
                }
            }
        });
        let holidays = await prisma.holiday.findMany({});
        for (let index = 0; index < reportData.length; index++) {
            const i = reportData[index];
            let startDateCalculated = (i["startDate"] < new Date(startDate)) ? startDate : i["startDate"];
            let endDateCalculated = (i["endDate"] > new Date(endDate)) ? endDate : i["endDate"];
            let dateArr = getDateArray(startDateCalculated, endDateCalculated);
            startDateCalculated = getFirstNonHoliday(dateArr, holidays);
            dateArr.sort((a, b) => b - a);
            endDateCalculated = getFirstNonHoliday(dateArr, holidays);
            i['startDate'] = startDateCalculated;
            i['endDate'] = endDateCalculated;
        }
        return { statusCode: 0, data, reportData };
    }
    let date, firstDay, lastDay;
    if (month) {
        date = new Date(month);
        firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    const data = await prisma.line.findMany({
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
        },
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.line.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("line");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.line.findMany({
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
    const data = await prisma.line.create({
        data: {
            description, date: date ? new Date(date) : undefined
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { description } = await body
    const dataFound = await prisma.line.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!dataFound) return NoRecordFound("line");
    const data = await prisma.line.update({
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
    const data = await prisma.line.delete({
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
