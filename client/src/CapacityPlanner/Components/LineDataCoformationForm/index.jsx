// import React, { useContext, useEffect, useState } from 'react'
// import { CapacityPlannerContext } from '../../CapacityPlanner';

// import { orderAssignment, findDays, findEndDate, getDateFromDateTimeFormat } from '../../helper';

// import { GridForm } from './GridForm';
// import { LearningCurveInputGrid } from './LearningCurveInputGrid';
// import { toast } from 'react-toastify';

// const LineDataConformationForm = () => {
//   const {
//     setLineEntryConformation,
//     split,
//     currentOrder, currentDate, currentLine,
//     orders, setOrders,
//     holidays, setIsModified
//   } = useContext(CapacityPlannerContext);

//   const [lineItems, setLineItems] = useState([]);
//   const [allPcs, setAllpcs] = useState(false)
//   useEffect(() => {
//     const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
//     const orderLines = structuredClone(orders[currentOrderIndex]?.['lines'] || []);
//     const currentOrderLineIndex = orderLines.findIndex(i => i.id == currentLine.id);
//     if (currentOrderLineIndex == -1) {
//       orderLines.push({ id: currentLine.id, Line: currentLine, pcs: 0, startDate: currentDate })
//     } else {
//       orderLines[currentOrderLineIndex]['startDate'] = currentDate;
//     }
//     setLineItems(orderLines)
//   }, [orders, currentOrder, currentLine, currentDate])

//   const [learningCurveItems, setLearningCurveItems] = useState([]);

//   const handleNoSplit = (e) => {
//     e.preventDefault();
//     if (!window.confirm("Confirm Update Changes ?")) {
//       return
//     }
//     if (learningCurveItems.filter(i => i.percentage).length == 0) return toast.info("Invalid Learning Curve...!!!")
//     setLineEntryConformation(false);
//     let currentLineDetails = lineItems?.find(i => i.id == currentLine.id);
//     if (!currentLineDetails) return
//     let pcs = currentLineDetails?.pcs || 0;
//     const days = findDays(pcs, { ...currentLine, learningCurveItems });
//     const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
//     let endDate = findEndDate(currentLineDetails?.startDate, days, holidays);
//     let currentOrderLineIndex = -1;
//     let newOrders = structuredClone(orders);
//     if (currentOrderIndex != -1) {
//       currentOrderLineIndex = orders[currentOrderIndex]['lines'].findIndex(l => parseInt(l.id) == parseInt(currentLine.id));
//       if (currentOrderLineIndex != -1) {
//         newOrders[currentOrderIndex]["lines"][currentOrderLineIndex]["learningCurveItems"] = learningCurveItems.filter(i => i.percentage);
//       } else {
//         newOrders[currentOrderIndex]["lines"].push({ id: currentLine.id, learningCurveItems })
//       }
//     }
//     orderAssignment(newOrders, setOrders, currentOrder, currentLine, pcs, days, currentLineDetails?.startDate, endDate, holidays)
//     setIsModified(true);
//   }

//   function getEstimatedEndDate() {
//     if (learningCurveItems.filter(i => i.percentage).length == 0) return ""
//     let currentLineDetails = lineItems?.find(i => i.id == currentLine.id);
//     if (!currentLineDetails) return ""
//     let pcs = currentLineDetails?.pcs || 0;
//     const days = findDays(pcs, { ...currentLine, learningCurveItems });
//     let endDate = findEndDate(currentLineDetails?.startDate, days, holidays);
//     return getDateFromDateTimeFormat(endDate)
//   }

//   const totalAllocatedQty = lineItems.reduce((a, c) => a + parseFloat(c.pcs || 0), 0)
//   console.log(totalAllocatedQty, 'totalAllocatedQty');

//   const balanceQty = (currentOrder.quantity || 0) - totalAllocatedQty;

//   function handleChange(index, field, value) {
//     setLineItems(prev => {
//       let newItems = structuredClone(prev);
//       newItems[index][field] = value;
//       const totalAllocatedQty = newItems.reduce((a, c) => a + parseFloat(c.pcs || 0), 0)

//       const balanceQty = (currentOrder.quantity || 0) - totalAllocatedQty;
//       if (balanceQty < 0) {
//         return prev;
//       }
//       return newItems
//     })
//   }
//   let estimatedEndDate = getEstimatedEndDate()
//   console.log(totalAllocatedQty, 'totalAllocatedQty');
//   console.log(currentOrder.quantity, 'totalAllocatedQty');

