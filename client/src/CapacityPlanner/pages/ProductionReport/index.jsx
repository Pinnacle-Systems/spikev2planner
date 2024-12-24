import React, { useEffect, useState } from 'react'
import { Header, Icon, HeaderContent } from 'semantic-ui-react'
import Report from './Report'
import axios from 'axios'
import { BASE_URL, LINES_API } from '../../../Constants/Api'


const ProductionReport = () => {
    const [data, setData] = useState([])
    useEffect(() => {
        axios.get(BASE_URL + LINES_API, { params: { type: 'planned' } })
            .then(response => {
                console.log(response.data)
                setData(response?.data?.data || []);
            })
            .catch(error => {
                console.log(error)
            })
    }, [])
    return (
        <div>
            <Header as='h4' icon textAlign='center' >
                <HeaderContent>Planned Orders</HeaderContent>
                {/* <Icon name='unordered list' circular /> */}
            </Header>
            <div className='flex items-center justify-center'>
                <div className='w-[1100px]'>
                    <Report data={data} />
                </div>
            </div>
        </div>
    )
}

export default ProductionReport