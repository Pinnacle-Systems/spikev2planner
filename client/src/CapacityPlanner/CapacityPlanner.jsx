import React, { useEffect, useState, useCallback, createContext, useRef } from 'react'
import { getRandomColor } from '../utils/helper';
import Calendar from './Components/CalendarWithManyLines';
import OrderList from './Components/orderpanel/OrderList';
import SelectionPanel from './Components/SelectionPanel/SelectionPanel';
import axios from 'axios';
import { ORDERS_API, HOLIDAYS_API, UNITS_API } from '../Constants/Api';
import { toast } from 'react-toastify';
import DeliveryDateWarning from './Components/DeliveryDate/DeliveryDateWarning';
import IncludeNationalHolidays from './Components/DeliveryDate/IncludeNationalHolidays';
import LineDataConformationForm from './Components/LineDataCoformationForm';
import { OrderSplitDetail } from './Components/orderpanel/OrderSplitDetail';
import { toasterTrigger } from "../utils/helper";
import ReportPanel from './Components/ReportPanel';
import OrderLineDetails from './Components/orderpanel/OrderLineDetails';
import loadingIcon from "../assets/icons8-loading-16.png"
import addOrders from "../assets/pngwing.com (7).png"
import holidaysIcon from "../assets/pngwing.com (8).png"
import splitUpIcon from "../assets/pngwing.com (9).png"
import { CLIENT_HOLIDAY_URL, CLIENT_ORDERS_URL, CLIENT_UNIT_URL } from '../Constants/clientAppUrls';
import { LearningCurveInputGridStandalone } from './Components/LineDataCoformationForm/LearningCurveInputGrid';
import OrderProductionDetails from './Components/orderpanel/OrderProductionDetails';
import OrderLineDetailOptions from './Components/orderpanel/OrderLineDetailOptions';
import ProductionPlanningReport from './Components/Report/Report';
import ProductionDetails from './Components/orderpanel/ProductionDetails';
import Modal from '../Components/Modal';
import ViewPlanDetails from './Components/LineDataCoformationForm/ViewPlanDetails';
import ReduceEndDate from './Components/LineDataCoformationForm/ReduceEndDate';
import useNavigationBlocker from '../CustomHooks/useNavigationBlocker';
import { Loader } from '../Basic/Components';

