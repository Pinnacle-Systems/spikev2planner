import moment from 'moment';
import React, { useContext } from 'react'
import { findHolidaysBetweenDates, findSundaysBetweenDates } from '../../../utils/nationHolidaysHelper';
import { CapacityPlannerContext } from '../../CapacityPlanner';
import { adjust, isCurrentOrderLineActive } from '../../helper';
import { EMPTY_ALERT_COLOR, GREEN_ALERT_COLOR, ORANGE_ALERT_COLOR, RED_ALERT_COLOR } from '../../../Constants/colors';
import { dateDiffBetweenDays, getTotalPcsProductionShouldBeCompletedByYesterday } from '../../../utils/helper';

const OrderItem = ({ order, index = 0, tooltip = null, width = "100%", holidays, line = null }) => {
    const { manualSelect, setOpenOrderDetail, setCurrentOrder, setCurrentLine, activeLineOrder, setCurrentDraggedLine, productionMode } = useContext(CapacityPlannerContext)
    function drag(ev) {
        ev.dataTransfer.setData("order", JSON.stringify(order));
        ev.dataTransfer.setData("line", JSON.stringify(line));
        setCurrentDraggedLine(line)
    }
    const lineObj = (order?.lines || []).find(lineItem => parseInt(lineItem.id) === parseInt(line?.id))
    const totalLineWiseProductionQty = (order.OrderSizeColorWiseDetails || []).filter(i => i.line === line?.name).reduce((a, c) => a + parseFloat(c?.productionQty || 0), 0)
    const productionPercent = Math.floor(totalLineWiseProductionQty / parseFloat(order.quantity || 0) * 100);
    const balProductionPercent = 100 - productionPercent;

    // Calculation UpTo Today;
    const totalPcsProductionShouldBeCompletedByYesterday = getTotalPcsProductionShouldBeCompletedByYesterday(line, lineObj, holidays)


    const plannedVsActualPercentage = Math.floor(totalLineWiseProductionQty / parseFloat(totalPcsProductionShouldBeCompletedByYesterday) * 100);
    // console.log(lineCurrentCapacity, lineDays, holidaysCount, sundayCount, totalPcsProductionShouldBeCompletedByYesterday, totalLineWiseProductionQty, plannedVsActualPercentage)

    let bgColor = GREEN_ALERT_COLOR;
    if (plannedVsActualPercentage < 50) {
        bgColor = RED_ALERT_COLOR;
    } else if (plannedVsActualPercentage < 80) {
        bgColor = ORANGE_ALERT_COLOR;
    }
    return (
        <>
            {order.lines.length !== 0
                ?
                <>
                    {index === 0 ?
                        <div onMouseOver={(e) => { e.stopPropagation(); }} id={`${order?.id}/${line ? line.id : ""}`}
                            draggable={!manualSelect} onDragStart={(e) => { drag(e) }}
                            onDragOver={(e) => { e.preventDefault(); }}
                            onClick={() => {
                                if (manualSelect) return
                                setCurrentOrder(order);
                                setCurrentLine(line);
                                setOpenOrderDetail(true)
                            }}
                            className={` animate-bounce-once mix-blend-multiply py-2 relative z-20 text-center rounded-full text-xs
                            ${manualSelect ? "pointer-events-none" : "grabbable"} select-none 
                            ${manualSelect ?
                                    (isCurrentOrderLineActive(order.id, line.id, activeLineOrder) ?
                                        "z-0 transition delay-150 duration-300 ease-in-out scale-150 " : "") : ""}`}
                            style={{
                                background: productionMode
                                    ?
                                    productionPercent > 0 ?
                                        `linear-gradient(to right, ${bgColor}, ${bgColor} ${productionPercent}%, ${EMPTY_ALERT_COLOR} , ${EMPTY_ALERT_COLOR} ${balProductionPercent}%)`
                                        : EMPTY_ALERT_COLOR : (isCurrentOrderLineActive(order.id, line.id, activeLineOrder) ? adjust(order.color, -100) : order.color),
                                width: width,
                                fontSize: "10px",
                            }}
                        >
                            <div className={`flex flex-col gap-1 text-center p-1 onShow
                            ${tooltip ? (tooltip === "left" ? "-ml-14" : "mt-14 -ml-[200px]") : ""}`}
                            >
                                <div className='grid grid-cols-2'>
                                    <b> Order no.</b>
                                    <div> {order.orderNo}</div>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <b> Style Ref</b>
                                    <div> {order.style} </div>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <b> Buyer</b>
                                    <div> {order.buyer} </div>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <b> Total Order Qty</b>
                                    <div> {order.quantity} </div>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <b> Line Qty</b>
                                    <div> {lineObj?.pcs} </div>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <b> Line Days</b>
                                    <div> {lineObj?.days} </div>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <b> National Holidays</b>
                                    <div> {findHolidaysBetweenDates(lineObj?.startDate, lineObj?.endDate, holidays)}</div>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <b> Sundays</b>
                                    <div> {findSundaysBetweenDates(lineObj?.startDate, lineObj?.endDate)}</div>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <b> Delivery Date</b>
                                    <div> {moment.utc(order.dDate).format("DD-MM-YYYY")} </div>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <b> Production Qty</b>
                                    <div> {totalLineWiseProductionQty} </div>
                                </div>
                            </div>
                            <strong className='text-xs font-bold relative z-20'> {order.orderNo} </strong>
                        </div>
                        :
                        <tr className='hidden'></tr>
                    }
                </>
                :
                <tr
                    style={{ fontSize: "10px" }} id={order.id} draggable onDragStart={(e) => { drag(e) }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    className={`orderItem noDrop select-none text-center border grabbable`}
                >
                    <td>
                        {index}
                    </td>
                    <td>
                        {order.orderNo}
                    </td>
                    <td>
                        {order.style}
                    </td>
                    <td>
                        {order.buyer}
                    </td>
                    <td>
                        {order.quantity}
                    </td>
                    <td style={{ backgroundColor: order.color }}>
                    </td>
                </tr>
            }
        </>
    )
}



export default OrderItem
