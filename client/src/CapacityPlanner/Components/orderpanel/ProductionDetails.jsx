// import React, { useContext } from 'react'
// import { CapacityPlannerContext } from '../../CapacityPlanner';

// const ProductionDetails = () => {
//     const { currentOrder: order } = useContext(CapacityPlannerContext)

//     let lineAndDateWiseProductionQtyList = (order?.productionDetailsDateWise || []);

//     let totalProductionQty = lineAndDateWiseProductionQtyList.reduce((a, c) => a + parseFloat(c.qty || 0), 0)

//     return (
//         <div className='mt-5 px-5 text-center overflow-y-auto'>
//             <table className='table-fixed mt-4'>
//                 <thead className='top-0 sticky bg-gray-100'>
//                     <tr className=' font-bold mb-1 bg-blue-300 '>
//                         <th colSpan={5}>
//                             Production Schedule Details
//                         </th>
//                     </tr>
//                     <tr >
//                         <th className='border border-black'> Order no.</th>
//                         <th className='border border-black' colSpan={3}> {order.orderNo}</th>
//                     </tr>
//                     <tr>
//                         <th className='border border-black w-5'> S.no</th>
//                         <th className='border border-black'> Date</th>
//                         <th className='border border-black' > Line</th>
//                         <th className='border border-black' > Prod.Qty</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {(lineAndDateWiseProductionQtyList.length == 0) ?
//                         <tr >
//                             <td className='border border-black p-2' colSpan={4}> No Production Data...!!!</td>
//                         </tr>
//                         :
//                         <>
//                             {
//                                 lineAndDateWiseProductionQtyList.map((prod, index) => {
//                                     return (<tr key={prod.date}>
//                                         <td className='border border-black'> {index + 1}</td>
//                                         <td className='border border-black'> {prod.date}</td>
//                                         <td className='border border-black' > {prod?.line}</td>
//                                         <td className='border border-black' > {prod?.qty}</td>
//                                     </tr>)
//                                 }
//                                 )
//                             }
//                         </>
//                     }
//                     <tr className='font-bold'>
//                         <td className='border border-black' colSpan={3}>Total</td>
//                         <td className='border border-black'> {totalProductionQty}</td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div>
//     )
// }

// export default ProductionDetails


import React, { useContext } from 'react';
import { CapacityPlannerContext } from '../../CapacityPlanner';

const ProductionDetails = () => {
    const { currentOrder: order } = useContext(CapacityPlannerContext);

    const lineAndDateWiseProductionQtyList =
        order?.productionDetailsDateWise || [];

    const totalProductionQty = lineAndDateWiseProductionQtyList.reduce(
        (a, c) => a + parseFloat(c.qty || 0),
        0
    );

    return (
        <div className="mt-5 px-4 sm:px-5">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-gray-800">
                            Production Schedule Details
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Line-wise and date-wise production summary
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 sm:self-auto">
                        <span className="text-xs font-medium text-blue-600">
                            Order No.
                        </span>
                        <span className="text-sm font-bold text-blue-900">
                            {order?.orderNo || '-'}
                        </span>
                    </div>
                </div>

                {/* Production Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] table-fixed border-collapse text-sm">
                        <thead>
                            <tr className="bg-[#1D3A76] text-white">
                                <th className="w-16 px-4 py-3 text-center font-semibold">
                                    S.No
                                </th>
                                <th className="px-4 py-3 text-left font-semibold">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left font-semibold">
                                    Production Line
                                </th>
                                <th className="w-36 px-4 py-3 text-right font-semibold">
                                    Prod. Qty
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {lineAndDateWiseProductionQtyList.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="22"
                                                    height="22"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                                    <path d="M8 2v4M16 2v4M3 10h18M8 14h3M8 17h6" />
                                                </svg>
                                            </div>
                                            <p className="font-semibold text-gray-700">
                                                No Production Data
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Production schedule details are not available.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                lineAndDateWiseProductionQtyList.map((prod, index) => (
                                    <tr
                                        key={`${prod.date}-${prod.line}-${index}`}
                                        className="transition-colors hover:bg-blue-50/50"
                                    >
                                        <td className="px-4 py-3 text-center text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                            {prod.date || '-'}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-700">
                                            {prod?.line || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-800">
                                            {prod?.qty ?? 0}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                        {/* Total */}
                        <tfoot>
                            <tr className="border-t-2 border-gray-200 bg-gray-50">
                                <td
                                    colSpan={3}
                                    className="px-4 py-4 text-right font-bold uppercase tracking-wide text-gray-600"
                                >
                                    Total Production Quantity
                                </td>
                                <td className="px-4 py-4 text-right text-base font-bold tabular-nums text-[#1D3A76]">
                                    {totalProductionQty}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-5 py-3">
                    <p className="text-xs text-gray-400">
                        Total Records:{' '}
                        <span className="font-semibold text-gray-600">
                            {lineAndDateWiseProductionQtyList.length}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductionDetails;