//   const isAllPcsChecked = (checked) => {
//     if (checked) {
//       setLineItems((prev) =>
//         prev.map((item) =>
//           currentLine.id === item.id
//             ? { ...item, pcs: totalAllocatedQty === 0 ? currentOrder.quantity : balanceQty + totalAllocatedQty }
//             : item
//         )
//       );
//     } else {
//       setLineItems((prev) =>
//         prev.map((item) =>
//           currentLine.id === item.id
//             ? { ...item, pcs: totalAllocatedQty }
//             : item
//         )
//       )
//     }
//     setAllpcs(checked);
//   };
//   return (
//     <>
//       {split ?
//         <div className={`w-[800px] h-[400px] flex flex-col items-center p-6`}>
//           <div className='flex justify-between w-full'>
//             <div>Order id</div>
//             <input type="text" disabled value={currentOrder.orderNo} className='bg-gray-200' />
//             <div>Total pcs</div>
//             <input type="text" disabled value={currentOrder.quantity} className='bg-gray-200' />
//           </div>
//           <GridForm />
//         </div>
//         :
//         <form className={`w-[450px] flex flex-col items-center justify-center p-2 mt-5`} onSubmit={handleNoSplit} >
//           <table className='table-fixed mt-4 w-full'>
//             <thead className='top-0 sticky bg-gray-100'>
//               <tr className=' font-bold mb-1 bg-blue-300 '>
//                 <th className='w-10'>
//                 </th>
//                 <th colSpan={4}>
//                   Line Schedule Details
//                 </th>
//               </tr>
//               {/* <tr >
//                 <th className='border border-black'> Order no.</th>
//                 <th className='border border-black'> {currentOrder.orderNo}</th>
//                 <th className='border border-black'> Current Line</th>
//                 <th className='border border-black'> {currentLine?.name}</th>
//               </tr> */}
//               <tr>
//                 <th className='border border-black'> S.no</th>
//                 <th className='border border-black'> Line</th>
//                 <th className='border border-black' > Start.Date</th>
//                 <th className='border border-black' > Est.End.Date</th>
//                 <th className='border border-black w-full flex justify-between' > Pcs <div>  <button
//                   className="bg-green-400 px-2 py-1 rounded hover:bg-green-500 text-white"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     isAllPcsChecked(true);
//                   }}
//                 >
//                   All
//                 </button>
//                 </div></th>
//               </tr>
//               <tr>
//                 <th className='border border-black'> </th>
//                 <th className='border border-black'> Order Total Pcs</th>
//                 <th className='border border-black'> </th>
//                 <th className='border border-black'> </th>
//                 <th className='border border-black text-right' > {currentOrder.quantity || 0}

//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {lineItems.map((line, index) =>
//                 <tr key={line.id} className={`${(currentLine.id == line.id) ? 'bg-green-200' : ''}`}>
//                   <td className='border border-black text-center'> {index + 1}</td>
//                   <td className='border border-black'> {line?.Line?.name}</td>
//                   <td className='border border-black text-right' >
//                     <input required type="date" className='text-right focus:outline-none w-full' value={getDateFromDateTimeFormat(line?.startDate)}
//                       disabled={currentLine.id != line.id} onChange={(e) => { handleChange(index, 'startDate', e.target.value) }} /> </td>
//                   <td className='border border-black text-right' >
//                     <input type="date" className='text-right focus:outline-none w-full'
//                       value={currentLine.id == line.id ? estimatedEndDate : getDateFromDateTimeFormat(line.endDate)}
//                       disabled /> </td>
//                   <td className='border border-black text-right' >
//                     <input type="number" min={0} className='text-right focus:outline-none w-full' value={line?.pcs}
//                       disabled={currentLine.id != line.id} onChange={(e) =>
//                         handleChange(index, 'pcs', !allPcs ? e.target.value : currentOrder.quantity)
//                       } /> </td>
//                 </tr>
//               )}
//               <tr>
//                 <td className='border border-black' colSpan={1}></td>
//                 <td className='border border-black text-center' colSpan={1}>Total Allocated</td>
//                 <td className='border border-black text-center' colSpan={1}></td>
//                 <td className='border border-black text-center' colSpan={1}></td>
//                 <td className='border border-black text-right' > {totalAllocatedQty}</td>
//               </tr>
//               <tr>
//                 <td className='border border-black' colSpan={1}></td>
//                 <td className='border border-black text-center' colSpan={1}>Balance</td>
//                 <td className='border border-black text-center' colSpan={1}></td>
//                 <td className='border border-black text-center' colSpan={1}></td>
//                 <td className='border border-black text-right' > {balanceQty}</td>
//               </tr>
//             </tbody>
//           </table>
//           <LearningCurveInputGrid learningCurveItems={learningCurveItems} setLearningCurveItems={setLearningCurveItems} lineItems={lineItems} />
//           <div className='flex justify-evenly w-full mt-5'>
//             {/* <button autoFocus id='manualSelect' className='bg-blue-200 w-20 text-blue-700 p-1 rounded hover:bg-blue-300 text-xs'
//               onClick={handleManualSelect}> Manual Select</button> */}
//             <button type='button' className='bg-red-200 text-red-700 p-1 rounded hover:bg-red-300'
//               onClick={() => { setLineEntryConformation(false) }}> Cancel</button>
//             <button type='submit' className='bg-green-200 text-green-700 p-1 rounded hover:bg-red-300'
//             > Update Changes</button>
//           </div>
//         </form>
//       }
//     </>
//   )
// }

