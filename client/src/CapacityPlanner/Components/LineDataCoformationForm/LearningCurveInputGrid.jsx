import React, { useContext, useEffect, useState } from 'react'
import { DELETE, PLUS } from '../../../Inputs'
import { CapacityPlannerContext } from '../../CapacityPlanner'
import { toast } from 'react-toastify'

export const LearningCurveInputGrid = ({ setLearningCurveItems, learningCurveItems, readOnly, lineItems, setLineItems, line }) => {
    const {
        currentOrder,
        orders,
        currentLine,
    } = useContext(CapacityPlannerContext)

    const capacity = (line || currentLine)?.capacity || 0;

    const getRowPcs = (pct) => {
        const val = parseFloat(pct);
        if (isNaN(val) || val <= 0) return 0;
        return Math.round((val * capacity) / 100);
    };

    const syncLineItemsPcs = (totalPcs) => {
        if (setLineItems && currentLine?.id) {
            setLineItems(prev =>
                (prev || []).map(item =>
                    parseInt(item.id) === parseInt(currentLine.id)
                        ? { ...item, pcs: totalPcs }
                        : item
                )
            );
        }
    };

    useEffect(() => {
        const currentOrderIndex = orders.findIndex(o => parseInt(o.id) === parseInt(currentOrder?.id));
        let currentOrderLineIndex = -1;
        let initialLearning = [{ percentage: 0 }];
        if (currentOrderIndex != -1) {
            currentOrderLineIndex = orders[currentOrderIndex]['lines'].findIndex(l => parseInt(l.id) == parseInt(currentLine.id));
            if (currentOrderLineIndex != -1) {
                const learning = orders[currentOrderIndex]["lines"][currentOrderLineIndex]["learningCurveItems"];
                if (learning && learning.length > 0) {
                    initialLearning = learning;
                }
            }
        }
        setLearningCurveItems(initialLearning);

        const initialTotalPcs = initialLearning.reduce((acc, item) => acc + getRowPcs(item?.percentage), 0);
        if (initialTotalPcs > 0) {
            syncLineItemsPcs(initialTotalPcs);
        }
    }, []);

    const otherLinesPcs = (lineItems || [])
        .filter(i => parseInt(i.id) !== parseInt(currentLine?.id))
        .reduce((sum, item) => sum + (parseFloat(item.pcs) || 0), 0);
    const orderQuantity = parseFloat(currentOrder?.quantity) || 0;
    const maxAllowedPcs = Math.max(0, orderQuantity - otherLinesPcs);

    function deleteGrid(index) {
        const remainingItems = (learningCurveItems || []).filter((_, i) => i !== index);
        const newTotalPcs = remainingItems.reduce((acc, item) => acc + getRowPcs(item?.percentage), 0);
        setLearningCurveItems(remainingItems);
        syncLineItemsPcs(newTotalPcs);
    }

    function addNewGrid() {
        setLearningCurveItems(prev =>
            [...prev,
            { percentage: 0 }]
        );
    }

    function handleChange(value, index, field) {
        if (field === "percentage") {
            if (value !== "" && isNaN(value)) {
                return;
            }

            const numValue = value === "" ? 0 : parseFloat(value);
            if (numValue < 0) {
                return;
            }

            const projectedItems = (learningCurveItems || []).map((item, i) => {
                if (i === index) {
                    return { ...item, percentage: value };
                }
                return item;
            });

            const projectedTotalPcs = projectedItems.reduce((acc, item) => acc + getRowPcs(item?.percentage), 0);

            if (projectedTotalPcs > maxAllowedPcs) {
                toast.warning(`Total pieces (${projectedTotalPcs}) cannot exceed order quantity (${orderQuantity})! Available: ${maxAllowedPcs}`);
                return;
            }

            setLearningCurveItems(projectedItems);
            syncLineItemsPcs(projectedTotalPcs);
        } else {
            setLearningCurveItems(prev => {
                const newItems = structuredClone(prev);
                newItems[index][field] = value;
                return newItems;
            });
        }
    }

    const totalCurvePcs = (learningCurveItems || []).reduce((acc, item) => acc + getRowPcs(item?.percentage), 0);

    return (
        <div className="w-full">
            <table className="border border-gray-400 text-xs table-auto w-full bg-white rounded shadow-xs overflow-hidden">
                <thead className='bg-slate-100 top-0 border-b border-gray-300'>
                    <tr>
                        <th className="table-data py-2 w-10 text-center font-semibold text-slate-700">Day</th>
                        <th className="table-data py-2 w-32 text-center font-semibold text-slate-700">Learning Curve (%)</th>
                        <th className="table-data py-2 w-24 text-right font-semibold text-slate-700 pr-2">Pcs</th>
                        {!readOnly &&
                            <th className="table-data w-10 p-0.5 text-center">
                                <button
                                    type='button'
                                    className="p-1 rounded hover:bg-slate-200 text-slate-700 transition-colors"
                                    onClick={addNewGrid}
                                    title="Add Day"
                                >
                                    {PLUS}
                                </button>
                            </th>
                        }
                    </tr>
                </thead>
                <tbody className='overflow-y-auto h-full w-full'>
                    {(learningCurveItems ? learningCurveItems : []).map((item, index) =>
                        <tr key={index} className="w-full border-b border-slate-100 hover:bg-slate-50">
                            <td className='table-data text-center text-slate-600 font-medium'>
                                {index + 1}
                            </td>
                            <td className='table-data p-1'
                                onKeyDown={(e) => { if ((index == learningCurveItems.length - 1) && e.key == "Tab") { addNewGrid() } }}>
                                <input
                                    type="text"
                                    className="text-right rounded py-1 px-2 w-full table-data-input border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                                    value={item?.percentage || ""}
                                    placeholder="0"
                                    onChange={(e) =>
                                        handleChange(e.target.value, index, "percentage")
                                    }
                                    disabled={readOnly}
                                />
                            </td>
                            <td className="table-data text-right pr-2 tabular-nums font-semibold text-slate-800">
                                {getRowPcs(item?.percentage)}
                            </td>

                            {!readOnly &&
                                <td className="text-center p-1">
                                    <button
                                        tabIndex={-1}
                                        type='button'
                                        onClick={() => {
                                            deleteGrid(index)
                                        }}
                                        title="Delete Row"
                                        className='text-xs text-red-600 hover:text-red-800 p-1'>
                                        {DELETE}
                                    </button>
                                </td>
                            }
                        </tr>
                    )}
                </tbody>
                <tfoot className="bg-slate-50 font-semibold border-t border-slate-300 text-slate-700">
                    <tr>
                        <td className="table-data text-center py-2" colSpan={2}>
                            Total Planned Pcs
                        </td>
                        <td className={`table-data text-right pr-2 py-2 tabular-nums font-bold ${totalCurvePcs > orderQuantity ? 'text-red-600' : 'text-emerald-700'}`}>
                            {totalCurvePcs}
                        </td>
                        {!readOnly && <td className="table-data"></td>}
                    </tr>
                </tfoot>
            </table>
        </div>
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