import React, { useContext, } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';

import { orderAssignment, getEndDate, endDateLoopFinder, findDays, findEndDate } from '../../helper';

import { GridForm } from './GridForm';

const LineDataConformationForm = () => {
  const {
    setLineEntryConformation,
    split,
    currentOrder, currentDate, currentLine,
    orders, setOrders,
    setManualSelect,
    holidays,
    currentDraggedLine
  } = useContext(CapacityPlannerContext)


  const handleNoSplit = () => {
    setLineEntryConformation(false);
    let pcs = currentOrder.quantity;
    const days = findDays(pcs, currentLine);
    let endDate = getEndDate(currentDate, days);
    console.log(endDate, "endDate")
    // endDate = endDateLoopFinder(currentDate, endDate, holidays);
    endDate = findEndDate(currentDate, days, holidays);
    console.log(endDate, "endDate")
    orderAssignment(orders, setOrders, currentOrder, currentLine, pcs, days, currentDate, endDate, holidays)
  }

  function removeOrderFromLine(updatingOrder, lineObj) {
    const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(updatingOrder.id));
    const newOrders = [...orders]
    newOrders[currentOrderIndex]["lines"] = newOrders[currentOrderIndex]["lines"].filter(line => parseInt(line.id) !== parseInt(lineObj.id));
    setOrders(newOrders);
}

  const handleManualSelect = async () => {
    removeOrderFromLine(currentOrder, currentDraggedLine)
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
        <div className={`w-[400px] ${split ? "h-[400px]" : "h-[100px]"} flex flex-col items-center justify-center`}>
          <div className='font-bold'>
            Do you want to split it to multiple lines?
          </div>
          <div className='flex justify-evenly w-full mt-5'>
            <button id='manualSelect' className='bg-blue-200 w-20 text-blue-700 p-1 rounded hover:bg-blue-300 text-xs'
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