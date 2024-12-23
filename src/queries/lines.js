import prisma from "../models/getPrisma.js";
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
        const i = orderLines[index];
        let learningCurveItems = i.learningCurveItems;
        const productionSchedule = [];
        let currentLine = lineObj.Line;
        const workingDays = findWorkingDaysBetweenDates(lineObj.startDate, lineObj.endDate, holidays);
        const currentCapacity = parseInt(getCurrentCapacity(currentLine.efficiency, currentLine.capacity));
        let totalPcs = lineObj.pcs || 0;
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
            productionSchedule.push({ date: workingDays[i], pcs: allocationQty })
        }
    }
}