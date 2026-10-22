import React, { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Modal from "../../../Components/Modal";
import SuperAdminHeader from "../../Components/SuperAdminHeader";
import ActiveTabList from "../../../Basic/Components/ActiveTabList";

const Home = () => {
    const [isGlobalOpen, setIsGlobalOpen] = useState(false);
    const [logout, setLogout] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
    const [profile, setProfile] = useState(false);
    const isSuperAdmin = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "superAdmin"
    );
    const navigate = useNavigate();
    // const openTabs = useSelector((state) => state.openTabs);

    return (
        <>
            <Modal
                isOpen={isGlobalOpen}
                onClose={() => {
                    setIsGlobalOpen(false);
                }}
                widthClass={""}
            >
                {/* <BranchAndFinyearForm setIsGlobalOpen={setIsGlobalOpen} /> */}
            </Modal>
            <Modal
                isOpen={logout}
                onClose={() => {
                    setLogout(false);
                }}
                widthClass={""}
            >
                {/* <LogoutConfirm setLogout={setLogout} /> */}
            </Modal>
            <div className="h-screen overflow-hidden">
                {isSuperAdmin ? (
                    <>
                        <SuperAdminHeader
                            setIsGlobalOpen={setIsGlobalOpen}
                            setLogout={setLogout}
                        />
                        <div className="">
                            <ActiveTabList isSuperAdmin={isSuperAdmin} />

                        </div>

                    </>
                ) : (
                    // <div >
                    //     <Header profile={profile} setProfile={setProfile} setIsGlobalOpen={setIsGlobalOpen}
                    //     />

                    //     <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} isMainDropdownOpen={isMainDropdownOpen} setIsMainDropdownOpen={setIsMainDropdownOpen} />
                    //     <div className="pt-9 py-2 px-2 bg-[#f1f1f0] :tab">
                    //         <ActiveTabList isSuperAdmin={isSuperAdmin} />
                    //         {openTabs.tabs.length === 0 ? (
                    //             <div className="flex items-center justify-center h-[80vh]">
                    //                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    //             </div>
                    //         ) : ''}
                    //     </div>


                    // </div>
                    <></>
                )}


            </div>
        </>
    );
};
export default Home;
