import { Aggregate, ColumnDirective, ColumnsDirective, ExcelExport, Filter, GridComponent, Group, Inject, Page, PdfExport, Search, Sort, Toolbar } from '@syncfusion/ej2-react-grids';
import * as React from 'react';
// import { data } from './datasource';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(value || 0);
};
function Report({ data }) {

    const gridRef = React.useRef(null);
    const pageSettings = { pageSize: 20 };
    const aggregates = [
        {
            columns: [
                {
                    type: 'Sum',
                    field: 'pcs',
                    groupFooterTemplate: (data) => `Group Total: ${parseFloat(data.Sum || 0).toFixed(0)}`,
                    footerTemplate: (data) => `${parseFloat(data.Sum || 0).toFixed(0)}`,
                },
            ],
        },
    ];

    return (
        <GridComponent
            rowHeight={30}
            ref={gridRef}
            dataSource={data} allowPaging={true} allowGrouping
            pageSettings={pageSettings}
            aggregates={aggregates}
            toolbar={['Search',]}
            allowSorting={true}
            showGroupingBar={false}
            allowSearching={true}
            allowExcelExport={true}
            allowPdfExport={true}

            created={() => {
                const footerElement = document.querySelector('.e-gridfooter');
                if (footerElement) {
                    Object.assign(footerElement.style, { width: '120%', });
                }
            }}

            // toolbarClick={toolbarClick}
            title='Production Report'
            searchSettings={{ operator: 'contains', key: '', ignoreCase: true }}
            allowFiltering={true}
            filterSettings={{ type: 'Menu' }}
        >
            <ColumnsDirective>
                <ColumnDirective headerText='Date' field='date' width='100' textAlign="Right" />
                <ColumnDirective headerText='Month' field='month' width='100' textAlign="Right" />
                <ColumnDirective headerText='Year' field='year' width='100' textAlign="Right" />
                <ColumnDirective headerText='Line' field='line' width='100' textAlign="center" />
                <ColumnDirective headerText='Order No' field='orderNo' width='100' allowSearching />
                <ColumnDirective headerText='Delivery Date' field='deliveryDate' width='100' textAlign="Right" />
                <ColumnDirective headerText='Pcs' field='pcs' width='100' textAlign="Right" allowGrouping={false}
                    template={(props) => parseFloat(props.pcs || 0).toFixed(0)}
                />
            </ColumnsDirective>
            <Inject services={[Page, Sort, Filter, Group, Aggregate, Search, Toolbar, ExcelExport, PdfExport]} />
        </GridComponent>
    );
}
;
export default Report;