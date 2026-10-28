import React, { useContext, useEffect, useState } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';
import { getDateFromDateTimeFormat } from '../../helper';

const ReduceEndDate = () => {
    const {
        setReduceEndDate,
        currentOrder, currentDate, currentLine,
        orders, setOrders,
        prevOrders,
        setIsModified
    } = useContext(CapacityPlannerContext);

    const [lineItems, setLineItems] = useState([]);

    useEffect(() => {
        const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
        const orderLines = structuredClone(orders[currentOrderIndex]?.['lines'] || []);
        const currentOrderLineIndex = orderLines.findIndex(i => i.id == currentLine.id);
        const formattedCurrentDate = getDateFromDateTimeFormat(currentDate);
        if (currentOrderLineIndex == -1) {
            orderLines.push({ id: currentLine.id, Line: currentLine, pcs: 0, startDate: formattedCurrentDate })
        } else {
            orderLines[currentOrderLineIndex]['startDate'] = formattedCurrentDate;
        }
        setLineItems(orderLines)
    }, [orders, currentOrder, currentLine, currentDate])

    const handleNoSplit = (e) => {
        e.preventDefault();
        if (!window.confirm("Confirm Update Changes ?")) {
            return
        }
        let currentLineDetails = lineItems?.find(i => i.id == currentLine.id);
        if (!currentLineDetails) return
        const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
        let newOrders = structuredClone(orders);
        if (currentOrderIndex != -1) {
            newOrders[currentOrderIndex]['lines'] = lineItems;
        }
        setOrders(newOrders);
        setReduceEndDate(false);
        setIsModified(true);
    }

    const totalAllocatedQty = lineItems.reduce((a, c) => a + parseFloat(c.pcs || 0), 0)

    const balanceQty = (currentOrder.quantity || 0) - totalAllocatedQty;

    function handleChange(index, field, value) {
        setLineItems(prev => {
            let newItems = structuredClone(prev);
            newItems[index][field] = value;
            const totalAllocatedQty = newItems.reduce((a, c) => a + parseFloat(c.pcs || 0), 0)
            const balanceQty = (currentOrder.quantity || 0) - totalAllocatedQty;
            if (balanceQty < 0) {
                return prev;
            }
            return newItems
        })
    }

    function getValidationEndDate(lineId) {
        const orders = prevOrders.current;
        const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
        let currentOrderLineIndex = -1;
        if (currentOrderIndex != -1) {
            currentOrderLineIndex = orders[currentOrderIndex]['lines'].findIndex(l => parseInt(l.id) == parseInt(lineId));
            if (currentOrderLineIndex != -1) {
                return getDateFromDateTimeFormat(orders[currentOrderIndex]['lines'][currentOrderLineIndex]?.["endDate"]);
            } else {
                return ''
            }
        }
    }

    return (
        <>
            <form className={`w-[450px] flex flex-col items-center justify-center p-2 mt-5`} onSubmit={handleNoSplit} >
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
                            <th className='border border-black' > End.Date</th>
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
                                        min={getDateFromDateTimeFormat(line.startDate)}
                                        max={getValidationEndDate(line.id)}
                                        onChange={(e) => { handleChange(index, 'endDate', e.target.value) }} /> </td>
                                <td className='border border-black text-right' >
                                    <input type="number" min={0} className='text-right focus:outline-none w-full' value={line?.pcs}
                                        disabled /> </td>
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
                <div className='flex justify-evenly w-full mt-5'>
                    <button type='submit' className='bg-green-200 text-green-700 p-1 rounded hover:bg-red-300'
                    > Update Changes</button>
                    <button type='button' className='bg-red-200 text-red-700 p-1 rounded hover:bg-red-300'
                        onClick={() => { setReduceEndDate(false) }}>
                        Cancel
                    </button>
                </div>
            </form>
        </>
    )
}

export default ReduceEndDate