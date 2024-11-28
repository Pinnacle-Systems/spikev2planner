import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FloatingLabelInput from "../../../Components/FloatingLabelInput";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { toasterTrigger } from "../../../utils/helper";
import { ORDERS_API } from "../../../Constants/Api"
import moment from "moment";
import Modal from "../../../Components/Modal";
import ProductionExcelImport from "./ProductionExcelImport";
import OrderExcelImport from "./OrderExcelImport";

import OrderSizeColorWiseDetails from "./OrderSizeColorWiseDetails";
import FloatingLabelSelect from "../../../Components/FloatingLabelSelect";
import { styleTypeOptions } from "../../../utils/selectOptions";
import { getDateFromDateTimeFormat } from "../../helper";

const BASE_URL = process.env.REACT_APP_SERVER_URL;


function Form({ id, setId, getOrders }) {
    const [orderNo, setOrderNo] = useState("");
    const [buyer, setBuyer] = useState("");
    const [dDate, setDDate] = useState("");
    const [style, setStyle] = useState("");
    const [quantity, setQuantity] = useState("");
    const [sam, setSam] = useState("");
    const [productionExcelImportForm, setProductionExcelImportForm] = useState(false);
    const [orderExcelImportForm, setOrderExcelImportForm] = useState(false);
    const [orderSizeColorWiseDetails, setOrderSizeColorWiseDetails] = useState([]);
    const [styleType, setStyleType] = useState('basic');
    const [loadNewOrders, setLoadNewOrders] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const handleSubmit = (event) => {
        event.preventDefault();
        axios({
            method: `${id ? "put" : "post"}`,
            url: BASE_URL + ORDERS_API + `${id ? "/" + id : ""}`,
            data: { orderNo, buyer, dDate, style, quantity, sam, styleType }
        }).then((result) => {
            console.log("result", result.data.response);
            if (result.status === 200 || result.status === 304) {
                if (result.data.statusCode === 0) {
                    window.location.reload();
                    localStorage.setItem("res", "success");
                    localStorage.setItem("success", `Order Saved Successfully!!!`);
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
    const navigate = useNavigate()

    const populateData = () => {
        if (id) {
            axios({
                method: 'get',
                url: BASE_URL + ORDERS_API + `/${id}`
            }).then((result) => {
                if (result?.status === 200) {
                    if (result?.data?.statusCode === 0) {
                        setBuyer(result?.data?.data.buyer);
                        setDDate(moment.utc(result?.data?.data?.dDate).format("YYYY-MM-DD"));
                        setOrderNo(result?.data?.data?.orderNo);
                        setQuantity(result?.data?.data?.quantity);
                        setSam(result?.data?.data?.sam);
                        setStyle(result?.data?.data?.style);
                        setStyleType(result?.data?.data?.styleType);
                        setOrderSizeColorWiseDetails(result?.data?.data?.OrderSizeColorWiseDetails || []);
                    }
                } else {
                    console.log(result);
                }
            }, (error) => {
                console.log(error);
                toast.error("Server Down", { autoClose: 5000 });
            });
        }
    }
    useEffect(populateData, [id])

    useEffect(toasterTrigger, []);
    const handleDelete = () => {
        axios({
            method: 'delete',
            url: BASE_URL + ORDERS_API + `/${id}`
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

    const resetForm = () => {
        setBuyer("");
        setDDate("");
        setOrderNo("");
        setQuantity("");
        setSam("");
        setStyle("");
        setId("");
        setOrderSizeColorWiseDetails([]);
        setStyleType('');
    }
    function handleGetOrders() {
        if (!startDate || !endDate) return toast.info("Start Date and End Date Mandatory...!!!")
        setLoadNewOrders(false);
        getOrders({ isGetOrdersFromERP: true, startDate, endDate })
    }

    return (
        <>
            <Modal isOpen={productionExcelImportForm} onClose={() => { setProductionExcelImportForm(false) }}>
                <ProductionExcelImport />
            </Modal>
            <Modal isOpen={orderExcelImportForm} onClose={() => { setOrderExcelImportForm(false) }}>
                <OrderExcelImport />
            </Modal>
            <Modal isOpen={loadNewOrders} onClose={() => { setLoadNewOrders(false) }}>
                <div className="p-5">
                    <div>Sync Orders from ERP</div>
                    <div className="flex">
                        <div>
                            From: <input type="date" value={getDateFromDateTimeFormat(startDate)} onChange={(e) => { setStartDate(e.target.value) }} />
                        </div>
                        <div>
                            To: <input type="date" value={getDateFromDateTimeFormat(endDate)} onChange={(e) => { setEndDate(e.target.value) }} />
                        </div>
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white font-bold hover:rounded p-1 disabled:bg-red-300"
                            type="button"
                            onClick={handleGetOrders}
                        >
                            Retrieve Orders
                        </button>
                    </div>
                </div>
            </Modal>
            <div className="flex mt-5 h-full w-full">
                <form className="mx-auto w-[90%] mt-2 border h-[400px]" onSubmit={handleSubmit}>
                    <header className="text-xl w-full text-gray-700 text-center font-bold flex justify-between  items-center p-1">
                        <div></div>
                        <span>
                            Order Details Form
                        </span>
                        <button
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold hover:rounded p-1 disabled:bg-red-300"
                            type="button"
                            onClick={() => { setLoadNewOrders(true) }}
                        >
                            Get New Orders
                        </button>
                        {/* <button
                            className="bg-green-600 hover:bg-green-700 text-white font-bold hover:rounded p-1 disabled:bg-red-300"
                            type="button"
                            onClick={resetForm}
                        >
                            New
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold hover:rounded p-1 disabled:bg-blue-300"
                            type="button"
                            onClick={() => { setOrderExcelImportForm(true) }}
                        >
                            Order Import
                        </button>
                        <button
                            className="bg-green-500 hover:bg-green-500 text-white font-bold hover:rounded p-1 disabled:bg-green-300"
                            type="button"
                            onClick={() => { setProductionExcelImportForm(true) }}
                        >
                            Production Data
                        </button> */}
                    </header>
                    <div className="grid md:grid-cols-2 gap-1 w-full">
                        <FloatingLabelInput label={"Order no"} autoFocus={true} value={orderNo} setValue={setOrderNo} disabled />
                        <FloatingLabelInput label={"Buyer"} value={buyer} setValue={setBuyer} disabled />
                        <FloatingLabelInput label={"Delivery Date"} type={"date"} value={dDate} setValue={setDDate} disabled />
                        <FloatingLabelInput label={"Style Ref."} value={style} setValue={setStyle} disabled />
                        <FloatingLabelInput label={"Quantity"} type={"number"} value={quantity} setValue={setQuantity} disabled />
                        {/* <FloatingLabelInput label={"Sam"} value={sam} type={"number"} setValue={setSam} disabled /> */}
                        <FloatingLabelSelect label={"Style Type"} value={styleType} setValue={setStyleType} options={styleTypeOptions} disabled />
                    </div>
                    <OrderSizeColorWiseDetails orderSizeColorWiseDetails={orderSizeColorWiseDetails} />
                    <div className="flex md:justify-evenly mt-3">
                        <button
                            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded "
                            type="button"
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </button>

                        {id ?

                            <button
                                className="bg-red-600 hover:bg-red-700 text-white font-bold hover:rounded p-1 disabled:bg-red-300"
                                type="button"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                            :
                            ""}
                        {/* <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 rounded"
                            type="submit"
                        >
                            Submit
                        </button> */}
                    </div>
                </form>
            </div>
        </>

    );
}

export default Form;