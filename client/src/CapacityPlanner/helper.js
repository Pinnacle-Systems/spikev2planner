import moment from "moment";
import { toast } from "react-toastify";
import { STYLE_TYPE_NOT_MATCHING_WARNING_MESSAGE } from "./constants";

export function adjust(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

export const isCurrentOrderLineActive = (orderId, lineId, activeLineOrder) => {
    if (Object.keys(activeLineOrder).length === 0) return false
    return ((parseInt(orderId) === parseInt(activeLineOrder?.orderId)) && (parseInt(lineId) === parseInt(activeLineOrder?.lineId)))
}
export const isCurrentOrderActive = (orderId, activeLineOrder) => {
    return (parseInt(orderId) === parseInt(activeLineOrder?.orderId))
}

export const getTotalPcsInLineOrder = (orders, currentOrder) => {
    let totalPcs = 0;
    const currentUpdateOrderDetails = orders.find(o => parseInt(o.id) === parseInt(currentOrder.id))
    currentUpdateOrderDetails?.lines.forEach(element => {
        totalPcs += parseInt(element.pcs)
    });
    return totalPcs
}

export const getTotalPcsInLineOrderExceptCurrentLine = (orders, currentOrder, currentLine) => {
    let totalPcs = 0;
    const currentUpdateOrderDetails = orders.find(o => parseInt(o.id) === parseInt(currentOrder.id))
    currentUpdateOrderDetails?.lines.filter(line => parseInt(line.id) !== parseInt(currentLine)).forEach(element => {
        totalPcs += parseInt(element.pcs)
    });
    return totalPcs
}

export function getCurrentLine(orders, order, line) {
    const currentOrder = findItem(orders, order.id);
    return currentOrder?.lines ? findItem(currentOrder.lines, line.id) : null
}

export function getBalancePcs(orderQuantity, totalSplitedPcs) {
    return orderQuantity - totalSplitedPcs
}

export const orderAssignment = (orders, setOrders, order, line, pcs, days, startDate, endDate, holidays) => {
    if (!styleTypeMatchingWarningMessage(line, order)) return
    let orderIndex = findItemIndex(orders, order.id);
    const newOrders = structuredClone(orders);
    let learningCurveItems = (newOrders[orderIndex]?.["lines"] || []).find(i => i.id == line.id)?.learningCurveItems || [];
    let currentOrderLine = findItem(newOrders[orderIndex]["lines"], line.id);
    let linesLocal = filterItem(newOrders[orderIndex]["lines"], line.id);
    if (pcs > 0) {
        linesLocal.push(
            {
                ordersLineId: currentOrderLine?.ordersLineId,
                Line: line,
                id: line.id,
                lineId: line.id,
                pcs: pcs,
                startDate,
                endDate,
                days: days,
                learningCurveItems,
                capacity: line.capacity,
                efficiency: line.efficiency
            })
    }
    newOrders[orderIndex]["line"] = [];
    newOrders[orderIndex]["lines"] = linesLocal;
    let ordersInCurrentLine = getOrdersInCurrentLine(order.id, line.id, newOrders);
    const currentOrderInOrders = findItem(newOrders, order.id);
    const matchingOrdersList = ordersInCurrentLine.map((loopOrder) => {
        const matchingDays = matchingDatesbetweenOrders(currentOrderInOrders, loopOrder, line);
        if (matchingDays !== 0) {
            let currentOrderCurrentLine = findItem(loopOrder.lines, line.id);
            let startDate = new Date(endDate)
            startDate.setDate(startDate.getDate() + 1);
            let loopOrderDays = findDays(currentOrderCurrentLine.pcs || 0, currentOrderCurrentLine);
            let loopOrderendDate = findEndDate(startDate, loopOrderDays, holidays);
            orderAssignment(newOrders, setOrders, loopOrder, line, currentOrderCurrentLine.pcs, loopOrderDays, startDate, loopOrderendDate, holidays)
        }
        return matchingDays
    })
    if (!matchingOrdersList.some(item => item > 0)) {
        setOrders(newOrders);
    }
}

function getOrdersInCurrentLine(orderId, lineId, orders) {
    let ordersIncurrentLine = []
    orders.filter(order => parseInt(order.id) !== parseInt(orderId)).forEach(order => {
        order.lines.filter(line => parseInt(line.id) === parseInt(lineId)).forEach(line => ordersIncurrentLine.push(order))
    });
    return ordersIncurrentLine
}

function filterItem(itemArray, itemId) {
    return itemArray.filter(item => parseInt(item.id) !== parseInt(itemId))
}

export const getDateFromDateTimeFormat = (date) => {
    if (!date) return "";
    if (date instanceof Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    return moment.utc(date).format("YYYY-MM-DD");
};
export const getYearMonthFromDateTimeFormat = (date) => moment.utc(date).format("YYYY-MM");
export const getYearFromDateTimeFormat = (date) => moment.utc(date).format("YYYY");
export const getDateFromDateTimeFormatToDisplay = (date) => moment.utc(date).format("DD-MM-YYYY");


function matchingDatesbetweenOrders(currentOrder, looporder, line) {
    let currentOrderCurrentLine = currentOrder.lines.find(l => parseInt(l.id) === parseInt(line.id))
    let loopOrderCurrentLine = looporder.lines.find(l => parseInt(l.id) === parseInt(line.id))
    const currentOrderDates = getDateArray(new Date(currentOrderCurrentLine.startDate), new Date(currentOrderCurrentLine.endDate)).map(date => getDateFromDateTimeFormat(date));
    let loopOrderDates = getDateArray(new Date(loopOrderCurrentLine.startDate), new Date(loopOrderCurrentLine.endDate)).map(date => getDateFromDateTimeFormat(date));
    let matchingDates = currentOrderDates.filter((date) => loopOrderDates.includes(date));
    return matchingDates.length
}

export const getEndDate = (startDate, days) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1)
    return endDate
}

