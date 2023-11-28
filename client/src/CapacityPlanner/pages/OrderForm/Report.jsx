import React from "react";

import moment from "moment";


const Report = ({orders, setId}) => {
   
return (
    <div className='w-full'>
        <table className='table-fixed w-full text-center'>
            <thead className="table-header">
                <tr className="">
                    <th>
                        Order&nbsp;no
                    </th>
                    <th>
                        Buyer
                    </th>
                    <th>
                        Delivery&nbsp;Date
                    </th>
                    <th>
                        Style
                    </th>
                    <th>
                        Quantity
                    </th>
                    <th>
                        Sam
                    </th>
                </tr>
            </thead>
            <tbody>
               {orders.map(order =>
                <tr key={order.id} className="table-row" onClick={()=> setId(order.id)}>
                    <td className="table-data">
                        {order.orderNo}
                    </td>
                    <td className="table-data">
                        {order.buyer}
                    </td>
                    <td className="table-data">
                        {moment.utc(order.dDate).format("DD-MM-YYYY")}
                    </td>
                    <td className="table-data">
                        {order.style}
                    </td>
                    <td className="table-data">
                        {order.quantity}
                    </td>
                    <td className="table-data">
                        {order.sam}
                    </td>
                </tr>
               )}
            </tbody>
        </table>
    </div>
)
}

export default Report
