import React, { useContext, useEffect, useState } from 'react'
import { DELETE, PLUS } from '../../../Inputs'
import { CapacityPlannerContext } from '../../CapacityPlanner'



export const LearningCurveInputGrid = ({ setLearningCurveItems, learningCurveItems, readOnly, lineItems, line }) => {
    const {
        currentOrder,
        orders,
        currentLine,
    } = useContext(CapacityPlannerContext)
    const [pcsQty, setPcsQty] = useState('')
    useEffect(() => {
        const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
        let currentOrderLineIndex = -1;
        if (currentOrderIndex == -1) {
            setLearningCurveItems([{ percentage: 0 }]);
        } else {
            currentOrderLineIndex = orders[currentOrderIndex]['lines'].findIndex(l => parseInt(l.id) == parseInt(currentLine.id));
            if (currentOrderLineIndex == -1) {
                setLearningCurveItems([{ percentage: 0 }]);
            } else {
                const learning = orders[currentOrderIndex]["lines"][currentOrderLineIndex]["learningCurveItems"];
                setLearningCurveItems(learning || [{ percentage: 0 }]);
            }
        }
    }, []);

    function deleteGrid(index) {
        setLearningCurveItems(prev => prev.filter((_, i) => i !== index))
    }
    function addNewGrid() {
        setLearningCurveItems(prev =>
            [...prev,
            { percentage: 0 }]
        );
    }

    function handleChange(value, index, field) {
        setLearningCurveItems(prev => {
            const newItems = structuredClone(prev);
            newItems[index][field] = value;
            return newItems

        }

        )
    }
    const capacity = (line || currentLine)?.capacity || 0;

    return (
        <table className=" border border-gray-500 text-xs table-auto w-full">
            <thead className='bg-blue-200 top-0 border-b border-gray-500'>
                <tr className=''>
                    <th className="table-data  py-2 w-5">S.No</th>
                    <th className="table-data  py-2 w-16">Learning Curve (%)</th>
                    <th className="table-data  py-2 w-5">Pcs</th>
                    {!readOnly &&
                        <th className="table-data  w-10 p-0.5">
                            <button
                                type='button'
                                onClick={addNewGrid}>{PLUS}</button>
                        </th>
                    }
                </tr>
            </thead>
            <tbody className='overflow-y-auto h-full w-full'>
                {(learningCurveItems ? learningCurveItems : []).map((item, index) =>
                    <tr key={index} className="w-full ">
                        <td className='table-data text-center'>
                            {index + 1}
                        </td>
                        <td className='table-data'
                            onKeyDown={(e) => { if ((index == learningCurveItems.length - 1) && e.key == "Tab") { addNewGrid() } }}>
                            <input
                                type="text"
                                className="text-left rounded py-2 px-1 w-full table-data-input"
                                value={item?.percentage || ""}
                                onChange={(e) =>
                                    handleChange(e.target.value, index, "percentage")
                                }
                                disabled={readOnly}
                            />
                        </td>
                        <td className="table-data">
                            {item.percentage
                                ? (item.percentage * capacity) / 100
                                : 0}
                        </td>

                        {!readOnly &&
                            <td className="border border-gray-500 text-xs text-center">
                                <button
                                    tabIndex={-1}
                                    type='button'
                                    onClick={() => {
                                        deleteGrid(index)
                                    }}
                                    className='text-xs text-red-600 '>{DELETE}
                                </button>
                            </td>
                        }
                    </tr>
                )}
            </tbody>
        </table>


    )
}



export const LearningCurveInputGridStandalone = ({ readOnly }) => {
    const {
        currentOrder,
        setOrders,
        currentLine,
        setLearningCurvePopup
    } = useContext(CapacityPlannerContext)
    const [learningCurveItems, setLearningCurveItems] = useState([])

    function assignLearningCurve() {
        setOrders(orders => {
            const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
            let currentOrderLineIndex = -1;
            let newOrders = structuredClone(orders);
            if (currentOrderIndex != -1) {
                currentOrderLineIndex = orders[currentOrderIndex]['lines'].findIndex(l => parseInt(l.id) == parseInt(currentLine.id));
                if (currentOrderLineIndex != -1) {
                    newOrders[currentOrderIndex]["lines"][currentOrderLineIndex]["learningCurveItems"] = learningCurveItems.filter(i => i.percentage);
                } else {
                    newOrders[currentOrderIndex]["lines"].push({ id: currentLine.id, learningCurveItems })
                }
            }
            return newOrders;
        })
    }

    function handleDone() {
        assignLearningCurve();
        setLearningCurvePopup(false)
    }
    function handleCancel() {
        setLearningCurvePopup(false)
    }

    return (
        <div className='w-[300px]'>
            <LearningCurveInputGrid setLearningCurveItems={setLearningCurveItems} learningCurveItems={learningCurveItems} />
            <div className='flex justify-between mt-5'>
                <button type='button' onClick={handleDone} className='bg-blue-400 text-white'>Done</button>
                <button type='button' onClick={handleCancel} className='bg-red-400 text-white'>Cancel</button>
            </div>
        </div>
    )
}