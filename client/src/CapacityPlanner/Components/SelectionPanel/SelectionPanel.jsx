import React, { useCallback, useEffect, useContext, useState } from 'react';
import moment from 'moment/moment';
import { ORDERS_API } from '../../../Constants/Api';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CapacityPlannerContext } from '../../CapacityPlanner';
import saveLogo from "../../../assets/pngwing.com (10).png"
import ToggleButton from '../../../Components/ToggleButton';

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SelectionPanel = () => {
    const {
        orders,
        month, setMonth,
        selectedUnit, setSelectedUnit,
        manualSelect, setLoading,
        productionMode, setProductionMode,
        units, setIsModified
    } = useContext(CapacityPlannerContext);




    const storeOrderData = useCallback(() => {

        axios({
            method: 'patch',
            url: BASE_URL + ORDERS_API,
            data: { orders }
        }).then((result) => {
            if (result.data.statusCode === 0) {
                localStorage.setItem("res", "success");
                localStorage.setItem("success", `Orders Planning Saved Successfully!!!`);
                localStorage.setItem("lastSelectedMonth", moment.utc(month).format("YYYY-MM-DD"));

                setIsModified(false);

                toast.success("Orders Saved Successfully");


                window.location.reload();
            } else if (result.data.statusCode === 1) {
                toast.warning(result.data.message, { autoClose: 5000 });
            }
        }).catch(() => {
            toast.error("Server Down", { autoClose: 5000 });
        });
    }, [orders, month]);

    useEffect(() => {
        setSelectedUnit(sessionStorage.getItem("selectedUnit") || "");
    }, [setSelectedUnit]);


    return (
        <div className='flex justify-between p-1 items-center text-[12px]'>

            <div>
                <select
                    value={selectedUnit}
                    onChange={(e) => {
                        setSelectedUnit(e.target.value);
                        sessionStorage.setItem("selectedUnit", e.target.value);
                    }}
                    name="unit" id="unit" className='rounded border select-none text-center p-1 focus:outline-none focus:shadow-outline text-sm'>
                    <option value="" hidden>Select</option>
                    {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                </select>
            </div>
            <h2 className='bg-gray-50 p-1 text-lg'>
                Capacity Planner
            </h2>
            <h2 className='bg-gray-50 p-1 text-lg'>
                <ToggleButton label={"Production"} value={productionMode} setValue={setProductionMode} />
            </h2>
            {manualSelect ? "" :
                <button className='px-1 text-base flex bg-gray-100 rounded-md'
                    onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                            storeOrderData();
                        }, 3000);
                    }}>
                    <img src={saveLogo} width={20} alt="" />
                    <span>
                        Save
                    </span>
                </button>
            }
            <div>
                <div className='text-gray-700'>* Dates marked with Gray -  <strong>Sundays</strong></div>
                <div className='text-red-500'>* Dates marked with Red -  <strong>Holidays</strong></div>
                <div className='text-green-700'>* Click to View the <strong> Order Details </strong> on Lines</div>
            </div>
            <div className='flex gap-2'>
                <button className=' font-bold px-1 rounded' onClick={() => setMonth(moment.utc(month).subtract(1, "M"))}>
                    {"< Prev"}
                </button>
                <input type="month" name="" id="" className='rounded border select-none text-center font-bold'
                    value={moment.utc(month).format("YYYY-MM")} onChange={(e) => setMonth(e.target.value)} />
                <button className='rounded font-bold px-4' onClick={() => setMonth(moment.utc(month).add(1, "M"))}>
                    {"Next >"}
                </button>
            </div>
        </div>
    );
};

export default SelectionPanel;
