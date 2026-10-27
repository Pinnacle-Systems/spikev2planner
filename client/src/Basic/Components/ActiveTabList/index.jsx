import React, { useState, Suspense, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { push, remove, clearAll } from "../../../redux/features/opentabs";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { useGetRoleByIdQuery } from "../../../redux/services/RolesMasterService";
import { CityMaster, CompanyMaster, CountryMaster, DepartmentMaster, EmployeeCategoryMaster, EmployeeMaster, PageGroupMaster, PageMaster, StateMaster, UnitMaster, UserAndRolesMaster } from "..";
import CapacityPlanner from "../../../CapacityPlanner/CapacityPlanner";
import { HolidayCalendar, OrderForm, UnPlannedOrdersReport } from "../../../CapacityPlanner/pages";
import ProductionReport from "../../../CapacityPlanner/pages/ProductionReport";
import Home from "../../../CapacityPlanner/pages/Home";
import HomeDashboard from "../Home";
import OrderFormNew from "../../../CapacityPlanner/pages/OrderFormNew";

const formatTabTitle = (name) => {
  if (!name) return "";
  if (name.toUpperCase() === "HOME") return "Home";
  // If mixed case, return as-is
  if (name !== name.toUpperCase() && name !== name.toLowerCase()) return name;
  // Convert UPPERCASE to Title Case (e.g. "PAGE MASTER" -> "Page Master")
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ActiveTabList = ({ isSuperAdmin }) => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useOutsideClick(() => setShowDropdown(false));

  const defaultAdmin = JSON.parse(
    secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "defaultAdmin"
    )
  );
  const userRoleId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRoleId"
  );

  const { data: roleData } = useGetRoleByIdQuery(userRoleId, {
    skip: !userRoleId || isSuperAdmin || defaultAdmin,
  });

  const hasPosPermission = useMemo(() => {
    if (isSuperAdmin || defaultAdmin) return true;
    if (!roleData) return false;
    return (roleData?.data?.RoleOnPage || []).some(
      (rp) => rp.page.name === "POINT OF SALES" && rp.page.active && rp.read && roleData?.data?.name === "SALES"
    );
  }, [isSuperAdmin, defaultAdmin, roleData]);

  const tabs = {
    "HOME": <HomeDashboard />,
    "Home": <HomeDashboard />,
    "PAGE GROUP MASTER": <PageGroupMaster />,
    "PAGE MASTER": <PageMaster />,
    "COMPANY MASTER": <CompanyMaster />,
    "CAPASITY PLANNER": <CapacityPlanner />,
    "USERS & ROLES": <UserAndRolesMaster />,
    "UNIT MASTER": <UnitMaster />,
    // "ORDER DETAILS FORM": <OrderForm />,
    "HOLIDAYS": <HolidayCalendar />,
    "PLANNED ORDERS": <ProductionReport />,
    "UNPLANNED ORDERS": <UnPlannedOrdersReport />,
    "COUNTRY MASTER": <CountryMaster />,
    "STATE MASTER": <StateMaster />,
    "CITY MASTER": <CityMaster />,
    "DEPARTMENT MASTER": <DepartmentMaster />,
    "EMPLOYEE CATEGORY MASTER": <EmployeeCategoryMaster />,
    "EMPLOYEE MASTER": <EmployeeMaster />,
    "ORDER DETAILS FORM": <OrderFormNew />,


  };

  // Ensure tabs array is available and Home is present
  const allTabs = useMemo(() => {
    const list = openTabs?.tabs || [];
    const hasHome = list.some((t) => t.name?.toUpperCase() === "HOME");
    if (!hasHome) {
      return [{ name: "Home", active: list.length === 0 || list.every((t) => !t.active) }, ...list];
    }
    return list;
  }, [openTabs?.tabs]);

  // Ensure an active tab is selected if none is active
  useEffect(() => {
    if (openTabs?.tabs?.length > 0 && !openTabs.tabs.some((t) => t.active)) {
      dispatch(push({ name: openTabs.tabs[0].name }));
    }
  }, [openTabs?.tabs, dispatch]);

  const handleWheel = (e) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full">
      {/* Top Tab Bar Navigation */}
      <div className="w-full bg-[#f8fafc] border-b border-gray-200 px-2.5 py-1 flex items-center justify-between gap-1.5 select-none text-xs">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={scrollLeft}
          className="text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 p-1 rounded transition hidden md:flex items-center justify-center shrink-0"
          title="Scroll Left"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Scrollable Tabs Wrapper */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
        >
          {allTabs.map((tab, index) => {
            const isHome = tab.name?.toUpperCase() === "HOME";
            const isActive = !!tab.active;
            const displayName = formatTabTitle(tab.name);

            return (
              <div
                key={tab.name || index}
                onClick={() => dispatch(push({ name: tab.name }))}
                className={`group flex items-center shrink-0 rounded-md text-[11px] font-medium cursor-pointer transition-all duration-150 ${isActive
                  ? "bg-[#e0562c] text-white shadow-xs px-2.5 py-0.5"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 px-2.5 py-0.5"
                  }`}
              >
                <span className="whitespace-nowrap select-none">{displayName}</span>

                {/* Close button for non-home tabs */}
                {!isHome && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(remove({ name: tab.name }));
                    }}
                    className={`ml-1.5 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] font-bold leading-none transition-all ${isActive
                      ? "text-white/80 hover:text-white hover:bg-black/20"
                      : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                      }`}
                    title={`Close ${displayName}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}

          {/* Clear All Pill Button */}
          <button
            type="button"
            onClick={() => dispatch(clearAll())}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 bg-white font-medium text-[11px] px-2.5 py-0.5 rounded-md shadow-xs transition-all cursor-pointer select-none shrink-0"
            title="Clear all tabs except Home"
          >
            Clear All
          </button>
        </div>

        {/* Scroll Right Button & Overflow Dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={scrollRight}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition hidden md:flex items-center justify-center shrink-0"
            title="Scroll Right"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Tab quick switcher dropdown */}
          {allTabs.length > 3 && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-1 rounded-full transition flex items-center justify-center"
                title="View all open tabs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-7 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1 text-xs">
                  <div className="px-3 py-1 font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[10px]">
                    Open Tabs ({allTabs.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {allTabs.map((tab) => {
                      const isHome = tab.name?.toUpperCase() === "HOME";
                      const displayName = isHome ? "Home" : formatTabTitle(tab.name);
                      return (
                        <div
                          key={tab.name}
                          onClick={() => {
                            dispatch(push({ name: tab.name }));
                            setShowDropdown(false);
                          }}
                          className={`flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition ${tab.active ? "bg-orange-50 text-[#e0562c] font-medium" : "text-gray-700"
                            }`}
                        >
                          <span className="truncate">{displayName}</span>
                          {!isHome && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch(remove({ name: tab.name }));
                              }}
                              className="text-red-400 hover:text-red-600 ml-2 p-0.5 rounded-full hover:bg-red-50 text-[10px]"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {allTabs.map((tab, index) => (
          <div key={tab.name || index} className={tab.active ? "block" : "hidden"}>
            <Suspense fallback={<div className="p-4 text-gray-400 text-sm">Loading...</div>}>
              {typeof tabs[tab.name] === "function"
                ? tabs[tab.name](tab.data)
                : (tabs[tab.name] || tabs[tab.name?.toUpperCase()] || null)}
            </Suspense>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveTabList;
