import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { getCurrentCapacity } from '../../../utils/helper';
import { DELETE, PLUS } from "../../../utils/icons"
import axios from 'axios';
import { LINES_API } from '../../../Constants/Api';
import { toast } from 'react-toastify';
import FloatingLabelSelect from '../../../Components/FloatingLabelSelect';
import { styleTypeOptions } from '../../../utils/selectOptions';
import DropdownWithSearch from '../../../Components/Dropdown';

const BASE_URL = process.env.REACT_APP_SERVER_URL;


const LineDetails = ({ lines, setLines }) => {
    const [erpLines, setErpLines] = useState([]);
    const handleInputChange = (value, index, field) => {
        const newLines = [...lines];
        newLines[index][field] = value;
        setLines(newLines);
    };
    useEffect(() => setLines(lines.length === 0 ? [{ name: '', inCharge: "", capacity: 0, efficiency: 0 }] : lines), [lines, setLines])
    const addRow = () => {
        const newRow = { name: '', inCharge: "", capacity: 0, efficiency: 0 };
        setLines([...lines, newRow]);
    };
    const handleDeleteRow = id => {
        const filteredRows = lines.filter((row, index) => index !== id);
        setLines(filteredRows);
    };

    const onKeyDown = (e) => {
        if (e.key === "Tab") {
            addRow();
        }
    };
    const navigate = useNavigate()

    const handleDelete = (id) => {
        axios({
            method: 'delete',
            url: BASE_URL + LINES_API + `/${id}`
        }).then((result) => {
            if (result.status === 200) {
                if (result.data.statusCode === 0) {
                    window.location.reload();
                    localStorage.setItem(sessionStorage.getItem("sessionId") + "res", "success");
                    localStorage.setItem(sessionStorage.getItem("sessionId") + "success", `Holiday Deleted Successfully!!!`);
                } else if (result.data.statusCode === 1) {
                    toast.warning(result.data.message, { autoClose: 5000 });
                }
            }
        }, (error) => {
            console.log(error);
            toast.error("Server Down", { autoClose: 5000 });
        });
    }

    useEffect(() => {
        axios.get(BASE_URL + LINES_API, { params: { isGetLinesFromERP: true } })
            .then(data => {
                setErpLines(data?.data?.data || []);
            }).catch(error => {
                console.log(error);
                toast.error("Server Down", { autoClose: 5000 });
            });
    }, [])


    return (
        <div className='h-full'>
            <div className='p-1 flex justify-between text-sm'>
                <button
                    className="w-1/6 bg-red-600 hover:bg-red-700 text-white font-bold hover:rounded p-1"
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>
                <button
                    className="w-1/6 bg-blue-500 hover:bg-blue-700 text-white font-bold hover:rounded p-1"
                    type="submit"
                >
                    Submit
                </button>
                <button
                    className="w-1/6 bg-green-600 hover:bg-green-700 text-white font-bold hover:rounded p-1"
                    type="button"
                    onClick={addRow}
                >
                    {PLUS}&nbsp;Add&nbsp;Lines
                </button>
            </div>
            {
                lines.length !== 0 ?
                    <div className="mt-1 mx-auto flex gap-2">
                        <table className="w-full text-sm">
                            <thead className='sticky top-0 bg-gray-100'>
                                <tr className='text-sm'>
                                    <th className="table-data">Line Name</th>
                                    <th className="table-data">Style Type</th>
                                    <th className="table-data">Incharge</th>
                                    <th className="table-data">Max Capacity / per day(piece)</th>
                                    <th className="table-data">Efficiency (%)</th>
                                    <th className="table-data">Current Capacity / per day(piece)</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className=''>
                                {lines.map((row, index) => (
                                    <tr key={index} className="even:bg-gray-100 odd:bg-gray-50">
                                        <td>
                                            {/* <input
                                                type="text"
                                                className="border rounded px-4 py-2 w-full"
                                                value={row.name}
                                                onChange={(event) =>
                                                    handleInputChange(event.target.value, index, "name")
                                                }
                                            /> */}
                                            <DropdownWithSearch
                                                value={row.name}
                                                selection
                                                options={erpLines.map((i, index) => ({
                                                    key: index,
                                                    text: i.linename,
                                                    value: i.linename,
                                                }))}
                                                onChange={(e, { value }) => {
                                                    console.log(value, 'value')
                                                    handleInputChange(value, index, "name")
                                                }
                                                }
                                            />
                                        </td>
                                        <td>
                                            <FloatingLabelSelect value={row.styleType} setValue={(value) => [handleInputChange(value, index, "styleType")]} options={styleTypeOptions} />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="border rounded px-4 py-2 w-full"
                                                value={row.inCharge}
                                                onChange={(event) =>
                                                    handleInputChange(event.target.value, index, "inCharge")
                                                }
                                            />
                                        </td>
                                        <td>
                                            <input
                                                id='capacity'
                                                type="number"
                                                className="border rounded px-4 py-2 w-full"
                                                value={row.capacity}
                                                onChange={(event) =>
                                                    handleInputChange(event.target.value, index, "capacity")
                                                }
                                            />
                                        </td>
                                        <td>
                                            <input
                                                onKeyDown={(e) => { if (lines.length - 1 === index) onKeyDown(e) }}
                                                id='efficiency'
                                                type="number"
                                                className="border rounded px-4 py-2 w-full"
                                                value={row.efficiency}
                                                onChange={(event) =>
                                                    handleInputChange(event.target.value, index, "efficiency")
                                                }
                                            />
                                        </td>
                                        <td>
                                            <input
                                                id='currentCapacity'
                                                type="number"
                                                className="border rounded px-4 py-2 w-full disabled:bg-gray-200 text-center"
                                                value={getCurrentCapacity(row.efficiency, row.capacity)}
                                                disabled
                                            />
                                        </td>
                                        <td>
                                            <button tabIndex={-1} type='button'
                                                onClick={() => { row.id ? handleDelete(row.id) : handleDeleteRow(index) }}>{DELETE}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    :
                    ""
            }
        </div>
    )
}

export default LineDetails
