import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import company from '../../../assets/pinnacleInfo.png'
import logo from '../../../assets/pinnacle-full.png'
import { toast } from "react-toastify";
import { CLIENT_HOME_URL, PRODUCT_ADMIN_HOME_PATH } from "../../../Constants/clientAppUrls";
import { LOGIN_API } from "../../../Constants/Api";
import { generateSessionId } from "../../../utils/helper";
import Swal from 'sweetalert2';
import secureLocalStorage from "react-secure-storage";
import axios from 'axios';
import Modal from "../../../Components/Modal";
import BranchAndFinYearForm from "../../../Basic/Components/BranchAndFinyear";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isGlobalOpen, setIsGlobalOpen] = useState(false);

    const data = { username, password }
    const navigate = useNavigate();

    const validate = () => {
        const errors = {};


        if (!username) {
            errors.email = "Email is required";
        }
        if (!password) {
            errors.password = "Password is required";
        }

        return errors;
    };

    const loginUser = (e) => {
        e.preventDefault();
        // navigate(CLIENT_HOME_URL)

        const validateErrors = validate()
        setErrors(validateErrors)
        if (Object.keys(validateErrors).length === 0) {
            axios({
                method: "post",
                url: BASE_URL + LOGIN_API,
                data: data,
            }).then(
                (result) => {
                    console.log(result?.data, "result for login")
                    if (result?.status === 200) {
                        if (result?.data?.statusCode === 0) {
                            // sessionStorage?.setIttem("sessionId", generateSessionId());
                            if (1 == 2) {
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "userId",
                                    result.data.userInfo.id
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "username",
                                    result.data.userInfo.username
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "superAdmin",
                                    true
                                );
                                navigate(PRODUCT_ADMIN_HOME_PATH);
                            }
                            else {
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "employeeId",
                                    result?.data?.userInfo?.employeeId
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "userId",
                                    result?.data?.userInfo?.id
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "username",
                                    result?.data?.userInfo?.username
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "userEmail",
                                    result?.data?.userInfo?.email
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "userCompanyId",
                                    result?.data?.userInfo?.role?.companyId
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "defaultAdmin",
                                    JSON.stringify(result?.data?.userInfo?.role?.defaultRole)
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "userRole",
                                    result?.data?.userInfo?.role?.name
                                );



                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "userRoleId",
                                    result?.data?.userInfo?.roleId
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") +
                                    "latestActivePlanExpireDate",
                                    new Date(
                                        result?.data?.userInfo?.role?.company?.Subscription[0]?.expireAt
                                    ).toDateString()
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "userRole",
                                    result?.data?.userInfo?.role?.name
                                );
                                setIsGlobalOpen(true);
                                // navigate(CLIENT_HOME_URL)
                            }



                        } else {
                            console.log(result)
                            Swal.fire({
                                icon: 'error',
                                title: 'Submission error',
                                text: result?.data?.message || 'Something went wrong!',
                            });
                            setLoading(false);
                        }
                    }
                },
                (error) => {
                    console.log(error);
                    Swal.fire({
                        title: "Server Down",
                        icon: "error",

                    });
                    setLoading(false);
                }
            );
        }

    };


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
            <section className='relative flex flex-col items-center justify-evenly w-full h-full bg-white'>
                <h1 className='font-bold text-[2rem] pt-12  '> Capacity Planner</h1>
                <div className='flex h-full items-center justify-center '>
                    <div className=' w-[65%]  flex flex-col  '>
                        <img src={company} alt="" className='bg-white shadow-none ' />
                    </div>
                    <div className='w-[25%]  h-[60%] flex flex-col gap-5  border  rounded items-center justify-center p-4  bg'>
                        <img src={logo} alt="" className=' shadow-none w-[60%] rounded' />
                        <form onSubmit={loginUser} className="p-4 w-[80%] flex flex-col justify-center bg">
                            <h2 className="font-bold text-center text-lg text-white">Login</h2>
                            <div>
                                <label className="block text-white mb-1">Username</label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className='pb-2'>
                                <div className='flex justify-between'><label className="block text-white mb-1">Password</label>
                                    <div
                                        className=" inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                                    </div></div>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                            </div>
                            <button
                                className="w-24 p-1 bg-blue-500  rounded-md hover:bg-blue-600 transition duration-300 text-white"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>

    );
};

export default Login;
