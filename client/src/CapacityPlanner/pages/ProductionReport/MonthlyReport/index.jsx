import React from 'react'
import { useState } from 'react'
import { getYearFromDateTimeFormat, getYearMonthFromDateTimeFormat } from '../../../helper';
import TableEg from './Table';
import { Button, Input } from 'semantic-ui-react';
import DropdownWithSearch from '../../../../Components/Dropdown';

const MonthlyReport = () => {

    const [selectedYear, setSelectedYear] = useState(getYearFromDateTimeFormat(new Date()));
    const startYear = 1900;
    const endYear = new Date().getFullYear(); // Current year
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    return (
        <div>
            <form onSubmit={() => { console.log("Sub") }}>
                <DropdownWithSearch
                    value={selectedYear}
                    selection
                    options={years.map((i, index) => ({
                        key: index,
                        text: i.toString(),
                        value: (i).toString(),
                    }))}
                    onChange={(e, { value }) => {
                        setSelectedYear(value)
                    }
                    }
                />
            </form>
            <TableEg />
        </div>
    )
}

export default MonthlyReport
