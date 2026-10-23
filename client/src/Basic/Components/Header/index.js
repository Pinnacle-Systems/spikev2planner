
import logo from "../../../../src/assets/spike.jpeg";
import dp from "../../../assets/default-dp.png";
import "./Header.css";
// import { useState } from "react"
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from "react-redux";
import secureLocalStorage from 'react-secure-storage';
import Swal from "sweetalert2";
import { PAGES_API, ROLES_API } from '../../../Api';
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { GLOBE_ICON } from "../../../icons";
import { push } from "../../../redux/features/opentabs";
import { useGetUserByIdQuery } from '../../../redux/services/UsersMasterService';
import Modal from '../../../UiComponents/Modal';
// import Logout from '../LogoutConfirm';
// import NotificationBell from "../Notification";
import PageSearch from "./PageSearch";
import Logout from "../LogoutConfirm";
import { useGetPageGroupQuery } from "../../../redux/services/PageGroupMasterServices";
import MultiLevelDropDown from "../MultiSelectDropDown";
import ActiveTabList from "../ActiveTabList";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Header = ({ profile, setIsGlobalOpen }) => {

    const PRINT_ROLES = [
        { key: 'receipt', label: 'Receipt' },
        { key: 'barcode-label', label: 'Barcode Label' },
        { key: 'a4-invoice', label: 'A4 Invoice' },
    ];

    const [logout, setLogout] = useState(false);
    const [hideNavBar, sethideNavBar] = useState(true);



    const navBatItemsStyle = hideNavBar ? "hidden" : "";

    const [allowedPages, setAllowedPages] = useState([]);
    const [showStockAlertPopup, setStockAlertPopup] = useState(false);





    const dispatch = useDispatch()



    const handleOutsideClick = () => {
        sethideNavBar(true);
    };

    const ref = useOutsideClick(handleOutsideClick);

    const toggleNavMenu = () => {
        sethideNavBar(!hideNavBar);
    };
    const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetUserByIdQuery(id);

    const { data: pageGroup, isLoading, isFetching } = useGetPageGroupQuery({ searchParams: "" })




    function getRoleStatusLabel(connected, health, roleKey) {
        if (!connected) return 'Not Configured';
        const role = health?.roles?.[roleKey];
        if (!role || !role.configured) return 'Not Configured';
        if (role.configured && role.printerFound === false) return 'Printer Missing';
        return 'Ready';
    }

    const retrieveAllowedPages = useCallback(() => {
        const defaultAdminRaw = secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "defaultAdmin"
        );

        let defaultAdmin = false;
        try {
            if (typeof defaultAdminRaw === "string") {
                defaultAdmin = JSON.parse(defaultAdminRaw);
            } else {
                defaultAdmin = defaultAdminRaw;
            }
        } catch (e) {
            console.error("Failed to parse defaultAdmin:", e);
            defaultAdmin = false;
        }
        if (
            defaultAdmin
        ) {
            axios({
                method: "get",
                url: BASE_URL + PAGES_API,
                params: { active: true },
            }).then(
                (result) => {
                    console.log("result", result.data.data);
                    setAllowedPages(result.data.data);
                },
                (error) => {
                    console.log(error);
                    // toast.error("Server Down", { autoClose: 5000 });
                    Swal.fire({
                        title: "Server Down",
                        icon: "error",

                    });

                }
            );
        } else {
            axios({
                method: "get",
                url:
                    BASE_URL +
                    ROLES_API +
                    `/${secureLocalStorage.getItem(
                        sessionStorage.getItem("sessionId") + "userRoleId"
                    )}`,
            }).then(
                (result) => {
                    if (result.status === 200) {
                        if (result.data.statusCode === 0) {
                            setAllowedPages(
                                result.data.data.RoleOnPage.filter(
                                    (page) => page.page.active && page.read
                                ).map((page) => {
                                    return {
                                        name: page.page.name,
                                        type: page.page.type,
                                        link: page.page.link,
                                        id: page.page.id,
                                        pageGroupId: page.page.pageGroupId
                                    };
                                })
                            );
                        }
                    } else {
                        console.log(result);
                    }
                },
                (error) => {
                    console.log(error);
                    // toast.error("Server Down", { autoClose: 5000 });
                    Swal.fire({
                        title: "Server Down",
                        icon: "error",

                    });


                }
            );
        }
    }, []);
    useEffect(retrieveAllowedPages, [retrieveAllowedPages]);
    function findElement(id, arr) {
        if (!arr) return ""
        let data = arr.find(item => parseInt(item.id) === parseInt(id))
        return data ? data.name : ""
    }
    const masters = allowedPages.filter((page) => page.type === "Masters")
    const mastersGroup = [...new Set(masters.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
    const transactions = allowedPages.filter((page) => page.type === "Transactions")
    const transactionsGroup = [...new Set(transactions.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
    const reports = allowedPages.filter((page) => page.type === "Reports")
    const reportGroups = [...new Set(reports.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })



    return (
        <>
            <div className="w-full relative z-40 bg-white">
                <div className='flex h-11 w-full items-center justify-between bg-white px-2 sm:px-4 border-b border-gray-100'>
                    <Modal
                        isOpen={logout}
                        onClose={() => {
                            setLogout(false);
                        }}
                        widthClass={""}
                    >
                        <Logout setLogout={setLogout} />
                    </Modal>
                    <div className="flex shrink-0 items-center">
                        <img className="h-5"
                            src={logo}
                            alt="" />
                    </div>
                    <div className="nav-item flex-grow ">
                        <div
                            className={`flex items-center mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
                        >
                            <MultiLevelDropDown heading={"Masters"} groups={mastersGroup} pages={masters} />
                        </div>
                        <div
                            className={`flex items-center mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
                        >
                            <MultiLevelDropDown heading={"Transactions"} groups={transactionsGroup} pages={transactions} />
                        </div>
                        <div
                            className={`block mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
                        >
                            <MultiLevelDropDown heading={"Reports"} groups={reportGroups} pages={reports} />
                        </div>


                    </div>
                    <div className="mr-1 md:mr-9 flex items-center gap-1.5 sm:gap-3">


                        <PageSearch pageList={allowedPages} />
                        <div
                            className="text-lg cursor-pointer"
                            onClick={() => { setIsGlobalOpen(true) }}>
                            {GLOBE_ICON}
                        </div>
                        {/* <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-beige">
                    <NotificationBell />
                </div> */}

                        <div className="relative text-left">
                            <button
                                ref={ref}
                                onClick={toggleNavMenu}
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-2xl"
                                id="menu-button"
                                aria-expanded="true"
                                aria-haspopup="true"
                            >
                                <img className="rounded-full cursor-pointer" width={'25px'}
                                    src={dp}
                                    alt="image" />

                            </button>
                            <div
                                className={`right-0 absolute mt-2 w-52 origin-top-right rounded-md z-50 shadow-lg border border-gray-100 ${navBatItemsStyle}`}
                            >
                                <div className="bg-beige flex p-2 items-center rounded-lg">
                                    <div className="mr-2 w-12">
                                        <img className="rounded-full" width={'30px'} height={'30px'} src={dp} alt="image" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-black my-0 py-0">
                                            {secureLocalStorage.getItem(
                                                sessionStorage.getItem("sessionId") + "username"
                                            )}
                                        </div>
                                        <div className="text-[11px] p-0 text-gray-400 -mt-1 ">{singleData?.data?.email}</div>
                                    </div>
                                </div>
                                <button className="nav-dropdown-bg z-99 p-2 w-full" onClick={() => { dispatch(push({ id: 1000000, name: "ACCOUNT SETTINGS" })) }}>
                                    <pre>ACCOUNT SETTINGS</pre>
                                </button>
                                {allowedPages.filter((page) => page.type === "AdminAccess")?.map((item, index) => (
                                    <button
                                        key={index}
                                        type="link"
                                        className="nav-dropdown-bg z-99 p-2 text-start block w-full"
                                        onClick={(e) => {
                                            dispatch(push({ id: item.id, name: item.name }))
                                            secureLocalStorage.setItem(
                                                sessionStorage.getItem("sessionId") + "currentPage",
                                                item.id
                                            );
                                        }}
                                    >
                                        <pre>{item.name}</pre>
                                    </button>
                                ))}

                                <button className="nav-dropdown-bg z-50 p-2 w-full" onClick={() => setLogout(true)}>
                                    <pre>LOG OUT</pre>

                                </button>

                            </div>
                        </div>
                    </div>

                </div>
            </div>


        </>
    )
}

export default Header
