import axios from 'axios';
import React from 'react'
import { useState } from 'react'
import { ORDERS_API } from '../../../Constants/Api';
import { toast } from 'react-toastify';
const BASE_URL = process.env.REACT_APP_SERVER_URL;

const OrderExcelImport = () => {
    const [file, setFile] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('importType', 'order');
        axios({
            method: 'post',
            url: BASE_URL + ORDERS_API + '/excelImport',
            data: formData
        }).then((result) => {
            console.log("result", result.data.response);
            if (result.status === 200 || result.status === 304) {
                if (result.data.statusCode === 0) {
                    window.location.reload();
                    localStorage.setItem("res", "success");
                    localStorage.setItem("success", `Order Imported Successfully!!!`);
                }
                else if (result.data.statusCode === 1) {
                    toast.warning(result.data.message, { autoClose: 5000 })
                }
            } else {
                console.log(result);
            }
        }, (error) => {
            console.log(error.status)
            toast.error("Server Down", { autoClose: 5000 })
        });
    };
    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 bg-blue-500 rounded-md p-1 text-white">Upload Order Excel File</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="file-upload" className="block text-gray-700 text-sm font-bold mb-2">
                        Select Excel File:
                    </label>
                    <input
                        type="file"
                        id="file-upload"
                        accept=".xlsx"
                        onChange={(e) => { setFile(e.target.files[0]) }}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                >
                    Upload
                </button>
            </form>
        </div>
    )
}

export default OrderExcelImport
