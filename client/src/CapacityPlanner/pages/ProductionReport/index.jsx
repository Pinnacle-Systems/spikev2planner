import React, { useEffect } from 'react'
import { Header, Icon, HeaderContent } from 'semantic-ui-react'
import Report from './Report'
import axios from 'axios'
import { BASE_URL, ORDERS_API } from '../../../Constants/Api'


const ProductionReport = () => {
    useEffect(() => {
        axios.get(BASE_URL + ORDERS_API, { params: { type: 'planned' } })
            .then(response => {
                console.log(response.data)
            })
            .catch(error => {
                console.log(error)
            })
    }, [])
    return (
        <div>
            <Header as='h3' icon textAlign='center' >
                <Icon name='unordered list' circular />
                <HeaderContent>Planned Orders</HeaderContent>
            </Header>
            <div className='flex items-center justify-center'>
                <div className='w-[1100px]'>
                    <Report />
                </div>
            </div>
        </div>
    )
}

export default ProductionReport