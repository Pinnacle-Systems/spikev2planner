import React, { useCallback, useEffect, useState } from 'react'
import Form from './Form'
import Report from './Report'
import { toast } from 'react-toastify';
import axios from "axios";
import { ORDERS_API } from "../../../Constants/Api";
import loadingIcon from "../../../assets/icons8-loading-16.png"
import Modal from '../../../Components/Modal';
import { FaPlus } from 'react-icons/fa';
import { PlusIcon } from 'lucide-react';
import { getDateFromDateTimeFormat } from '../../helper';
import Swal from 'sweetalert2';
import { useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { Loader } from '../../../Basic/Components';


const BASE_URL = process.env.REACT_APP_SERVER_URL;

const OrderFormNew = () => {
  const [id, setId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [loadNewOrders, setLoadNewOrders] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());


  const [searchOrderNo, setSearchOrderNo] = useState("")
  const [searchStyleNo, setSearchStyleNo] = useState("")
  const [searchDeliveryDate, setSearchDeliveryDate] = useState("")
  const [searchBuyerName, setSearchBuyerName] = useState("")
  const [searchQty, setSearchQty] = useState("")
  const [currentPage, setCurrentPage] = useState(1);


  const searchFields = {
    searchOrderNo,
    searchStyleNo,
    searchDeliveryDate,
    searchBuyerName,
    searchQty

  };

  const { data: allData, isFetching, isLoading, refetch } = useGetOrderQuery({
    params: {
      ...searchFields,
      pagination: true,
      dataPerPage: 14,
      currentPageNumber: currentPage,
    }
  });



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


  const retrieveAllData = useCallback((params) => {
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
    }).finally(() => { setLoading(false); refetch() });
  }, []);
  useEffect(retrieveAllData, [retrieveAllData]);


  const handleView = (id) => {

    setId(id)
    setShowForm(true)
  };
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure to delete...?")) {
      return;
    }

    axios({
      method: 'delete',
      url: BASE_URL + ORDERS_API + `/${id}`
    })
      .then((result) => {
        if (result.status === 200) {
          if (result.data.statusCode === 0) {
            Swal.fire({
              title: "Deleted Successfully",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            }).then(() => {
              window.location.reload();
            });
          } else if (result.data.statusCode === 1) {
            Swal.fire({
              title: result.data.message,
              icon: "warning",
            });
          }
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Server Down", { autoClose: 5000 });
      });
  };
  function handleGetOrders() {
    if (!startDate || !endDate) return toast.info("Start Date and End Date Mandatory...!!!")
    setLoadNewOrders(false);
    retrieveAllData({ isGetOrdersFromERP: true, startDate, endDate })
  }

  return (
    <>
      <Modal isOpen={loading}>
        {/* <button type="button" className="bg-indigo-500 text-white gap-2 p-2 rounded flex justify-center items-center" disabled>
          <img src={loadingIcon} className='animate-spin h-[40px] w-[40px]' alt="loading" />
          Loading...
        </button> */}
        <Loader />
      </Modal>
      <Modal isOpen={loadNewOrders} onClose={() => { setLoadNewOrders(false) }}>

        <div className="p-4 sm:p-5">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            {/* Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-800">
                Sync Orders from ERP
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select a date range to retrieve orders from the ERP system.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="startDate"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  From Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={getDateFromDateTimeFormat(startDate)}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#1D3A76] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex-1">
                <label
                  htmlFor="endDate"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  To Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={getDateFromDateTimeFormat(endDate)}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#1D3A76] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1D3A76] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#152c5c] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[170px]"
                type="button"
                onClick={handleGetOrders}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-15.5-6.3L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 15.5 6.3L21 16" />
                  <path d="M21 21v-5h-5" />
                </svg>
                Retrieve Orders
              </button>
            </div>
          </div>
        </div>

      </Modal>

      {showForm ? (
        <div className="h-[calc(100vh-5rem)] min-h-0 overflow-hidden">
          <Form id={id} setId={setId} getOrders={retrieveData}
            onClose={() => { setShowForm(false) }}
          />
        </div>

      ) : (
        <div className="flex h-[calc(100vh-5rem)] min-h-0 flex-col bg-[#F1F1F0] mt-3 ">

          <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-1 shadow-sm mb-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="h-8 w-1 shrink-0 rounded-full bg-[#E0562C]"
              />
              <div className="min-w-0">
                <h2 className={`truncate text-lg font-semibold leading-tight text-slate-900 `}>Order Details Form
                </h2>
              </div>
            </div>

            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold hover:rounded p-1 disabled:bg-red-300"
              type="button"
              onClick={() => { setLoadNewOrders(true) }}
            >
              Get New Orders
            </button>
            {/* <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-md bg-[#E0562C] hover:bg-[#e0562cf2] px-4 py-1 text-sm font-medium text-white shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0562C] focus-visible:ring-offset-2 active:bg-indigo-800"
            >
              <PlusIcon height={15} />
              Create New
            </button> */}

          </header>

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-sm">

            <Report
              onView={handleView}
              onDelete={handleDelete}
              orders={orders}
              setOrders={setOrders}
              setId={setId}
              allData={allData}


              searchOrderNo={searchOrderNo}
              setSearchOrderNo={setSearchOrderNo}
              searchStyleNo={searchStyleNo}
              setSearchStyleNo={setSearchStyleNo}
              searchDeliveryDate={searchDeliveryDate}
              setSearchDeliveryDate={setSearchDeliveryDate}
              searchBuyerName={searchBuyerName}
              setSearchBuyerName={setSearchBuyerName}
              searchQty={searchQty}
              setSearchQty={setSearchQty}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}

            />
          </div>
        </div>
      )}
    </>
  )
}

export default OrderFormNew
