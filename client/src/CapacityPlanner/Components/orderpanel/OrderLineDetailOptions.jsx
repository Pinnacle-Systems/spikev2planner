// import React, { useContext } from 'react'
// import { CapacityPlannerContext } from '../../CapacityPlanner';
// import axios from 'axios';
// import { ORDERS_API } from '../../../Constants/Api';
// import { toast } from 'react-toastify';
// import { getDateFromDateTimeFormatToDisplay } from '../../helper';

// const BASE_URL = process.env.REACT_APP_SERVER_URL;


// const OrderLineDetailOptions = () => {
//     const { setIsOrderProductionDetails, setLineEntryConformation, setOpenOrderDetail, setIsOrderLineDetailOptions, setOrders, currentOrder, currentLine, setViewPlanDetails,
//         setReduceEndDate, prevOrders, loading, setLoading
//     } = useContext(CapacityPlannerContext)
//     function removeOrderFromLine() {
//         if (!window.confirm("Do you want to delete this strip?")) return
//         setOrders(prev => {
//             let orders = structuredClone(prev);
//             const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder.id));
//             const newOrders = [...orders]
//             newOrders[currentOrderIndex]["lines"] = newOrders[currentOrderIndex]["lines"].filter(line => parseInt(line.id) !== parseInt(currentLine.id));
//             return newOrders
//         });
//         setIsOrderLineDetailOptions(false);
//     }
//     function removeOrder() {
//         if (!window.confirm("Do you want to delete all strips?")) return
//         setOrders(prev => {
//             let orders = structuredClone(prev);
//             const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder.id));
//             const newOrders = [...orders]
//             newOrders[currentOrderIndex]["lines"] = [];
//             return newOrders
//         });
//         setIsOrderLineDetailOptions(false);
//     }

//     function replanOrder() {
//         setLoading(true);
//         axios.put(BASE_URL + ORDERS_API + `/${currentOrder.id}`, { isReplanOrder: true })
//             .then(data => {
//                 if (data.data?.statusCode == 1) {
//                     toast.error(data?.data?.message);
//                 } else {
//                     window.location.search = data?.data?.data?.orderNo;
//                     window.location.reload();
//                     toast.success("Order Replanned Successfully...!!!");
//                 }
//                 setLoading(false);
//             }).catch(err => {
//                 console.error(err)
//                 setLoading(false);
//             })
//     }

//     let options = [
//         { name: "Production Schedule", onClick: () => { setIsOrderProductionDetails(true); setIsOrderLineDetailOptions(false); }, className: "bg-green-600" },
//         { name: "Order Details", onClick: () => { setOpenOrderDetail(true); setIsOrderLineDetailOptions(false); }, className: "bg-blue-600" },

//     ];
//     if (!currentOrder.isReplanned) {
//         options = [
//             ...options,
//             { name: "Edit Planning", onClick: () => { setLineEntryConformation(true); setIsOrderLineDetailOptions(false); }, className: "bg-violet-600" },
//             { name: "Delete Strip", onClick: () => { removeOrderFromLine(); }, className: "bg-red-600" },
//             { name: "Delete All Strips ", onClick: () => { removeOrder(); }, className: "bg-red-600" },
//             { name: "Replan Order", onClick: replanOrder, className: "bg-orange-600" },
//         ]
//     } else {
//         options = [
//             ...options,
//             { name: "View Plan", onClick: () => { setViewPlanDetails(true); setIsOrderLineDetailOptions(false); }, className: "bg-violet-600" },
//             { name: "Change End Date", onClick: () => { setReduceEndDate(true); setIsOrderLineDetailOptions(false); }, className: "bg-red-600" },
//         ]
//     }
//     return (
//         <div className='mt-10'>
//             <div className='grid grid-cols-3 bg-gray-200 p-1 gap-3'>
//                 <div>
//                     Current Selected Order:
//                     <strong>
//                         {currentOrder.orderNo}
//                     </strong>
//                 </div>
//                 <div>
//                     Del.Date:
//                     <strong>
//                         {getDateFromDateTimeFormatToDisplay(currentOrder.dDate)}
//                     </strong>
//                 </div>
//                 <div>
//                     Current Selected Line:
//                     <strong>
//                         {currentLine?.name}
//                     </strong>
//                 </div>
//             </div>
//             <div className='p-5 mt-5 flex items-center gap-3'>
//                 {options.map(option =>
//                     <div key={option.name}>
//                         <button className={`${option.className} text-white p-1 rounded`} onClick={option.onClick}>{option.name}</button>
//                     </div>
//                 )}

//             </div>
//         </div>
//     )
// }

// export default OrderLineDetailOptions


import React, { useContext } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';
import axios from 'axios';
import { ORDERS_API } from '../../../Constants/Api';
import { toast } from 'react-toastify';
import { getDateFromDateTimeFormatToDisplay } from '../../helper';

const BASE_URL = process.env.REACT_APP_SERVER_URL;

// ---- UI-only helpers (no logic depends on these) ----
const ICON_PATHS = {
    schedule: 'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
    details: 'M9 12h6m-6 4h6M7 4h7l5 5v10a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z',
    edit: 'M4 20h4l10-10-4-4L4 16v4zM14 6l4 4',
    replan: 'M4 4v5h5M20 20v-5h-5M5.6 15A7 7 0 0018.4 9M18.4 9A7 7 0 005.6 15',
    plan: 'M9 5H7a1 1 0 00-1 1v13a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6M9 13l2 2 4-4',
    trash: 'M5 7h14M10 11v6m4-6v6M6 7l1 12a1 1 0 001 1h8a1 1 0 001-1l1-12M9 7V4h6v3',
    end: 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z',
};

