// import React, { useContext, useState } from 'react'
// import OrderItem from "./OrderItem"
// import { CapacityPlannerContext } from '../../CapacityPlanner';

// const OrderList = () => {

//     const {
//         orders, setOrders,
//         holidays,
//     } = useContext(CapacityPlannerContext)

//     const [searchText, setSearchText] = useState('');
//     const [statusFilter, setStatusFilter] = useState("")

//     function drop(ev) {
//         ev.preventDefault();
//         const order = JSON.parse(ev.dataTransfer.getData("order"));
//         const currentOrderIndex = orders.findIndex(ord => parseInt(ord.id) === parseInt(order.id));
//         const newOrders = [...orders]
//         newOrders[currentOrderIndex]["lines"] = []
//         setOrders(newOrders);
//     }

//     let ordersForLines = orders.map(ord => {
//         let status = "Pending";
//         let isFullyCompleted = (ord.lines).reduce((a, c) => a + parseFloat(c.pcs || 0), 0) == ord.quantity;
//         if (isFullyCompleted) {
//             status = "Allocated";
//         } else if (ord.lines.length > 0) {
//             status = "Partial";
//         }
//         return { ...ord, status }
//     })

//     return (
//         <div className='w-full h-[400px]'
//             onDragOver={(e) => {
//                 e.preventDefault();
//             }}
//             onDragLeave={(e) => {
//                 e.preventDefault();
//             }}
//             onDrop={(e) => { e.preventDefault(); drop(e); }}
//         >
//             {/* <h2 className='text-center w-full  select-none text-lg'>Orders</h2> */}
//             <div id="ordersList" className='flex flex-col gap-1 border-2  w-full overflow-auto h-[calc(100vh-100px)]'>
//                 <table className='table-fixed border border-black'>
//                     <thead className='text-xs sticky z-10 top-0 '>
//                         <tr>
//                             <td className='border border-black' colSpan={9} >
//                                 <div className='flex justify-center items-center'>
//                                     <input type="text" placeholder='Search Order,Style' className='w-full p-1 my-1 outline-none' autoFocus
//                                         value={searchText} onChange={(e) => { setSearchText(e.target.value) }}
//                                     />
//                                 </div>
//                             </td>
//                         </tr>
//                     </thead>
//                     <thead className='text-xs sticky z-10 top-0 '>
//                         <tr>
//                             <td className='border border-black' colSpan={9} >
//                                 <div className='flex items-center gap-16'>
//                                     <label htmlFor="" className='w-1/4 pl-2'>Status</label>
//                                     <select name="" id="" className='text-center w-3/4' value={statusFilter}
//                                         onChange={(e) => { setStatusFilter(e.target.value) }}>
//                                         <option value="">All</option>
//                                         <option value="Allocated">Allocated</option>
//                                         <option value="Pending">Pending</option>
//                                         <option value="Partial">Partial</option>
//                                     </select>
//                                 </div>
//                             </td>
//                         </tr>
//                     </thead>
//                     <thead className='text-xs sticky bg-gray-300 z-10 top-0 '>
//                         <tr>
//                             <td className='border border-black'>S.no</td>
//                             <td className='border border-black'>Order&nbsp;no.</td>
//                             <td className='border border-black'>Del.Date</td>
//                             <td className='border border-black'>Style</td>
//                             <td className='border border-black'>Buyer</td>
//                             <td className='border border-black'>Style Type</td>
//                             <td className='border border-black'>Qty</td>
//                             <td className='border border-black'>F%</td>
//                             <td className='border border-black'>T%</td>
//                             <td className='border border-black'>Status</td>
//                             <td className='border border-black'>Find</td>
//                             <td className='border border-black'>Prod.Det</td>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {ordersForLines.filter(i =>
//                             (!i.isReplanned)
//                             &&
//                             (i.balanceQty > 0)
//                             &&
//                             (statusFilter ? (i.status == statusFilter) : true)
//                             &&
//                             (searchText ? ((i?.orderNo || '').toLowerCase().includes(searchText.toLowerCase()) || (i?.style || '').toLowerCase().includes(searchText.toLowerCase())) : true)
//                         ).map((order, index) =>
//                             <OrderItem key={order.id} index={index + 1} order={order} holidays={holidays} fromOrderList />
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     )
// }

// export default OrderList

import React, { useContext, useMemo, useState } from 'react'
import { Search, X, Inbox } from 'lucide-react'
import OrderItem from "./OrderItem"
import { CapacityPlannerContext } from '../../CapacityPlanner';

const TABS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Partial', value: 'Partial' },
    { label: 'Allocated', value: 'Allocated' },
];

const HEADERS = ['S.no', 'Order no.', 'Del. date', 'Style', 'Buyer', 'Style type',
    'Qty', 'F%', 'T%', 'Status', 'Find', 'Prod. det'];

