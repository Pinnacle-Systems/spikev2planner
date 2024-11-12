import React, { useContext } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';

const OrderLineDetailOptions = () => {
    const { setIsOrderProductionDetails, setLineEntryConformation, setOpenOrderDetail, setIsOrderLineDetailOptions } = useContext(CapacityPlannerContext)

    const options = [
        { name: "Production Schedule", onClick: () => { setIsOrderProductionDetails(true); setIsOrderLineDetailOptions(false); }, className: "bg-green-600" },
        { name: "Order Details", onClick: () => { setOpenOrderDetail(true); setIsOrderLineDetailOptions(false); }, className: "bg-blue-600" },
        { name: "Change Planning", onClick: () => { setLineEntryConformation(true); setIsOrderLineDetailOptions(false); }, className: "bg-violet-600" },
    ];
    return (
        <div className='p-5 mt-5 flex items-center gap-3'>
            {options.map(option =>
                <div key={option.name}>
                    <button className={`${option.className} text-white p-1 rounded`} onClick={option.onClick}>{option.name}</button>
                </div>
            )}

        </div>
    )
}

export default OrderLineDetailOptions
