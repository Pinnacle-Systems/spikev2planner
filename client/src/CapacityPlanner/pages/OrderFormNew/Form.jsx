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
import TransactionEntryShell from "../../../Basic/ReusabelComponents/TransactionEntryShell";
import TransactionHeaderSection from "../../../Basic/ReusabelComponents/TransactionHeaderSection";
import { DateInput, DropdownInput, ReusableInput, TextInput } from "../../../Inputs";

const BASE_URL = process.env.REACT_APP_SERVER_URL;


function Form({ id, setId, getOrders, onClose }) {
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
    const [headerOpen, setHeaderOpen] = useState(true);

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
            <TransactionEntryShell
                title="Purchase Inward"
                // readOnly={readOnly}
                id={id}
                onClose={onClose}
                headerOpen={headerOpen}
                // setHeaderOpen={setHeaderOpen}
                // summaryItems={summaryItems}
                openStateClassName="max-h-[320px] headerContent opacity-100 overflow-visible"
                headerContent={
                    <div className="grid grid-cols-1  gap-2 overflow-visible md:grid-cols-2">
                        <TransactionHeaderSection
                            title="Basic Details"
                            bodyClassName="grid-cols-12 gap-1.5 overflow-visible"
                        >
                            <div className="col-span-3">

                                <ReusableInput
                                    label="Order  No"
                                    value={orderNo}
                                />
                            </div>
                            <div className="col-span-3">
                                <ReusableInput
                                    label="Deivery Date"
                                    value={dDate}
                                />
                            </div>
                            <div className="col-span-6">

                                <ReusableInput
                                    label="Customer / Buyer Name"
                                    value={buyer}
                                />
                            </div>



                        </TransactionHeaderSection>
                        <TransactionHeaderSection
                            title="Other Details"
                            bodyClassName="grid-cols-12 gap-1.5 overflow-visible"
                        >




                            <div className="col-span-3">

                                <ReusableInput
                                    label="Style Type"
                                    value={style}
                                />
                            </div>
                            <div className="col-span-2">

                                <ReusableInput
                                    label="Qty"
                                    value={quantity}
                                />
                            </div>
                        </TransactionHeaderSection>



                    </div>
                }
            // footer={footerContent}
            >
                <OrderSizeColorWiseDetails orderSizeColorWiseDetails={orderSizeColorWiseDetails} />


            </TransactionEntryShell>
        </>

    );
}

export default Form;