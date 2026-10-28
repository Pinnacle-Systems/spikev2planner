import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { useState } from 'react'
import { findWorkingDaysBetweenDates, getCurrentCapacity, getDateFromDateTimeFormatToDisplay, isDateBetweenDates, isSameDay } from '../../helper';
import { CapacityPlannerContext } from '../../CapacityPlanner';
import axios from 'axios';
import { LINES_API } from '../../../Constants/Api';
import { toast } from 'react-toastify';
import Cell from './Cell';
import Parameter from './Parameter';

const BASE_URL = process.env.REACT_APP_SERVER_URL;


const ProductionPlanningReport = () => {

    const {
        holidays,
        units
    } = useContext(CapacityPlannerContext);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [dates, setDates] = useState([]);


    useEffect(() => {
        setSelectedUnits(units.map(i => i.id))
    }, [units])

    const [allUnitLines, setAllUnitLines] = useState([]);
    const [reportData, setReportData] = useState([]);



    console.log(allUnitLines, "allUnitLines", reportData)

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
        const retrieveAllLines = () => {
            if (!startDate || !endDate) return
            axios({
                method: 'get',
                url: BASE_URL + LINES_API,
                params: {
                    isReport: true,
                    selectedUnits,
                    startDate, endDate
                }
            }).then((result) => {
                setAllUnitLines(result?.data?.data || [])
                setReportData(result?.data?.reportData || []);
            }, (error) => {
                toast.error("Server Down", { autoClose: 5000 });
            });
        }
        retrieveAllLines()
    }, [selectedUnits, startDate, endDate])



    useEffect(() => {
        setDates(findWorkingDaysBetweenDates(startDate, endDate, holidays));
    }, [startDate, endDate, holidays]);

    function getDataForStartDateAndLine(date, line) {
        return reportData.find(orderLine => (orderLine.lineId == line.id) && isSameDay(new Date(date), new Date(orderLine.startDate)))
    }
    let reportDataWithLearningCurvePercentage = reportData.map(lineObj => {
        const learningCurveItems = lineObj.learningCurveItems || [];
        const productionSchedule = [];
        const workingDays = findWorkingDaysBetweenDates(lineObj.startDate, lineObj.endDate, holidays);
        const lineCapacity = lineObj.capacity || lineObj.Line?.capacity || 0;
        const defaultEfficiency = lineObj.efficiency || 100;
        let totalPcs = Number(lineObj.pcs || 0);
        let totalProductionSchedulePcs = 0;
        for (let i = 0; i < workingDays.length; i++) {
            const currentEfficiency = learningCurveItems.length > 0
                ? (i < learningCurveItems.length
                    ? parseFloat(learningCurveItems[i]?.percentage || 0)
                    : parseFloat(learningCurveItems[learningCurveItems.length - 1]?.percentage || 0))
                : defaultEfficiency;
            const currentDatePcs = Math.round((currentEfficiency * lineCapacity) / 100);
            const balanceQty = totalPcs - totalProductionSchedulePcs;
            const allocationQty = currentDatePcs > balanceQty
                ? Math.max(0, balanceQty)
                : Math.max(0, currentDatePcs);
            totalProductionSchedulePcs += allocationQty;
            productionSchedule.push({ date: workingDays[i], pcs: allocationQty });
        }
        return { ...lineObj, productionSchedule };
    });

    function getDataForDateAndLine(date, line) {
        return reportDataWithLearningCurvePercentage.find(orderLine => (orderLine.lineId == line.id) && isDateBetweenDates(new Date(orderLine.startDate), new Date(orderLine.endDate), new Date(date)))
    }

    function getLineWiseTotal(lineId) {
        let reportData = reportDataWithLearningCurvePercentage.filter(orderLine => (orderLine.lineId == lineId))
        let qty = 0;
        reportData.forEach(dateData => {
            let productionSchedule = dateData?.productionSchedule || [];
            qty += productionSchedule.filter(i =>
                isDateBetweenDates(new Date(startDate), new Date(endDate), new Date(i.date))
            ).reduce((a, c) => a + parseFloat(c?.pcs || 0), 0);
        })
        return qty
    }


    return (
        <div className='pt-2 w-full h-full text-sm p-2'>
            <div className='text-center bg-blue-200 text-2xl '>
                Production Schedule Report
            </div>
            <Parameter selectedUnits={selectedUnits} setSelectedUnits={setSelectedUnits} startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
            <div className='text-center bg-gray-200 mt-1'>
                <strong>
                    Date From {getDateFromDateTimeFormatToDisplay(startDate)} to {getDateFromDateTimeFormatToDisplay(endDate)}
                    <span className='pl-10'>
                        Units:  {(selectedUnits.length === 0)
                            ?
                            units.map(i => i.name).join(',')
                            :
                            units.filter(i => selectedUnits.includes(i.id)).map(i => i.name).join(',')}
                    </span>
                </strong>
            </div>
            {reportData?.length == 0 ?
                <div className='text-2xl text-center h-[90%] flex justify-center items-center'>
                    <span>
                        Generate Report to View
                    </span>
                </div>
                :
                <div className='w-full h-[90%] overflow-auto'>
                    <table id='production-report' className='w-full table-auto'>
                        <thead className="table-header sticky top-0 left-0 bg-gray-200">
                            <tr className=''>
                                <th>
                                    <span className='bg-gray-200'>
                                        Lines →
                                        Date ↓
                                    </span>
                                </th>
                                {allUnitLines.map(line =>
                                    <React.Fragment key={line.id}>
                                        <th>
                                            <span className='w-20 whitespace-nowrap p-1'>
                                                {line.name}
                                            </span>
                                        </th>
                                        <th className='border-r border-gray-400'>Pcs</th>
                                    </React.Fragment>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {dates.map(date =>
                                <tr key={date} className="table-row-report">
                                    <td className='sticky left-0 '>
                                        <div className='w-20 z-0 bg-gray-200'>
                                            {getDateFromDateTimeFormatToDisplay(date)}
                                        </div>
                                    </td>
                                    {allUnitLines.map(line =>
                                        <Cell key={line.id} date={date} line={line} getDataForDateAndLine={getDataForDateAndLine} getDataForStartDateAndLine={getDataForStartDateAndLine} endDate={endDate} startDate={startDate} />
                                    )}
                                </tr>
                            )}
                            <tr className="table-row-report">
                                <td className='sticky left-0 '>
                                    <div className='w-20 z-0 bg-gray-200'>
                                        Total
                                    </div>
                                </td>
                                {allUnitLines.map(line =>
                                    <td className='' colSpan={2}>
                                        <div className='z-0 bg-gray-200 text-right'>
                                            {getLineWiseTotal(line.id)}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        </tbody>
                    </table>
                </div>
            }

        </div>
    )
}

export default ProductionPlanningReport
