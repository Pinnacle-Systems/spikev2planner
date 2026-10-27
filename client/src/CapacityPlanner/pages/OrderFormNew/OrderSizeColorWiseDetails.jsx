import React from 'react'
import TransactionLineItemsSection, { transactionTableClassName, transactionTableHeadClassName } from '../../../Basic/ReusabelComponents/TransactionLineItemsSection';

const OrderSizeColorWiseDetails = ({ orderSizeColorWiseDetails }) => {
    return (
        <TransactionLineItemsSection
            panelClassName="h-full"
            contentClassName="overflow-hidden rounded-md border border-slate-200 !py-0"
        >
            <div className="h-full overflow-x-auto overflow-y-auto ">
                <table className={`${transactionTableClassName} [&_button]:leading-[14px] [&_input]:leading-[14px] [&_tbody_td]:h-[26px] [&_tbody_td]:align-middle [&_tbody_tr]:h-[26px] [&_td]:leading-[14px] [&_th]:leading-[14px]`}>
                    <thead className={`${transactionTableHeadClassName} shadow-sm [&>tr>th]:align-middle [&>tr>th]:leading-[14px]`}>
                        <tr className="bg-gray-00">
                            <th
                                className={`w-5 bg-gray-300 px-1 py-1 text-center font-medium text-[12px] `}
                            >
                                S.No
                            </th>

                            <th

                                className={`w-12 bg-gray-300 px-1 py-1 text-center font-medium text-[12px] `}
                            >
                                Size
                            </th>
                            <th

                                className={`w-20 bg-gray-300 px-1 py-1 text-center font-medium text-[12px] `}
                            >
                                Color
                            </th>
                            <th

                                className={`w-16 bg-gray-300 px-1 py-1 text-center font-medium text-[12px] `}
                            >
                                Order Qty
                            </th>
                            <th

                                className={`w-20 bg-gray-300 px-1 py-1 text-center font-medium text-[12px] `}
                            >
                                Production Qty

                            </th>
                            <th

                                className={`w-20 bg-gray-300 px-1 py-1 text-center font-medium text-[12px] `}
                            >
                                Balance Qty

                            </th>




                        </tr>
                    </thead>

                    <tbody className="bg-white">

                        {(orderSizeColorWiseDetails ? orderSizeColorWiseDetails : [])?.map((order, index) =>
                            <tr key={index} className={`border border-blue-gray-200 cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}

                            >
                                <td className="w-12 border border-gray-300 text-[11px] text-center py-0.5">{index + 1}</td>
                                <td className="w-16 px-1 text-[11px] text-left border border-gray-300 p-0 ">
                                    {order?.size}

                                </td>
                                <td className="w-16 text-[11px] px-1 border border-gray-300 p-0 text-left">
                                    {order?.color}

                                </td>
                                <td className="w-16 text-[11px]  px-3 border border-gray-300 p-0 text-right">
                                    {parseFloat(order?.qty).toFixed(2)}

                                </td>
                                <td className="w-16 text-[11px]  px-3 border border-gray-300 p-0 text-right">
                                    {parseFloat(order?.productionQty).toFixed(2)}

                                </td>
                                <td className="w-16 text-[11px] px-3 border border-gray-300 p-0 text-right">
                                    {parseFloat(order?.balanceQty).toFixed(2)}

                                </td>

                            </tr>
                        )}
                    </tbody>

                </table>
            </div>

        </TransactionLineItemsSection>
    )
}

export default OrderSizeColorWiseDetails
