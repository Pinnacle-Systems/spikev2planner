import moment from 'moment';
import React, { useContext } from 'react'
import { findHolidaysBetweenDates, findSundaysBetweenDates } from '../../../utils/nationHolidaysHelper';
import { CapacityPlannerContext } from '../../CapacityPlanner';
import { adjust, getDateFromDateTimeFormatToDisplay, isCurrentOrderActive, isCurrentOrderLineActive } from '../../helper';
import { EMPTY_ALERT_COLOR, GREEN_ALERT_COLOR, ORANGE_ALERT_COLOR, RED_ALERT_COLOR } from '../../../Constants/colors';
import { getTotalPcsProductionShouldBeCompletedByYesterday } from '../../../utils/helper';
import { BAN_ICON, VIEW, LOCK_ICON } from '../../../utils/icons';

const OrderItem = ({
    order,
    index = 0,
    tooltip = null,
    width = "100%",
    holidays,
    line = null,
    fromOrderList,
    startsBefore = false,
    endsAfter = false
}) => {


    const { manualSelect, setCurrentOrder, setCurrentLine, activeLineOrder, productionMode, setCurrentDate,
        setIsOrderLineDetailOptions, setFindOrder, findOrder, setMonth, setSelectedUnit, setScrollLine, setProductionDetails,
        selectedUnit, setCalendarViewMode,
    } = useContext(CapacityPlannerContext)

    const findOrderTimeoutRef = React.useRef(null);

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

    function handleFindOrder(e) {
        if (e) e.stopPropagation();
        const lines = order?.lines || [];
        if (lines.length === 0) return;

        // Toggle off if already active
        if (findOrder?.orderId && parseInt(findOrder.orderId) === parseInt(order.id)) {
            setFindOrder({});
            return;
        }

        const targetLine = lines[0];
        const unitId = targetLine?.Line?.unitId || targetLine?.unitId || targetLine?.Line?.Unit?.id;

        if (unitId && String(selectedUnit) !== String(unitId)) {
            setSelectedUnit(String(unitId));
            sessionStorage.setItem("selectedUnit", String(unitId));
        }

        if (targetLine?.startDate) {
            setMonth(moment.utc(new Date(targetLine.startDate)));
            if (setCalendarViewMode) {
                setCalendarViewMode('month');
            }
        }

        const lineId = targetLine?.lineId || targetLine?.id;
        setFindOrder({ orderId: order.id, lineId, date: targetLine?.startDate });

        if (findOrderTimeoutRef.current) {
            clearTimeout(findOrderTimeoutRef.current);
        }
        findOrderTimeoutRef.current = setTimeout(() => {
            setFindOrder({});
        }, 5000);
    }



    let orderNoSplit = order.orderNo.split("/")

    orderNoSplit = orderNoSplit.slice(1).join("/");

    console.log(fromOrderList, "fromOrderListfromOrderList")
    return (
        <>
            {fromOrderList
                ?
                <tr
                    style={{ fontSize: "11px" }} id={order.id}
                    draggable={["Pending", "Partial"].includes(order.status) && !order.isReplanned}
                    onDragStart={(e) => { drag(e) }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    className={`orderItem noDrop select-none text-center border grabbable`}
                    onClick={handleFindOrder}
                >
                    <td
                    >
                        {index}
                    </td>
                    <td className='py-1 border border-grya-200'>
                        {order.orderNo}
                    </td>
                    <td className='py-1 border border-grya-200'>
                        {getDateFromDateTimeFormatToDisplay(order.dDate)}
                    </td>
                    <td className='py-1 border border-grya-200'>
                        {order.style}
                    </td>
                    <td className='py-1 border border-grya-200'>
                        {order.buyer}
                    </td>
                    <td className='capitalize py-1 border border-grya-200'>
                        {order.styleType}
                    </td>
                    <td className='py-1 border border-grya-200'>
                        {order.quantity}
                    </td>
                    {/* <td>
                        <strong>
                            {parseInt(order?.timeAndAction?.fPer || 0)}%
                        </strong>
                    </td>
                    <td>
                        <strong>
                            {parseInt(order?.timeAndAction?.tPer || 0)}%
                        </strong>
                    </td> */}
                    <td className='py-1 border border-grya-200'>
                        {order.status}
                    </td>
                    {/* {order.status == "Pending" ?
                        <td className='py-1 border border-grya-200'>
                            {BAN_ICON}
                        </td>
                        :
                        <td onClick={handleFindOrder} className='py-1 border border-slate-200 text-center cursor-pointer'>
                            <button
                                type="button"
                                title={isCurrentOrderActive(order.id, findOrder) ? "Active in calendar (click to cancel)" : "Find order in calendar"}
                                className={`p-1 rounded transition-colors ${isCurrentOrderActive(order.id, findOrder) ? "text-orange-600 bg-orange-100 font-bold scale-110" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
                            >
                                {VIEW}
                            </button>
                        </td>
                    } */}

                    <td className='py-1 border border-grya-200' onClick={() => { setProductionDetails(true); setCurrentOrder(order); }}>
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
                            className={` mix-blend-multiply py-2 relative z-20 text-center text-xs
                            ${(startsBefore && endsAfter) ? 'rounded-none' : startsBefore ? 'rounded-r-full rounded-l-none border-l-2 border-slate-700/40' : endsAfter ? 'rounded-l-full rounded-r-none border-r-2 border-slate-700/40' : 'rounded-full'}
                            ${manualSelect ? "pointer-events-none" : ""}
                            ${(order.isReplanned) ? "cursor-pointer" : "grabbable"}
                            select-none 
                            ${manualSelect ?
                                    (isCurrentOrderLineActive(order.id, line.id, activeLineOrder) ?
                                        "z-0 transition delay-150 duration-300 ease-in-out scale-150 animate-bounce" : "") : ""}
                                        ${isCurrentOrderActive(order.id, findOrder) ? "transition delay-150 duration-300 ease-in-out animate-bounce scale-110 !z-30 ring-4 ring-orange-500 shadow-2xl" : ""} 
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
                            <strong className='text-xs font-bold relative z-20 flex items-center justify-center gap-1 px-1 overflow-hidden'>
                                {startsBefore && (
                                    <span className="text-[10px] text-slate-900 font-black shrink-0" title="Started before this view">◀</span>
                                )}
                                <span className="truncate">
                                    {orderNoSplit}-{order.style}
                                </span>
                                <span className="text-red-500 shrink-0">
                                    {order.isReplanned ?
                                        <> {LOCK_ICON}  </>
                                        : <></>}
                                </span>
                                {endsAfter && (
                                    <span className="text-[10px] text-slate-900 font-black shrink-0" title="Continues past this view">▶</span>
                                )}
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
