import React, { useContext } from 'react'
import { CapacityPlannerContext } from '../../CapacityPlanner';
import { getDateFromDateTimeFormatToDisplay } from '../../helper';

const ProductionDetails = () => {
    const { currentOrder: order } = useContext(CapacityPlannerContext)

    let lineAndDateWiseProductionQtyList = (order?.lineWiseProductionData || []);

    return (
        <div className=' p-5 mt-5 text-center overflow-y-auto'>
            <table className='table-fixed mt-4'>
                <thead className='top-0 sticky bg-gray-100'>
                    <tr className=' font-bold mb-1 bg-blue-300 '>
                        <th colSpan={5}>
                            Production Schedule Details
                        </th>
                    </tr>
                    <tr >
                        <th className='border border-black'> Order no.</th>
                        <th className='border border-black' colSpan={3}> {order.orderNo}</th>
                    </tr>
                    <tr>
                        <th className='border border-black w-5'> S.no</th>
                        <th className='border border-black'> Date</th>
                        <th className='border border-black' > Line</th>
                        <th className='border border-black' > Prod.Qty</th>
                    </tr>
                </thead>
                <tbody>
                    {(lineAndDateWiseProductionQtyList.length == 0) ?
                        <tr >
                            <td className='border border-black p-2' colSpan={4}> No Production Data...!!!</td>
                        </tr>
                        :
                        <>
                            {
                                lineAndDateWiseProductionQtyList.map((prod, index) => {
                                    return (<tr key={prod.date}>
                                        <td className='border border-black'> {index + 1}</td>
                                        <td className='border border-black'> {getDateFromDateTimeFormatToDisplay(prod.date)}</td>
                                        <td className='border border-black' > {prod?.line}</td>
                                        <td className='border border-black' > {prod?.productionqty}</td>
                                    </tr>)
                                }
                                )
                            }
                        </>
                    }
                </tbody>
            </table>
        </div>
    )
}

export default ProductionDetails