import React, { useContext } from 'react'
import OrderItem from "./OrderItem"
import { CapacityPlannerContext } from '../../CapacityPlanner';

const OrderList = () => {

    const {
        orders, setOrders,
        holidays,
    } = useContext(CapacityPlannerContext)


    function drop(ev) {
        ev.preventDefault();
        const order = JSON.parse(ev.dataTransfer.getData("order"));
        const currentOrderIndex = orders.findIndex(ord => parseInt(ord.id) === parseInt(order.id));
        const newOrders = [...orders]
        newOrders[currentOrderIndex]["lines"] = []
        setOrders(newOrders);
    }

    return (
        <div className='w-full h-[400px]'
            onDragOver={(e) => {
                e.preventDefault();
            }}
            onDragLeave={(e) => {
                e.preventDefault();
            }}
            onDrop={(e) => { e.preventDefault(); drop(e); }}
        >
            <h2 className='text-center w-full  select-none text-lg'>Orders</h2>
            <div id="ordersList" className='flex flex-col gap-1 border-2  w-full overflow-auto h-full'>
                <table className='table-fixed border border-black'>
                    <thead className='text-xs sticky bg-gray-300 z-10 top-0 '>
                        <tr>
                            <td className='border border-black'>S.no</td>
                            <td className='border border-black'>Order&nbsp;no.</td>
                            <td className='border border-black'>Style</td>
                            <td className='border border-black'>Buyer</td>
                            <td className='border border-black'>Style Type</td>
                            <td className='border border-black'>Qty</td>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.filter(item => item.lines.length === 0).map((order, index) => <OrderItem key={order.id} index={index + 1} order={order} holidays={holidays} />
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default OrderList
