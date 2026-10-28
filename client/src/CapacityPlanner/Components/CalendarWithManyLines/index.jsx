// import React, { useState, useEffect, useContext } from 'react'
// import { getDateArray, getDateFromDateTimeFormat, weekday, isSameDay, arrayCounter, getMonthYearFromDateTimeFormat } from '../../../utils/helper';
// import OrderItem from '../orderpanel/OrderItem';
// import moment from 'moment';
// import LineItem from '../Line/LineItem';
// import { NATIONAL_HOLIDAY_COLOR, SUNDAY_COLOR } from '../../../Constants/colors';

// import { CapacityPlannerContext } from '../../CapacityPlanner';
// import { isHoliday, isSunday, isNationalHoliday } from './helper';
// import { sortWeekDaysIfLastWeek, } from '../../helper';

// const Calendar = () => {
//     const {
//         setLineEntryConformation,
//         orders,
//         month, holidays,
//         setCurrentOrder,
//         setCurrentLine,
//         setCurrentDate,
//         lines,
//         manualSelect, setPreviousOrders, productionMode,
//     } = useContext(CapacityPlannerContext)

//     const [currentMonthDays, setCurrentMonthDays] = useState([]);

//     useEffect(() => {
//         let startDate = new Date();
//         let endDate = new Date();
//         const currentYear = new Date(month).getFullYear();
//         const currentMonth = new Date(month).getMonth();
//         startDate.setFullYear(currentYear, currentMonth, 1);
//         endDate.setFullYear(currentYear, currentMonth + 1, 0);
//         setCurrentMonthDays(getDateArray(startDate, endDate));
//     }, [month])

//     async function drop(ev, date, line) {
//         ev.preventDefault();
//         await setCurrentOrder(JSON.parse(ev.dataTransfer.getData("order")));
//         await setCurrentLine(line);
//         await setCurrentDate(date);
//         await setLineEntryConformation(true);
//         setPreviousOrders(orders);
//     }

//     const findOrderHasCurrentDate = (order, date, lineObj) => {
//         if (!(date || lineObj)) return
//         const line = order.lines.find(lineItem => parseInt(lineItem.id) === parseInt(lineObj.id))
//         if (line) {
//             let lineOrderDates = getDateArray(line.startDate, line.endDate)
//             if (lineOrderDates.some(d => isSameDay(new Date(d), new Date(date)))) {
//                 return true
//             }
//         }
//     }

//     const getOrderIfOrderPlacedInCurrentDate = (date, line) => {
//         let orderOnDate = orders.find(order => {
//             return findOrderHasCurrentDate(order, date, line)
//         })
//         return orderOnDate
//     }

//     const onDragOver = (e) => {
//         e.preventDefault();
//     }

//     const onDragLeave = (e, date, line) => {
//         e.preventDefault();
//     }

