import React, { useContext, useEffect, useState } from 'react'
import { REFRESH_ICON } from '../../../Inputs';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { getDateFromDateTimeFormat } from '../../helper';
import { CapacityPlannerContext } from '../../CapacityPlanner';

const Parameter = ({ startDate, endDate, setStartDate, setEndDate, selectedUnits, setSelectedUnits }) => {
    const {
        units,
    } = useContext(CapacityPlannerContext);
    const [localFromDate, setLocalFromDate] = useState('');
    const [localToDate, setLocalToDate] = useState('');
    const [localSelectedUnits, setLocalSelectedUnits] = useState([]);

    useEffect(() => {
        setLocalFromDate(startDate);
        setLocalToDate(endDate);
        setLocalSelectedUnits(selectedUnits);
    }, [startDate, endDate, selectedUnits])

    function handleGenerate() {
        setStartDate(localFromDate);
        setEndDate(localToDate);
        setSelectedUnits(localSelectedUnits);
    }

    function isSelected(unitId) {
        return localSelectedUnits.includes(unitId)
    }

    function handleChange(unitId) {
        if (isSelected(unitId)) {
            setLocalSelectedUnits(prev => prev.filter(i => i != unitId))
        } else {
            setLocalSelectedUnits(prev => ([...prev, unitId]))
        }
    }
    return (
        <div className='flex gap-5 justify-end p-2 pr-5 '>
            <div className='flex items-center gap-5'>
                Select Units:
                {units.map(unit =>
                    <button onClick={() => { handleChange(unit.id) }} className={`${isSelected(unit.id) ? "bg-blue-400 text-white" : "bg-gray-200"} p-1 rounded`} key={unit.id}>{unit.name}</button>
                )}
            </div>
            <div>
                From: <input type="date" value={getDateFromDateTimeFormat(localFromDate)} onChange={(e) => { setLocalFromDate(e.target.value) }} />
            </div>
            <div>
                To: <input type="date" value={getDateFromDateTimeFormat(localToDate)} onChange={(e) => { setLocalToDate(e.target.value) }} />
            </div>
            <button onClick={handleGenerate} className='bg-green-400 p-1 text-white'>Generate {REFRESH_ICON}</button>
            <ReactHTMLTableToExcel
                id="test-table-xls-button"
                className="download-table-xls-button text-white bg-blue-400 p-2 text-xs rounded-xl"
                table="production-report"
                filename="tablexls"
                sheet="tablexls"
                buttonText="Excel"
            >
            </ReactHTMLTableToExcel>
        </div>
    )
}

export default Parameter
