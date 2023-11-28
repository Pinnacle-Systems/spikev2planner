import React from "react";
import moment from "moment";

const HolidayReport = ({holidays, onClick}) => {
return (
    <div className='w-full mx-auto h-full bg-gray-100'>
        <div className="text-center font-bold sticky top-0 bg-gray-100"> Holidays</div>
        <table className='table-fixed w-full text-center'>
            <thead className="table-header sticky top-5">
                <tr className="">
                    <th className="border border-black">
                        Date
                    </th>
                    <th>
                        Reason
                    </th>
                </tr>
            </thead>
            <tbody>
               {holidays.map(holiday =>
                <tr key={holiday.id} className="table-row" onClick={()=>onClick(holiday.date)}>
                    <td className="table-data">
                        {moment.utc(holiday.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="table-data">
                        {holiday.description}
                    </td>
                </tr>
               )}
            </tbody>
        </table>
    </div>
)
}

export default HolidayReport
