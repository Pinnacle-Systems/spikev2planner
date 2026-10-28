import React from 'react'
import PurchaseReport from '../../Components/NewReport/PurchaseReport'

const UnPlannedOrdersReport = () => {
    return (
        <div className='w-full h-full min-h-0 flex flex-col'>
            <PurchaseReport reportType="unplanned" />
        </div>
    )
}

export default UnPlannedOrdersReport