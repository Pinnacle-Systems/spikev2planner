import React, { useCallback, useEffect, useState } from 'react'
import Form from './Form'
import Report from './Report'
import { toast } from 'react-toastify';
import axios from "axios";
import { ORDERS_API } from "../../../Constants/Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const OrderForm = () => {
  const [id, setId] = useState("");
  const [orders, setOrders] = useState([]);
  const retrieveData = useCallback(() => {
    axios({
      method: 'get',
      url: BASE_URL + ORDERS_API,
    }).then((result) => {
      setOrders(result.data.data)
    }, (error) => {
      toast.error("Server Down", { autoClose: 5000 });
    });
  }, []);
  useEffect(retrieveData, [retrieveData]);

  return (
    <div className='h-screen w-screen'>
      <div className='h-full border w-1/2 float-left'>
        <Form id={id} setId={setId}/>
      </div>
      <div className='h-full w-1/2 float-right'>
        <Report orders={orders} setOrders={setOrders} setId={setId}/>
      </div>
    </div>
  )
}

export default OrderForm
