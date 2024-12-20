import React, { useContext, useState } from 'react'
import OrderItem from "./OrderItem"
import { CapacityPlannerContext } from '../../CapacityPlanner';

const OrderList = () => {

    const {
        orders, setOrders,
        holidays,
    } = useContext(CapacityPlannerContext)

    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState("")

    function drop(ev) {
        ev.preventDefault();
        const order = JSON.parse(ev.dataTransfer.getData("order"));
        const currentOrderIndex = orders.findIndex(ord => parseInt(ord.id) === parseInt(order.id));
        const newOrders = [...orders]
        newOrders[currentOrderIndex]["lines"] = []
        setOrders(newOrders);
    }

    let ordersForLines = orders.map(ord => {
        let status = "Pending";
        let isFullyCompleted = (ord.lines).reduce((a, c) => a + parseFloat(c.pcs || 0), 0) == ord.quantity;
        if (isFullyCompleted) {
            status = "Allocated";
        } else if (ord.lines.length > 0) {
            status = "Partial";
        }
        return { ...ord, status }
    })

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
                    <thead className='text-xs sticky z-10 top-0 '>
                        <tr>
                            <td className='border border-black' colSpan={9} >
                                <div className='flex justify-center items-center'>
                                    <input type="text" placeholder='Search Order,Style' className='w-full p-1 my-1 outline-none' autoFocus
                                        value={searchText} onChange={(e) => { setSearchText(e.target.value) }}
                                    />
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <thead className='text-xs sticky z-10 top-0 '>
                        <tr>
                            <td className='border border-black' colSpan={9} >
                                <div className='flex items-center gap-16'>
                                    <label htmlFor="" className='w-1/4 pl-2'>Status</label>
                                    <select name="" id="" className='text-center w-3/4' value={statusFilter}
                                        onChange={(e) => { setStatusFilter(e.target.value) }}>
                                        <option value="">All</option>
                                        <option value="Allocated">Allocated</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Partial">Partial</option>
                                    </select>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <thead className='text-xs sticky bg-gray-300 z-10 top-0 '>
                        <tr>
                            <td className='border border-black'>S.no</td>
                            <td className='border border-black'>Order&nbsp;no.</td>
                            <td className='border border-black'>Style</td>
                            <td className='border border-black'>Buyer</td>
                            <td className='border border-black'>Style Type</td>
                            <td className='border border-black'>Qty</td>
                            <td className='border border-black'>Status</td>
                            <td className='border border-black'>Find</td>
                            <td className='border border-black'>Prod.Det</td>
                        </tr>
                    </thead>
                    <tbody>
                        {ordersForLines.filter(i =>
                            (!i.isReplanned)
                            &&
                            (i.balanceQty > 0)
                            &&
                            (statusFilter ? (i.status == statusFilter) : true)
                            &&
                            (searchText ? ((i?.orderNo || '').toLowerCase().includes(searchText.toLowerCase()) || (i?.style || '').toLowerCase().includes(searchText.toLowerCase())) : true)
                        ).map((order, index) =>
                            <OrderItem key={order.id} index={index + 1} order={order} holidays={holidays} fromOrderList />
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default OrderList
