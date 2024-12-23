import React, { useEffect, useState } from 'react'
import {
    TableRow,
    TableHeaderCell,
    TableHeader,
    TableCell,
    TableBody,
    Icon,
    Table,
} from 'semantic-ui-react'

const TableEg = () => {
    const [data, setData] = useState([]);

    useEffect(() => {

    }, [])

    return (
        <Table celled structured>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>Month</TableHeaderCell>
                    <TableHeaderCell>Line</TableHeaderCell>
                    <TableHeaderCell>Order</TableHeaderCell>
                    <TableHeaderCell >Pcs</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell rowSpan={3} >Jan</TableCell>
                    <TableCell rowSpan={2}>Line 1</TableCell>
                    <TableCell textAlign='center'>
                        BVK/24/0713
                    </TableCell>
                    <TableCell textAlign='right'>2300</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell textAlign='center'>
                        BVK/24/0714
                    </TableCell>
                    <TableCell textAlign='right'>3000</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell >Line 2</TableCell>
                    <TableCell textAlign='center'>
                        BVK/24/0714
                    </TableCell>
                    <TableCell textAlign='right'>2000</TableCell>
                </TableRow>

                <TableRow>
                    <TableCell rowSpan={3} >Feb</TableCell>
                    <TableCell rowSpan={2}>Line 1</TableCell>
                    <TableCell textAlign='center'>
                        BVK/24/0713
                    </TableCell>
                    <TableCell textAlign='right'>2300</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell textAlign='center'>
                        BVK/24/0714
                    </TableCell>
                    <TableCell textAlign='right'>3000</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell >Line 2</TableCell>
                    <TableCell textAlign='center'>
                        BVK/24/0714
                    </TableCell>
                    <TableCell textAlign='right'>2000</TableCell>
                </TableRow>

                <TableRow className='font-bold'>
                    <TableCell colSpan={3} textAlign='center' >Total</TableCell>
                    <TableCell textAlign='right'>10000</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}


export default TableEg