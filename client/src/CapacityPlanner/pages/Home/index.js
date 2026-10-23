import React, { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Modal from "../../../Components/Modal";
import SuperAdminHeader from "../../Components/SuperAdminHeader";
import ActiveTabList from "../../../Basic/Components/ActiveTabList";
import { Header, Logout } from "../../../Basic/Components";
import CapacityPlanner from "../../CapacityPlanner";
import BranchAndFinYearForm from "../../../Basic/Components/BranchAndFinyear";

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
    console.log(isSuperAdmin, 'isSuperAdmin')
    return (
        <>
            <Modal
                isOpen={isGlobalOpen}
                onClose={() => {
                    setIsGlobalOpen(false);
                }}
                widthClass={""}
            >
                <BranchAndFinYearForm setIsGlobalOpen={setIsGlobalOpen} />
            </Modal>
            <Modal
                isOpen={logout}
                onClose={() => {
                    setLogout(false);
                }}
                widthClass={""}
            >
                <Logout setLogout={setLogout} />
            </Modal>
            <div className="h-screen overflow-hidden flex flex-col">
                {isSuperAdmin ? (
                    <>
                        <SuperAdminHeader
                            setIsGlobalOpen={setIsGlobalOpen}
                            setLogout={setLogout}
                        />
                        <div className="flex-1 ">
                            <ActiveTabList isSuperAdmin={isSuperAdmin} />
                        </div>

                    </>
                ) : (

                    <>
                        <Header profile={profile} setProfile={setProfile} setIsGlobalOpen={setIsGlobalOpen} />
                        <div className="flex-1 ">
                            <ActiveTabList isSuperAdmin={isSuperAdmin} />
                        </div>
                    </>
                )}


            </div>
        </>
    );
};
export default Home;
