import React, { useContext } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';
import { findWorkingDaysBetweenDates, getCurrentCapacity, getDateFromDateTimeFormatToDisplay } from '../../helper';

const OrderProductionDetails = () => {



    const { currentOrder: order, currentLine, holidays, } = useContext(CapacityPlannerContext)
    const lineObj = order.lines.find(lineItem => parseInt(lineItem.id) === parseInt(currentLine?.id))
    // const totalLineWiseProductionQty = (order.OrderSizeColorWiseDetails || []).filter(i => i.line === currentLine?.name).reduce((a, c) => a + parseFloat(c?.productionQty || 0), 0)
    // const totalPcsProductionShouldBeCompletedByYesterday = getTotalPcsProductionShouldBeCompletedByYesterday(currentLine, lineObj, holidays)
    const learningCurveItems = lineObj.learningCurveItems || [];
    const productionSchedule = [];
    const workingDays = findWorkingDaysBetweenDates(lineObj.startDate, lineObj.endDate, holidays);
    const currentCapacity = parseInt(getCurrentCapacity(lineObj.efficiency, lineObj.capacity));
    let totalPcs = lineObj.pcs || 0;
    let totalProductionSchedulePcs = 0;
    for (let i = 0; i < workingDays.length; i++) {
        let currentEfficiency = (i < (learningCurveItems.length)) ? (learningCurveItems[i]?.percentage || 0) : (learningCurveItems[learningCurveItems.length - 1]?.percentage || 0);
        let currentDatePcs = getCurrentCapacity(parseInt(currentEfficiency), currentCapacity);
        let balanceQty = totalPcs - totalProductionSchedulePcs;
        let allocationQty = 0;
        if (currentDatePcs > balanceQty) {
            allocationQty += balanceQty
        } else {
            allocationQty += currentDatePcs
        }
        totalProductionSchedulePcs += allocationQty;
        productionSchedule.push({ date: workingDays[i], pcs: allocationQty })
    }

    console.log(order, "order")
    // let lineAndDateWiseProductionQtyList = (order.productionDetailsDateWise || []);
    let lineAndDateWiseProductionQtyList = (order.lineWiseProductionData || []);
    function getLineWiseDateProductionQty(date) {
        return lineAndDateWiseProductionQtyList.filter(i => i.line == currentLine.name && i.date == getDateFromDateTimeFormatToDisplay(date)).reduce((a, c) => a + parseFloat(c.qty || 0), 0)
    }



    let lineAndDateWiseProductionQty = lineAndDateWiseProductionQtyList.filter(i => i.line == currentLine.name).reduce((a, c) => a + parseFloat(c.qty || 0), 0);
    // let lineAndDateWiseProductionQty = lineAndDateWiseProductionQtyList.reduce((a, c) => a + parseFloat(c.qty || 0), 0);

    console.log(lineAndDateWiseProductionQty, "lineAndDateWiseProductionQty")


    let totalBalanceQty = totalProductionSchedulePcs - lineAndDateWiseProductionQty;
    return (
        <div className='mt-10 px-5 text-center max-h-[500px] overflow-y-auto'>
            <table className='table-fixed'>
                <thead className='top-0 sticky bg-gray-100'>
                    <tr className=' font-bold mb-1 bg-blue-300 '>
                        <th colSpan={5}>
                            Production Schedule Details
                        </th>
                    </tr>
                    <tr >
                        <th className='border border-black'> Order no.</th>
                        <th className='border border-black'> {order.orderNo}</th>
                        <th className='border border-black'> Line</th>
                        <th className='border border-black' colSpan={2}> {currentLine?.name}</th>
                    </tr>
                    <tr>
                        <th className='border border-black w-5'> S.no</th>
                        <th className='border border-black'> Date</th>
                        <th className='border border-black' > Pcs</th>
                        <th className='border border-black' > Prod.Qty</th>
                        <th className='border border-black' > Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {productionSchedule.map((prod, index) => {
                        let prodQty = getLineWiseDateProductionQty(prod.date);
                        let balQty = parseFloat(prod?.pcs || 0) - prodQty;
                        return (<tr key={prod.date}>
                            <td className='border border-black'> {index + 1}</td>
                            <td className='border border-black'> {getDateFromDateTimeFormatToDisplay(prod.date)}</td>
                            <td className='border border-black' > {prod?.pcs}</td>
                            <td className='border border-black' > {prodQty}</td>
                            {/* <td className='border border-black' > {balQty < 0 ? 0 : balQty}</td> */}
                            <td className={`border border-black ${balQty > 0 ? "text-red-700" : "text-green-700"}`} > {Math.abs(balQty)}</td>
                        </tr>)
                    }
                    )}
                    <tr className='font-bold'>
                        <td className='border border-black' colSpan={2}>Total</td>
                        <td className='border border-black'> {totalProductionSchedulePcs}</td>
                        <td className='border border-black'> {lineAndDateWiseProductionQty}</td>
                        <td className={`border border-black ${totalBalanceQty > 0 ? "text-red-700" : "text-green-700"} `}> {Math.abs(totalBalanceQty)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default OrderProductionDetails