const Icon = ({ name, className = '' }) => (
    <svg viewBox='0 0 24 24' className={`h-5 w-5 ${className}`} fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
        <path d={ICON_PATHS[name]} />
    </svg>
);

const TILE_STYLES = {
    view: { tile: 'border-slate-200 hover:border-slate-400 hover:bg-slate-50', icon: 'bg-slate-100 text-slate-600' },
    primary: { tile: 'border-violet-200 bg-violet-50/60 hover:border-violet-400 hover:bg-violet-50', icon: 'bg-violet-100 text-violet-700' },
    warn: { tile: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50', icon: 'bg-amber-100 text-amber-700' },
    danger: { tile: 'border-red-200 hover:border-red-400 hover:bg-red-50', icon: 'bg-red-100 text-red-600' },
};

const OrderLineDetailOptions = () => {
    const { setIsOrderProductionDetails, setLineEntryConformation, setOpenOrderDetail, setIsOrderLineDetailOptions, setOrders, currentOrder, currentLine, setViewPlanDetails,
        setReduceEndDate, prevOrders, loading, setLoading
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
        setLoading(true);
        axios.put(BASE_URL + ORDERS_API + `/${currentOrder.id}`, { isReplanOrder: true })
            .then(data => {
                if (data.data?.statusCode == 1) {
                    toast.error(data?.data?.message);
                } else {
                    window.location.search = data?.data?.data?.orderNo;
                    window.location.reload();
                    toast.success("Order Replanned Successfully...!!!");
                }
                setLoading(false);
            }).catch(err => {
                console.error(err)
                setLoading(false);
            })
    }

    // `group`, `variant`, `icon` and `desc` only control how a button is drawn.
    let options = [
        { name: "Production Schedule", onClick: () => { setIsOrderProductionDetails(true); setIsOrderLineDetailOptions(false); }, group: "main", variant: "view", icon: "schedule", desc: "See the production schedule" },
        { name: "Order Details", onClick: () => { setOpenOrderDetail(true); setIsOrderLineDetailOptions(false); }, group: "main", variant: "view", icon: "details", desc: "Open the full order information" },

    ];
    if (!currentOrder.isReplanned) {
        options = [
            ...options,
            { name: "Edit Planning", onClick: () => { setLineEntryConformation(true); setIsOrderLineDetailOptions(false); }, group: "main", variant: "primary", icon: "edit", desc: "Change pieces and dates for this line" },
            { name: "Replan Order", onClick: replanOrder, group: "main", variant: "warn", icon: "replan", desc: "Create a new plan for this order" },
            { name: "Delete Strip", onClick: () => { removeOrderFromLine(); }, group: "danger", variant: "danger", icon: "trash", desc: "Remove this line's strip" },
            { name: "Delete All Strips ", onClick: () => { removeOrder(); }, group: "danger", variant: "danger", icon: "trash", desc: "Remove every strip of this order" },
        ]
    } else {
        options = [
            ...options,
            { name: "View Plan", onClick: () => { setViewPlanDetails(true); setIsOrderLineDetailOptions(false); }, group: "main", variant: "primary", icon: "plan", desc: "See the replanned schedule" },
            { name: "Change End Date", onClick: () => { setReduceEndDate(true); setIsOrderLineDetailOptions(false); }, group: "danger", variant: "danger", icon: "end", desc: "Adjust the order end date" },
        ]
    }

    const mainOptions = options.filter(o => o.group === 'main');
    const dangerOptions = options.filter(o => o.group === 'danger');

    const renderTile = (option) => {
        const styles = TILE_STYLES[option.variant];
        return (
            <button
                key={option.name}
                type='button'
                disabled={loading && option.name === "Replan Order"}
                onClick={option.onClick}
                className={`flex items-start gap-3 rounded-lg border bg-white p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50 ${styles.tile}`}
            >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${styles.icon}`}>
                    <Icon name={option.icon} />
                </span>
                <span className='min-w-0'>
                    <span className='block text-sm font-semibold text-slate-800'>{option.name.trim()}</span>
                    <span className='block text-xs text-slate-500'>{option.desc}</span>
                </span>
            </button>
        );
    };

    return (
        <div className='mt-10 w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4'>
                <div className='min-w-0'>
                    <div className='text-xs text-slate-500'>Selected order</div>
                    <div className='truncate text-lg font-semibold text-slate-900'>{currentOrder.orderNo}</div>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                    <span className='rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600'>
                        Delivery <strong className='ml-1 font-semibold text-slate-800'>{getDateFromDateTimeFormatToDisplay(currentOrder.dDate)}</strong>
                    </span>
                    <span className='rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs text-violet-700'>
                        Line <strong className='ml-1 font-semibold'>{currentLine?.name}</strong>
                    </span>
                </div>
            </div>

            <div className='p-5'>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    {mainOptions.map(renderTile)}
                </div>

                {dangerOptions.length > 0 &&
                    <div className='mt-5 rounded-lg border border-red-100 bg-red-50/40 p-3'>
                        <div className='mb-2 text-xs font-medium text-red-700'>These actions change or remove the plan</div>
                        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                            {dangerOptions.map(renderTile)}
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default OrderLineDetailOptions