const OrderList = () => {

    const {
        orders, setOrders,
        holidays,
    } = useContext(CapacityPlannerContext)

    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);

    function drop(ev) {
        ev.preventDefault();
        const raw = ev.dataTransfer.getData("order");
        if (!raw) return;
        const order = JSON.parse(raw);
        const currentOrderIndex = orders.findIndex(ord => parseInt(ord.id) === parseInt(order.id));
        if (currentOrderIndex === -1) return;
        const newOrders = [...orders];
        newOrders[currentOrderIndex] = { ...newOrders[currentOrderIndex], lines: [] };
        setOrders(newOrders);
    }

    const ordersForLines = useMemo(() => orders.map(ord => {
        let status = "Pending";
        const isFullyCompleted = (ord.lines).reduce((a, c) => a + parseFloat(c.pcs || 0), 0) == ord.quantity;
        if (isFullyCompleted) {
            status = "Allocated";
        } else if (ord.lines.length > 0) {
            status = "Partial";
        }
        return { ...ord, status }
    }), [orders]);

    const baseOrders = useMemo(
        () => ordersForLines.filter(i => !i.isReplanned && i.balanceQty > 0),
        [ordersForLines]
    );

    const counts = useMemo(() => ({
        '': baseOrders.length,
        Pending: baseOrders.filter(i => i.status === 'Pending').length,
        Partial: baseOrders.filter(i => i.status === 'Partial').length,
        Allocated: baseOrders.filter(i => i.status === 'Allocated').length,
    }), [baseOrders]);

    const visibleOrders = useMemo(() => {
        const s = searchText.trim().toLowerCase();
        return baseOrders.filter(i =>
            (statusFilter ? i.status === statusFilter : true) &&
            (s ? (i?.orderNo || '').toLowerCase().includes(s) ||
                (i?.style || '').toLowerCase().includes(s) : true)
        );
    }, [baseOrders, statusFilter, searchText]);

    return (
        // ROOT: fills parent height. min-h-0 and min-w-0 let flex children shrink so the inner area can scroll.
        <div
            className={`flex flex-col w-full h-full min-h-0 min-w-0 bg-white border border-slate-200 rounded-xl overflow-hidden transition
                ${isDragOver ? 'ring-2 ring-orange-600 bg-orange-50/40' : ''}`}
            style={{ height: 'calc(100vh - 60px)' }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => {
                e.preventDefault();
                if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false);
            }}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); drop(e); }}
        >
            {/* Header (fixed) */}
            <div className="shrink-0 flex items-center justify-between px-3 pt-3 pb-2">
                <h2 className="text-sm font-semibold text-slate-900">Order backlog</h2>
                <span className="text-xs text-slate-600">
                    {visibleOrders.length} of {baseOrders.length} orders
                </span>
            </div>

            {/* Search (fixed) */}
            <div className="shrink-0 px-3 pb-2">
                <div className="relative">
                    <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder="Search order no. or style"
                        aria-label="Search orders"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full h-9 pl-8 pr-8 text-sm rounded-lg border border-slate-300 bg-slate-50 outline-none
                                   focus:bg-white focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    />
                    {searchText && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setSearchText('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200 text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Status tabs (fixed) */}
            <div className="shrink-0 flex gap-1 px-3 pb-2 border-b border-slate-200" role="tablist" aria-label="Order status">
                {TABS.map(t => {
                    const active = statusFilter === t.value;
                    return (
                        <button
                            key={t.label}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setStatusFilter(t.value)}
                            className={`flex-1 h-8 rounded-md text-xs font-medium transition
                                ${active ? 'bg-[#16345F] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            {t.label}
                            <span className={`ml-1 ${active ? 'text-white/80' : 'text-slate-500'}`}>{counts[t.value]}</span>
                        </button>
                    );
                })}
            </div>

            {/* SCROLL AREA: scrolls both directions (x and y) */}
            <div
                id="ordersList"
                className="flex-1 min-h-0 w-full overflow-auto"
            >
                <table className="w-full min-w-max border-separate border-spacing-0 text-[11px]">
                    <thead>
                        <tr>
                            {HEADERS.map(h => (
                                <th
                                    key={h}
                                    scope="col"
                                    className="sticky top-0 z-10 bg-slate-100 px-2 py-2 text-left font-semibold uppercase
                                               tracking-wide text-slate-600 border-b border-slate-300 whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="[&>tr>td]:border-b [&>tr>td]:border-slate-200 [&>tr:nth-child(even)]:bg-slate-50 [&>tr:hover]:bg-orange-50">
                        {visibleOrders.map((order, index) => (
                            <OrderItem key={order.id} index={index + 1} order={order} holidays={holidays} fromOrderList />
                        ))}
                    </tbody>
                </table>

                {visibleOrders.length === 0 && (
                    <div className="sticky left-0 flex flex-col items-center gap-2 py-12 text-slate-500">
                        <Inbox size={28} aria-hidden="true" />
                        <p className="text-sm">No orders match your filters.</p>
                    </div>
                )}
            </div>

            {/* Hint (fixed) */}
            <div className="shrink-0 px-3 py-2 text-[11px] text-slate-600 border-t border-slate-200 bg-slate-50">
                Drag an order onto a line to plan it. Drop a planned order here to unplan it.
            </div>
        </div>
    )
}

export default OrderList