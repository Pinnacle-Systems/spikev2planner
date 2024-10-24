import React, { useContext, useState } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';

import { orderAssignment, findDays, findEndDate } from '../../helper';

import { GridForm } from './GridForm';
import { LearningCurveInputGrid } from './LearningCurveInputGrid';

const LineDataConformationForm = () => {
  const {
    setLineEntryConformation,
    split,
    currentOrder, currentDate, currentLine,
    orders, setOrders,
    setManualSelect,
    holidays,
  } = useContext(CapacityPlannerContext)

  const [learningCurveItems, setLearningCurveItems] = useState([])

  const handleNoSplit = () => {
    setLineEntryConformation(false);
    let pcs = currentOrder.quantity;
    const days = findDays(pcs, { ...currentLine, learningCurveItems });
    // let endDate = getEndDate(currentDate, days);
    let endDate = findEndDate(currentDate, days, holidays);
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
    orderAssignment(newOrders, setOrders, currentOrder, currentLine, pcs, days, currentDate, endDate, holidays)
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
        <div className={`w-[450px] flex flex-col items-center justify-center p-2`}>
          <div className='font-bold'>
            Do you want to Select Manual or Auto Allocation ?
          </div>
          <LearningCurveInputGrid learningCurveItems={learningCurveItems} setLearningCurveItems={setLearningCurveItems} />
          <div className='flex justify-evenly w-full mt-5'>
            <button autoFocus id='manualSelect' className='bg-blue-200 w-20 text-blue-700 p-1 rounded hover:bg-blue-300 text-xs'
              onClick={handleManualSelect}> Manual Select</button>
            <button className='bg-red-200 w-10 text-red-700 p-1 rounded hover:bg-red-300'
              onClick={handleNoSplit}> Auto</button>
          </div>
        </div>
      }
    </>
  )
}

export default LineDataConformationForm