//     const orderDaysInCurrentMonth = (date, line, order) => {
//         const currentMonth = getMonthYearFromDateTimeFormat(date);
//         let currentLineObj = order["lines"].find(item => parseInt(item.id) === parseInt(line.id))
//         return currentLineObj ? getDateArray(currentLineObj.startDate, currentLineObj.endDate).filter(date => getMonthYearFromDateTimeFormat(date) === currentMonth).length : ""
//     }
//     const getHolidayAbbreviation = (date) => {
//         const holiday = isHoliday(date, holidays);
//         return holiday ? holiday?.description.toUpperCase() : (isSunday(date) ? "SUNDAY" : "")
//     }
//     const getBackgroundColor = (date, holidays) => {
//         if (isHoliday(date, holidays)) {
//             return NATIONAL_HOLIDAY_COLOR
//         } else if (isSunday(date)) {
//             return SUNDAY_COLOR
//         }
//         return false
//     }
//     return (
//         <div className='relative w-full overflow-y-auto overflow-x-hidden select-none p-2' style={{ height: "90%", fontSize: "12px" }}>
//             <table className={`relative table-fixed w-full p-2`}>
//                 <thead className='sticky z-40 top-0 bg-gray-200'>
//                     <tr>
//                         {manualSelect ? <th></th> : ""}
//                         <th className='w-16'>
//                             <div className='flex justify-center mx-1'>
//                                 Week →
//                             </div>
//                         </th>
//                         {
//                             sortWeekDaysIfLastWeek(currentMonthDays)
//                                 .map((weekday, index) =>
//                                     <th key={index} className="border" colSpan={arrayCounter(currentMonthDays.map(date => moment.utc(date).format('W')))[weekday]}>
//                                         <div className='flex justify-center'>
//                                             {weekday}
//                                         </div>
//                                     </th>
//                                 )
//                         }
//                     </tr>
//                     <tr>
//                         <th className='whitespace-nowrap p-1'>
//                             ↓ Lines
//                         </th>
//                         {currentMonthDays.map((date, index) =>
//                             <th key={index} className="">
//                                 <div className='flex justify-center'>
//                                     {new Date(date).getDate()}
//                                 </div>
//                                 <div className='flex justify-center text-xs'>
//                                     {weekday[new Date(date).getDay()]}
//                                 </div>
//                             </th>
//                         )}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {lines.map((line, index) =>
//                         <tr key={index} className='h-10'>
//                             <LineItem index={index} line={line} isLast={index >= (lines.length / 2)} />
//                             {currentMonthDays.map((date, index) =>
//                                 <td key={index} id={line.id + "/" + getDateFromDateTimeFormat(date)}
//                                     className={`
//                                     bg-white w-full onHover-holiday
//                                     ${isNationalHoliday(date, holidays) ? "" : (getOrderIfOrderPlacedInCurrentDate(date, line) ? "border" : "border")}`
//                                     }
//                                     onDragOver={isNationalHoliday(date, holidays) ? undefined : (e) => onDragOver(e)}
//                                     onDragLeave={(e) => { onDragLeave(e, date, line) }}
//                                     onDrop={(e) => { drop(e, date, line) }}
//                                     style={{
//                                         backgroundColor:
//                                             (getBackgroundColor(date, holidays) ? getBackgroundColor(date, holidays) : undefined),
//                                     }}
//                                 >
//                                     <div className='onShow-holiday'>
//                                         {getHolidayAbbreviation(date)}
//                                     </div>
//                                     {
//                                         getOrderIfOrderPlacedInCurrentDate(date, line)
//                                             ?
//                                             <>
//                                                 {
//                                                     ((getDateFromDateTimeFormat(getOrderIfOrderPlacedInCurrentDate(date, line).lines.find(l => parseInt(l.id) === parseInt(line.id)).startDate) === getDateFromDateTimeFormat(date))
//                                                         ||
//                                                         (new Date(date).getDate() === 1)) ?
//                                                         <OrderItem
//                                                             key={productionMode}
//                                                             date={date}
//                                                             width={`${orderDaysInCurrentMonth(date, line, getOrderIfOrderPlacedInCurrentDate(date, line)) * 110}%`}
//                                                             tooltip={orderDaysInCurrentMonth(date, line, getOrderIfOrderPlacedInCurrentDate(date, line)) >= 10 ? null : (new Date(date).getDate() > 25 ? "left" : "right")}
//                                                             order={getOrderIfOrderPlacedInCurrentDate(date, line)}
//                                                             line={line}
//                                                             holidays={holidays}
//                                                         />

//                                                         :
//                                                         ""
//                                                 }
//                                             </>
//                                             :
//                                             ""
//                                     }
//                                 </td>
//                             )}
//                         </tr>
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     )
// }

// export default Calendar


import React, { useState, useEffect, useContext } from 'react'
import { getDateArray, getDateFromDateTimeFormat, weekday, isSameDay, arrayCounter } from '../../../utils/helper';
import OrderItem from '../orderpanel/OrderItem';
import moment from 'moment';
import LineItem from '../Line/LineItem';
import { NATIONAL_HOLIDAY_COLOR, SUNDAY_COLOR } from '../../../Constants/colors';
import { toast } from 'react-toastify';

