import moment from 'moment';
import React, { useContext } from 'react'
import { findHolidaysBetweenDates, findSundaysBetweenDates } from '../../../utils/nationHolidaysHelper';
import { CapacityPlannerContext } from '../../CapacityPlanner';
import { adjust, getDateFromDateTimeFormatToDisplay, isCurrentOrderActive, isCurrentOrderLineActive } from '../../helper';
import { EMPTY_ALERT_COLOR, GREEN_ALERT_COLOR, ORANGE_ALERT_COLOR, RED_ALERT_COLOR } from '../../../Constants/colors';
import { getTotalPcsProductionShouldBeCompletedByYesterday } from '../../../utils/helper';
import { BAN_ICON, VIEW, LOCK_ICON } from '../../../utils/icons';

const OrderItem = ({ order, index = 0, tooltip = null, width = "100%", holidays, line = null, fromOrderList }) => {
    const { manualSelect, setCurrentOrder, setCurrentLine, activeLineOrder, productionMode, setCurrentDate,
        setIsOrderLineDetailOptions, setFindOrder, findOrder, setMonth, setSelectedUnit, setScrollLine, setProductionDetails,
    } = useContext(CapacityPlannerContext)
    function drag(ev) {
        ev.dataTransfer.setData("order", JSON.stringify(order));
    }
    const lineObj = (order?.lines || []).find(lineItem => parseInt(lineItem.id) === parseInt(line?.id))
    const totalLineWiseProductionQty = (order.lineWiseProductionData || []).filter(i => i.line === line?.name).reduce((a, c) => a + parseFloat(c?.productionqty || 0), 0)
    const productionPercent = Math.floor(totalLineWiseProductionQty / parseFloat(order.quantity || 0) * 100);
    const balProductionPercent = 100 - productionPercent;

    // Calculation UpTo Today;
    const totalPcsProductionShouldBeCompletedByYesterday = getTotalPcsProductionShouldBeCompletedByYesterday(line, lineObj, holidays)

    const plannedVsActualPercentage = Math.floor(totalLineWiseProductionQty / parseFloat(totalPcsProductionShouldBeCompletedByYesterday) * 100);

    let bgColor = EMPTY_ALERT_COLOR;
    if (plannedVsActualPercentage < 50) {
        bgColor = RED_ALERT_COLOR;
    } else if (plannedVsActualPercentage < 80) {
        bgColor = ORANGE_ALERT_COLOR;
    } else if (plannedVsActualPercentage >= 80) {
        bgColor = GREEN_ALERT_COLOR;
    }

    function handleFindOrder() {
        let lines = (order.lines || [])
        if (lines.length === 0) return
        setMonth(moment.utc(new Date(lines[0]?.startDate)));
        if (lines[0]?.Line?.unitId) {
            setSelectedUnit(lines[0]?.Line?.unitId);
        }
        setFindOrder({ orderId: order.id })
        setScrollLine({ lineId: lines[0]?.id })
    }
    function handleFindOrderDisable() {
        setFindOrder({})
    }



    let orderNoSplit = order.orderNo.split("/")

    orderNoSplit = orderNoSplit.slice(1).join("/");

    return (
        <>
            {fromOrderList
                ?
                <tr
                    style={{ fontSize: "10px" }} id={order.id}
                    draggable={["Pending", "Partial"].includes(order.status) && !order.isReplanned}
                    onDragStart={(e) => { drag(e) }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    className={`orderItem noDrop select-none text-center border grabbable`}
                >
                    <td style={{ backgroundColor: order.color }}>
                        {index}
                    </td>
                    <td>
                        {order.orderNo}
                    </td>
                    <td>
                        {getDateFromDateTimeFormatToDisplay(order.dDate)}
                    </td>
                    <td>
                        {order.style}
                    </td>
                    <td>
                        {order.buyer}
                    </td>
                    <td className='capitalize'>
                        {order.styleType}
                    </td>
                    <td>
                        {order.quantity}
                    </td>
                    <td>
                        {order.status}
                    </td>
                    {order.status == "Pending" ?
                        <td >
                            {BAN_ICON}
                        </td>
                        :
                        <td onClick={handleFindOrder} onBlur={handleFindOrderDisable}>
                            <button >{VIEW}</button>
                        </td>
                    }

                    <td onClick={() => { setProductionDetails(true); setCurrentOrder(order); }}>
                        <button >{VIEW}</button>
                    </td>
                </tr>
                :
                <>
                    {index === 0 ?
                        <div onMouseOver={(e) => { e.stopPropagation(); }} id={`${order?.id}/${line ? line.id : ""}`}
                            draggable={!manualSelect && !order.isReplanned} onDragStart={(e) => { drag(e) }}
                            onDragOver={(e) => { e.preventDefault(); }}
                            onClick={() => {
                                if (manualSelect) return
                                setCurrentOrder(order);
                                setCurrentLine(line);
                                setCurrentDate(lineObj?.startDate);
                                setIsOrderLineDetailOptions(true)
                            }}
                            style={{
                                background: (productionMode
                                    ?
                                    `linear-gradient(to right, ${bgColor}, ${bgColor} ${productionPercent}%, ${EMPTY_ALERT_COLOR} , ${EMPTY_ALERT_COLOR} ${balProductionPercent}%)`
                                    : (isCurrentOrderLineActive(order.id, line.id, activeLineOrder) ? adjust(order.color, -100) : order.color)),
                                width: width,
                                fontSize: "10px",
                            }}
                            className={` mix-blend-multiply py-2 relative z-20 text-center rounded-full text-xs
                            ${manualSelect ? "pointer-events-none" : ""}
                            ${(order.isReplanned) ? "cursor-pointer" : "grabbable"}
                            select-none 
                            ${manualSelect ?
                                    (isCurrentOrderLineActive(order.id, line.id, activeLineOrder) ?
                                        "z-0 transition delay-150 duration-300 ease-in-out scale-150 animate-bounce" : "") : ""}
                                        ${isCurrentOrderActive(order.id, findOrder) ? "transition delay-150 duration-300 ease-in-out animate-bounce scale-150 z-0" : ""} 
                                        `}
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
                            <strong className='text-xs font-bold relative z-20'>
                                <span>
                                    {orderNoSplit}-{order.style}
                                </span>
                                <span className="text-red-500">
                                    {order.isReplanned ?
                                        <> {LOCK_ICON}  </>
                                        : <></>}
                                </span>
                            </strong>
                        </div>
                        :
                        <tr className='hidden'></tr>
                    }
                </>

            }
        </>
    )
}



export default OrderItem
