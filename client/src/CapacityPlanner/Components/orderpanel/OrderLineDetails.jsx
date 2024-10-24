import React, { useContext } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';
import { findHolidaysBetweenDates, findSundaysBetweenDates } from '../../../utils/nationHolidaysHelper';
import moment from 'moment';
import { getTotalPcsProductionShouldBeCompletedByYesterday } from '../../../utils/helper';
import { LearningCurveInputGrid } from '../LineDataCoformationForm/LearningCurveInputGrid';

const OrderLineDetails = () => {
    const { currentOrder: order, currentLine, holidays, } = useContext(CapacityPlannerContext)
    const lineObj = order.lines.find(lineItem => parseInt(lineItem.id) === parseInt(currentLine?.id))
    const totalLineWiseProductionQty = (order.OrderSizeColorWiseDetails || []).filter(i => i.line === currentLine?.name).reduce((a, c) => a + parseFloat(c?.productionQty || 0), 0)
    const totalPcsProductionShouldBeCompletedByYesterday = getTotalPcsProductionShouldBeCompletedByYesterday(currentLine, lineObj, holidays)

    return (
        <div className=' w-[350px] p-7 mt-4 text-center z-50'>
            <div className=' font-bold mb-1 bg-green-300'> Order Details </div>
            <div className='border border-gray-500 w-full'>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Order no.</b>
                    <div className='border border-black'> {order.orderNo}</div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Style Ref</b>
                    <div className='border border-black'> {order.style} </div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Buyer</b>
                    <div className='border border-black'> {order.buyer} </div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Total Order Qty</b>
                    <div className='border border-black'> {order.quantity} </div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Line</b>
                    <div className='border border-black'> {currentLine?.name} </div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Line Qty</b>
                    <div className='border border-black font-semibold text-blue-600 font-sans'> {lineObj?.pcs} </div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Line Days</b>
                    <div className='border border-black font-semibold text-blue-600 font-sans'> {lineObj?.days} </div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> National Holidays</b>
                    <div className='border border-black text-orange-700 font-semibold font-mono'> {findHolidaysBetweenDates(lineObj?.startDate, lineObj?.endDate, holidays)}</div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Sundays</b>
                    <div className='border border-black text-green-600 font-mono'> {findSundaysBetweenDates(lineObj?.startDate, lineObj?.endDate)}</div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Delivery Date</b>
                    <div className='border border-black'> {moment.utc(order.dDate).format("DD-MM-YYYY")} </div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Planned Qty</b>
                    <div className='border border-black'> {totalPcsProductionShouldBeCompletedByYesterday} </div>
                </div>
                <div className='grid grid-cols-2'>
                    <b className='border border-black'> Production Qty</b>
                    <div className='border border-black'> {totalLineWiseProductionQty} </div>
                </div>
                {console.log(lineObj, 'learningCurveItems')}
                <LearningCurveInputGrid learningCurveItems={lineObj?.learningCurveItems || []} readOnly />
            </div>
        </div>
    )
}

export default OrderLineDetails