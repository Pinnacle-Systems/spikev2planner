import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import axios from "axios";
import { ORDERS_API } from "../../../Constants/Api";
import moment from 'moment';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const BASE_URL = process.env.REACT_APP_SERVER_URL;


const UnPlannedOrdersReport = () => {
    const [orders, setOrders] = useState([]);
    const retrieveData = useCallback(() => {
        axios({
            method: 'get',
            url: BASE_URL + ORDERS_API,
            params: { lines: false }
        }).then((result) => {
            setOrders(result.data.data)
        }, (error) => {
            toast.error("Server Down", { autoClose: 5000 });
        });
    }, []);
    useEffect(retrieveData, [retrieveData]);
    return (
        <div className='p-5'>
            <h1 className='text-center font-bold text-2xl'>Un Planned Orders Report</h1>
            <div className='flex justify-end'>
                <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button text-white bg-blue-400 p-2 text-xs rounded-xl"
                    table="unplannedOrders"
                    filename="tablexls"
                    sheet="tablexls"
                    buttonText="Excel"
                >
                </ReactHTMLTableToExcel>
            </div>
            <div className='flex justify-center text-center'>
                <table id='unplannedOrders' className='table-fixed w-full text-center'>
                    <thead className="table-header">
                        <tr className="">
                            <th>
                                Order&nbsp;no
                            </th>
                            <th>
                                Buyer
                            </th>
                            <th>
                                Delivery&nbsp;Date
                            </th>
                            <th>
                                Style
                            </th>
                            <th>
                                Quantity
                            </th>
                            <th>
                                Sam
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order =>
                            <tr key={order.id} className="table-row">
                                <td className="table-data">
                                    {order.orderNo}
                                </td>
                                <td className="table-data">
                                    {order.buyer}
                                </td>
                                <td className="table-data">
                                    {moment.utc(order.dDate).format("DD-MM-YYYY")}
                                </td>
                                <td className="table-data">
                                    {order.style}
                                </td>
                                <td className="table-data">
                                    {order.quantity}
                                </td>
                                <td className="table-data">
                                    {order.sam}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    )
}

export default UnPlannedOrdersReport