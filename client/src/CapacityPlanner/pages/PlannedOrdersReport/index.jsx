import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import axios from "axios";
import { ORDERS_API } from "../../../Constants/Api";
import moment from 'moment';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const BASE_URL = process.env.REACT_APP_SERVER_URL;


const PlannedOrdersReport = () => {
    const [orders, setOrders] = useState([]);
    const retrieveData = useCallback(() => {
        axios({
            method: 'get',
            url: BASE_URL + ORDERS_API,
            params: { lines: true }
        }).then((result) => {
            setOrders(result.data.data)
        }, (error) => {
            toast.error("Server Down", { autoClose: 5000 });
        });
    }, []);
    useEffect(retrieveData, [retrieveData]);
    return (
        <div className='p-5'>
            <h1 className='text-center font-bold text-2xl'>Planned Orders Report</h1>
            <div className='flex justify-end'>
                <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button text-white bg-blue-400 p-2 text-xs rounded-xl"
                    table="plannedOrders"
                    filename="tablexls"
                    sheet="tablexls"
                    buttonText="Excel"
                >
                </ReactHTMLTableToExcel>
            </div>
            <div className='flex justify-center text-center'>
                <table id='plannedOrders' className='w-full'>
                    <thead className="table-header">
                        <tr>
                            <th>
                                Plan Date
                            </th>
                            <th>
                                Revised Plan Date
                            </th>
                            <th>
                                Order No.
                            </th>
                            <th>
                                Order Date
                            </th>
                            <th>
                                Factory
                            </th>
                            <th>
                                Line
                            </th>
                            <th>
                                From Date
                            </th>
                            <th>
                                End Date
                            </th>
                            <th>
                                Total Order Qty
                            </th>
                            <th>
                                Line Qty
                            </th>
                            <th>
                                Username
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order =>
                            <React.Fragment key={order.id}>{console.log(orders)}
                                {order.lines.map(line =>
                                    <tr key={line.id} className="table-row">
                                        <td className="table-data">
                                            23-01-2023
                                        </td>
                                        <td className="table-data">

                                        </td>
                                        <td className="table-data">
                                            {order.orderNo}
                                        </td>
                                        <td className="table-data">

                                        </td>
                                        <td className="table-data">
                                            {line.Line.Unit.name}
                                        </td>
                                        <td className="table-data">
                                            {line.Line.name}
                                        </td>
                                        <td className="table-data">
                                            {moment.utc(line.startDate).format("DD-MM-YYYY")}
                                        </td>
                                        <td className="table-data">
                                            {moment.utc(line.endDate).format("DD-MM-YYYY")}
                                        </td>
                                        <td className="table-data">
                                            {order.quantity}
                                        </td>
                                        <td className="table-data">
                                            {line.pcs}
                                        </td>
                                        <td className="table-data"></td>
                                    </tr>
                                )}
                            </React.Fragment>)}
                    </tbody>
                </table>
            </div>
        </div >
    )
}

export default PlannedOrdersReport