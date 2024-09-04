import React from 'react'

const OrderSizeColorWiseDetails = ({ orderSizeColorWiseDetails }) => {
    return (
        <fieldset className='w-full overflow-auto'>
            <legend>Order Details</legend>
            <table className='table-auto w-full text-center '>
                <thead className="table-header">
                    <tr className="">
                        <th>
                            Size
                        </th>
                        <th>
                            Color
                        </th>
                        <th>
                            Qty
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {orderSizeColorWiseDetails.map(order =>
                        <tr key={order.id} className="table-row">
                            <td className="table-data">
                                {order?.size}
                            </td>
                            <td className="table-data">
                                {order?.color}
                            </td>
                            <td className="table-data">
                                {order?.qty}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </fieldset>
    )
}

export default OrderSizeColorWiseDetails
