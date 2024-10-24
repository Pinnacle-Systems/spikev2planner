import React, { useState, useEffect, useContext, useRef } from 'react'
import { flushSync } from 'react-dom';
import { getDateArray, getDateFromDateTimeFormat, weekday, isSameDay, arrayCounter, getMonthYearFromDateTimeFormat } from '../../../utils/helper';
import OrderItem from '../orderpanel/OrderItem';
import moment from 'moment';
import LineItem from '../Line/LineItem';
import { NATIONAL_HOLIDAY_COLOR, SUNDAY_COLOR } from '../../../Constants/colors';

import { CapacityPlannerContext } from '../../CapacityPlanner';
import { dateDiffInDays, getCurrentCapacity, isHoliday, isSunday, isNationalHoliday } from './helper';
import { sortWeekDaysIfLastWeek, getTotalPcsInLineOrder, styleTypeMatchingWarningMessage, findDays } from '../../helper';
import { toast } from 'react-toastify';

const MAX_SPEED = 300;

const Calendar = () => {
    const maxDays = useRef(0);
    const speedRef = useRef(0);
    const {
        setLineEntryConformation,
        orders, setOrders,
        month, setMonth, holidays,
        currentOrder, setCurrentOrder,
        setCurrentLine,
        setCurrentDate,
        lines,
        manualSelect, setManualSelect,
        setPreviousOrders, previousOrders, productionMode,
        setLearningCurvePopup
    } = useContext(CapacityPlannerContext)

    const [currentMonthDays, setCurrentMonthDays] = useState([]);

    const [selectedStarted, setSelectedStarted] = useState(false);

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
    document.addEventListener("wheel", function (event) {
        if (document.activeElement.type === "number") {
            document.activeElement.blur();
        }
    });
    let previousEvent, currentEvent;
    let maxSpeed = 0, previousSpeed = 0, maxPositiveAcceleration = 0, maxNegativeAcceleration = 0;

    document.addEventListener('mousemove', (event) => {
        currentEvent = event
    });

    setInterval(function () {
        let speed = speedRef.current
        if (currentEvent && previousEvent) {
            let movementX = Math.abs(currentEvent.pageX - previousEvent.pageX);
            let movementY = Math.abs(currentEvent.pageY - previousEvent.pageY);
            let movement = Math.sqrt(movementX * movementX + movementY * movementY);
            //Dividing by 100 since the setInterval function is called every 100ms
            speed = 10 * movement;
            maxSpeed = Math.round(speed > maxSpeed ? (maxSpeed = speed) : maxSpeed);

            let acceleration = 10 * (speed - previousSpeed);

            if (acceleration > 0) {
                maxPositiveAcceleration = Math.round(acceleration > maxPositiveAcceleration ? (maxPositiveAcceleration = acceleration) : maxPositiveAcceleration);
            } else {
                maxNegativeAcceleration = Math.round(acceleration < maxNegativeAcceleration ? (maxNegativeAcceleration = acceleration) : maxNegativeAcceleration);
            }
        }
        previousEvent = currentEvent
        previousSpeed = speed;
        speedRef.current = speed;
    }, 100);

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

    const getCurrentOrder = (id) => orders.find(order => parseInt(order.id) === id)

    const manualSelectAllowed = (date, lineObj) => {
        const alreadyOrder = getOrderIfOrderPlacedInCurrentDate(date, lineObj);
        if (alreadyOrder && (parseInt(alreadyOrder.id) !== parseInt(currentOrder.id))) return false
        return true
    }

    // function getMaxDays(){
    //     const balancePcs = getBalanceQuantityMain(orders, currentOrder);

    //     const learningCurveItems = currentLineFromOrders?.learningCurveItems || [];
    //     const currentCapacity = parseInt(getCurrentCapacity(lineObj.efficiency, lineObj.capacity));
    //     const days = parseInt(dateDiffInDays(line.startDate, endDate, holidays));
    //     let currentDayPerc = ((days - 1 >= learningCurveItems.length) ? learningCurveItems[learningCurveItems.length - 1] : learningCurveItems[days - 1])?.percentage;
    //     const currentDayCapacity = getCurrentCapacity(parseInt(currentDayPerc), currentCapacity)

    //     let pcs = currentDayCapacity * (parseInt(dateDiffInDays(line.startDate, endDate, holidays)));

    // }



    function getMaxDays(orders, currentOrder, currentLine) {
        const balancePcs = getBalanceQuantityMain(orders, currentOrder);
        const currentOrderIndex = orders.findIndex(order => order.id === parseInt(currentOrder.id));
        const linesFromOrders = [...orders[currentOrderIndex]["lines"]];
        let currentLineFromOrders = linesFromOrders.find(line => parseInt(line.id) == parseInt(currentLine.id));
        return findDays(balancePcs, { ...currentLine, learningCurveItems: currentLineFromOrders?.learningCurveItems || [] });
    }

    const handleOnMouseDown = async (lineObj, date) => {
        if (!manualSelectAllowed(date, lineObj)) return
        setCurrentLine(lineObj);
        if (!manualSelect) return
        if (!styleTypeMatchingWarningMessage(lineObj, currentOrder)) return
        if (isNationalHoliday(date, holidays)) return
        setSelectedStarted(true);
        const line = lines.find(lineItem => parseInt(lineItem.id) === parseInt(lineObj.id))
        const currentOrderIndex = orders.findIndex(order => order.id === parseInt(currentOrder.id));
        const newOrders = structuredClone(orders)
        const linesFromOrders = [...newOrders[currentOrderIndex]["lines"]];
        let currentLineFromOrders = linesFromOrders.find(line => parseInt(line.id) == parseInt(lineObj.id));
        const linesLocal = linesFromOrders.filter(line => parseInt(line.id) !== parseInt(lineObj.id))
        const endDate = new Date(date)

        if ((currentLineFromOrders?.learningCurveItems || []).length == 0) {
            return setLearningCurvePopup(true);
        }

        const learningCurveItems = currentLineFromOrders?.learningCurveItems || [];
        const currentCapacity = parseInt(getCurrentCapacity(lineObj.efficiency, lineObj.capacity));
        let currentDayPerc = parseInt((learningCurveItems[0])?.percentage || 0);
        const currentDayCapacity = getCurrentCapacity(parseInt(currentDayPerc), currentCapacity)
        let pcs = currentDayCapacity * (parseInt(dateDiffInDays(new Date(date), endDate, holidays)));
        // balance is found omitting the current line allocated quantity
        maxDays.current = getMaxDays(newOrders, currentOrder, lineObj)
        newOrders[currentOrderIndex]["lines"] = linesLocal;
        const balancePcs = getBalanceQuantityMain(newOrders, currentOrder)
        if (parseInt(balancePcs) === 0 && (linesFromOrders.length === linesLocal.length)) {
            // toast.error("No Balance Qty ", { position: "top-center" });
            return
        }

        if (parseInt(balancePcs) < parseInt(getCurrentCapacity(lineObj.efficiency, lineObj.capacity))) {
            pcs = getCurrentCapacity(lineObj.efficiency, lineObj.capacity) * (parseInt(dateDiffInDays(date, endDate, holidays)) - 1) + parseInt(balancePcs);
        }

        linesLocal.push({ ...currentLineFromOrders, id: line.id, pcs, startDate: date, endDate: endDate, days: dateDiffInDays(date, endDate, holidays) })
        newOrders[currentOrderIndex]["lines"] = linesLocal;
        setOrders(newOrders);
    }

    const handleOnnMouseOver = (lineObj, date) => {
        if (!manualSelectAllowed(date, lineObj)) return
        if (manualSelect && selectedStarted) {
            if (!styleTypeMatchingWarningMessage(lineObj, currentOrder)) return
            if (isNationalHoliday(date, holidays)) return
            const currentOrderInOrders = getCurrentOrder(currentOrder.id)
            const line = currentOrderInOrders.lines.find(lineItem => parseInt(lineItem.id) === parseInt(lineObj.id))
            if (!line) return
            const currentOrderIndex = orders.findIndex(order => order.id === parseInt(currentOrder.id));
            const newOrders = structuredClone(orders)
            const linesFromOrders = [...newOrders[currentOrderIndex]["lines"]]
            let currentLineFromOrders = linesFromOrders.find(line => parseInt(line.id) == parseInt(lineObj.id));
            const linesLocal = linesFromOrders.filter(line => parseInt(line.id) !== parseInt(lineObj.id))
            const endDate = new Date(date)

            const balancePcs = getBalanceQuantityMain(orders, currentOrder);


            if (parseInt(balancePcs) <= 0 && (linesFromOrders.length === linesLocal.length)) {
                // toast.error("No Balance Qty ", { position: "top-center" });
                return
            }

            if (speedRef.current > MAX_SPEED) {
                // toast.info("Don't do so fast ...! ", { position: "top-left" });
                return
            }
            const learningCurveItems = currentLineFromOrders?.learningCurveItems || [];
            const currentCapacity = parseInt(getCurrentCapacity(lineObj.efficiency, lineObj.capacity));
            const days = parseInt(dateDiffInDays(line.startDate, endDate, holidays));
            let currentDayPerc = parseInt(((days - 1 >= learningCurveItems.length) ? learningCurveItems[learningCurveItems.length - 1] : learningCurveItems[days - 1])?.percentage || 0);
            const currentDayCapacity = getCurrentCapacity(parseInt(currentDayPerc), currentCapacity)
            let pcs = currentLineFromOrders.pcs;
            if (currentDayCapacity > balancePcs) {
                pcs += balancePcs;
            } else {
                pcs += currentDayCapacity;
            }
            // if (maxDays.current < days) return
            linesLocal.push({ ...currentLineFromOrders, id: lineObj.id, pcs, startDate: line.startDate, endDate: endDate, days: dateDiffInDays(line.startDate, endDate, holidays) })
            newOrders[currentOrderIndex]["lines"] = linesLocal;
            if (validateAllocatedQuantity(orders, currentOrder)) {
                flushSync(() => {
                    setOrders(newOrders);
                })
            } else {
                // toast.error("No Balance Qty ", { position: "top-center" });
            }
        }
    }

    const handleOnMouseUp = (line, date) => {
        setSelectedStarted(false);
    }

    function getBalanceQuantityMain(orders, currentOrder) {
        const totalAllocatedPcs = getTotalPcsInLineOrder(orders, currentOrder);
        return parseInt(currentOrder.quantity) - parseInt(totalAllocatedPcs)
    }

    const validateAllocatedQuantity = (orders, currentOrder) => {
        const balancePcs = getBalanceQuantityMain(orders, currentOrder);
        if (parseInt(balancePcs) <= 0) {
            return false
        }
        return true
    }


    const handleSaveManualSelect = () => {
        if (parseInt(currentOrder.quantity) <= parseInt(getTotalPcsInLineOrder(orders, currentOrder))) setManualSelect(false)
        else toast.warning("You Should Allocate All Quantity Of Current Order ", { position: "top-center" });
    }

    const handleCancelManualSelect = () => {
        setOrders(previousOrders);
        setManualSelect(false);
    }

    return (
        <div className='relative w-full overflow-y-auto overflow-x-hidden select-none p-2' style={{ height: "90%", fontSize: "12px" }}>
            <table className={`relative table-fixed w-full p-2`}>
                <thead className='sticky z-10 top-0 bg-white'>
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
                    <tr className={`${manualSelect ? "" : "hidden"}`}>
                        <th colSpan={currentMonthDays.length} >
                            <div className='flex items-center justify-between'>
                                <button className='bg-red-900 text-white p-1 rounded' onClick={handleCancelManualSelect}>Cancel</button>
                                <div> Select Dates </div>
                                <button className='bg-blue-900 text-white p-1 rounded'
                                    onClick={handleSaveManualSelect}
                                >Done</button>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {lines.map((line, index) =>
                        <tr key={index} className='h-10'>
                            <LineItem index={index} onMouseOver={() => { if (selectedStarted) setMonth(moment.utc(month).subtract(1, "M")) }} line={line} isLast={index >= (lines.length / 2)} />
                            {currentMonthDays.map((date, index) =>
                                <td key={index} id={line.id + "/" + getDateFromDateTimeFormat(date)}
                                    className={`
                                    bg-white w-full onHover-holiday
                                    ${isNationalHoliday(date, holidays) ? "" : (getOrderIfOrderPlacedInCurrentDate(date, line) ? "border" : "border")}`
                                    }
                                    onDragOver={isNationalHoliday(date, holidays) ? undefined : (e) => onDragOver(e)}
                                    onDragLeave={(e) => { onDragLeave(e, date, line) }}
                                    onMouseDown={() => handleOnMouseDown(line, date)}
                                    onMouseOver={() => handleOnnMouseOver(line, date)}
                                    onMouseUp={() => { handleOnMouseUp(line, date) }}
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
                            <td onMouseOver={() => { if (selectedStarted) setMonth(moment.utc(month).add(1, "M")) }}>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Calendar
