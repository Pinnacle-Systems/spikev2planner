import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.scss';

import CapacityPlanner from './CapacityPlanner/CapacityPlanner';

import { OrderForm, UnitForm, HolidayCalendar, PlannedOrdersReport, UnPlannedOrdersReport } from './CapacityPlanner/pages';


function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path={"/"} element={<CapacityPlanner />} />
        <Route path={"/orders"} element={<OrderForm />} />
        <Route path={"/unitForm"} element={<UnitForm />} />
        <Route path={"/holidayForm"} element={<HolidayCalendar />} />
        <Route path={"/plannedOrdersReport"} element={<PlannedOrdersReport />} />
        <Route path={"/unPlannedOrdersReport"} element={<UnPlannedOrdersReport />} />
      </Routes>
    </HashRouter >
  );
}

export default App;
