import React, { useContext, useEffect, useState } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';

import { getDateFromDateTimeFormat } from '../../helper';
import { LearningCurveInputGrid } from './LearningCurveInputGrid';

const ViewPlanDetails = () => {
    const {
        currentOrder, currentDate, currentLine,
        orders,
    } = useContext(CapacityPlannerContext);

    const [lineItems, setLineItems] = useState([]);
    const [learningCurveItems, setLearningCurveItems] = useState([]);

    useEffect(() => {
        const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
        const orderLines = structuredClone(orders[currentOrderIndex]?.['lines'] || []);
        const currentOrderLineIndex = orderLines.findIndex(i => i.id == currentLine.id);
        if (currentOrderLineIndex == -1) {
            orderLines.push({ id: currentLine.id, Line: currentLine, pcs: 0, startDate: currentDate })
        } else {
            orderLines[currentOrderLineIndex]['startDate'] = currentDate;
        }
        setLineItems(orderLines)
    }, [orders, currentOrder, currentLine, currentDate])

    const totalAllocatedQty = lineItems.reduce((a, c) => a + parseFloat(c.pcs || 0), 0)

    const balanceQty = (currentOrder.quantity || 0) - totalAllocatedQty;

    return (
        <form className={`w-[450px] flex flex-col items-center justify-center p-2 mt-5`} >
            <table className='table-fixed mt-4 w-full'>
                <thead className='top-0 sticky bg-gray-100'>
                    <tr className=' font-bold mb-1 bg-blue-300 '>
                        <th className='w-10'>
                        </th>
                        <th colSpan={4}>
                            Line Schedule Details
                        </th>
                    </tr>
                    <tr>
                        <th className='border border-black'> S.no</th>
                        <th className='border border-black'> Line</th>
                        <th className='border border-black' > Start.Date</th>
                        <th className='border border-black' > Est.End.Date</th>
                        <th className='border border-black' > Pcs</th>
                    </tr>
                    <tr>
                        <th className='border border-black'> </th>
                        <th className='border border-black'> Order Total Pcs</th>
                        <th className='border border-black'> </th>
                        <th className='border border-black'> </th>
                        <th className='border border-black text-right' > {currentOrder.quantity || 0}</th>
                    </tr>
                </thead>
                <tbody>
                    {lineItems.map((line, index) =>
                        <tr key={line.id} className={`${(currentLine.id == line.id) ? 'bg-green-200' : ''}`}>
                            <td className='border border-black text-center'> {index + 1}</td>
                            <td className='border border-black'> {line?.Line?.name}</td>
                            <td className='border border-black text-right' >
                                <input required type="date" className='text-right focus:outline-none w-full' value={getDateFromDateTimeFormat(line?.startDate)}
                                    disabled /> </td>
                            <td className='border border-black text-right' >
                                <input type="date" className='text-right focus:outline-none w-full'
                                    value={getDateFromDateTimeFormat(line.endDate)}
                                    disabled /> </td>
                            <td className='border border-black text-right' >
                                <input type="number" min={0} className='text-right focus:outline-none w-full' value={line?.pcs}
                                    disabled
                                /> </td>
                        </tr>
                    )}
                    <tr>
                        <td className='border border-black' colSpan={1}></td>
                        <td className='border border-black text-center' colSpan={1}>Total Allocated</td>
                        <td className='border border-black text-center' colSpan={1}></td>
                        <td className='border border-black text-center' colSpan={1}></td>
                        <td className='border border-black text-right' > {totalAllocatedQty}</td>
                    </tr>
                    <tr>
                        <td className='border border-black' colSpan={1}></td>
                        <td className='border border-black text-center' colSpan={1}>Balance</td>
                        <td className='border border-black text-center' colSpan={1}></td>
                        <td className='border border-black text-center' colSpan={1}></td>
                        <td className='border border-black text-right' > {balanceQty}</td>
                    </tr>
                </tbody>
            </table>
            <LearningCurveInputGrid learningCurveItems={learningCurveItems} setLearningCurveItems={setLearningCurveItems} readOnly />
        </form>
    )
}

export default ViewPlanDetails