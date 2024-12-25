import prisma from "../models/getPrisma.js";
import { findWorkingDaysBetweenDates, getCurrentCapacity, getDateFromDateTimeFormatToDisplay } from "../utils/dateHelper.js";
import { runOracleQuery } from "../utils/db.connection.js";
import { getMonthName } from "../utils/helper.js";

export async function getLinesFromERP() {
    return await runOracleQuery("SELECT SHORTCODE as LINENAME FROM GTLINEMAST");
}

export async function getPlannedOrdersReport() {
    const orderLines = await prisma.orderLines.findMany({
        include: {
            learningCurveItems: true,
            Line: true,
            Orders: {
                select: {
                    orderNo: true,
                    dDate: true
                }
            }
        }
    })
    const data = [];
    const holidays = await prisma.holiday.findMany({});
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
            data.push({ date: getDateFromDateTimeFormatToDisplay(date), pcs: allocationQty, month: getMonthName(new Date(date)), year: date.getFullYear(), line: line.Line.name, orderNo: line.Orders.orderNo, deliveryDate: getDateFromDateTimeFormatToDisplay(line.Orders.dDate) });
        }
    }
    return data;
}