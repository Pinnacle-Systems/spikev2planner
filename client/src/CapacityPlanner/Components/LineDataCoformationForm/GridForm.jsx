import React, { useState, useContext } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';
import { getCurrentCapacity } from '../CalendarWithManyLines/helper';
import { getDateFromDateTimeFormat } from '../../../utils/helper';


export const GridForm = () => {
    const { lines,setSplit, orders, setOrders, currentOrder,  setLineEntryConformation, setCurrentOrder} = useContext(CapacityPlannerContext)

    const [lineSplit, setLineSplit] = useState([])

    const handleInputChange = (event, index, field) => {
        const value = event.target.value;
        const newLines = [...lineSplit];
        newLines[index][field] = value;
        newLines[index]["endDate"] = getEndDate(newLines[index]["startDate"], newLines[index]["id"], newLines[index]["pcs"])
        newLines[index]["days"] = findDays(newLines[index]["id"], newLines[index]["pcs"])
        setLineSplit(newLines);
    };

    const save = () => {
        const currentOrderIndex = orders.findIndex(order => order.id === parseInt(currentOrder.id));
        const newOrders = [...orders]
        newOrders[currentOrderIndex]["lines"] = lineSplit;
        setOrders(newOrders);
        setLineEntryConformation(false);
        setCurrentOrder("");
        setSplit(false);
    }
    const addRow = () => {
        const newRow = { id: "", pcs: "", startDate: "", endDate: "", days: "" };
        setLineSplit([ ...lineSplit, newRow]);
    };
    const handleDeleteRow = id => {
        const filteredRows = lineSplit.filter((row, index) => index !== id);
        setLineSplit(filteredRows);
    };

    const getLineById = id => lines.find(line => parseInt(line.id) === parseInt(id))

    const findDays = (lineId, lineOrderQty) => {
        let currentLine = getLineById(lineId)
        return Math.ceil(lineOrderQty / getCurrentCapacity(currentLine.efficiency, currentLine.capacity))
    }

    const getEndDate = (startDate, line, lineOrderQty) => {
        let endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + findDays(line, lineOrderQty))
        return endDate
    }

    return (
        <div className='mt-5 h-5/6 w-full'>
            <div className='mr-1 flex justify-end '>
                <div onClick={addRow}
                    className='hover:cursor-pointer p-1 flex items-center bg-green-600 text-white rounded'>
                    Add&nbsp;Line
                </div>
            </div>
            <div className='h-3/4 overflow-auto mt-4'>
                <table className="w-full text-xs ">
                    <thead className='sticky top-0 bg-white'>
                        <tr className=''>
                            <th className="text-center w-32">Line</th>
                            <th className="text-center w-32">Current Capacity</th>
                            <th className="text-center">Start Date</th>
                            <th className="text-center">Pcs</th>
                            <th className="text-center">End Date</th>
                            <th className="text-center">Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineSplit.map((row, index) => (
                            <tr key={index}>
                                <td>
                                    <select
                                        className="border rounded px-4 py-2 w-full"
                                        value={row.id}
                                        onChange={(event) => handleInputChange(event, index, "id")}
                                    >
                                        <option value="" className='text-sm' hidden>Select</option>
                                        {lines.map((line) =>
                                            <option key={line.id} value={line.id}>{line.name}</option>
                                        )}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="border rounded px-4 py-2 w-full"
                                        value={getCurrentCapacity(getLineById(row.id)?.efficiency, getLineById(row.id)?.capacity)}
                                        disabled
                                    />
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        className="border rounded px-4 py-2 w-full"
                                        value={row.startDate}
                                        onChange={(event) =>
                                            handleInputChange(event, index, "startDate")
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="border rounded px-4 py-2 w-full"
                                        value={row.pcs}
                                        onChange={(event) =>
                                            handleInputChange(event, index, "pcs")
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        className="border rounded px-4 py-2 w-full"
                                        disabled
                                        value={getDateFromDateTimeFormat(row.endDate)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="border rounded px-4 py-2 w-full"
                                        value={row.days}
                                        disabled
                                    />
                                </td>
                                <td>
                                    <button onClick={() => handleDeleteRow(index)} className='text-red-600'>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='flex p-2 justify-end items-center'>
                <button
                    onClick={() => save()}
                    type="button"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Done
                </button>
            </div>
        </div>
    )
}
