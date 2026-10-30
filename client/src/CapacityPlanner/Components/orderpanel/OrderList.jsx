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

import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Search, X, Inbox, PanelLeftClose, PanelLeftOpen, Layers } from 'lucide-react'
import OrderItem from "./OrderItem"
import { CapacityPlannerContext } from '../../CapacityPlanner';

const TABS = [
    { label: 'All', value: '' },
    { label: 'To Be Planned', value: 'Pending' },
    { label: 'Partially Planned', value: 'Partial' },
    { label: 'Allocated', value: 'Allocated' },
    { label: 'Amended', value: 'AMANDMENT' },
];

const HEADERS = ['S.no', 'Order no', 'Delivery date', 'Style', 'Buyer', 'Style type',
    'Qty', 'Status', 'Production details'];

const EMPTY_ARRAY = [];

const OrderList = ({ isCollapsed: propIsCollapsed, onToggleCollapse: propOnToggleCollapse }) => {

    const context = useContext(CapacityPlannerContext) || {};
    const orders = context.orders ?? EMPTY_ARRAY;
    const setOrders = context.setOrders || (() => { });
    const holidays = context.holidays;

    const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : (context.isOrderListCollapsed ?? false);
    const onToggleCollapse = propOnToggleCollapse || context.toggleOrderList;

    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);

    // Keyboard shortcut (Ctrl+B or Cmd+B) to toggle backlog
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                if (onToggleCollapse) onToggleCollapse();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onToggleCollapse]);

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
        const isFullyCompleted = (ord.lines || []).reduce((a, c) => a + parseFloat(c.pcs || 0), 0) === parseFloat(ord.quantity || 0);
        if (ord.status === "AMANDMENT") {
            status = "AMANDMENT";
        } else if (isFullyCompleted) {
            status = "Allocated";
        } else if ((ord.lines || []).length > 0) {
            status = "Partial";
        }
        return { ...ord, status }
    }), [orders]);

    const baseOrders = useMemo(
        () => ordersForLines.filter(i => !i.isReplanned && (i.status === "AMANDMENT" || i.balanceQty > 0 || (i.lines || []).length > 0)),
        [ordersForLines]
    );

    const counts = useMemo(() => ({
        '': baseOrders.length,
        Pending: baseOrders.filter(i => i.status === 'Pending').length,
        Partial: baseOrders.filter(i => i.status === 'Partial').length,
        Allocated: baseOrders.filter(i => i.status === 'Allocated').length,
        AMANDMENT: baseOrders.filter(i => i.status === 'AMANDMENT').length,
    }), [baseOrders]);

    const visibleOrders = useMemo(() => {
        const s = searchText.trim().toLowerCase();
        return baseOrders.filter(i =>
            (statusFilter ? i.status === statusFilter : true) &&
            (s ? (i?.orderNo || '').toLowerCase().includes(s) ||
                (i?.style || '').toLowerCase().includes(s) : true)
        );
    }, [baseOrders, statusFilter, searchText]);

    // Collapsed Rail View
    if (isCollapsed) {
        return (
            <aside
                aria-label="Order backlog sidebar (collapsed)"
                className={`group flex flex-col items-center justify-between w-full h-full min-h-0 bg-white border border-slate-200 rounded-xl overflow-hidden py-3 transition select-none
                    ${isDragOver ? 'ring-2 ring-orange-500 bg-orange-50/80 shadow-md' : 'hover:border-slate-300 hover:shadow-xs'}`}
                style={{ height: 'calc(100vh - 60px)' }}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false);
                }}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); drop(e); }}
            >

                <div className="flex flex-col items-center gap-3 w-full px-1">
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        title="Expand order backlog (Ctrl+B)"
                        aria-label="Expand order backlog"
                        className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shadow-xs border border-slate-200 bg-white active:scale-95 cursor-pointer"
                    >
                        <PanelLeftOpen size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        title={`${counts['Pending']} pending, ${baseOrders.length} total orders`}
                        className="flex flex-col items-center cursor-pointer group/badge focus:outline-none"
                    >
                        <span className="w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-bold bg-[#16345F] text-white shadow-xs group-hover/badge:scale-110 transition">
                            {counts['Pending']}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-tight">
                            Pend
                        </span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onToggleCollapse}
                    title="Click to expand order backlog"
                    className="flex-1 w-full flex flex-col items-center justify-center gap-2 cursor-pointer py-4 hover:bg-slate-50/70 transition focus:outline-none"
                >
                    <Layers size={16} className="text-slate-400 group-hover:text-slate-600 transition" />
                    <span
                        className="text-[11px] font-bold tracking-wider text-slate-600 group-hover:text-slate-900 uppercase transition"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                        {/* Order Backlog */}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                        ({baseOrders.length})
                    </span>
                </button>

                <div
                    className={`w-10 h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center p-1 transition
                        ${isDragOver
                            ? 'border-orange-500 bg-orange-100/90 text-orange-700 animate-pulse ring-2 ring-orange-300'
                            : 'border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-400'}`}
                    title="Drag a planned order from the calendar and drop here to unplan it"
                >
                    <Inbox size={14} className={isDragOver ? 'text-orange-600' : 'text-slate-400'} />
                    <span className="text-[8px] font-bold uppercase leading-tight mt-0.5">
                        {isDragOver ? 'Drop!' : 'Unplan'}
                    </span>
                </div>
            </aside>
        );
    }

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
            <div className="shrink-0 flex items-center justify-between px-3 pt-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                    {/* <h1 className="text-[15px] font-semibold text-slate-900 truncate mb-0">Order backlog</h1> */}
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
                    <span className="px-1.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 shrink-0">
                        {/* {visibleOrders.length} of {baseOrders.length} */}
                    </span>
                </div>
                {onToggleCollapse && (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        title="Collapse order backlog (Ctrl+B)"
                        aria-label="Collapse order backlog"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-transparent hover:border-slate-200 active:scale-95 shrink-0"
                    >
                        <PanelLeftClose size={18} />
                    </button>
                )}
            </div>

            {/* Search (fixed) */}
            {/* <div className="shrink-0 px-3 pb-2">
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
            </div> */}

            {/* Notification Banner when Amended Orders exist */}
            {counts['AMANDMENT'] > 0 && (
                <div className="mx-3 my-1.5 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 shadow-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-sm">⚠️</span>
                        <span>
                            <strong>{counts['AMANDMENT']} {counts['AMANDMENT'] === 1 ? 'order' : 'orders'}</strong> amended from ERP
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === 'AMANDMENT' ? '' : 'AMANDMENT')}
                        className="text-[11px] font-semibold underline text-amber-800 hover:text-amber-950 cursor-pointer"
                    >
                        {statusFilter === 'AMANDMENT' ? 'Show All' : 'View Orders'}
                    </button>
                </div>
            )}

            {/* Status tabs (fixed) */}
            <div
                className="shrink-0 flex gap-1 overflow-x-auto px-3 pb-2 border-b border-slate-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="tablist"
                aria-label="Order status"
            >
                {TABS.map(t => {
                    const active = statusFilter === t.value;
                    const isAll = t.value === '';
                    const isAmendedTab = t.value === 'AMANDMENT';
                    return (
                        <button
                            key={t.label}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setStatusFilter(t.value)}
                            className={`shrink-0 whitespace-nowrap h-8 rounded-md text-xs font-medium transition
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16345F]/40
                    ${isAll ? 'w-16 flex-none px-1' : 'flex-auto px-2.5'}
                    ${active 
                        ? (isAmendedTab ? 'bg-amber-600 text-white' : 'bg-[#16345F] text-white') 
                        : (isAmendedTab && counts['AMANDMENT'] > 0 ? 'bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}`}
                        >
                            {isAmendedTab && counts['AMANDMENT'] > 0 ? '⚠️ ' : ''}{t.label}
                            <span className={`ml-1 tabular-nums ${active ? 'text-white/80' : (isAmendedTab && counts['AMANDMENT'] > 0 ? 'text-amber-800 font-bold' : 'text-slate-500')}`}>
                                {counts[t.value] !== undefined ? `(${counts[t.value]})` : ''}
                            </span>
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
                {/* Drag an order onto a line to plan it. Drop a planned order here to unplan it. */}
            </div>
        </div>
    )
}

export default OrderList