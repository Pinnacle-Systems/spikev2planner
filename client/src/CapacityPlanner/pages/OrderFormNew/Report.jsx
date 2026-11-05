import React, { useState } from "react";

import moment from "moment";
import { getDateFromDateTimeFormatToDisplay } from "../../helper";
import { Tooltip } from "@mui/material";
import { useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import { FaChevronLeft, FaChevronRight, FaStepBackward, FaStepForward } from "react-icons/fa";


const Report = ({ orders, setId, onDelete, onView, allData,
    searchOrderNo,
    setSearchOrderNo,
    searchStyleNo,
    setSearchStyleNo,
    searchDeliveryDate,
    setSearchDeliveryDate,
    searchBuyerName,
    setSearchBuyerName,
    searchQty,
    setSearchQty,
    currentPage,
    setCurrentPage,

}) => {


    const totalPages = Math?.ceil(allData?.totalCount / 14);
    const indexOfFirstItem = 0;
    const indexOfLastItem = Math.min(currentPage * parseInt(14), allData?.totalCount || 0);
    const currentItems = allData?.data?.slice(indexOfFirstItem, indexOfLastItem);

    // console.log(allData, 'currentItems')

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };


    const Pagination = () => {
        return (
            <div className="h-10 w-full flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200 ">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, allData?.data?.length)} of {allData?.length} entries
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className={`min-w-8 rounded-md px-2.5 py-1 ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        title="First Page"
                    >
                        <FaStepBackward size={12} className="inline" />
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <FaChevronLeft className="inline" />
                    </button>

                    {Array?.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 rounded-md ${currentPage === pageNum
                                    ? 'bg-indigo-800 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                        <span className="px-3 py-1">...</span>
                    )}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className={`px-3 py-1 rounded-md ${currentPage === totalPages
                                ? 'bg-indigo-800 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {totalPages}
                        </button>
                    )}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <FaChevronRight className="inline" />
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`min-w-8 rounded-md px-2.5 py-1 ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        title="Last Page"
                    >
                        <FaStepForward size={12} className="inline" />
                    </button>
                </div>
            </div>
        );
    };


    return (

        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">

            <>
                <div className="flex h-[72vh] min-h-0 flex-col rounded-lg bg-[#F1F1F0] shadow-sm">
                    <div className="min-h-0 flex-1 overflow-auto">
                        <table>
                            <thead className="bg-gray-200 text-gray-800 ">
                                <tr className="">
                                    <th className=" px-1 py-1.5  font-bold text-[13px]  text-gray-900  text-center  w-12">
                                        <div className="">S No</div>
                                    </th>

                                    <th className=" px-3  font-bold text-[13px]  text-gray-900  text-center w-64">
                                        <div>Order No</div>

                                    </th>
                                    <th className=" px-3  font-bold text-[13px]  text-gray-900  text-center w-48">
                                        <div>Customer / Buyer</div>

                                    </th>


                                    <th className="w-40  px-3   font-bold text-[13px] text-gray-900  text-center ">
                                        <div>Delivery Date	</div>

                                    </th>
                                    <th className="w-64  px-3   font-bold text-[13px] text-gray-900  text-center ">
                                        <div>Style</div>

                                    </th>
                                    <th className="w-18   px-3  font-bold text-[13px]  text-gray-900  text-center ">
                                        <div>Quantity</div>

                                    </th>

                                    <th className="w-18   px-3  font-bold text-[13px]  text-gray-900  text-center ">
                                        <div>Actions</div>

                                    </th>
                                </tr>
                                <tr className="">
                                    <th className=" px-1  font-bold text-[13px] justify-end  text-gray-900  text-center  w-12">
                                        <div className="h-3"></div>
                                    </th>

                                    <th className=" px-1 font-bold text-[13px] border  text-gray-900  text-center w-32">
                                        <input
                                            type="text"
                                            className="text-black h-5 bg-white  w-full  px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={searchOrderNo}
                                            onChange={(e) => {
                                                setSearchOrderNo(e.target.value);
                                            }}
                                        />
                                    </th>
                                    <th className="w-96  px-1 font-bold text-[13px]  text-gray-900  text-center ">
                                        <input
                                            type="text"
                                            className="text-black h-5 bg-white  w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={searchBuyerName}
                                            onChange={(e) => {
                                                setSearchBuyerName(e.target.value);
                                            }}
                                        />
                                    </th>
                                    <th className="  px-1 font-bold text-[13px]  text-gray-900  text-center w-32">
                                        <input
                                            type="text"
                                            className="text-black h-5 bg-white  w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={searchDeliveryDate}
                                            onChange={(e) => {
                                                setSearchDeliveryDate(e.target.value);
                                            }}
                                        />
                                    </th>



                                    <th className="  px-1 font-bold text-[13px]  text-gray-900  text-center w-32">
                                        <input
                                            type="text"
                                            className="text-black h-5 bg-white  w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={searchStyleNo}
                                            onChange={(e) => {
                                                setSearchStyleNo(e.target.value);
                                            }}
                                        />
                                    </th>

                                    <th className="  px-1 font-bold text-[13px]  text-gray-900  text-center w-32">
                                        <input
                                            type="text"
                                            className="text-black h-5 bg-white   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                            placeholder="Search"
                                            value={searchQty}
                                            onChange={(e) => {
                                                setSearchQty(e.target.value);
                                            }}
                                        />
                                    </th>

                                    <th className="  px-1 font-bold text-[13px]  text-gray-900  text-center w-32">

                                    </th>

                                </tr>
                            </thead>
                            {false ? (
                                <tbody>
                                    <tr>
                                        <td>
                                            {/* <Loader /> */}
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody className="border-2">
                                    {(currentItems ? currentItems : []).map((dataObj, index) => {

                                        return (
                                            <tr

                                                tabIndex={0}
                                                key={dataObj.id}
                                                className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                    }`}
                                            >
                                                <td className="py-1.5 text-center " >
                                                    {index + 1}
                                                </td>

                                                <td className="py-1.5 text-left">{dataObj.orderNo} </td>
                                                <td className="py-1.5 text-left">{dataObj.buyer} </td>


                                                <td className="py-1.5 text-left">
                                                    {getDateFromDateTimeFormatToDisplay(dataObj.dDate)}
                                                </td>
                                                <td className="py-1.5 text-left">{dataObj.style} </td>
                                                <td className="py-1.5  px-2 text-right">{parseFloat(dataObj.quantity).toFixed(2)} </td>

                                                <td className="px-2 h-8">
                                                    <div className="flex items-center justify-end">


                                                        <div className="flex items-center gap-1 pl-2">
                                                            <Tooltip title="View" arrow>
                                                                <button
                                                                    className="text-blue-600  flex items-center   px-1  bg-blue-50 rounded"
                                                                    onClick={() => onView(dataObj.id)}
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </Tooltip>


                                                            <Tooltip
                                                                title={
                                                                    false
                                                                        ? "Cannot Delete. Child Record Exists"
                                                                        : "Delete"
                                                                }
                                                                arrow
                                                            >
                                                                <button
                                                                    className={`flex items-center gap-1 px-1 rounded transition
       ${false
                                                                            ? "bg-red-50 text-red-500 opacity-40 cursor-not-allowed"
                                                                            : "bg-red-50 text-red-800 hover:bg-red-100"
                                                                        }`}
                                                                    // onClick={() => hasPermission(() => onDelete(dataObj.id, dataObj?._count), "delete", dataObj?._count)}
                                                                    // disabled={hasChildRecords}
                                                                    onClick={() => onDelete(dataObj.id)}
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                    {/* <span className="text-xs">delete</span> */}
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                </td>



                                            </tr>
                                        )
                                    }

                                    )}

                                </tbody>
                            )}
                        </table>

                    </div>
                    {/* <div className="shrink-0">
                        <Pagination />
                    </div> */}

                </div>
                <div className="shrink-0">
                    <Pagination />
                </div>
            </>

        </div >
    )
}

export default Report