export const findDays = (pcs, line) => {
    const learningCurveItems = line?.learningCurveItems || [];
    if (learningCurveItems.length === 0) return 0;
    let days = 0;
    let allocatablePcs = 0;
    for (let i = 0; i < learningCurveItems.length; i++) {
        allocatablePcs += getCurrentCapacity(parseInt(learningCurveItems[i]?.percentage || 0), line.capacity);
        days++;
    }
    days += Math.ceil((pcs - allocatablePcs) / getCurrentCapacity(parseInt(learningCurveItems[learningCurveItems.length - 1]?.percentage), line.capacity));
    return days
}
export const findPcs = (targetDays, line) => {
    const learningCurveItems = line?.learningCurveItems || [];
    if (learningCurveItems.length === 0) return 0;
    let days = 0;
    let allocatablePcs = 0;
    for (let i = 0; i < learningCurveItems.length; i++) {
        allocatablePcs += getCurrentCapacity(parseInt(learningCurveItems[i]?.percentage || 0), line.capacity);
        days++;
    }
    return allocatablePcs
}

export function getCurrentCapacity(efficiency, capacity) {
    return (parseInt(efficiency) * parseInt(capacity)) / 100;
}

export function endDateLoopFinder(startDate, endDate, holidays) {
    let nationalDays = 0;
    let localStartDate = new Date(startDate);
    let localEndDate = new Date(endDate);
    while (findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays) > nationalDays) {
        nationalDays = findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays)
        localEndDate.setDate(new Date(endDate).getDate() + nationalDays)
    }
    return localEndDate
}

export function findEndDate(startDate, days, holidays) {
    let localStartDate = new Date(startDate);
    let localEndDate = new Date(startDate);
    localEndDate.setDate(localEndDate.getDate() + (days - 1));
    let nationalDays = findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays)
    if (nationalDays === 0) {
        return localEndDate
    }
    localEndDate.setDate(localEndDate.getDate() + 1)
    return findEndDate(localEndDate, nationalDays, holidays);
}


const findItem = (itemArray, itemId) => {
    return itemArray.find(item => parseInt(item.id) === parseInt(itemId))
}

const findItemIndex = (itemArray, itemId) => {
    return itemArray.findIndex(item => parseInt(item.id) === parseInt(itemId))
}
export function findNationalHolidaysBetweenDates(start, end, holidays) {
    const allDates = getDateArray(start, end);
    return allDates.filter(date => isNationalHoliday(date, holidays)).length
}



