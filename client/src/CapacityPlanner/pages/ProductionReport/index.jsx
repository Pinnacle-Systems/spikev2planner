import React from 'react'
import { TabPane, Tab, Header, Icon, HeaderContent } from 'semantic-ui-react'
import MonthlyReport from './MonthlyReport'

const panes = [
    {
        menuItem: { key: 'Monthly', icon: 'calendar alternate', content: 'Monthly' },
        render: () => <TabPane> <MonthlyReport /> </TabPane>,
    },
    {
        menuItem: { key: 'Weekly', icon: 'calendar check', content: 'Weekly' },
        render: () => <TabPane>Tab 1 Content</TabPane>,
    },
    {
        menuItem: { key: 'Daily', icon: 'calendar plus', content: 'Daily' },
        render: () => <TabPane>Tab 1 Content</TabPane>,
    },
]

const ProductionReport = () => {
    return (
        <div>
            <Header as='h3' icon textAlign='center' >
                <Icon name='unordered list' circular />
                <HeaderContent>Planned Orders</HeaderContent>
            </Header>
            <div className='flex items-center justify-center'>
                <div className='w-[1100px]'>
                    <Tab panes={panes} />
                </div>
            </div>
        </div>
    )
}

export default ProductionReport