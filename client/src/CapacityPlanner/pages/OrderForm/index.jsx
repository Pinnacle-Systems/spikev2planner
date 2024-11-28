import React, { useCallback, useEffect, useState } from 'react'
import Form from './Form'
import Report from './Report'
import { toast } from 'react-toastify';
import axios from "axios";
import { ORDERS_API } from "../../../Constants/Api";
import loadingIcon from "../../../assets/icons8-loading-16.png"
import Modal from '../../../Components/Modal';


const BASE_URL = process.env.REACT_APP_SERVER_URL;

const OrderForm = () => {
  const [id, setId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const retrieveData = useCallback((params) => {
    setLoading(true);
    axios({
      method: 'get',
      url: BASE_URL + ORDERS_API,
      params
    }).then((result) => {
      if (result.data.statusCode == 1) {
        toast.warning(result.data.message)
      } else {
        setOrders(result?.data?.data || []);
      }
    }, (error) => {
      toast.error("Server Down", { autoClose: 5000 });
    }).finally(() => { setLoading(false) });
  }, []);
  useEffect(retrieveData, [retrieveData]);
  return (
    <>
      <Modal isOpen={loading}>
        <button type="button" className="bg-indigo-500 text-white gap-2 p-2 rounded flex justify-center items-center" disabled>
          <img src={loadingIcon} className='animate-spin h-[40px] w-[40px]' alt="loading" />
          Loading...
        </button>
      </Modal>
      <div className='h-screen w-screen'>
        <div className='h-full border w-3/4 float-left'>
          <Form id={id} setId={setId} getOrders={retrieveData} />
        </div>
        <div className='h-full w-1/4 float-right'>
          <Report orders={orders} setOrders={setOrders} setId={setId} />
        </div>
      </div>
    </>
  )
}

export default OrderForm
