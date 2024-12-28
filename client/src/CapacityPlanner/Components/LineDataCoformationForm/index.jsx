import React, { useContext, useEffect, useState } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';

import { orderAssignment, findDays, findEndDate, getDateFromDateTimeFormat } from '../../helper';

import { GridForm } from './GridForm';
import { LearningCurveInputGrid } from './LearningCurveInputGrid';
import { toast } from 'react-toastify';

const LineDataConformationForm = () => {
  const {
    setLineEntryConformation,
    split,
    currentOrder, currentDate, currentLine,
    orders, setOrders,
    setManualSelect,
    holidays, setIsModified
  } = useContext(CapacityPlannerContext);

  const [lineItems, setLineItems] = useState([]);
  const [allPcs, setAllpcs] = useState(false)
  useEffect(() => {
    const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
    const orderLines = structuredClone(orders[currentOrderIndex]?.['lines'] || []);
    const currentOrderLineIndex = orderLines.findIndex(i => i.id == currentLine.id);
    if (currentOrderLineIndex == -1) {
      orderLines.push({ id: currentLine.id, Line: currentLine, pcs: 0, startDate: currentDate })
    } else {
      orderLines[currentOrderLineIndex]['startDate'] = currentDate;
    }
    setLineItems(orderLines)
  }, [orders, currentOrder, currentLine, currentDate])

  const [learningCurveItems, setLearningCurveItems] = useState([]);

  const handleNoSplit = (e) => {
    e.preventDefault();
    if (!window.confirm("Confirm Update Changes ?")) {
      return
    }
    if (learningCurveItems.filter(i => i.percentage).length == 0) return toast.info("Invalid Learning Curve...!!!")
    setLineEntryConformation(false);
    let currentLineDetails = lineItems?.find(i => i.id == currentLine.id);
    if (!currentLineDetails) return
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

  function removeOrderFromLine(updatingOrder, lineObj) {
    setOrders(orders => {
      const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(updatingOrder.id));
      const newOrders = [...orders]
      newOrders[currentOrderIndex]["lines"] = newOrders[currentOrderIndex]["lines"].filter(line => parseInt(line.id) !== parseInt(lineObj.id))
      // const lineIndex = newOrders[currentOrderIndex]["lines"].findIndex(line => parseInt(line.id) == parseInt(lineObj.id))
      // newOrders[currentOrderIndex]["lines"][lineIndex]['startDate'] = '';
      // newOrders[currentOrderIndex]["lines"][lineIndex]['endDate'] = '';
      return newOrders
    });
  }

  function assignLearningCurve() {
    setOrders(orders => {
      const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
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
      return newOrders;
    })
  }

  const handleManualSelect = async () => {
    // removeOrderFromLine(currentOrder, currentDraggedLine)
    assignLearningCurve()
    setLineEntryConformation(false);
    setManualSelect(true);
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
            ? { ...item, pcs: currentOrder.quantity || 0 }
            : item
        )
      );
    } else {
      setLineItems((prev) =>
        prev.map((item) =>
          currentLine.id === item.id
            ? { ...item, pcs: 0 }
            : item
        )
      )
    }
    setAllpcs(checked);
  };
  return (
    <>
      {split ?
        <div className={`w-[800px] h-[400px] flex flex-col items-center p-6`}>
          <div className='flex justify-between w-full'>
            <div>Order id</div>
            <input type="text" disabled value={currentOrder.orderNo} className='bg-gray-200' />
            <div>Total pcs</div>
            <input type="text" disabled value={currentOrder.quantity} className='bg-gray-200' />
          </div>
          <GridForm />
        </div>
        :
        <form className={`w-[450px] flex flex-col items-center justify-center p-2 mt-5`} onSubmit={handleNoSplit} >
          <table className='table-fixed mt-4 w-full'>
            <thead className='top-0 sticky bg-gray-100'>
              <tr className=' font-bold mb-1 bg-blue-300 '>
                <th className='w-10'>
                </th>
                <th colSpan={4}>
                  Line Schedule Details
                </th>
              </tr>
              {/* <tr >
                <th className='border border-black'> Order no.</th>
                <th className='border border-black'> {currentOrder.orderNo}</th>
                <th className='border border-black'> Current Line</th>
                <th className='border border-black'> {currentLine?.name}</th>
              </tr> */}
              <tr>
                <th className='border border-black'> S.no</th>
                <th className='border border-black'> Line</th>
                <th className='border border-black' > Start.Date</th>
                <th className='border border-black' > Est.End.Date</th>
                <th className='border border-black w-full flex justify-between' > Pcs <div> All<input type="checkBox"
                  onChange={(e) => isAllPcsChecked(e.target.checked)}

                /></div></th>
              </tr>
              <tr>
                <th className='border border-black'> </th>
                <th className='border border-black'> Order Total Pcs</th>
                <th className='border border-black'> </th>
                <th className='border border-black'> </th>
                <th className='border border-black text-right' > {currentOrder.quantity || 0}

                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((line, index) =>
                <tr key={line.id} className={`${(currentLine.id == line.id) ? 'bg-green-200' : ''}`}>
                  <td className='border border-black text-center'> {index + 1}</td>
                  <td className='border border-black'> {line?.Line?.name}</td>
                  <td className='border border-black text-right' >
                    <input required type="date" className='text-right focus:outline-none w-full' value={getDateFromDateTimeFormat(line?.startDate)}
                      disabled={currentLine.id != line.id} onChange={(e) => { handleChange(index, 'startDate', e.target.value) }} /> </td>
                  <td className='border border-black text-right' >
                    <input type="date" className='text-right focus:outline-none w-full'
                      value={currentLine.id == line.id ? estimatedEndDate : getDateFromDateTimeFormat(line.endDate)}
                      disabled /> </td>
                  <td className='border border-black text-right' >
                    <input type="number" min={0} className='text-right focus:outline-none w-full' value={line?.pcs}
                      disabled={currentLine.id != line.id} onChange={(e) =>
                        handleChange(index, 'pcs', !allPcs ? e.target.value : currentOrder.quantity)
                      } /> </td>
                </tr>
              )}
              <tr>
                <td className='border border-black' colSpan={1}></td>
                <td className='border border-black text-center' colSpan={1}>Total Allocated</td>
                <td className='border border-black text-center' colSpan={1}></td>
                <td className='border border-black text-center' colSpan={1}></td>
                <td className='border border-black text-right' > {totalAllocatedQty}</td>
              </tr>
              <tr>
                <td className='border border-black' colSpan={1}></td>
                <td className='border border-black text-center' colSpan={1}>Balance</td>
                <td className='border border-black text-center' colSpan={1}></td>
                <td className='border border-black text-center' colSpan={1}></td>
                <td className='border border-black text-right' > {balanceQty}</td>
              </tr>
            </tbody>
          </table>
          <LearningCurveInputGrid learningCurveItems={learningCurveItems} setLearningCurveItems={setLearningCurveItems} lineItems={lineItems} />
          <div className='flex justify-evenly w-full mt-5'>
            {/* <button autoFocus id='manualSelect' className='bg-blue-200 w-20 text-blue-700 p-1 rounded hover:bg-blue-300 text-xs'
              onClick={handleManualSelect}> Manual Select</button> */}
            <button type='button' className='bg-red-200 text-red-700 p-1 rounded hover:bg-red-300'
              onClick={() => { setLineEntryConformation(false) }}> Cancel</button>
            <button type='submit' className='bg-green-200 text-green-700 p-1 rounded hover:bg-red-300'
            > Update Changes</button>
          </div>
        </form>
      }
    </>
  )
}

export default LineDataConformationForm