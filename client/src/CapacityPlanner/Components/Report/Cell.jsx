import React from 'react'
import { isSameDay } from '../../helper';
import { dateDiffBetweenDays } from '../../../utils/helper';

const Cell = ({ line, date, getDataForStartDateAndLine, getDataForDateAndLine, endDate, }) => {
    let data = getDataForStartDateAndLine(date, line);
    let dateData = getDataForDateAndLine(date, line);
    let productionSchedule = dateData?.productionSchedule || [];
    let qty = productionSchedule.find(i => isSameDay(new Date(i.date), new Date(date)))?.pcs || 0;

    let days = parseFloat(data?.days || 0);
    let dateDiff = dateDiffBetweenDays(new Date(endDate), new Date(data?.endDate));

    if (data) {
        console.log(endDate, data, dateDiff, 'datediff')
    }

    if (dateDiff > 0) {
        days -= (dateDiff);
    }

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
