import React from 'react'
import { Header, Icon, HeaderContent } from 'semantic-ui-react'
import Report from './Report'


const ProductionReport = () => {
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