import { CapacityPlannerContext } from '../../CapacityPlanner';
import { isHoliday, isSunday, isNationalHoliday } from './helper';
import { sortWeekDaysIfLastWeek, getWeeksInMonth, isDateInPreviousWeek, getDaysUntilDelivery } from '../../helper';

// Height of everything ABOVE the calendar (header + toolbar + legend grid). Tune this number if the bottom is cut off or has a gap.
const CALENDAR_HEIGHT = 'calc(100vh - 140px)';
const DAY_COL_MIN = 38;   // min width of one day column in Month view (px)
const LINE_COL = 96;      // width of the Lines column (px)

const Calendar = () => {
    const {
        setLineEntryConformation,
        orders,
        month, holidays,
        setCurrentOrder,
        setCurrentLine,
        setCurrentDate,
        lines,
        manualSelect, setPreviousOrders, productionMode,
        calendarViewMode, calendarHalf, calendarWeek,
    } = useContext(CapacityPlannerContext)

    const [visibleDays, setVisibleDays] = useState([]);
    const [hoverCell, setHoverCell] = useState(null); // "lineId/date" currently under the dragged order

    useEffect(() => {
        const currentYear = new Date(month).getFullYear();
        const currentMonth = new Date(month).getMonth();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const allMonthDays = getDateArray(firstDay, lastDay);

        if (calendarViewMode === '15days') {
            if (calendarHalf === 1) {
                const halfEnd = new Date(currentYear, currentMonth, 15);
                setVisibleDays(getDateArray(firstDay, halfEnd));
            } else {
                const halfStart = new Date(currentYear, currentMonth, 16);
                setVisibleDays(getDateArray(halfStart, lastDay));
            }
        } else if (calendarViewMode === 'week') {
            const weeks = getWeeksInMonth(month);
            const clampedIndex = Math.min(Math.max(0, calendarWeek || 0), Math.max(0, weeks.length - 1));
            if (weeks[clampedIndex]) {
                setVisibleDays(weeks[clampedIndex].days);
            } else {
                setVisibleDays(allMonthDays);
            }
        } else {
            setVisibleDays(allMonthDays);
        }
    }, [month, calendarViewMode, calendarHalf, calendarWeek]);

    async function drop(ev, date, line) {
        ev.preventDefault();
        setHoverCell(null);

        const raw = ev.dataTransfer.getData("order");
        if (!raw) return;
        const order = JSON.parse(raw);

        // 1. Restrict to current week or above (cannot assign to previous week)
        if (isDateInPreviousWeek(date)) {
            toast.warning("Cannot assign order to a previous week. Please assign to current week or later.");
            return;
        }

        // 2. Alert if order delivery is more than 45 days
        const daysFromToday = getDaysUntilDelivery(order.dDate);
        const daysFromPlan = getDaysUntilDelivery(order.dDate, date);
        const maxDeliveryDays = Math.max(daysFromToday ?? 0, daysFromPlan ?? 0);
        if (maxDeliveryDays > 45) {
            const formattedDeliveryDate = order.dDate ? moment.utc(order.dDate).format("DD-MM-YYYY") : "";
            const confirmMsg = `Alert: Order ${order.orderNo || ''} delivery date (${formattedDeliveryDate}) is more than 45 days away (${maxDeliveryDays} days). Do you want to make plan?`;
            if (!window.confirm(confirmMsg)) {
                return;
            }
            toast.info(`Alert: Order delivery is more than 45 days away (${maxDeliveryDays} days).`);
        }

        await setCurrentOrder(order);
        await setCurrentLine(line);
        await setCurrentDate(date);
        await setLineEntryConformation(true);
        setPreviousOrders(orders);
    }

    const findOrderHasCurrentDate = (order, date, lineObj) => {
        if (!(date || lineObj)) return false;
        const line = order.lines.find(lineItem => parseInt(lineItem.id) === parseInt(lineObj.id));
        if (line && line.startDate && line.endDate) {
            const targetDateStr = getDateFromDateTimeFormat(date);
            const lineStartStr = getDateFromDateTimeFormat(line.startDate);
            const lineEndStr = getDateFromDateTimeFormat(line.endDate);
            return targetDateStr >= lineStartStr && targetDateStr <= lineEndStr;
        }
        return false;
    };

    const getOrderIfOrderPlacedInCurrentDate = (date, line) => {
        let orderOnDate = orders.find(order => {
            return findOrderHasCurrentDate(order, date, line)
        })
        return orderOnDate
    }

    const onDragOver = (e, cellKey) => {
        e.preventDefault();
        if (hoverCell !== cellKey) setHoverCell(cellKey); // only update state when the cell changes
    }

    const onDragLeave = (e, cellKey) => {
        e.preventDefault();
        if (hoverCell === cellKey) setHoverCell(null);
    }

    const getHolidayAbbreviation = (date) => {
        const holiday = isHoliday(date, holidays);
        return holiday ? holiday?.description.toUpperCase() : (isSunday(date) ? "SUNDAY" : "")
    }

    const getBackgroundColor = (date, holidays) => {
        if (isHoliday(date, holidays)) {
            return NATIONAL_HOLIDAY_COLOR
        } else if (isSunday(date)) {
            return SUNDAY_COLOR
        }
        return false
    }

    const today = new Date();
    const weekCounts = arrayCounter(visibleDays.map(date => moment.utc(date).format('W')));

    // header cell styling by day type
    const dayHeaderClass = (date) => {
        if (isHoliday(date, holidays)) return 'bg-red-50 text-red-700';
        if (isSunday(date)) return 'bg-slate-200 text-slate-600';
        if (isDateInPreviousWeek(date)) return 'bg-slate-100/60 text-slate-400';
        return 'bg-slate-100 text-slate-800';
    }

    // Dynamic width per day column based on view mode
    let dayColWidth = DAY_COL_MIN;
    if (calendarViewMode === '15days') {
        dayColWidth = 72; // ~2x wider for bi-weekly view
    } else if (calendarViewMode === 'week') {
        dayColWidth = 150; // ~4x wider for spacious week view
    }

    return (
        <div
            className='relative w-full min-w-0 overflow-auto overscroll-contain select-none bg-white border border-slate-200 rounded-xl'
            style={{ height: CALENDAR_HEIGHT, fontSize: "12px" }}
        >
            <table
                className='relative table-fixed w-full border-separate border-spacing-0'
                style={{ minWidth: `${LINE_COL + visibleDays.length * dayColWidth}px` }}
            >
                <thead>
                    {/* Row 1: weeks */}
                    <tr>
                        {manualSelect ? <th className='sticky top-0 z-40 bg-slate-100 border-b border-slate-200'></th> : null}
                        <th className='sticky top-0 left-0 z-10 bg-slate-100 border-b border-r border-slate-200 h-7 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600'
                            style={{ width: LINE_COL }}>
                            Week →
                        </th>
                        {sortWeekDaysIfLastWeek(visibleDays).map((weekday, index) =>
                            <th key={index}
                                className="sticky top-0 z-20 h-7 bg-slate-100 border-b border-r border-slate-200 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
                                colSpan={weekCounts[weekday]}>
                                <div className='flex justify-center'>
                                    Week {weekday}
                                </div>
                            </th>
                        )}
                    </tr>
                    {/* Row 2: days (sticks just below row 1: 28px = h-7) */}
                    <tr>
                        <th className='sticky left-0 top-[28px] z-10 bg-slate-100 border-b-2 border-r border-slate-300 px-2 py-1 text-left whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-slate-600'>
                            ↓ Lines
                        </th>
                        {visibleDays.map((date, index) => {
                            const isToday = isSameDay(new Date(date), today);
                            return (
                                <th key={index}
                                    style={{ width: `${dayColWidth}px`, minWidth: `${dayColWidth}px` }}
                                    className={`sticky top-[28px] z-10 py-1 border-r border-slate-200 border-b-2
                                        ${dayHeaderClass(date)}
                                        ${isToday ? 'border-b-orange-600' : 'border-b-slate-300'}`}>
                                    <div className={`flex justify-center text-[13px] font-bold ${isToday ? 'text-orange-700' : ''}`}>
                                        {new Date(date).getDate()}
                                    </div>
                                    <div className='flex justify-center text-[10px] font-medium opacity-80'>
                                        {weekday[new Date(date).getDay()]}
                                    </div>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {lines.map((line, index) =>
                        <tr key={index} className=' h-10 '>
                            <LineItem index={index} line={line} isLast={index >= (lines.length / 2)} />
                            {visibleDays.map((date, dIndex) => {
                                const isPastWeek = isDateInPreviousWeek(date);
                                const placedOrder = getOrderIfOrderPlacedInCurrentDate(date, line);
                                const cellId = line.id + "/" + getDateFromDateTimeFormat(date);
                                const bg = getBackgroundColor(date, holidays);
                                const blocked = isNationalHoliday(date, holidays) || isPastWeek;
                                const isHover = hoverCell === cellId && !blocked;
                                const placedLine = placedOrder
                                    ? placedOrder.lines.find(l => parseInt(l.id) === parseInt(line.id))
                                    : null;

                                let showBar = false;
                                let spanDays = 0;
                                let startsBefore = false;
                                let endsAfter = false;

                                if (placedOrder && placedLine && visibleDays.length > 0) {
                                    const firstVisibleStr = getDateFromDateTimeFormat(visibleDays[0]);
                                    const lastVisibleStr = getDateFromDateTimeFormat(visibleDays[visibleDays.length - 1]);
                                    const lineStartStr = getDateFromDateTimeFormat(placedLine.startDate);
                                    const lineEndStr = getDateFromDateTimeFormat(placedLine.endDate);
                                    const cellDateStr = getDateFromDateTimeFormat(date);

                                    startsBefore = lineStartStr < firstVisibleStr;
                                    endsAfter = lineEndStr > lastVisibleStr;

                                    const barStartStr = startsBefore ? firstVisibleStr : lineStartStr;

                                    if (cellDateStr === barStartStr) {
                                        showBar = true;
                                        const barEndStr = endsAfter ? lastVisibleStr : lineEndStr;
                                        spanDays = getDateArray(new Date(barStartStr), new Date(barEndStr)).length;
                                    }
                                }

                                const barWidth = spanDays <= 1 ? '100%' : `calc(${spanDays * 100}% - 4px)`;

                                return (
                                    <td key={dIndex} id={cellId}
                                        style={{ backgroundColor: bg ? bg : undefined, width: `${dayColWidth}px`, minWidth: `${dayColWidth}px` }}
                                        className={`border-b border border-slate-200 bg-white w-full onHover-holiday
                                            ${isPastWeek ? '!bg-slate-50/70' : ''}
                                            ${isHover ? 'ring-2 ring-inset ring-orange-500 !bg-orange-50' : ''}
                                            ${blocked ? 'cursor-not-allowed' : ''}`}
                                        title={isPastWeek ? 'Cannot assign orders to a previous week' : undefined}
                                        onDragOver={blocked ? undefined : (e) => onDragOver(e, cellId)}
                                        onDragLeave={(e) => { onDragLeave(e, cellId) }}
                                        onDrop={(e) => { drop(e, date, line) }}
                                    >
                                        <div className='onShow-holiday'>
                                            {getHolidayAbbreviation(date)}
                                        </div>
                                        {showBar ? (
                                            <OrderItem
                                                key={`${productionMode}-${calendarViewMode}-${spanDays}-${getDateFromDateTimeFormat(date)}`}
                                                date={date}
                                                width={barWidth}
                                                tooltip={spanDays >= 10 ? null : (new Date(date).getDate() > 25 ? "left" : "right")}
                                                order={placedOrder}
                                                line={line}
                                                holidays={holidays}
                                                startsBefore={startsBefore}
                                                endsAfter={endsAfter}
                                            />
                                        ) : null}
                                    </td>
                                )
                            })}
                        </tr>
                    )}
                    {lines.length === 0 && (
                        <tr>
                            <td colSpan={visibleDays.length + 1} className='py-12 text-center text-sm text-slate-500'>
                                No production lines found for this unit.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Calendar