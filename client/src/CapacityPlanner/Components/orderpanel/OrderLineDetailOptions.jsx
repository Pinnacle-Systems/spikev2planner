import React, { useContext } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';
import axios from 'axios';
import { ORDERS_API } from '../../../Constants/Api';
import { toast } from 'react-toastify';
import { getDateFromDateTimeFormatToDisplay } from '../../helper';

const BASE_URL = process.env.REACT_APP_SERVER_URL;


const OrderLineDetailOptions = () => {
    const { setIsOrderProductionDetails, setLineEntryConformation, setOpenOrderDetail, setIsOrderLineDetailOptions, setOrders, currentOrder, currentLine, setViewPlanDetails,
        setReduceEndDate, prevOrders
    } = useContext(CapacityPlannerContext)
    function removeOrderFromLine() {
        if (!window.confirm("Do you want to delete this strip?")) return
        setOrders(prev => {
            let orders = structuredClone(prev);
            const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder.id));
            const newOrders = [...orders]
            newOrders[currentOrderIndex]["lines"] = newOrders[currentOrderIndex]["lines"].filter(line => parseInt(line.id) !== parseInt(currentLine.id));
            return newOrders
        });
        setIsOrderLineDetailOptions(false);
    }
    function removeOrder() {
        if (!window.confirm("Do you want to delete all strips?")) return
        setOrders(prev => {
            let orders = structuredClone(prev);
            const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder.id));
            const newOrders = [...orders]
            newOrders[currentOrderIndex]["lines"] = [];
            return newOrders
        });
        setIsOrderLineDetailOptions(false);
    }

    function replanOrder() {
        axios.put(BASE_URL + ORDERS_API + `/${currentOrder.id}`, { isReplanOrder: true })
            .then(data => {
                if (data.data?.statusCode == 1) {
                    toast.error(data?.data?.message);
                } else {
                    window.location.search = data?.data?.data?.orderNo;
                    window.location.reload();
                    toast.success("Order Replanned Successfully...!!!");
                }
            }).catch(err => {
                console.error(err)
            })
    }

    let options = [
        { name: "Production Schedule", onClick: () => { setIsOrderProductionDetails(true); setIsOrderLineDetailOptions(false); }, className: "bg-green-600" },
        { name: "Order Details", onClick: () => { setOpenOrderDetail(true); setIsOrderLineDetailOptions(false); }, className: "bg-blue-600" },

    ];
    if (!currentOrder.isReplanned) {
        options = [
            ...options,
            { name: "Edit Planning", onClick: () => { setLineEntryConformation(true); setIsOrderLineDetailOptions(false); }, className: "bg-violet-600" },
            { name: "Delete Strip", onClick: () => { removeOrderFromLine(); }, className: "bg-red-600" },
            { name: "Delete All Strips ", onClick: () => { removeOrder(); }, className: "bg-red-600" },
            { name: "Replan Order", onClick: replanOrder, className: "bg-orange-600" },
        ]
    } else {
        options = [
            ...options,
            { name: "View Plan", onClick: () => { setViewPlanDetails(true); setIsOrderLineDetailOptions(false); }, className: "bg-violet-600" },
            { name: "Change End Date", onClick: () => { setReduceEndDate(true); setIsOrderLineDetailOptions(false); }, className: "bg-red-600" },
        ]
    }
    return (
        <div className='mt-10'>
            <div className='grid grid-cols-3 bg-gray-200 p-1 gap-3'>
                <div>
                    Current Selected Order:
                    <strong>
                        {currentOrder.orderNo}
                    </strong>
                </div>
                <div>
                    Del.Date:
                    <strong>
                        {getDateFromDateTimeFormatToDisplay(currentOrder.dDate)}
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
