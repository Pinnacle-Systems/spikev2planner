// import React, { useContext } from 'react'
// import { CapacityPlannerContext } from '../../CapacityPlanner';
// import { findWorkingDaysBetweenDates, getCurrentCapacity, getDateFromDateTimeFormatToDisplay } from '../../helper';

// const OrderProductionDetails = () => {



//     const { currentOrder: order, currentLine, holidays, } = useContext(CapacityPlannerContext)
//     const lineObj = order.lines.find(lineItem => parseInt(lineItem.id) === parseInt(currentLine?.id))
//     // const totalLineWiseProductionQty = (order.OrderSizeColorWiseDetails || []).filter(i => i.line === currentLine?.name).reduce((a, c) => a + parseFloat(c?.productionQty || 0), 0)
//     // const totalPcsProductionShouldBeCompletedByYesterday = getTotalPcsProductionShouldBeCompletedByYesterday(currentLine, lineObj, holidays)
//     const learningCurveItems = lineObj.learningCurveItems || [];
//     const productionSchedule = [];
//     const workingDays = findWorkingDaysBetweenDates(lineObj.startDate, lineObj.endDate, holidays);
//     const currentCapacity = parseInt(getCurrentCapacity(lineObj.efficiency, lineObj.capacity));
//     let totalPcs = lineObj.pcs || 0;
//     let totalProductionSchedulePcs = 0;
//     for (let i = 0; i < workingDays.length; i++) {
//         let currentEfficiency = (i < (learningCurveItems.length)) ? (learningCurveItems[i]?.percentage || 0) : (learningCurveItems[learningCurveItems.length - 1]?.percentage || 0);
//         let currentDatePcs = getCurrentCapacity(parseInt(currentEfficiency), currentCapacity);
//         let balanceQty = totalPcs - totalProductionSchedulePcs;
//         let allocationQty = 0;
//         if (currentDatePcs > balanceQty) {
//             allocationQty += balanceQty
//         } else {
//             allocationQty += currentDatePcs
//         }
//         totalProductionSchedulePcs += allocationQty;
//         productionSchedule.push({ date: workingDays[i], pcs: allocationQty })
//     }

//     console.log(order, "order")

//     let lineAndDateWiseProductionQtyList = (order.productionDetailsDateWise || []);

//     let filterLineAndDateWiseProductionQtyList = lineAndDateWiseProductionQtyList?.filter(val => productionSchedule?.find(j => getDateFromDateTimeFormatToDisplay(j.date) == val.date))
//     console.log(filterLineAndDateWiseProductionQtyList, "filterLineAndDateWiseProductionQtyList")

//     function getLineWiseDateProductionQty(date) {
//         return lineAndDateWiseProductionQtyList.filter(i => i.line == currentLine.name && i.date == getDateFromDateTimeFormatToDisplay(date)).reduce((a, c) => a + parseFloat(c.qty || 0), 0)
//     }



//     let lineAndDateWiseProductionQty = filterLineAndDateWiseProductionQtyList.filter(i => i.line == currentLine.name).reduce((a, c) => a + parseFloat(c.qty || 0), 0);
//     // let lineAndDateWiseProductionQty = lineAndDateWiseProductionQtyList.reduce((a, c) => a + parseFloat(c.qty || 0), 0);

//     console.log(lineAndDateWiseProductionQty, "lineAndDateWiseProductionQty")


//     let totalBalanceQty = totalProductionSchedulePcs - lineAndDateWiseProductionQty;
//     return (
//         <div className='mt-10 px-5 text-center max-h-[500px] overflow-y-auto'>{console.log(productionSchedule, "productionSchedule")}
//             <table className='table-fixed'>
//                 <thead className='top-0 sticky bg-gray-100'>
//                     <tr className=' font-bold mb-1 bg-blue-300 '>
//                         <th colSpan={5}>
//                             Production Schedule Details
//                         </th>
//                     </tr>
//                     <tr >
//                         <th className='border border-black'> Order no.</th>
//                         <th className='border border-black'> {order.orderNo}</th>
//                         <th className='border border-black'> Line</th>
//                         <th className='border border-black' colSpan={2}> {currentLine?.name}</th>
//                     </tr>
//                     <tr>
//                         <th className='border border-black w-5'> S.no</th>
//                         <th className='border border-black'> Date</th>
//                         <th className='border border-black' > Pcs</th>
//                         <th className='border border-black' > Prod.Qty</th>
//                         <th className='border border-black' > Balance</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {productionSchedule.map((prod, index) => {
//                         let prodQty = getLineWiseDateProductionQty(prod.date);
//                         let balQty = parseFloat(prod?.pcs || 0) - prodQty;
//                         return (<tr key={prod.date}>
//                             <td className='border border-black'> {index + 1}</td>
//                             <td className='border border-black'> {getDateFromDateTimeFormatToDisplay(prod.date)}</td>
//                             <td className='border border-black' > {prod?.pcs}</td>
//                             <td className='border border-black' > {prodQty}</td>
//                             {/* <td className='border border-black' > {balQty < 0 ? 0 : balQty}</td> */}
//                             <td className={`border border-black ${balQty > 0 ? "text-red-700" : "text-green-700"}`} > {Math.abs(balQty)}</td>
//                         </tr>)
//                     }
//                     )}
//                     <tr className='font-bold'>
//                         <td className='border border-black' colSpan={2}>Total</td>
//                         <td className='border border-black'> {totalProductionSchedulePcs}</td>
//                         <td className='border border-black'> {lineAndDateWiseProductionQty}</td>
//                         <td className={`border border-black ${totalBalanceQty > 0 ? "text-red-700" : "text-green-700"} `}> {Math.abs(totalBalanceQty)}</td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div>
//     )
// }

