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
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Orders</TableHeaderCell>
                    <TableHeaderCell >Pcs</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>Alpha Team</TableCell>
                    <TableCell>Project 1</TableCell>
                    <TableCell textAlign='right'>2</TableCell>
                    <TableCell textAlign='center'>
                        <Icon color='green' name='checkmark' size='large' />
                    </TableCell>
                    <TableCell>Project 1</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}


export default TableEg