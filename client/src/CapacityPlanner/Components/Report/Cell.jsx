import React, { useContext } from 'react'
import { findNationalHolidaysBetweenDates, getDateArray, isSameDay } from '../../helper';
import { dateDiffBetweenDays } from '../../../utils/helper';
import { CapacityPlannerContext } from '../../CapacityPlanner';

const Cell = ({ line, date, getDataForStartDateAndLine, getDataForDateAndLine, }) => {
    const {
        holidays,
    } = useContext(CapacityPlannerContext);
    let data = getDataForStartDateAndLine(date, line);
    let dateData = getDataForDateAndLine(date, line);
    let productionSchedule = dateData?.productionSchedule || [];
    let qty = productionSchedule.find(i => isSameDay(new Date(i.date), new Date(date)))?.pcs || 0;

    let calculatedStartDate = new Date(data?.startDate);
    let calculatedEndDate = new Date(data?.endDate);

    let nationalHolidays = findNationalHolidaysBetweenDates(calculatedStartDate, calculatedEndDate, holidays)
    let days = dateDiffBetweenDays(calculatedStartDate, calculatedEndDate) - nationalHolidays + 1;

    console.log(data, "datadatadata")

    return (
        <React.Fragment key={line.id}>
            {data ?
                <td rowSpan={days} className='border border-gray-700 p-1'>
                    <span className='w-24' >
                        {data?.Orders?.style}
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
