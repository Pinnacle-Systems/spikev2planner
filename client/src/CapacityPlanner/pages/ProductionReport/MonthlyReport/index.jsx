import React from 'react'
import { useState } from 'react'
import { getYearMonthFromDateTimeFormat } from '../../../helper';
import TableEg from './Table';

const MonthlyReport = () => {
    const [selectedMonth, setSelectedMonth] = useState(getYearMonthFromDateTimeFormat(new Date()));
    return (
        <div>
            {/* <form onSubmit={() => { console.log("Sub") }}>
                <Input type='month' value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value) }} action>
                    <input />
                    <Button type='submit'>Generate</Button>
                </Input>
            </form> */}
            <TableEg />
        </div>
    )
}

export default MonthlyReport
