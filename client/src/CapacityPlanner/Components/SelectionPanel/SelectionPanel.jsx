import React, { useCallback, useEffect, useContext, useMemo } from 'react';
import moment from 'moment/moment';
import { ORDERS_API } from '../../../Constants/Api';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CapacityPlannerContext } from '../../CapacityPlanner';
import ToggleButton from '../../../Components/ToggleButton';
import { Building2, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { getWeeksInMonth } from '../../helper';
import SearchableTableCellSelect from '../../../Basic/ReusabelComponents/SearchableTableCellSelect';

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SelectionPanel = () => {
    const {
        orders,
        month, setMonth,
        selectedUnit, setSelectedUnit,
        manualSelect, setLoading,
        productionMode, setProductionMode,
        units, setIsModified,
        calendarViewMode, setCalendarViewMode,
        calendarHalf, setCalendarHalf,
        calendarWeek, setCalendarWeek
    } = useContext(CapacityPlannerContext);


    console.log(units, "units")

    const weeksList = useMemo(() => {
        return getWeeksInMonth(month);
    }, [month]);

    // Keep calendarWeek clamped if month changes
    useEffect(() => {
        if (calendarWeek >= weeksList.length) {
            setCalendarWeek(Math.max(0, weeksList.length - 1));
        }
    }, [weeksList, calendarWeek, setCalendarWeek]);

    const handlePrevWeek = () => {
        if (calendarWeek > 0) {
            setCalendarWeek(calendarWeek - 1);
        } else {
            const prevM = moment.utc(month).subtract(1, 'M');
            const prevWeeks = getWeeksInMonth(prevM);
            setMonth(prevM);
            setCalendarWeek(Math.max(0, prevWeeks.length - 1));
        }
    };

    const handleNextWeek = () => {
        if (calendarWeek < weeksList.length - 1) {
            setCalendarWeek(calendarWeek + 1);
        } else {
            const nextM = moment.utc(month).add(1, 'M');
            setMonth(nextM);
            setCalendarWeek(0);
        }
    };

    const handlePrevHalf = () => {
        if (calendarHalf === 2) {
            setCalendarHalf(1);
        } else {
            setMonth(moment.utc(month).subtract(1, 'M'));
            setCalendarHalf(2);
        }
    };

    const handleNextHalf = () => {
        if (calendarHalf === 1) {
            setCalendarHalf(2);
        } else {
            setMonth(moment.utc(month).add(1, 'M'));
            setCalendarHalf(1);
        }
    };

    const handleToday = () => {
        const now = new Date();
        setMonth(moment.utc(now));
        if (calendarViewMode === '15days') {
            setCalendarHalf(now.getDate() <= 15 ? 1 : 2);
        } else if (calendarViewMode === 'week') {
            const weeks = getWeeksInMonth(now);
            const currentWKey = moment.utc(now).format('W');
            const foundIdx = weeks.findIndex(w => w.weekKey === currentWKey);
            setCalendarWeek(foundIdx !== -1 ? foundIdx : 0);
        }
    };

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

    const unitOptions = (units || [])?.map((item) => ({
        value: item.id,
        label: item?.name || "",
    }));

    return (
        <div className="flex items-center gap-2 h-12 px-3 bg-white border-b border-slate-200 text-xs whitespace-nowrap">

            <label className="shrink-0 z-30 flex items-center gap-1.5 h-8 pl-2 pr-1 rounded-md border border-slate-300 bg-white
                      focus-within:border-orange-600 focus-within:ring-2 focus-within:ring-orange-100">
                {/* <select
                    id="unit"
                    name="unit"
                    aria-label="Unit"
                    value={selectedUnit}
                    onChange={(e) => {
                        setSelectedUnit(e.target.value);
                        sessionStorage.setItem("selectedUnit", e.target.value);
                    }}
                    className="bg-transparent text-[11px] w-[100px] font-medium text-slate-800 outline-none cursor-pointer pr-1"
                >
                    <option value=""> </option>
                    {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                </select> */}
                <SearchableTableCellSelect
                    value={selectedUnit}
                    options={unitOptions}
                    onChange={(e) => {
                        setSelectedUnit(e.target.value);
                        sessionStorage.setItem("selectedUnit", e.target.value);
                    }}
                />

            </label>

            <span className="shrink-0 h-5 w-px bg-slate-200" aria-hidden="true" />

            {/* Month navigator */}
            <div className="shrink-0 flex items-center h-8 rounded-md border border-slate-300 bg-white overflow-hidden shadow-xs">
                <button
                    type="button"
                    aria-label="Previous month"
                    className="h-full px-1.5 hover:bg-slate-100 text-slate-700"
                    onClick={() => setMonth(moment.utc(month).subtract(1, "M"))}
                >
                    <ChevronLeft size={16} />
                </button>
                <input
                    type="month"
                    aria-label="Month"
                    className="h-full px-1 w-[112px] text-xs font-semibold text-slate-800 text-center bg-transparent outline-none
                   border-x border-slate-300"
                    value={moment.utc(month).format("YYYY-MM")}
                    onChange={(e) => setMonth(e.target.value)}
                />
                <button
                    type="button"
                    aria-label="Next month"
                    className="h-full px-1.5 hover:bg-slate-100 text-slate-700"
                    onClick={() => setMonth(moment.utc(month).add(1, "M"))}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
            {/* <button
                type="button"
                className="shrink-0 h-8 px-2.5 rounded-md border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-100 shadow-xs"
                onClick={handleToday}
            >
                Today
            </button> */}

            <span className="shrink-0 h-5 w-px bg-slate-200" aria-hidden="true" />

            {/* View Mode Segmented Switcher: Month | 15 Days | Week */}
            <div className="shrink-0 flex items-center h-8 p-0.5 rounded-md border border-slate-300 bg-slate-100 text-xs">
                <button
                    type="button"
                    className={`px-2 h-full rounded font-medium transition-all ${calendarViewMode === 'month'
                        ? 'bg-white text-[#16345F] font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    onClick={() => setCalendarViewMode('month')}
                >
                    Month
                </button>
                <button
                    type="button"
                    className={`px-2 h-full rounded font-medium transition-all ${calendarViewMode === '15days'
                        ? 'bg-white text-[#16345F] font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    onClick={() => setCalendarViewMode('15days')}
                >
                    15 Days
                </button>
                <button
                    type="button"
                    className={`px-2 h-full rounded font-medium transition-all ${calendarViewMode === 'week'
                        ? 'bg-white text-[#16345F] font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    onClick={() => setCalendarViewMode('week')}
                >
                    Week
                </button>
            </div>

            {/* Sub-selector for 15 Days Mode */}
            {calendarViewMode === '15days' && (
                <div className="shrink-0 flex items-center h-8 rounded-md border border-slate-300 bg-white overflow-hidden shadow-xs">
                    <button
                        type="button"
                        title="Previous 15 days"
                        className="h-full px-1.5 hover:bg-slate-100 text-slate-700 border-r border-slate-200"
                        onClick={handlePrevHalf}
                    >
                        <ChevronLeft size={15} />
                    </button>
                    <button
                        type="button"
                        className={`px-2 h-full font-medium transition-all ${calendarHalf === 1
                            ? 'bg-orange-50 text-orange-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        onClick={() => setCalendarHalf(1)}
                    >
                        1st – 15th
                    </button>
                    <span className="h-4 w-px bg-slate-200" />
                    <button
                        type="button"
                        className={`px-2 h-full font-medium transition-all ${calendarHalf === 2
                            ? 'bg-orange-50 text-orange-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        onClick={() => setCalendarHalf(2)}
                    >
                        16th – End
                    </button>
                    <button
                        type="button"
                        title="Next 15 days"
                        className="h-full px-1.5 hover:bg-slate-100 text-slate-700 border-l border-slate-200"
                        onClick={handleNextHalf}
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            )}

            {/* Sub-selector for Week Mode */}
            {calendarViewMode === 'week' && (
                <div className="shrink-0 flex items-center h-8 rounded-md border border-slate-300 bg-white overflow-hidden shadow-xs">
                    <button
                        type="button"
                        title="Previous week"
                        className="h-full px-1.5 hover:bg-slate-100 text-slate-700"
                        onClick={handlePrevWeek}
                    >
                        <ChevronLeft size={15} />
                    </button>
                    <select
                        value={calendarWeek}
                        onChange={(e) => setCalendarWeek(Number(e.target.value))}
                        className="h-full px-2 text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer border-x border-slate-200"
                    >
                        {weeksList.map((w, idx) => (
                            <option key={idx} value={idx}>
                                {w.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        title="Next week"
                        className="h-full px-1.5 hover:bg-slate-100 text-slate-700"
                        onClick={handleNextWeek}
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            )}

            {/* Production toggle (your existing component) */}
            <div className="shrink-0 flex items-center h-8 px-2 rounded-md border border-slate-300 bg-white">
                <ToggleButton label={"Production"} value={productionMode} setValue={setProductionMode} />
            </div>

            <div className="flex-1" />

            {/* Compact legend (replaces the 3 text lines) */}
            <div className="hidden 2xl:flex shrink-0 items-center gap-3 text-slate-600 text-[11px]">
                <span className="flex items-center gap-1.5">
                    <i className="w-2.5 h-2.5 rounded-sm bg-slate-300 border border-slate-400" /> Sunday
                </span>
                <span className="flex items-center gap-1.5">
                    <i className="w-2.5 h-2.5 rounded-sm bg-red-300 border border-red-400" /> Holiday
                </span>
                <span className="flex items-center gap-1.5">
                    <i className="w-2.5 h-2.5 rounded-sm bg-green-600" /> Details
                </span>
            </div>

            {/* Save */}
            {manualSelect ? null : (
                <button
                    type="button"
                    className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#16345F] text-white font-semibold
                   hover:bg-[#1d4380] focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-xs"
                    onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                            storeOrderData();
                        }, 3000);
                    }}
                >
                    <Save size={14} aria-hidden="true" />
                    Save
                </button>
            )}
        </div>
    )
};

export default SelectionPanel;
