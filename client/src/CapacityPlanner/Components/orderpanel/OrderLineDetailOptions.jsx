import React, { useContext } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';

const OrderLineDetailOptions = () => {
    const { setIsOrderProductionDetails, setLineEntryConformation, setOpenOrderDetail, setIsOrderLineDetailOptions, setOrders, currentOrder, currentLine } = useContext(CapacityPlannerContext)
    function removeOrderFromLine() {
        setOrders(prev => {
            let orders = structuredClone(prev);
            const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder.id));
            const newOrders = [...orders]
            newOrders[currentOrderIndex]["lines"] = newOrders[currentOrderIndex]["lines"].filter(line => parseInt(line.id) !== parseInt(currentLine.id));
            return newOrders
        });
    }
    function removeOrder() {
        setOrders(prev => {
            let orders = structuredClone(prev);
            const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder.id));
            const newOrders = [...orders]
            newOrders[currentOrderIndex]["lines"] = [];
            return newOrders
        });
    }
    const options = [
        { name: "Production Schedule", onClick: () => { setIsOrderProductionDetails(true); setIsOrderLineDetailOptions(false); }, className: "bg-green-600" },
        { name: "Order Details", onClick: () => { setOpenOrderDetail(true); setIsOrderLineDetailOptions(false); }, className: "bg-blue-600" },
        { name: "Change Planning", onClick: () => { setLineEntryConformation(true); setIsOrderLineDetailOptions(false); }, className: "bg-violet-600" },
        { name: "Delete Strip", onClick: () => { removeOrderFromLine(); setIsOrderLineDetailOptions(false); }, className: "bg-red-600" },
        { name: "Delete All Strips ", onClick: () => { removeOrder(); setIsOrderLineDetailOptions(false); }, className: "bg-red-600" },
    ];
    return (
        <div className='mt-10'>
            <div className='grid grid-cols-2 bg-gray-200 p-1'>
                <div>
                    Current Selected Order:
                    <strong>
                        {currentOrder.orderNo}
                    </strong>
                </div>
                <div>
                    Current Selected Line:
                    <strong>
                        {currentLine?.name}
                    </strong>
                </div>
            </div>
            <div className='p-5 mt-5 flex items-center gap-3'>
                {options.map(option =>
                    <div key={option.name}>
                        <button className={`${option.className} text-white p-1 rounded`} onClick={option.onClick}>{option.name}</button>
                    </div>
                )}

            </div>
        </div>
    )
}

export default OrderLineDetailOptions
