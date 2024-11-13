import React, { useCallback, useContext, useEffect } from 'react'
import { useState } from 'react'
import { findWorkingDaysBetweenDates, getDateFromDateTimeFormatToDisplay } from '../../helper';
import { CapacityPlannerContext } from '../../CapacityPlanner';
import axios from 'axios';
import { LINES_API } from '../../../Constants/Api';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_SERVER_URL;


const ProductionPlanningReport = () => {

    const {
        holidays,
        setOpenProductionPlanningReport
    } = useContext(CapacityPlannerContext);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dates, setDates] = useState([]);

    const [allUnitLines, setAllUnitLines] = useState([]);

    const retrieveAllLines = useCallback(() => {
        axios({
            method: 'get',
            url: BASE_URL + LINES_API,
            params: {
                isReport: true
            }
        }).then((result) => {
            setAllUnitLines(result?.data?.data || [])
        }, (error) => {
            toast.error("Server Down", { autoClose: 5000 });
        });
    }, []);

    useEffect(retrieveAllLines, [retrieveAllLines]);

    useEffect(() => {
        let startDate = new Date();
        let endDate = new Date();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        startDate.setFullYear(currentYear, currentMonth, 1);
        endDate.setFullYear(currentYear, currentMonth + 1, 0);
        setStartDate(startDate);
        setEndDate(endDate);
    }, []);

    useEffect(() => {
        setDates(findWorkingDaysBetweenDates(startDate, endDate, holidays));
    }, [startDate, endDate, holidays]);

    return (
        <div className='mt-10 w-full h-full'>
            <div className='w-full h-[95%] overflow-auto'>
                <table id='plannedOrders' className='w-full table-auto'>
                    <thead className="table-header sticky top-0 left-0 bg-gray-200">
                        <tr className=''>
                            <th className='sticky left-0 top-0 z-5 bg-gray-200 '>
                                <span className='w-20'>
                                    Lines →
                                    Date ↓
                                </span>
                            </th>
                            {allUnitLines.map(line =>
                                <th>{line.name}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {dates.map(date =>
                            <tr key={date} className="table-row ">
                                <td className='sticky left-0 z-10 bg-gray-200'>
                                    <div className='w-20'>
                                        {getDateFromDateTimeFormatToDisplay(date)}
                                    </div>
                                </td>
                                {allUnitLines.map(line =>
                                    <td></td>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ProductionPlanningReport
