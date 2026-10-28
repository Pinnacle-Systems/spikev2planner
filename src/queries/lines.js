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
                    dDate: true,
                    style: true
                }
            }
        }
    })
    const data = [];
    const holidays = await prisma.holiday.findMany({});
    for (let index = 0; index < orderLines.length; index++) {
        const line = orderLines[index];
        let learningCurveItems = line.learningCurveItems || [];
        const workingDays = findWorkingDaysBetweenDates(line.startDate, line.endDate, holidays);
        const lineCapacity = line.capacity || line.Line?.capacity || 0;
        const defaultEfficiency = line.efficiency || 100;
        let totalPcs = Number(line.pcs || 0);
        let totalProductionSchedulePcs = 0;
        for (let i = 0; i < workingDays.length; i++) {
            const currentEfficiency = learningCurveItems.length > 0
                ? (i < learningCurveItems.length
                    ? parseFloat(learningCurveItems[i]?.percentage || 0)
                    : parseFloat(learningCurveItems[learningCurveItems.length - 1]?.percentage || 0))
                : defaultEfficiency;
            const currentDatePcs = Math.round((currentEfficiency * lineCapacity) / 100);
            const balanceQty = totalPcs - totalProductionSchedulePcs;
            const allocationQty = currentDatePcs > balanceQty
                ? Math.max(0, balanceQty)
                : Math.max(0, currentDatePcs);
            totalProductionSchedulePcs += allocationQty;
            let date = new Date(workingDays[i]);
            data.push({
                date: getDateFromDateTimeFormatToDisplay(date),
                pcs: allocationQty,
                month: getMonthName(new Date(date)),
                year: date.getFullYear(),
                line: line.Line?.name || "",
                orderNo: line.Orders?.orderNo || "",
                style: line.Orders?.style || "",
                deliveryDate: getDateFromDateTimeFormatToDisplay(line.Orders?.dDate)
            });
        }
    }
    return data;
}