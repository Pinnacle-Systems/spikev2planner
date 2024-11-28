import React, { useEffect, useState, useCallback, createContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { getRandomColor } from '../utils/helper';
import Calendar from './Components/CalendarWithManyLines';
import OrderList from './Components/orderpanel/OrderList';
import SelectionPanel from './Components/SelectionPanel/SelectionPanel';
import axios from 'axios';
import { ORDERS_API, HOLIDAYS_API, UNITS_API } from '../Constants/Api';
import { toast } from 'react-toastify';
import Modal from '../Components/Modal';
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

export const CapacityPlannerContext = createContext();


const BASE_URL = process.env.REACT_APP_SERVER_URL;

const CapacityPlanner = () => {
    const [loading, setLoading] = useState(false);
    const [previousOrders, setPreviousOrders] = useState([]);

    const [openModalDeliveryWarning, setOpenModalDeliveryWarning] = useState(false);
    const [openIncludeHolidayModal, setOpenIncludeHolidayModal] = useState(false);
    // const [openHolidaysSelectionForm, setOpenHolidaysSelectionForm] = useState(false);
    const [lineEntryConformation, setLineEntryConformation] = useState(false);
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


    const retrieveLines = useCallback(() => {
        if (!selectedUnit) return
        axios({
            method: 'get',
            url: BASE_URL + UNITS_API + `/${selectedUnit}`,
        }).then((result) => {
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
                order['lines'] = order.lines.map(i => ({ ...i, id: i.lineId }));
                return order
            }))
        }, (error) => {
            toast.error("Server Down", { autoClose: 5000 });
        }).finally(() => { setLoading(false) });
    }, []);

    useEffect(retrieveData, [retrieveData]);
    useEffect(toasterTrigger, []);
    const navigate = useNavigate()
    // useEffect(() => {
    //     if (manualSelect) return
    //     setLoading(true);
    //     const timer = setTimeout(() => {
    //         setLoading(false);
    //     }, 1000);
    //     return () => clearTimeout(timer);
    // }, [orders, manualSelect]);

    useEffect(() => {
        if (!scrollLine) return
        let lineElement = document.getElementById(`line${scrollLine?.lineId}`);
        if (!lineElement) return
        lineElement.scrollIntoView();
        setScrollLine(null)
    }, [scrollLine, selectedUnit, lines])

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
                productionDetails, setProductionDetails
            }}>
            <Modal isOpen={openModalDeliveryWarning} onClose={() => setOpenModalDeliveryWarning(false)}>
                <DeliveryDateWarning />
            </Modal>
            <Modal isOpen={openIncludeHolidayModal} onClose={() => setOpenIncludeHolidayModal(false)}>
                <IncludeNationalHolidays />
            </Modal>
            <Modal isOpen={lineEntryConformation} onClose={() => { setLineEntryConformation(false); setSplit(false); }}>
                <LineDataConformationForm />
            </Modal>
            <Modal isOpen={learningCurvePopup} >
                <LearningCurveInputGridStandalone />
            </Modal>
            <Modal isOpen={openOrderDetail} onClose={() => { setOpenOrderDetail(false); }}>
                <OrderLineDetails />
            </Modal>
            <Modal isOpen={isOrderProductionDetails} onClose={() => { setIsOrderProductionDetails(false); }}>
                <OrderProductionDetails />
            </Modal>
            <Modal isOpen={isOrderLineDetailOptions} onClose={() => { setIsOrderLineDetailOptions(false); }}>
                <OrderLineDetailOptions />
            </Modal>
            <Modal widthClass={'w-[90%] h-[80%]'} isOpen={openProductionPlanningReport} onClose={() => { setOpenProductionPlanningReport(false); }}>
                <ProductionPlanningReport />
            </Modal>
            <Modal widthClass={''} isOpen={productionDetails} onClose={() => { setProductionDetails(false); }}>
                <ProductionDetails />
            </Modal>
            <Modal isOpen={loading}>
                <button type="button" className="bg-indigo-500 text-white gap-2 p-2 rounded flex justify-center items-center" disabled>
                    <img src={loadingIcon} className='animate-spin h-[40px] w-[40px]' alt="loading" />
                    Loading...
                </button>
            </Modal>
            <div className=''>
                <div className='w-[25%] h-full float-left'>
                    <div className='flex justify-between items-center' style={{ height: "5%", fontSize: "12px" }}>
                        <button className='font-bold p-1 rounded flex justify-between bg-gray-50 gap-1 hover:scale-110' onClick={() => navigate(CLIENT_ORDERS_URL)}>
                            <img src={addOrders} width={20} alt="" />
                            <span>
                                Orders
                            </span>
                        </button>
                        <button className='font-bold p-1 rounded flex justify-between bg-gray-50 gap-1 hover:scale-110' onClick={() => navigate(CLIENT_HOLIDAY_URL)}>
                            <img src={holidaysIcon} width={20} alt="" />
                            <span>
                                Holidays
                            </span>
                        </button>
                        <button className='font-bold p-1 rounded flex justify-between bg-gray-50 gap-1 hover:scale-110' onClick={() => navigate(CLIENT_UNIT_URL)}>
                            <img src={splitUpIcon} width={20} alt="" />
                            <span>
                                Units
                            </span>
                        </button>
                    </div>
                    {manualSelect ?
                        <OrderSplitDetail />
                        :
                        <>
                            <ReportPanel />
                            <OrderList orders={orders} setOrders={setOrders} holidays={holidays} />
                        </>
                    }
                </div>
                <div className='w-[75%] float-right overflow-auto h-screen'>
                    <SelectionPanel />
                    <Calendar />
                </div>
            </div>
        </CapacityPlannerContext.Provider>
    )
}

export default CapacityPlanner