// export default LineDataConformationForm

import React, { useContext, useEffect, useState } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';
import moment from 'moment';

import { orderAssignment, findDays, findEndDate, getDateFromDateTimeFormat, isDateInPreviousWeek, getDaysUntilDelivery } from '../../helper';

import { GridForm } from './GridForm';
import { LearningCurveInputGrid } from './LearningCurveInputGrid';
import { toast } from 'react-toastify';

// ---- UI-only style tokens (no logic depends on these) ----
const cell = 'border border-slate-200 px-2 py-1.5 text-sm';
const headCell = 'text-center border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-600 text-left';
const inputBase =
  'w-full rounded px-1.5 py-1 text-right text-sm tabular-nums bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:text-slate-500 disabled:cursor-not-allowed';
const readonlyField =
  'w-40 rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-sm text-slate-700';

const LineDataConformationForm = () => {
  const {
    setLineEntryConformation,
    split,
    currentOrder, currentDate, currentLine,
    orders, setOrders,
    holidays, setIsModified
  } = useContext(CapacityPlannerContext);

  const [lineItems, setLineItems] = useState([]);
  const [allPcs, setAllpcs] = useState(false)
  useEffect(() => {
    const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
    const orderLines = structuredClone(orders[currentOrderIndex]?.['lines'] || []);
    const currentOrderLineIndex = orderLines.findIndex(i => i.id == currentLine.id);
    const formattedCurrentDate = getDateFromDateTimeFormat(currentDate);
    if (currentOrderLineIndex == -1) {
      orderLines.push({ id: currentLine.id, Line: currentLine, pcs: 0, startDate: formattedCurrentDate })
    } else {
      orderLines[currentOrderLineIndex]['startDate'] = formattedCurrentDate;
    }
    setLineItems(orderLines)
  }, [orders, currentOrder, currentLine, currentDate])

  const [learningCurveItems, setLearningCurveItems] = useState([]);

  const currentLineDetails = lineItems?.find(i => i.id == currentLine.id);
  const startOfCurrentWeek = moment().startOf('isoWeek').format('YYYY-MM-DD');
  const daysFromToday = getDaysUntilDelivery(currentOrder?.dDate);
  const daysFromPlan = getDaysUntilDelivery(currentOrder?.dDate, currentLineDetails?.startDate);
  const maxDeliveryDays = Math.max(daysFromToday ?? 0, daysFromPlan ?? 0);
  const isDeliveryMoreThan45Days = maxDeliveryDays > 45;
  const formattedDeliveryDate = currentOrder?.dDate ? moment.utc(currentOrder.dDate).format("DD-MM-YYYY") : null;

  const handleNoSplit = (e) => {
    e.preventDefault();

    let currentLineDetails = lineItems?.find(i => i.id == currentLine.id);
    if (!currentLineDetails) return;

    // 1. Restrict assignment to current week or above
    if (isDateInPreviousWeek(currentLineDetails?.startDate)) {
      toast.warning("Cannot assign order to a previous week. Start date must be in current week or later.");
      return;
    }

    // 2. Alert if order delivery is more than 45 days
    if (isDeliveryMoreThan45Days) {
      const confirmMsg = `Alert: Order ${currentOrder?.orderNo || ''} delivery date (${formattedDeliveryDate}) is more than 45 days away (${maxDeliveryDays} days). Confirm to make/update plan?`;
      if (!window.confirm(confirmMsg)) {
        return;
      }
    } else {
      if (!window.confirm("Confirm Update Changes ?")) {
        return;
      }
    }

    if (learningCurveItems.filter(i => i.percentage).length == 0) return toast.info("Invalid Learning Curve...!!!")
    setLineEntryConformation(false);
    let pcs = currentLineDetails?.pcs || 0;
    const days = findDays(pcs, { ...currentLine, learningCurveItems });
    const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
    let endDate = findEndDate(currentLineDetails?.startDate, days, holidays);
    let currentOrderLineIndex = -1;
    let newOrders = structuredClone(orders);
    if (currentOrderIndex != -1) {
      currentOrderLineIndex = orders[currentOrderIndex]['lines'].findIndex(l => parseInt(l.id) == parseInt(currentLine.id));
      if (currentOrderLineIndex != -1) {
        newOrders[currentOrderIndex]["lines"][currentOrderLineIndex]["learningCurveItems"] = learningCurveItems.filter(i => i.percentage);
      } else {
        newOrders[currentOrderIndex]["lines"].push({ id: currentLine.id, learningCurveItems })
      }
    }
    orderAssignment(newOrders, setOrders, currentOrder, currentLine, pcs, days, currentLineDetails?.startDate, endDate, holidays)
    setIsModified(true);
  }

  function getEstimatedEndDate() {
    if (learningCurveItems.filter(i => i.percentage).length == 0) return ""
    let currentLineDetails = lineItems?.find(i => i.id == currentLine.id);
    if (!currentLineDetails) return ""
    let pcs = currentLineDetails?.pcs || 0;
    const days = findDays(pcs, { ...currentLine, learningCurveItems });
    let endDate = findEndDate(currentLineDetails?.startDate, days, holidays);
    return getDateFromDateTimeFormat(endDate)
  }

  const totalAllocatedQty = lineItems.reduce((a, c) => a + parseFloat(c.pcs || 0), 0)

  const balanceQty = (currentOrder.quantity || 0) - totalAllocatedQty;

  function handleChange(index, field, value) {
    setLineItems(prev => {
      let newItems = structuredClone(prev);
      newItems[index][field] = value;
      const totalAllocatedQty = newItems.reduce((a, c) => a + parseFloat(c.pcs || 0), 0)

      const balanceQty = (currentOrder.quantity || 0) - totalAllocatedQty;
      if (balanceQty < 0) {
        return prev;
      }
      return newItems
    })
  }
  let estimatedEndDate = getEstimatedEndDate()

  const isAllPcsChecked = (checked) => {
    if (checked) {
      setLineItems((prev) =>
        prev.map((item) =>
          currentLine.id === item.id
            ? { ...item, pcs: totalAllocatedQty === 0 ? currentOrder.quantity : balanceQty + totalAllocatedQty }
            : item
        )
      );
    } else {
      setLineItems((prev) =>
        prev.map((item) =>
          currentLine.id === item.id
            ? { ...item, pcs: totalAllocatedQty }
            : item
        )
      )
    }
    setAllpcs(checked);
  };
  return (
    <>
      {split ?
        <div className={`w-[800px] max-w-full h-[400px] flex flex-col gap-4 p-6`}>
          <div className='flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3'>
            <label className='flex items-center gap-2 text-sm font-medium text-slate-700'>
              Order id
              <input type="text" disabled value={currentOrder.orderNo} className={readonlyField} />
            </label>
            <label className='flex items-center gap-2 text-sm font-medium text-slate-700'>
              Total pcs
              <input type="text" disabled value={currentOrder.quantity} className={readonlyField} />
            </label>
          </div>
          <GridForm />
        </div>
        :
        <form className={`w-[800px] max-w-full flex flex-col gap-4 p-1`} onSubmit={handleNoSplit} >
          <div className='flex items-baseline justify-between'>
            <h2 className='text-base font-semibold text-slate-800'>Line schedule details - {currentLine?.name}</h2>
            {formattedDeliveryDate && (
              <span className='text-xs font-medium text-slate-500'>
                Del. Date: <strong className='text-slate-700'>{formattedDeliveryDate}</strong>
              </span>
            )}
          </div>

          {isDeliveryMoreThan45Days && (
            <div className='flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow-xs'>
              <span className='font-bold text-amber-800'>⚠️ Alert:</span>
              <span>
                Order delivery date (<strong>{formattedDeliveryDate}</strong>) is more than 45 days away (<strong>{maxDeliveryDays} days</strong> remaining). Make plan with caution.
              </span>
            </div>
          )}

          <div className='max-h-48 overflow-y-auto rounded-lg border border-slate-200 shadow-sm bg-white'>
            <table className='w-full table-fixed border-collapse bg-white'>
              <colgroup>
                <col className='w-10' />
                <col />
                <col className='w-36' />
                <col className='w-36' />
                <col className='w-28' />
              </colgroup>
              <thead className='sticky top-0 z-10 bg-slate-100 shadow-[0_1px_0_0_rgba(226,232,240,1)]'>
                <tr>
                  <th className={`${headCell} text-center w-10 bg-slate-100`}>S No</th>
                  <th className={`${headCell} bg-slate-100`}>Line</th>
                  <th className={`${headCell} bg-slate-100`}>Start Date</th>
                  <th className={`${headCell} bg-slate-100`}>Estimate End date</th>
                  <th className={`${headCell} bg-slate-100`}>
                    <span>Pcs</span>
                  </th>
                </tr>
                <tr className='bg-slate-50'>
                  <th className={`${headCell} bg-slate-50`}></th>
                  <th className={`${headCell} font-medium bg-slate-50`}>Order total pcs</th>
                  <th className={`${headCell} bg-slate-50`}></th>
                  <th className={`${headCell} bg-slate-50`}></th>
                  <th className={`${headCell} text-right tabular-nums text-slate-800 bg-slate-50`}>{currentOrder.quantity || 0}</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((line, index) =>
                  <tr key={line.id} className={`${(currentLine.id == line.id) ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                    <td className={`${cell} text-center text-slate-500`}> {index + 1}</td>
                    <td className={`${cell} truncate ${currentLine.id == line.id ? 'font-semibold text-slate-800' : 'text-slate-700'}`}> {line?.Line?.name}</td>
                    <td className={`${cell} p-0.5`} >
                      <input
                        required
                        type="date"
                        min={startOfCurrentWeek}
                        className={inputBase}
                        value={getDateFromDateTimeFormat(line?.startDate)}
                        disabled={currentLine.id != line.id}
                        onChange={(e) => {
                          if (isDateInPreviousWeek(e.target.value)) {
                            toast.warning("Cannot assign order to a previous week. Please select current week or later.");
                            return;
                          }
                          handleChange(index, 'startDate', e.target.value);
                        }}
                      />
                    </td>

                    <td className={`${cell} p-0.5`} >
                      <input type="date" className={inputBase}
                        value={currentLine.id == line.id ? estimatedEndDate : getDateFromDateTimeFormat(line.endDate)}
                        disabled />
                    </td>
                    <td className={`${cell} p-0.5`} >
                      <input type="number"
                        min={0}
                        className={`${inputBase} bg-slate-50 cursor-not-allowed`}
                        value={line?.pcs || 0}
                        disabled={true}
                        readOnly
                        title="Auto-calculated from Learning Curve (%)"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className='sticky bottom-0 z-10 bg-slate-50 font-medium text-slate-700 shadow-[0_-1px_0_0_rgba(226,232,240,1)]'>
                <tr>
                  <td className={`${cell} bg-slate-50`} colSpan={1}></td>
                  <td className={`${cell} bg-slate-50`} colSpan={1}>Total allocated</td>
                  <td className={`${cell} bg-slate-50`} colSpan={1}></td>
                  <td className={`${cell} bg-slate-50`} colSpan={1}></td>
                  <td className={`${cell} bg-slate-50 text-right tabular-nums`}> {totalAllocatedQty}</td>
                </tr>
                <tr>
                  <td className={`${cell} bg-slate-50`} colSpan={1}></td>
                  <td className={`${cell} bg-slate-50`} colSpan={1}>Balance</td>
                  <td className={`${cell} bg-slate-50`} colSpan={1}></td>
                  <td className={`${cell} bg-slate-50`} colSpan={1}></td>
                  <td className={`${cell} bg-slate-50 text-right tabular-nums ${balanceQty === 0 ? 'text-emerald-700' : 'text-amber-700'}`}> {balanceQty}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <LearningCurveInputGrid learningCurveItems={learningCurveItems} setLearningCurveItems={setLearningCurveItems} lineItems={lineItems} setLineItems={setLineItems} />

          <div className='flex justify-end gap-3 border-t border-slate-200 pt-4'>
            {/* <button autoFocus id='manualSelect' className='bg-blue-200 w-20 text-blue-700 p-1 rounded hover:bg-blue-300 text-xs'
              onClick={handleManualSelect}> Manual Select</button> */}
            <button type='button'
              className='rounded-md border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300'
              onClick={() => { setLineEntryConformation(false) }}> Cancel</button>
            <button type='submit'
              className='rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400'
            > Update changes</button>
          </div>
        </form>
      }
    </>
  )
}

export default LineDataConformationForm