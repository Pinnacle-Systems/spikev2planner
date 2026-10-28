import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BASE_URL, LINES_API } from '../../../Constants/Api'
import PurchaseReport from '../../Components/NewReport/PurchaseReport'

const ProductionReport = () => {
    const [data, setData] = useState([])

    useEffect(() => {
        axios.get(BASE_URL + LINES_API, { params: { type: 'planned' } })
            .then(response => {
                setData(response?.data?.data || []);
            })
            .catch(error => {
                console.error("Error fetching planned orders:", error)
            })
    }, [])

    return (
        <div className='w-full h-full min-h-0 flex flex-col'>
            <PurchaseReport data={data} reportType="planned" />
        </div>
    )
}

export default ProductionReport