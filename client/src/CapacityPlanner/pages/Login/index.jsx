import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import company from '../../../assets/pinnacleInfo.png'
import logo from '../../../assets/pinnacle-full.png'
import { toast } from "react-toastify";
import { CLIENT_HOME_URL } from "../../../Constants/clientAppUrls";


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const loginUser = (e) => {
        e.preventDefault();
        if (username.toLowerCase() !== "admin") return toast.info("Username Not Found...!!!");
        if (password !== "Admin") return toast.info("Password Not Valid...!!!");
        navigate(CLIENT_HOME_URL, { replace: true })
    };


    return (
        <section className='relative flex flex-col items-center justify-evenly w-full h-full bg-white'>
            <h1 className='font-bold text-[2rem] pt-12  '> Management Dashboard</h1>
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
    );
};

export default Login;
