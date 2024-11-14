import React, { useContext } from 'react'
import { findNationalHolidaysBetweenDates, isNationalHoliday, isSameDay } from '../../helper';
import { dateDiffBetweenDays } from '../../../utils/helper';
import { CapacityPlannerContext } from '../../CapacityPlanner';

const Cell = ({ line, date, getDataForStartDateAndLine, getDataForDateAndLine, startDate, endDate, }) => {
    const {
        holidays,
    } = useContext(CapacityPlannerContext);
    let data = getDataForStartDateAndLine(date, line);
    let dateData = getDataForDateAndLine(date, line);
    let productionSchedule = dateData?.productionSchedule || [];
    let qty = productionSchedule.find(i => isSameDay(new Date(i.date), new Date(date)))?.pcs || 0;

    let dateDiff = dateDiffBetweenDays(new Date(endDate), new Date(data?.endDate)) - findNationalHolidaysBetweenDates(new Date(endDate), new Date(data?.endDate), holidays) + (isNationalHoliday(endDate, holidays) ? 1 : 0);
    let days = parseFloat(data?.days || 0);
    if (data) {
        console.log(days, 'days', dateDiff, 'dateDiff', endDate, data?.endDate);
    }
    if (dateDiff > 0) {
        days -= (dateDiff);
    };


    return (
        <React.Fragment key={line.id}>
            {data ?
                <td rowSpan={days} className='border border-gray-700 p-1'>
                    <span className='w-24' >
                        {data?.Orders?.orderNo}
                    </span>
                </td>
                :
                <>
                    {!dateData &&
                        <td className='border border-gray-700 p-1'>

                        </td>
                    }
                </>
            }
            <td className='border-b border-gray-700'>
                {qty > 0 && `${qty}`}
            </td>
        </React.Fragment>
    )
}

export default Cell
