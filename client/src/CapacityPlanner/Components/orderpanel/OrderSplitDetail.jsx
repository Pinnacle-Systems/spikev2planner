import React, { useContext } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';
import { getCurrentCapacity } from '../CalendarWithManyLines/helper';
import { getBalancePcs, getTotalPcsInLineOrder } from '../../helper';

export const OrderSplitDetail = () => {
    const { orders, setOrders, currentOrder, lines, setActiveLineOrder } = useContext(CapacityPlannerContext)
    const currentUpdateOrderDetails = orders.find(o => parseInt(o.id) === parseInt(currentOrder.id))
    const getLine = (id) => lines.find(l => parseInt(l.id) === parseInt(id))
    function removeOrderFromLine(e, updatingOrder, lineObj) {
        e.stopPropagation();
        const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(updatingOrder.id));
        const newOrders = [...orders]
        newOrders[currentOrderIndex]["lines"] = newOrders[currentOrderIndex]["lines"].filter(line => parseInt(line.id) !== parseInt(lineObj.id));
        setOrders(newOrders);
    }
    const balancePcs = getBalancePcs(currentOrder.quantity, getTotalPcsInLineOrder(orders, currentOrder));
    return (
        <div className='mt-5 h-5/6 w-full text-black'>
            <div className='grid grid-cols-2 justify-center text-center border border-black'><span className='border-r border-black'>Order no.</span> <span>{currentOrder.orderNo}</span></div>
            <div className='grid grid-cols-2 justify-center text-center border-x border-b border-black'><span className='border-r border-inherit'>Total quantity</span> <span>{currentOrder.quantity}</span></div>
            <div className='h-3/4 overflow-auto mt-4'>
                <table className="w-full text-xs text-center">
                    <thead className='sticky top-0 bg-white'>
                        <tr className='border border-black'>
                            <th className="text-center ">Line</th>
                            <th className="text-center ">Current Capacity</th>
                            <th className="text-center">Days</th>
                            {/* <th className="text-center">Max. pcs</th> */}
                            <th className="text-center">Pcs</th>
                            <th className="text-center">Close</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUpdateOrderDetails?.lines.sort(function (a, b) { return parseInt(a.id) - parseInt(b.id) }).map((line, index) => (
                            <tr key={index} className='border border-black hover:bg-yellow-400 cursor-cell'
                                onMouseOver={() => { setActiveLineOrder({ orderId: currentOrder.id, lineId: line.id }) }}
                                onMouseOut={() => { setActiveLineOrder({}) }}
                            >
                                <td>
                                    <pre>
                                        {getLine(line.id).name}
                                    </pre>
                                </td>
                                <td>
                                    {getCurrentCapacity(getLine(line.id).efficiency, getLine(line.id).capacity)}
                                </td>
                                <td>
                                    {line?.days}
                                </td>
                                {/* <td>
                                    {parseInt(getCurrentCapacity(getLine(line.id).efficiency, getLine(line.id).capacity)) * parseInt(line?.days)}
                                </td> */}
                                <td>
                                    {line?.pcs}
                                </td>
                                <td className='flex items-center justify-center h-5'>
                                    <button className='hover:bg-red-400' onClick={(e) => removeOrderFromLine(e, currentOrder, line)}>X</button>
                                </td>
                            </tr>
                        ))}
                        <tr className='border border-black'>
                            <td colSpan={2} className='border border-black'>
                                Allocated Qty
                            </td>
                            <td colSpan={2}>
                                {getTotalPcsInLineOrder(orders, currentOrder)}
                            </td>
                        </tr>
                        <tr className='border border-black'>
                            <td colSpan={2} className='border border-black'>
                                Balance Qty
                            </td>
                            <td colSpan={2}>
                                {/* {balancePcs < 0 ? 0 : balancePcs} */}
                                {balancePcs}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
