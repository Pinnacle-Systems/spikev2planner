import React, { useState, useEffect, useContext } from 'react'
import { getDateArray, getDateFromDateTimeFormat, weekday, isSameDay, arrayCounter, getMonthYearFromDateTimeFormat } from '../../../utils/helper';
import OrderItem from '../orderpanel/OrderItem';
import moment from 'moment';
import LineItem from '../Line/LineItem';
import { NATIONAL_HOLIDAY_COLOR, SUNDAY_COLOR } from '../../../Constants/colors';

import { CapacityPlannerContext } from '../../CapacityPlanner';
import { isHoliday, isSunday, isNationalHoliday } from './helper';
import { sortWeekDaysIfLastWeek, } from '../../helper';

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
    } = useContext(CapacityPlannerContext)

    const [currentMonthDays, setCurrentMonthDays] = useState([]);

    useEffect(() => {
        let startDate = new Date();
        let endDate = new Date();
        const currentYear = new Date(month).getFullYear();
        const currentMonth = new Date(month).getMonth();
        startDate.setFullYear(currentYear, currentMonth, 1);
        endDate.setFullYear(currentYear, currentMonth + 1, 0);
        setCurrentMonthDays(getDateArray(startDate, endDate));
    }, [month])

    async function drop(ev, date, line) {
        ev.preventDefault();
        await setCurrentOrder(JSON.parse(ev.dataTransfer.getData("order")));
        await setCurrentLine(line);
        await setCurrentDate(date);
        await setLineEntryConformation(true);
        setPreviousOrders(orders);
    }

    const findOrderHasCurrentDate = (order, date, lineObj) => {
        if (!(date || lineObj)) return
        const line = order.lines.find(lineItem => parseInt(lineItem.id) === parseInt(lineObj.id))
        if (line) {
            let lineOrderDates = getDateArray(line.startDate, line.endDate)
            if (lineOrderDates.some(d => isSameDay(new Date(d), new Date(date)))) {
                return true
            }
        }
    }

    const getOrderIfOrderPlacedInCurrentDate = (date, line) => {
        let orderOnDate = orders.find(order => {
            return findOrderHasCurrentDate(order, date, line)
        })
        return orderOnDate
    }

    const onDragOver = (e) => {
        e.preventDefault();
    }

    const onDragLeave = (e, date, line) => {
        e.preventDefault();
    }

    const orderDaysInCurrentMonth = (date, line, order) => {
        const currentMonth = getMonthYearFromDateTimeFormat(date);
        let currentLineObj = order["lines"].find(item => parseInt(item.id) === parseInt(line.id))
        return currentLineObj ? getDateArray(currentLineObj.startDate, currentLineObj.endDate).filter(date => getMonthYearFromDateTimeFormat(date) === currentMonth).length : ""
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
    return (
        <div className='relative w-full overflow-y-auto overflow-x-hidden select-none p-2' style={{ height: "90%", fontSize: "12px" }}>
            <table className={`relative table-fixed w-full p-2`}>
                <thead className='sticky z-40 top-0 bg-gray-200'>
                    <tr>
                        {manualSelect ? <th></th> : ""}
                        <th className='w-16'>
                            <div className='flex justify-center mx-1'>
                                Week →
                            </div>
                        </th>
                        {
                            sortWeekDaysIfLastWeek(currentMonthDays)
                                .map((weekday, index) =>
                                    <th key={index} className="border" colSpan={arrayCounter(currentMonthDays.map(date => moment.utc(date).format('W')))[weekday]}>
                                        <div className='flex justify-center'>
                                            {weekday}
                                        </div>
                                    </th>
                                )
                        }
                    </tr>
                    <tr>
                        <th className='whitespace-nowrap p-1'>
                            ↓ Lines
                        </th>
                        {currentMonthDays.map((date, index) =>
                            <th key={index} className="">
                                <div className='flex justify-center'>
                                    {new Date(date).getDate()}
                                </div>
                                <div className='flex justify-center text-xs'>
                                    {weekday[new Date(date).getDay()]}
                                </div>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {lines.map((line, index) =>
                        <tr key={index} className='h-10'>
                            <LineItem index={index} line={line} isLast={index >= (lines.length / 2)} />
                            {currentMonthDays.map((date, index) =>
                                <td key={index} id={line.id + "/" + getDateFromDateTimeFormat(date)}
                                    className={`
                                    bg-white w-full onHover-holiday
                                    ${isNationalHoliday(date, holidays) ? "" : (getOrderIfOrderPlacedInCurrentDate(date, line) ? "border" : "border")}`
                                    }
                                    onDragOver={isNationalHoliday(date, holidays) ? undefined : (e) => onDragOver(e)}
                                    onDragLeave={(e) => { onDragLeave(e, date, line) }}
                                    onDrop={(e) => { drop(e, date, line) }}
                                    style={{
                                        backgroundColor:
                                            (getBackgroundColor(date, holidays) ? getBackgroundColor(date, holidays) : undefined),
                                    }}
                                >
                                    <div className='onShow-holiday'>
                                        {getHolidayAbbreviation(date)}
                                    </div>
                                    {
                                        getOrderIfOrderPlacedInCurrentDate(date, line)
                                            ?
                                            <>
                                                {
                                                    ((getDateFromDateTimeFormat(getOrderIfOrderPlacedInCurrentDate(date, line).lines.find(l => parseInt(l.id) === parseInt(line.id)).startDate) === getDateFromDateTimeFormat(date))
                                                        ||
                                                        (new Date(date).getDate() === 1)) ?
                                                        <OrderItem
                                                            key={productionMode}
                                                            date={date}
                                                            width={`${orderDaysInCurrentMonth(date, line, getOrderIfOrderPlacedInCurrentDate(date, line)) * 110}%`}
                                                            tooltip={orderDaysInCurrentMonth(date, line, getOrderIfOrderPlacedInCurrentDate(date, line)) >= 10 ? null : (new Date(date).getDate() > 25 ? "left" : "right")}
                                                            order={getOrderIfOrderPlacedInCurrentDate(date, line)}
                                                            line={line}
                                                            holidays={holidays}
                                                        />

                                                        :
                                                        ""
                                                }
                                            </>
                                            :
                                            ""
                                    }
                                </td>
                            )}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Calendar
