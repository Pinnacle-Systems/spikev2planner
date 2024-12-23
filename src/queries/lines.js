import prisma from "../models/getPrisma.js";
import { findWorkingDaysBetweenDates, getCurrentCapacity } from "../utils/dateHelper.js";
import { runOracleQuery } from "../utils/db.connection.js";

export async function getLinesFromERP() {
    return await runOracleQuery("SELECT SHORTCODE as LINENAME FROM GTLINEMAST");
}

export async function getMonthlyWiseReport() {
    const orderLines = await prisma.orderLines.findMany({
        include: {
            learningCurveItems: true,
            Line: true,
            Orders: {
                select: {
                    orderNo: true
                }
            }
        }
    })
    const data = [];
    for (let index = 0; index < orderLines.length; index++) {
        const line = orderLines[index];
        let learningCurveItems = line.learningCurveItems;
        const workingDays = findWorkingDaysBetweenDates(line.startDate, line.endDate, holidays);
        const currentCapacity = parseInt(getCurrentCapacity(line.efficiency, line.capacity));
        let totalPcs = line.pcs || 0;
        let totalProductionSchedulePcs = 0;
        for (let i = 0; i < workingDays.length; i++) {
            let currentEfficiency = (i < (learningCurveItems.length)) ? (learningCurveItems[i]?.percentage || 0) : (learningCurveItems[learningCurveItems.length - 1]?.percentage || 0);
            let currentDatePcs = getCurrentCapacity(parseInt(currentEfficiency), currentCapacity);
            let balanceQty = totalPcs - totalProductionSchedulePcs;
            let allocationQty = 0;
            if (currentDatePcs > balanceQty) {
                allocationQty += balanceQty
            } else {
                allocationQty += currentDatePcs
            }
            totalProductionSchedulePcs += allocationQty;
            let date = new Date(workingDays[i]);
            data.push({ date, pcs: allocationQty, month: date.getMonth() + 1, year: date.getFullYear(), line: line.Line.linename });
        }
    }
    return data;
}