export function findSundaysBetweenDates(start, end) {
    const allDates = getDateArray(start, end);
    return allDates.filter(date => isSunday(date)).length
}

export function isSameDay(d1, d2) {
    return getDateFromDateTimeFormat(d1) === getDateFromDateTimeFormat(d2);
}
export function isDateBetweenDates(d1, d2, findDate) {
    let startDate = new Date(d1);
    let endDate = new Date(d2);
    let findingDate = new Date(findDate);
    if (isSameDay(findingDate, startDate) || isSameDay(findingDate, endDate)) return true
    return (startDate < findingDate) && (findingDate < endDate)
}

export const getDateArray = function (start, end) {
    let arr = [];
    let dt = new Date(start);
    end = new Date(end);
    end.setHours(23, 59, 59, 99)
    while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
}
export function findHolidaysBetweenDates(start, end, holidays) {
    const allDates = getDateArray(start, end);
    return allDates.filter(date => isHoliday(date, holidays)).length
}

export function findWorkingDaysBetweenDates(start, end, holidays) {
    const allDates = getDateArray(start, end);
    return allDates.filter(date => !isNationalHoliday(date, holidays))
}

export function isSunday(date) {
    return new Date(date).getDay() === 0
}

export function isNationalHoliday(date, holidays) {
    return isSunday(date) || isHoliday(date, holidays)
}

export function isHoliday(date, holidays) {
    return holidays.find(holiday => isSameDay(holiday.date, date))
}

export function arrayCounter(arr) {
    const counts = {};
    for (const num of arr) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    return counts
}

export function getWeekDays(currentMonthDays) {
    return Object.keys(arrayCounter(currentMonthDays.map(date => moment.utc(date).format('W'))))
}

export function sortWeekDaysIfLastWeek(currentMonthDays) {
    let weekArray = getWeekDays(currentMonthDays)
    if (weekArray.includes("52") && weekArray.includes("1")) {
        weekArray = [...weekArray.filter(week => parseInt(week) >= 42), ...weekArray.filter(week => parseInt(week) >= 1 && parseInt(week) <= 10)]
        weekArray = [...new Set(weekArray)]
    }
    return weekArray
}

export const getWeeksInMonth = (month) => {
    let dateObj = new Date(month);
    const currentYear = dateObj.getFullYear();
    const currentMonth = dateObj.getMonth();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const allDays = getDateArray(firstDay, lastDay);

    const weekKeys = sortWeekDaysIfLastWeek(allDays);
    return weekKeys.map((weekKey, index) => {
        const daysInWeek = allDays.filter(d => moment.utc(d).format('W') === weekKey);
        const startDay = new Date(daysInWeek[0]).getDate();
        const endDay = new Date(daysInWeek[daysInWeek.length - 1]).getDate();
        const monthShort = moment.utc(daysInWeek[0]).format('MMM');
        return {
            weekKey,
            index,
            label: `Week ${index + 1}: ${monthShort} ${startDay}–${endDay} (W${weekKey})`,
            shortLabel: `W${weekKey} (${startDay}–${endDay})`,
            days: daysInWeek,
            startDate: daysInWeek[0],
            endDate: daysInWeek[daysInWeek.length - 1]
        };
    });
};

export function styleTypeMatchingWarningMessage(line, order) {
    console.log({
        line,
        order
    }, "styleTypeMatchingWarningMessage")
    if (line?.styleType !== order?.styleType) {
        toast.warning(STYLE_TYPE_NOT_MATCHING_WARNING_MESSAGE)
        return false
    }
    return true
}

export const isDateInPreviousWeek = (date) => {
    if (!date) return false;
    const startOfCurrentWeek = moment().startOf('isoWeek').format('YYYY-MM-DD');
    const targetDate = getDateFromDateTimeFormat(date);
    return moment(targetDate).isBefore(startOfCurrentWeek, 'day');
};

export const getDaysUntilDelivery = (dDate, fromDate = null) => {
    if (!dDate) return null;
    const delivery = moment.utc(dDate).startOf('day');
    const baseDate = fromDate ? moment.utc(fromDate).startOf('day') : moment().startOf('day');
    return delivery.diff(baseDate, 'days');
};