// export default OrderProductionDetails



import React, { useContext } from 'react';
import { CapacityPlannerContext } from '../../CapacityPlanner';
import {
    findWorkingDaysBetweenDates,
    getCurrentCapacity,
    getDateFromDateTimeFormatToDisplay
} from '../../helper';

const OrderProductionDetails = () => {
    const { currentOrder: order, currentLine, holidays } =
        useContext(CapacityPlannerContext);

    const lineObj = order?.lines?.find(
        lineItem => parseInt(lineItem.id) === parseInt(currentLine?.id)
    );

    if (!lineObj || !currentLine) {
        return (
            <div className="mt-5 px-4 sm:px-5">
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm">
                    <p className="font-semibold text-gray-700">
                        No Production Schedule Available
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Select an order and production line to view details.
                    </p>
                </div>
            </div>
        );
    }

    const learningCurveItems = lineObj.learningCurveItems || [];
    const productionSchedule = [];
    const workingDays = findWorkingDaysBetweenDates(
        lineObj.startDate,
        lineObj.endDate,
        holidays
    );

    const currentCapacity = parseInt(
        getCurrentCapacity(lineObj.efficiency, lineObj.capacity)
    );

    const totalPcs = lineObj.pcs || 0;
    let totalProductionSchedulePcs = 0;

    for (let i = 0; i < workingDays.length; i++) {
        const currentEfficiency =
            i < learningCurveItems.length
                ? learningCurveItems[i]?.percentage || 0
                : learningCurveItems[learningCurveItems.length - 1]?.percentage || 0;

        const currentDatePcs = getCurrentCapacity(
            parseInt(currentEfficiency),
            currentCapacity
        );

        const balanceQty = totalPcs - totalProductionSchedulePcs;

        const allocationQty =
            currentDatePcs > balanceQty
                ? Math.max(0, balanceQty)
                : Math.max(0, currentDatePcs);

        totalProductionSchedulePcs += allocationQty;

        productionSchedule.push({
            date: workingDays[i],
            pcs: allocationQty
        });
    }

    const lineAndDateWiseProductionQtyList =
        order?.productionDetailsDateWise || [];

    const filterLineAndDateWiseProductionQtyList =
        lineAndDateWiseProductionQtyList.filter(val =>
            productionSchedule.some(
                j => getDateFromDateTimeFormatToDisplay(j.date) === val.date
            )
        );

    function getLineWiseDateProductionQty(date) {
        return lineAndDateWiseProductionQtyList
            .filter(
                i =>
                    i.line === currentLine.name &&
                    i.date === getDateFromDateTimeFormatToDisplay(date)
            )
            .reduce((a, c) => a + parseFloat(c.qty || 0), 0);
    }

    const lineAndDateWiseProductionQty =
        filterLineAndDateWiseProductionQtyList
            .filter(i => i.line === currentLine.name)
            .reduce((a, c) => a + parseFloat(c.qty || 0), 0);

    const totalBalanceQty =
        totalProductionSchedulePcs - lineAndDateWiseProductionQty;

    const formatQty = qty =>
        Number(qty || 0).toLocaleString('en-IN', {
            maximumFractionDigits: 2
        });

    return (
        <div className="mt-5 px-4 pb-5 sm:px-5">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                {/* Header */}
                <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-gray-800">
                                Production Schedule Details
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Planned vs actual production and daily balance
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600">
                                    Order No.
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-[#1D3A76]">
                                    {order?.orderNo || '-'}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                                    Production Line
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-gray-800">
                                    {currentLine?.name || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                        <p className="text-xs font-medium text-blue-700">
                            Scheduled Quantity
                        </p>
                        <p className="mt-2 text-2xl font-bold tabular-nums text-[#1D3A76]">
                            {formatQty(totalProductionSchedulePcs)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
                        <p className="text-xs font-medium text-emerald-700">
                            Actual Production
                        </p>
                        <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-800">
                            {formatQty(lineAndDateWiseProductionQty)}
                        </p>
                    </div>

                    <div className={`rounded-lg border p-4 ${totalBalanceQty > 0
                            ? 'border-amber-100 bg-amber-50/70'
                            : totalBalanceQty < 0
                                ? 'border-orange-100 bg-orange-50/70'
                                : 'border-emerald-100 bg-emerald-50/60'
                        }`}>
                        <p className={`text-xs font-medium ${totalBalanceQty > 0
                                ? 'text-amber-700'
                                : totalBalanceQty < 0
                                    ? 'text-orange-700'
                                    : 'text-emerald-700'
                            }`}>
                            {totalBalanceQty > 0
                                ? 'Pending Quantity'
                                : totalBalanceQty < 0
                                    ? 'Excess Production'
                                    : 'Schedule Completed'}
                        </p>
                        <p className={`mt-2 text-2xl font-bold tabular-nums ${totalBalanceQty > 0
                                ? 'text-amber-800'
                                : totalBalanceQty < 0
                                    ? 'text-orange-800'
                                    : 'text-emerald-800'
                            }`}>
                            {formatQty(Math.abs(totalBalanceQty))}
                        </p>
                    </div>
                </div>

                {/* Schedule Table */}
                <div className="max-h-[500px] overflow-auto">
                    <table className="w-full min-w-[650px] table-fixed border-collapse text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-[#1D3A76] text-white">
                                <th className="w-16 px-3 py-3 text-center font-semibold">
                                    S.No
                                </th>
                                <th className="w-[24%] px-4 py-3 text-left font-semibold">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-right font-semibold">
                                    Planned Pcs
                                </th>
                                <th className="px-4 py-3 text-right font-semibold">
                                    Produced Pcs
                                </th>
                                <th className="px-4 py-3 text-right font-semibold">
                                    Balance Pcs
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {productionSchedule.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <p className="font-semibold text-gray-700">
                                            No Working Days Available
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            Check the production start date, end date and holidays.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                productionSchedule.map((prod, index) => {
                                    const prodQty = getLineWiseDateProductionQty(
                                        prod.date
                                    );

                                    const balQty = Number(prod.pcs || 0) - prodQty;

                                    return (
                                        <tr
                                            key={`${prod.date}-${index}`}
                                            className="transition-colors hover:bg-blue-50/50"
                                        >
                                            <td className="px-3 py-3 text-center text-gray-400">
                                                {index + 1}
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-700">
                                                {getDateFromDateTimeFormatToDisplay(
                                                    prod.date
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                                                {formatQty(prod.pcs)}
                                            </td>

                                            <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-800">
                                                {formatQty(prodQty)}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <span className={`inline-flex min-w-16 justify-end rounded-md px-2.5 py-1 font-semibold tabular-nums ${balQty > 0
                                                        ? 'bg-amber-50 text-amber-700'
                                                        : balQty < 0
                                                            ? 'bg-orange-50 text-orange-700'
                                                            : 'bg-emerald-50 text-emerald-700'
                                                    }`}>
                                                    {formatQty(Math.abs(balQty))}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>

                        {/* Total Row */}
                        <tfoot className="sticky bottom-0 z-[1]">
                            <tr className="border-t-2 border-gray-200 bg-gray-50">
                                <td
                                    colSpan={2}
                                    className="px-4 py-4 text-right font-bold uppercase tracking-wide text-gray-600"
                                >
                                    Total
                                </td>

                                <td className="px-4 py-4 text-right font-bold tabular-nums text-[#1D3A76]">
                                    {formatQty(totalProductionSchedulePcs)}
                                </td>

                                <td className="px-4 py-4 text-right font-bold tabular-nums text-gray-800">
                                    {formatQty(lineAndDateWiseProductionQty)}
                                </td>

                                <td className="px-4 py-4 text-right font-bold tabular-nums text-gray-800">
                                    {formatQty(Math.abs(totalBalanceQty))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-5 py-3">
                    <p className="text-xs text-gray-500">
                        Working Days:{' '}
                        <span className="font-semibold text-gray-700">
                            {productionSchedule.length}
                        </span>
                    </p>

                    <p className="text-xs text-gray-500">
                        Production Records:{' '}
                        <span className="font-semibold text-gray-700">
                            {filterLineAndDateWiseProductionQtyList.filter(
                                i => i.line === currentLine.name
                            ).length}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderProductionDetails;
