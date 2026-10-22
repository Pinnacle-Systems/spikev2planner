import React, { useState, Suspense, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CLOSE_ICON, DOUBLE_NEXT_ICON } from "../../../icons";
import secureLocalStorage from "react-secure-storage";
import { push, remove } from "../../../CapacityPlanner/redux/features/opentabs";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { useGetRoleByIdQuery } from "../../../CapacityPlanner/redux/services/RolesMasterService";
import { CompanyMaster, PageGroupMaster, PageMaster } from "..";




const ActiveTabList = ({ isSuperAdmin }) => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();
  const [showHidden, setShowHidden] = useState(false);
  const ref = useOutsideClick(() => { setShowHidden(false) });

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
      (rp) => rp.page.name === "POINT OF SALES" && rp.page.active && rp.read && roleData?.data?.name == "SALES"
    );
  }, [isSuperAdmin, defaultAdmin, roleData]);



  const hasDashboardPermission = true

  const tabs = {
    "PAGE GROUP MASTER": <PageGroupMaster />,
    "PAGE MASTER": <PageMaster />,
    "COMPANY MASTER": <CompanyMaster />,

  };


  const innerWidth = window.innerWidth;
  const itemsToShow = innerWidth / 130;
  let currentShowingTabs = openTabs.tabs.slice(0, parseInt(itemsToShow));
  const hiddenTabs = openTabs.tabs.slice(parseInt(itemsToShow));


  // function initialTab() {
  //   if (!isSuperAdmin && !defaultAdmin && userRoleId && !roleData) {
  //     return;
  //   }

  //   dispatch(push(
  //     {
  //       active: true,
  //       name: "DASHBOARD",
  //     }
  //   ));

  //   if (currentShowingTabs?.length == 0 && !isSuperAdmin) {
  //     if (hasPosPermission) {
  //       dispatch(push(
  //         {
  //           active: true,
  //           name: "POINT OF SALES",
  //         }
  //       ));
  //     }
  //   }
  //   else {
  //     return
  //   }
  // }
  return (
    <div className="relative">
      <div className="flex justify-between">
        <div className="flex gap-2">
          {currentShowingTabs?.length == 0 ? true : currentShowingTabs?.map((tab, index) => (
            <div
              key={index}
              className={`px-2 rounded-lg text-[11px] d-flex content-center items-center gap-1 hover:bg-gray-500 hover:text-white transition my-1 ${tab.active
                ? "bg-gray-500 text-white border border-gray-500"
                : "text-gray-500 border border-gray-500"
                }`}
            >
              <button
                onClick={() => {
                  dispatch(push({ name: tab.name }));
                }}
              >
                {tab.name}
              </button>
              <button
                className="px-1 rounded-xs transition"
                onClick={() => {
                  dispatch(remove({ name: tab.name }));
                }}
              >
                {CLOSE_ICON}
              </button>
            </div>
          ))}
        </div>
        <div>
          {hiddenTabs.length !== 0 && (
            <button onClick={() => setShowHidden(true)}>
              {DOUBLE_NEXT_ICON}
            </button>
          )}
        </div>
        {showHidden && (
          <ul
            ref={ref}
            className="absolute right-0 top-5 bg-gray-200 z-50 text-xs p-1"
          >
            {hiddenTabs.map((tab) => (
              <li
                key={tab.name}
                className={`flex justify-between ${tab.active ? "bg-green-300" : "bg-gray-300"
                  } `}
              >
                <button
                  onClick={() => {
                    dispatch(push({ name: tab.name }));
                  }}
                >
                  {tab.name}
                </button>
                <button
                  className="hover:bg-red-400 px-1 rounded-xs transition"
                  onClick={() => {
                    dispatch(remove({ name: tab.name }));
                  }}
                >
                  {CLOSE_ICON}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {openTabs?.tabs?.map((tab, index) => (
        <div key={index} className={`${tab.active ? "block" : "hidden"}`}>
          <Suspense fallback={<div>Loading...</div>}>
            {typeof tabs[tab.name] === "function" ? tabs[tab.name](tab.data) : tabs[tab.name]}
          </Suspense>
        </div>
      ))}
    </div>
  );
};

export default ActiveTabList;
