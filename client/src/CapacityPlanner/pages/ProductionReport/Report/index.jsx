import { Aggregate, ColumnDirective, ColumnsDirective, Filter, GridComponent, Group, Inject, Page, Sort } from '@syncfusion/ej2-react-grids';
import * as React from 'react';
import { data } from './datasource';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(value || 0);
};
function Report() {
    const pageSettings = { pageSize: 6 };
    const aggregates = [
        {
            columns: [
                {
                    type: 'Sum',
                    field: 'Freight',
                    groupFooterTemplate: (data) => `Group Total: ${formatCurrency(data.Sum)}`,
                },
                {
                    type: 'Count',
                    field: 'OrderID',
                    groupFooterTemplate: (data) => `Count: ${data.Count}`,
                },
            ],
        },
    ];
    return (
        <GridComponent dataSource={data} allowPaging={true} allowGrouping
            groupSettings={{ columns: ['ShipCountry'] }}
            pageSettings={pageSettings}
            aggregates={aggregates}
            toolbar={['Group']}
            showGroupingBar={false}
        >
            <ColumnsDirective>
                <ColumnDirective field='OrderID' width='100' textAlign="Right" allowGrouping={false} />
                <ColumnDirective field='CustomerID' width='100' />
                <ColumnDirective field='EmployeeID' width='100' textAlign="Right" />
                <ColumnDirective field='Freight' width='100' format="C2" textAlign="Right"
                    template={(props) => formatCurrency(props.Freight)}
                />
                <ColumnDirective field='ShipCountry' width='100' />
            </ColumnsDirective>
            <Inject services={[Page, Sort, Filter, Group, Aggregate]} />
        </GridComponent>
    );
}
;
export default Report;