export const CapacityPlannerContext = createContext();

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const CapacityPlanner = () => {
    const [loading, setLoading] = useState(false);
    const [previousOrders, setPreviousOrders] = useState([]);

    const prevOrders = useRef([]);

    const [openModalDeliveryWarning, setOpenModalDeliveryWarning] = useState(false);
    const [openIncludeHolidayModal, setOpenIncludeHolidayModal] = useState(false);
    // const [openHolidaysSelectionForm, setOpenHolidaysSelectionForm] = useState(false);
    const [lineEntryConformation, setLineEntryConformation] = useState(false);
    const [viewPlanDetails, setViewPlanDetails] = useState(false);
    const [reduceEndDate, setReduceEndDate] = useState(false);
    const [learningCurvePopup, setLearningCurvePopup] = useState(false);

    const [manualSelect, setManualSelect] = useState(false);
    const [openOrderDetail, setOpenOrderDetail] = useState(false);

    const [isOrderProductionDetails, setIsOrderProductionDetails] = useState(false);

    const [isOrderLineDetailOptions, setIsOrderLineDetailOptions] = useState(false);

    const [activeLineOrder, setActiveLineOrder] = useState({});

    const [findOrder, setFindOrder] = useState({});

    const [scrollLine, setScrollLine] = useState('');

    const [openProductionPlanningReport, setOpenProductionPlanningReport] = useState(false);

    const [productionDetails, setProductionDetails] = useState(false);


    const [split, setSplit] = useState(false);
    const [currentOrder, setCurrentOrder] = useState({});
    const [currentLine, setCurrentLine] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const [currentDraggedLine, setCurrentDraggedLine] = useState("");

    const [orders, setOrders] = useState([]);
    const [month, setMonth] = useState(new Date());
    const [selectedUnit, setSelectedUnit] = useState("");
    const [holidays, setHolidays] = useState([]);

    const [productionMode, setProductionMode] = useState(false);

    const [calendarViewMode, setCalendarViewMode] = useState('month'); // 'month' | '15days' | 'week'
    const [calendarHalf, setCalendarHalf] = useState(1); // 1: 1-15, 2: 16-end
    const [calendarWeek, setCalendarWeek] = useState(0); // week index

    const [isModified, setIsModified] = useState(false);

    const [isOrderListCollapsed, setIsOrderListCollapsed] = useState(() => {
        try {
            return localStorage.getItem('orderListCollapsed') === 'true';
        } catch {
            return false;
        }
    });

    const toggleOrderList = useCallback(() => {
        setIsOrderListCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem('orderListCollapsed', String(next));
            } catch (e) {
                console.error(e);
            }
            return next;
        });
    }, []);


    const [lines, setLines] = useState([]);

    const [units, setUnits] = useState([]);


    const retrieveUnits = useCallback(() => {
        axios({
            method: 'get',
            url: BASE_URL + UNITS_API,
        }).then((result) => {
            setUnits(result.data.data)
        }, (error) => {
            toast.error("Server Down", { autoClose: 5000 });
        });
    }, []);
    useEffect(retrieveUnits, [retrieveUnits]);

    console.log(units, "result for units api")

    const retrieveLines = useCallback(() => {
        if (!selectedUnit) return
        axios({
            method: 'get',
            url: BASE_URL + UNITS_API + `/${selectedUnit}`,
        }).then((result) => {
            console.log(result.data.data.orderSplitDetailModel, "result from single unit api")
            setLines(result.data.data.line)
        }, (error) => {
            toast.error("Server Down", { autoClose: 5000 });
        });
    }, [selectedUnit]);
    useEffect(retrieveLines, [retrieveLines]);



    const getHolidays = useCallback(() => {
        axios({
            method: "get",
            url: BASE_URL + HOLIDAYS_API,
        }).then((result) => {
            if (result.status === 200 || result.status === 304) {
                if (result.data.statusCode === 0) {
                    setHolidays(result.data.data);
                }
                else if (result.data.statusCode === 1) {
                    toast.warning(result.data.message, { autoClose: 5000 })
                }
            } else {
                console.log(result);
            }
        }, (error) => {
            console.log(error.status)
            toast.error("Server Down", { autoClose: 5000 })
        });
    }, []);

    useEffect(getHolidays, [getHolidays])

    const retrieveData = useCallback(() => {
        setLoading(true);
        axios({
            method: 'get',
            url: BASE_URL + ORDERS_API,
        }).then((result) => {
            setOrders(result.data.data.map(order => {
                order["color"] = getRandomColor();
                order['lines'] = order.lines.map(i => {
                    return { ...i, id: i.lineId, }
                });
                return order
            }))
            prevOrders.current = (result?.data?.data || []).map(order => {
                order['lines'] = order.lines.map(i => {
                    return { ...i, id: i.lineId, }
                });
                return order
            });
        }, (error) => {
            toast.error("Server Down", { autoClose: 5000 });
        }).finally(() => { setLoading(false) });
    }, []);

    useEffect(retrieveData, [retrieveData]);
    useEffect(toasterTrigger, []);

    useEffect(() => {
        if (!scrollLine) return
        let lineElement = document.getElementById(`line${scrollLine?.lineId}`);
        if (!lineElement) return
        lineElement.scrollIntoView();
        setScrollLine(null)
    }, [scrollLine, selectedUnit, lines])

    const [navigate] = useNavigationBlocker({ hasUnsavedChanges: isModified, setHasUnsavedChanges: setIsModified });
    return (
        <CapacityPlannerContext.Provider
            value={{
                lineEntryConformation, setLineEntryConformation, selectedUnit, setSelectedUnit,
                orders, setOrders, month, setMonth, holidays, setOpenModalDeliveryWarning, split, setSplit,
                currentOrder, setCurrentOrder, currentLine, setCurrentLine, currentDate, setCurrentDate,
                lines, setLines,
                manualSelect, setManualSelect,
                openOrderDetail, setOpenOrderDetail,
                activeLineOrder, setActiveLineOrder,
                loading, setLoading,
                previousOrders, setPreviousOrders,
                currentDraggedLine, setCurrentDraggedLine,
                productionMode, setProductionMode,
                learningCurvePopup, setLearningCurvePopup,
                isOrderProductionDetails, setIsOrderProductionDetails,
                isOrderLineDetailOptions, setIsOrderLineDetailOptions,
                setFindOrder, findOrder,
                openProductionPlanningReport, setOpenProductionPlanningReport,
                units, setUnits,
                scrollLine, setScrollLine,
                productionDetails, setProductionDetails,
                viewPlanDetails, setViewPlanDetails,
                reduceEndDate, setReduceEndDate,
                prevOrders,
                isModified, setIsModified,
                calendarViewMode, setCalendarViewMode,
                calendarHalf, setCalendarHalf,
                calendarWeek, setCalendarWeek,
                isOrderListCollapsed, setIsOrderListCollapsed,
                toggleOrderList,
                retrieveData
            }}>
            <Modal isOpen={openModalDeliveryWarning} closeIcon onClose={() => setOpenModalDeliveryWarning(false)}>
                <DeliveryDateWarning />
            </Modal>
            <Modal isOpen={openIncludeHolidayModal} closeIcon onClose={() => setOpenIncludeHolidayModal(false)}>
                <IncludeNationalHolidays />
            </Modal>
            <Modal isOpen={lineEntryConformation} closeIcon onClose={() => { setLineEntryConformation(false); setSplit(false); }} widthClass={"max-h-[92vh] overflow-y-auto"} >
                <LineDataConformationForm />
            </Modal>
            <Modal isOpen={viewPlanDetails} closeIcon onClose={() => { setViewPlanDetails(false); setSplit(false); }}>
                <ViewPlanDetails />
            </Modal>
            <Modal isOpen={reduceEndDate} closeIcon onClose={() => { setReduceEndDate(false); setSplit(false); }}>
                <ReduceEndDate />
            </Modal>
            <Modal isOpen={learningCurvePopup} closeIcon >
                <LearningCurveInputGridStandalone />
            </Modal>
            <Modal isOpen={openOrderDetail} closeIcon onClose={() => { setOpenOrderDetail(false); }}>
                <OrderLineDetails />
            </Modal>
            <Modal isOpen={isOrderProductionDetails} closeIcon onClose={() => { setIsOrderProductionDetails(false); }} widthClass={"h-[90%] w-[90%]"} >
                <OrderProductionDetails />
            </Modal>
            <Modal isOpen={isOrderLineDetailOptions} closeIcon onClose={() => { setIsOrderLineDetailOptions(false); }}>
                <OrderLineDetailOptions />
            </Modal>
            <Modal widthClass={'w-[90%] h-[80%]'} closeIcon isOpen={openProductionPlanningReport} onClose={() => { setOpenProductionPlanningReport(false); }}>
                <ProductionPlanningReport />
            </Modal>
            <Modal widthClass={''} closeIcon isOpen={productionDetails} onClose={() => { setProductionDetails(false); }}>
                <ProductionDetails />
            </Modal>
            <Modal isOpen={loading}>
                {/* <button type="button" className="bg-indigo-500 text-white gap-2 p-2 rounded flex justify-center items-center" disabled>
                    <img src={loadingIcon} className='animate-spin h-[40px] w-[40px]' alt="loading" />
                    Loading...
                </button> */}
                <Loader />
            </Modal>

            <div className='relative flex w-full h-screen overflow-hidden bg-slate-50'>
                <div className={`h-full shrink-0 transition-all duration-300 ease-in-out ${isOrderListCollapsed ? 'w-12' : 'w-[35%] min-w-[340px] max-w-[480px]'
                    }`}>
                    <OrderList
                        orders={orders}
                        setOrders={setOrders}
                        holidays={holidays}
                        isCollapsed={isOrderListCollapsed}
                        onToggleCollapse={toggleOrderList}
                    />
                </div>
                <div className='flex min-w-0 h-full overflow-auto flex flex-col'>
                    <SelectionPanel />
                    <Calendar />
                </div>
            </div>
        </CapacityPlannerContext.Provider>
    )
}

export default CapacityPlanner
