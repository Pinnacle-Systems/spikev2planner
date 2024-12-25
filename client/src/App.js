import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.scss';

import CapacityPlanner from './CapacityPlanner/CapacityPlanner';

import { OrderForm, UnitForm, HolidayCalendar, UnPlannedOrdersReport, Login, PlannedOrdersReport } from './CapacityPlanner/pages';
import { CLIENT_HOLIDAY_URL, CLIENT_HOME_URL, CLIENT_ORDERS_URL, CLIENT_PLANNED_ORDERS_URL, CLIENT_UNIT_URL, CLIENT_UNPLANNED_ORDERS_URL } from './Constants/clientAppUrls';
import ProductionReport from './CapacityPlanner/pages/ProductionReport';


function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path={"/"} element={<Login />} />
        <Route path={CLIENT_HOME_URL} element={<CapacityPlanner />} />
        <Route path={CLIENT_ORDERS_URL} element={<OrderForm />} />
        <Route path={CLIENT_UNIT_URL} element={<UnitForm />} />
        <Route path={CLIENT_HOLIDAY_URL} element={<HolidayCalendar />} />
        <Route path={CLIENT_PLANNED_ORDERS_URL} element={<ProductionReport />} />
        <Route path={CLIENT_UNPLANNED_ORDERS_URL} element={<UnPlannedOrdersReport />} />
      </Routes>
    </HashRouter >
  );
}

export default App;
