import React, { useCallback, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import axios from "axios";
import { UNITS_API } from "../../../Constants/Api";
const BASE_URL = process.env.REACT_APP_SERVER_URL;


const Report = ({populateCall}) => {
    const [units, setUnits] = useState([]);
    const retrieveData = useCallback(() => {
        axios({
            method: 'get',
            url: BASE_URL + UNITS_API,
        }).then((result) => {
            setUnits(result.data.data)
        }, (error) => {
            toast.error("Server Down", { autoClose: 5000 });
        });
    }, []);
    useEffect(retrieveData, [retrieveData]);
    return (
        <div className='w-full'>
            <table className='table-fixed w-full text-center'>
                <thead className="table-header">
                    <tr>
                        <th>
                            Name
                        </th>
                        <th>
                            Location
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {units.map(unit =>
                        <tr key={unit.id} className="table-row" onClick={()=>populateCall(unit.id)}>
                            <td className="table-data">
                                {unit.name}
                            </td>
                            <td className="table-data">
                                {unit.location}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Report
