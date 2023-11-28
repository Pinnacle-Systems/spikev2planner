import React, { useState, useEffect, useCallback } from 'react'
import { getDateArray, getDateFromDateTimeFormat, weekday, isSameDay, addOrderToLine, arrayCounter, getMonthYearFromDateTimeFormat } from '../../../utils/helper';
import OrderItem from '../orderpanel/OrderItem';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UNITS_API } from '../../../Constants/Api';
import LineItem from '../Line/LineItem';
import { getCurrentCapacity } from '../../../utils/helper';
import { isSunday } from '../../../utils/nationHolidaysHelper';
import { NATIONAL_HOLIDAY_COLOR, SUNDAY_COLOR } from '../../../Constants/colors';
import { isNationalHoliday } from '../../../utils/nationHolidaysHelper';
import { isHoliday } from '../../pages/HolidayForm/helper';

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Calendar = ({ orders, setOrders, month, selectedUnit, holidays, setDeliveryDateWarning }) => {
    const [currentMonthDays, setCurrentMonthDays] = useState([]);
    const [lines, setLines] = useState([]);

    const retrieveData = useCallback(() => {
        if (!selectedUnit) return
        axios({
            method: 'get',
            url: BASE_URL + UNITS_API + `/${selectedUnit}`,
        }).then((result) => {
            setLines(result.data.data.line)
        }, (error) => {
            toast.error("Server Down", { autoClose: 5000 });
        });
    }, [selectedUnit]);
    useEffect(retrieveData, [retrieveData]);

    useEffect(() => {
        const startDate = new Date();
        const endDate = new Date();
        const currentYear = new Date(month).getFullYear();
        const currentMonth = new Date(month).getMonth();
        startDate.setFullYear(currentYear, currentMonth, 1);
        endDate.setFullYear(currentYear, currentMonth + 1, 0);
        setCurrentMonthDays(getDateArray(startDate, endDate));
    }, [month])


    function drop(ev, date, line) {
        ev.preventDefault();
        const currentOrderId = ev.dataTransfer.getData("orderId");
        const currentLine = line.id;
        const currentDate = date;
        const currentOrder = orders.find(order => order.id === parseInt(currentOrderId));
        const currentOrderIndex = orders.findIndex(order => order.id === parseInt(currentOrderId));
        const newOrders = [...orders]
        newOrders[currentOrderIndex]["days"] = Math.ceil(parseInt(currentOrder.quantity) / parseInt(getCurrentCapacity(line.efficiency, line.capacity)));
        addOrderToLine(currentOrderId, currentLine, currentDate, newOrders, setOrders, holidays, setDeliveryDateWarning);
    }


    const getOrderId = (currentDate, line) => {
        let currentOrder = orders.find(order => {
            const orderDates = getDateArray(new Date(order.startDate), new Date(order.endDate));
            return parseInt(order.line) === parseInt(line) && orderDates.some(date => isSameDay(new Date(date), new Date(currentDate)));
        })
        return currentOrder ? currentOrder : ""
    }

    const onDragOver = (e) => {
        e.preventDefault();
        // let node = document.getElementById(e.target.id);
        // if (node) node.style.backgroundColor = "blue";
    }
    const onDragLeave = (e, date, line) => {
        e.preventDefault();
        let node = document.getElementById(e.target.id);
        const orderObj = getOrderId(date, line.id)
        if (node) {
            if (!orderObj) {
                document.getElementById(e.target.id).style.backgroundColor = getBackgroundColor(date, holidays) ? getBackgroundColor(date, holidays) : "white"
            } else {
                document.getElementById(e.target.id).style.backgroundColor = getBackgroundColor(date, holidays) ? getBackgroundColor(date, holidays) : orderObj?.color
            }
        }
    }

    const orderDaysInCurrentMonth = (date, order) => {
        const currentMonth = getMonthYearFromDateTimeFormat(date);
        return getDateArray(order.startDate, order.endDate).filter(date => getMonthYearFromDateTimeFormat(date) === currentMonth).length
    }
    document.addEventListener("wheel", function (event) {
        if (document.activeElement.type === "number") {
            document.activeElement.blur();
        }
    });
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
        <div className='relative bg-gray-500 w-full overflow-y-auto overflow-x-hidden' style={{ height: "95%", fontSize: "12px" }}>
            <table className='relative table-fixed w-full py-2 ' style={{ height: "100%", zIndex: 1 }}>
                <thead className='sticky z-10 top-0 bg-blue-200'>
                    <tr>
                        <th>
                            <div className='flex justify-center mx-1'>
                                Week
                            </div>
                        </th>
                        {
                            Object.keys(arrayCounter(currentMonthDays.map(date => moment.utc(date).format('W')))).map((weekday, index) =>
                                <th key={index} className="border" colSpan={arrayCounter(currentMonthDays.map(date => moment.utc(date).format('W')))[weekday]}>
                                    <div className='flex justify-center'>
                                        {weekday}
                                    </div>
                                </th>
                            )
                        }
                    </tr>
                    <tr>
                        <th>
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
                        <tr key={index}>
                            <LineItem line={line} isLast={index >= (lines.length / 2)} />
                            {currentMonthDays.map((date, index) =>
                                <td key={index} id={line.id + "/" + getDateFromDateTimeFormat(date)}
                                    className={`bg-white w-full onHover-holiday ${isNationalHoliday(date, holidays) ? "" : (getOrderId(date, line.id) ? "" : "border")}`}
                                    onDragOver={(e) => onDragOver(e)}
                                    onDragLeave={(e) => { onDragLeave(e, date, line) }}
                                    onDrop={(e) => { drop(e, date, line) }}
                                    style={{
                                        backgroundColor: getBackgroundColor(date, holidays) ? getBackgroundColor(date, holidays) : getOrderId(date, line.id)?.color,
                                    }}
                                >
                                    <div className='onShow-holiday'>
                                        {getHolidayAbbreviation(date)}
                                    </div>
                                    {
                                        getOrderId(date, line.id)
                                            ?
                                            ((getDateFromDateTimeFormat(getOrderId(date, line.id).startDate) === getDateFromDateTimeFormat(date))
                                                ||
                                                (new Date(date).getDate() === 1)
                                            )
                                                ?
                                                <>
                                                    <OrderItem
                                                        width={`${orderDaysInCurrentMonth(date, getOrderId(date, line.id)) * 100}%`}
                                                        tooltip={orderDaysInCurrentMonth(date, getOrderId(date, line.id)) >= 10 ? null : (new Date(date).getDate() > 25 ? "left" : "right")}
                                                        order={getOrderId(date, line.id)}
                                                        holidays={holidays}
                                                    />

                                                </>
                                                : ""
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
 