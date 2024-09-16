import React from 'react'
import { getCurrentCapacity } from '../../../utils/helper'

const LineItem = ({ line, isLast = false, onMouseOver, index }) => {
    return (
        <td id={"line" + line.id}
            className={`onHover h-full`}
            style={{
                fontSize: "10px"
            }}
            onMouseOver={onMouseOver}
        >
            <div className='h-full grid justify-center items-center'>
                <span className='text-[12px] font-normal'> {line.name}
                    <span className='text-[10px] capitalize'>
                        ({(line?.styleType || '')?.[0]})
                    </span>
                </span>
            </div>
            <div className={`flex flex-col gap-1 text-center p-1 onShow ${isLast ? "-mt-20" : ""}`}>
                <div className='grid grid-cols-2 border-b items-center'>
                    <b> Name</b>
                    <div> {line.name}</div>
                </div>
                <div className='grid grid-cols-2 border-b items-center'>
                    <b>Max. capacity</b>
                    <div> {line.capacity}</div>
                </div>
                <div className='grid grid-cols-2 border-b items-center'>
                    <b> Efficiency</b>
                    <div> {line.efficiency}% </div>
                </div>
                <div className='grid grid-cols-2 border-b items-center'>
                    <b> Current capacity</b>
                    <div> {getCurrentCapacity(line.efficiency, line.capacity)} </div>
                </div>
                <div className='grid grid-cols-2 items-center border-b'>
                    <b> Incharge</b>
                    <div> {line.inCharge} </div>
                </div>
                <div className='grid grid-cols-2 items-center'>
                    <b> Style Type</b>
                    <div className='capitalize'> {line.styleType} </div>
                </div>
            </div>
        </td>
    )
}

export default LineItem
