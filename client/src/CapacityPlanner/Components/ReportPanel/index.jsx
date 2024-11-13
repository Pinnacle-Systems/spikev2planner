import React, { useContext } from 'react'
import plannedLogo from "../../../assets/pngwing.com (4).png"
import unPlannedLogo from "../../../assets/pngwing.com (5).png"
import scheduleLogo from "../../../assets/schedule.png"
import { CLIENT_PLANNED_ORDERS_URL, CLIENT_UNPLANNED_ORDERS_URL } from '../../../Constants/clientAppUrls'
import { CapacityPlannerContext } from '../../CapacityPlanner'

const ReportPanel = () => {
    const {
        setOpenProductionPlanningReport
    } = useContext(CapacityPlannerContext)
    return (
        <div className='text-sm text-center '>
            <div className='grid grid-cols-3 border'>
                <a href={`#${CLIENT_PLANNED_ORDERS_URL}`} className='p-1 border w-full flex justify-center bg-gray-50'>
                    <img src={plannedLogo} alt='' width={40} />
                    <span className='text-xs'>
                        Planned Orders
                    </span>
                </a>
                <a href={`#${CLIENT_UNPLANNED_ORDERS_URL}`} className='p-1 border w-full flex justify-center bg-gray-50 text-xs'>
                    <img src={unPlannedLogo} alt='' width={30} />
                    <p className='grid'>
                        <span className='whitespace-nowrap'>
                            Un-Planned
                        </span>
                        <span>
                            Orders
                        </span>
                    </p>
                </a>
                <button onClick={() => { setOpenProductionPlanningReport(true) }} className='p-1 border w-full flex justify-center bg-gray-50'>
                    <img src={scheduleLogo} alt='' width={40} />
                    <span className='text-xs'>
                        Production Schedule
                    </span>
                </button>
            </div>
        </div>
    )
}

export default ReportPanel