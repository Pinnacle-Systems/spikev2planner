import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FloatingLabelInput from "../../../Components/FloatingLabelInput";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { toasterTrigger } from "../../../utils/helper";
import { ORDERS_API } from "../../../Constants/Api"
import moment from "moment";

const BASE_URL = process.env.REACT_APP_SERVER_URL;


function Form({ id, setId }) {
    const [orderNo, setOrderNo] = useState("");
    const [buyer, setBuyer] = useState("");
    const [dDate, setDDate] = useState("");
    const [style, setStyle] = useState("");
    const [quantity, setQuantity] = useState("");
    const [sam, setSam] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        axios({
            method: `${id ? "put" : "post"}`,
            url: BASE_URL + ORDERS_API + `${id ? "/" + id : ""}`,
            data: { orderNo, buyer, dDate, style, quantity, sam }
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
                if (result.status === 200) {
                    if (result.data.statusCode === 0) {
                        setBuyer(result.data.data.buyer);
                        setDDate(moment.utc(result.data.data.dDate).format("YYYY-MM-DD"));
                        setOrderNo(result.data.data.orderNo);
                        setQuantity(result.data.data.quantity);
                        setSam(result.data.data.sam);
                        setStyle(result.data.data.style);
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
    }

    return (
        <div className="flex items-center h-full w-full">
            <form className="mx-auto w-[600px] mt-2 border h-[400px]" onSubmit={handleSubmit}>
                <header className="text-xl w-full text-gray-700 text-center font-bold flex justify-between  items-center p-1">
                    <div></div>
                    <span>
                        Order Details Form
                    </span>
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white font-bold hover:rounded p-1 disabled:bg-red-300"
                        type="button"
                        onClick={resetForm}
                    >
                        New
                    </button>
                </header>
                <div className="grid md:grid-cols-2 gap-1 w-full">
                    <FloatingLabelInput label={"Order no"} autoFocus={true} value={orderNo} setValue={setOrderNo} />
                    <FloatingLabelInput label={"Buyer"} value={buyer} setValue={setBuyer} />
                    <FloatingLabelInput label={"Delivery Date"} type={"date"} value={dDate} setValue={setDDate} />
                    <FloatingLabelInput label={"Style Ref."} value={style} setValue={setStyle} />
                    <FloatingLabelInput label={"Quantity"} type={"number"} value={quantity} setValue={setQuantity} />
                    <FloatingLabelInput label={"Sam"} value={sam} type={"number"} setValue={setSam} />
                </div>
                <div className="flex md:justify-evenly">
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded "
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
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 rounded"
                        type="submit"
                    >
                        Submit
                    </button>
                </div>

            </form>
        </div>

    );
}

export default Form;