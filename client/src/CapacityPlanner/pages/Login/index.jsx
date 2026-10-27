import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, Star, Eye, EyeOff } from "lucide-react";
import logo from "../../../assets/pinnacle-full.png";
import { PRODUCT_ADMIN_HOME_PATH } from "../../../Constants/clientAppUrls";
import { LOGIN_API } from "../../../Constants/Api";
import Swal from "sweetalert2";
import secureLocalStorage from "react-secure-storage";
import axios from "axios";
import Modal from "../../../Components/Modal";
import BranchAndFinYearForm from "../../../Basic/Components/BranchAndFinyear";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isGlobalOpen, setIsGlobalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem("remembered_user");
        if (savedUser) {
            setUsername(savedUser);
            setRememberMe(true);
        }
    }, []);

    const validate = () => {
        const errs = {};
        if (!username.trim()) {
            errs.username = "Email or Employee ID is required";
        }
        if (!password) {
            errs.password = "Password is required";
        }
        return errs;
    };

    const loginUser = (e) => {
        e.preventDefault();
        const validateErrors = validate();
        setErrors(validateErrors);

        if (Object.keys(validateErrors).length === 0) {
            setLoading(true);

            if (rememberMe) {
                localStorage.setItem("remembered_user", username);
            } else {
                localStorage.removeItem("remembered_user");
            }

            axios({
                method: "post",
                url: BASE_URL + LOGIN_API,
                data: { username, password },
            }).then(
                (result) => {
                    setLoading(false);
                    if (result?.status === 200) {
                        if (result?.data?.statusCode === 0) {
                            if (!result.data?.userInfo?.roleId) {
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "superAdmin",
                                    true
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "userId",
                                    result.data.userInfo.id
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "username",
                                    result.data.userInfo.username
                                );

                                navigate(PRODUCT_ADMIN_HOME_PATH);
                            } else {
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "superAdmin",
                                    false
                                );
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
                                        result?.data?.userInfo?.role?.company?.Subscription?.[0]?.expireAt
                                    ).toDateString()
                                );
                                secureLocalStorage.setItem(
                                    sessionStorage.getItem("sessionId") + "userRole",
                                    result?.data?.userInfo?.role?.name
                                );
                                setIsGlobalOpen(true);
                            }
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Submission error',
                                text: result?.data?.message || 'Something went wrong!',
                            });
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

    const handleForgotPassword = () => {
        Swal.fire({
            icon: 'info',
            title: 'Forgot Password',
            text: 'Please contact your system administrator or HR department to reset your password.',
            confirmButtonColor: '#e46230'
        });
    };

    const handleMobileLogin = () => {
        Swal.fire({
            icon: 'info',
            title: 'Mobile Login',
            text: 'Login with Mobile Number will be available soon. Please sign in with your Email or Employee ID.',
            confirmButtonColor: '#e46230'
        });
    };

    const handleCreateAccount = () => {
        Swal.fire({
            icon: 'info',
            title: 'Create Account',
            text: "New accounts are provisioned by your organization's administrator. Please reach out to your HR department.",
            confirmButtonColor: '#e46230'
        });
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

            <div className="min-h-screen w-full bg-[#f4f5f8] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
                {/* Main Card Container */}
                <div className="bg-white rounded-[28px] shadow-[0_15px_45px_rgba(0,0,0,0.06)] border border-gray-100 max-w-5xl w-full p-4 sm:p-6 lg:p-7 flex flex-col md:flex-row gap-6 lg:gap-10 items-stretch">

                    {/* Left Column - Warm Cream Feature Panel */}
                    <div className="w-full md:w-[46%] bg-[#fbf5ed] rounded-[22px] p-6 sm:p-8 lg:p-9 flex flex-col justify-between">
                        <div>
                            {/* Top Brand Logo */}
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#e46230] rounded-[3px] rotate-45 transform" />
                                <span className="text-xl font-bold tracking-tight text-slate-900">
                                    Dot <span className="text-[#e46230]">Capacity Planner</span>
                                </span>
                            </div>

                            {/* Headline */}
                            <div className="mt-8 sm:mt-11">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                                    Sign in to <br />
                                    Dot <span className="text-[#e46230]">Capacity Planner</span>
                                </h2>
                            </div>

                            {/* Feature highlight */}
                            <div className="mt-6 sm:mt-8 flex items-start gap-3.5">
                                {/* Stylized Care / HR Team Icon */}
                                <div className="flex-shrink-0 mt-0.5">
                                    <svg
                                        className="w-11 h-11 text-[#e46230]"
                                        viewBox="0 0 48 48"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {/* Left person */}
                                        <circle cx="16" cy="11.5" r="2.6" fill="#e46230" />
                                        <path d="M12.5 19C12.5 16.6 14.1 15 16 15C17.9 15 19.5 16.6 19.5 19H12.5Z" fill="#e46230" />

                                        {/* Center person */}
                                        <circle cx="24" cy="9.5" r="3" fill="#e46230" />
                                        <path d="M19.8 19C19.8 16.2 21.7 14.2 24 14.2C26.3 14.2 28.2 16.2 28.2 19H19.8Z" fill="#e46230" />

                                        {/* Right person */}
                                        <circle cx="32" cy="11.5" r="2.6" fill="#e46230" />
                                        <path d="M28.5 19C28.5 16.6 30.1 15 32 15C33.9 15 35.5 16.6 35.5 19H28.5Z" fill="#e46230" />

                                        {/* Supporting cradling hand */}
                                        {/* Wrist / Cuff */}
                                        <path d="M7 32C6.4 32 6 32.5 6 33.1V35.9C6 36.5 6.4 37 7 37H11.5L15.8 32H7Z" fill="#e46230" />
                                        {/* Palm, thumb, and fingers */}
                                        <path d="M12 30.5L18.2 25.5C19.1 24.8 20.4 25 21.1 25.9C21.7 26.8 21.5 28.1 20.6 28.8L18 30.8L24.5 30.8C25.7 30.8 26.9 30.2 27.7 29.3L32.2 24.5C33 23.6 34.4 23.6 35.2 24.4C36 25.2 36 26.5 35.1 27.4L29.5 33.6C27.9 35.4 25.6 36.5 23.2 36.5H15.5L12 30.5Z" fill="#e46230" />
                                    </svg>
                                </div>
                                <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                                    Manage production capacity, optimize resource utilization, and keep your production schedules on track with real-time planning insights                                </p>
                            </div>
                        </div>

                        {/* Bottom Stats Widget */}
                        <div className="mt-8 sm:mt-12 bg-white rounded-xl py-3.5 px-3 sm:px-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-orange-100/60 flex items-center justify-between">
                            {/* Stat 1 */}
                            <div className="flex-1 flex flex-col items-center text-center">
                                <Trophy className="w-5 h-5 text-amber-500 mb-1" />
                                <span className="text-sm font-bold text-slate-800">10+</span>
                                <span className="text-[11px] text-gray-400 font-medium">Years</span>
                            </div>

                            <div className="h-7 w-[1px] bg-gray-200" />

                            {/* Stat 2 */}
                            <div className="flex-1 flex flex-col items-center text-center">
                                <Users className="w-5 h-5 text-slate-700 mb-1" />
                                <span className="text-sm font-bold text-slate-800">500+</span>
                                <span className="text-[11px] text-gray-400 font-medium">Employees</span>
                            </div>

                            <div className="h-7 w-[1px] bg-gray-200" />

                            {/* Stat 3 */}
                            <div className="flex-1 flex flex-col items-center text-center">
                                <Star className="w-5 h-5 text-amber-400 fill-amber-400 mb-1" />
                                <span className="text-sm font-bold text-slate-800">98%</span>
                                <span className="text-[11px] text-gray-400 font-medium">Satisfaction</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="w-full md:w-[54%] flex flex-col justify-between py-2 sm:py-3 px-2 sm:px-4 lg:px-6">
                        {/* Top Pinnacle Logo */}
                        <div className="flex justify-end items-center mb-4 sm:mb-6">
                            <img
                                src={logo}
                                alt="PINNACLE Systems"
                                className="h-12 sm:h-16 object-contain"
                            />
                        </div>

                        {/* Main Content Area */}
                        <div className="w-full max-w-md mx-auto my-auto">
                            {/* Heading */}
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                Welcome in <br />
                                Dot <span className="text-[#e46230]">Capacity Planner</span> Platform
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-400 mt-2 mb-6 font-normal">
                                Enter your credentials to access your dashboard
                            </p>

                            {/* Form */}
                            <form onSubmit={loginUser} className="space-y-4">
                                {/* Email / Employee ID */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                                        Username or Employee ID
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            if (errors.username) setErrors({ ...errors, username: null });
                                        }}
                                        placeholder="Username or Emp ID"
                                        className={`w-full px-3.5 py-2.5 sm:py-3 text-sm rounded-lg border ${errors.username ? "border-red-500" : "border-gray-300"
                                            } text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#e46230] focus:ring-1 focus:ring-[#e46230] transition-colors`}
                                    />
                                    {errors.username && (
                                        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors({ ...errors, password: null });
                                            }}
                                            placeholder="Enter your password"
                                            className={`w-full px-3.5 py-2.5 sm:py-3 pr-11 text-sm rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"
                                                } text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#e46230] focus:ring-1 focus:ring-[#e46230] transition-colors`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#e46230] hover:text-[#c54b1d] transition-colors focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <Eye className="w-5 h-5" />
                                            ) : (
                                                <EyeOff className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Remember me & Forgot Password */}
                                <div className="flex items-center justify-between text-xs sm:text-sm pt-1 pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#e46230] accent-[#e46230] focus:ring-[#e46230]"
                                        />
                                        <span className="text-[13px] text-gray-600">Remember this device</span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-[13px] font-medium text-[#e46230] hover:text-[#c54b1d] transition-colors hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Sign In Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 sm:py-3 px-4 bg-[#e46230] hover:bg-[#d05322] active:bg-[#bd4516] disabled:opacity-70 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors duration-150 flex items-center justify-center cursor-pointer"
                                >
                                    {loading ? "Signing in..." : "Sign in"}
                                </button>

                                {/* Secondary Mobile Login Button */}

                            </form>

                            {/* Footer Link */}
                            <p className="text-center text-xs sm:text-[13px] text-gray-500 mt-6 sm:mt-8">
                                New user?{" "}
                                <button
                                    type="button"
                                    onClick={handleCreateAccount}
                                    className="text-slate-800 hover:text-[#e46230] font-medium transition-colors cursor-pointer"
                                >
                                    Create an account
                                </button>
                            </p>
                        </div>

                        {/* Subtle bottom spacing balance */}
                        <div className="hidden sm:block h-2" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;

