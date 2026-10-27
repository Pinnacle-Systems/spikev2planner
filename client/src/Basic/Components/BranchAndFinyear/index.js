import React, { useEffect, useState, useCallback } from 'react';
import { BRANCHES_API, FIN_YEAR_API, USERS_API } from '../../../Api';
import { dropDownFinYear, dropDownListObject } from '../../../utils/contructObject';
import { getData } from '../../../utils/Apicalls';
import secureLocalStorage from 'react-secure-storage';
import { useNavigate } from 'react-router-dom';
import { PRODUCT_ADMIN_HOME_PATH } from '../../../Constants/clientAppUrls';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const BranchAndFinYearForm = ({ setIsGlobalOpen }) => {
    const [loading, setLoading] = useState(false);
    const [currentFinYear, setcurrentFinYear] = useState(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentFinYear')
        ?
        secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentFinYear')
        : "");
    const [currentBranch, setCurrentBranch] = useState(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentBranchId')
        ?
        secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentBranchId')
        : "");

    const [finYears, setFinYears] = useState([]);
    const [branches, setBranches] = useState([]);

    const userEmail = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userEmail") || 
                      secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "username") || "";

    const isLoginPage = !window.location.hash || window.location.hash === "#/" || window.location.hash === "#";

    const retrieveFinYearData = useCallback(() => getData(FIN_YEAR_API, setFinYears, setLoading, { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }), []);
    useEffect(retrieveFinYearData, [retrieveFinYearData]);

    const retrieveBranchData = useCallback(() => {
        if (JSON.parse(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "defaultAdmin"))) {
            getData(BRANCHES_API, setBranches, setLoading, {
                active: true, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
            });
        } else {
            axios({
                method: 'get',
                url: BASE_URL + USERS_API + `/${secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")}`
            }).then((result) => {
                if (result.status === 200) {
                    if (result.data.statusCode === 0) {
                        setBranches(result.data.data.UserOnBranch.map((branch) => { return { branchName: branch.Branch.branchName, id: branch.Branch.id } }));
                    }
                } else {
                    console.log(result);
                }
            }, (error) => {
                console.log(error);
                Swal.fire({
                    title: "Server Down",
                    icon: "error",
                });
            });
        }
    }, []);
    useEffect(retrieveBranchData, [retrieveBranchData]);

    useEffect(() => {
        if (branches.length > 0 && !currentBranch) {
            setCurrentBranch(branches[0]?.id || "");
        }
        if (finYears.length > 0 && !currentFinYear) {
            let selectedFinYears = dropDownFinYear(finYears?.filter(val => val?.active));
            setcurrentFinYear(selectedFinYears[0]?.value || "");
        }
    }, [branches, finYears, currentBranch, currentFinYear]);

    const navigate = useNavigate();

    const onSubmit = (e) => {
        if (e) e.preventDefault();
        if (!(currentBranch && currentFinYear)) {
            toast.info("Select Branch and Fin. Year", { position: 'top-center' });
            return;
        }
        secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "currentBranchId", currentBranch);
        secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "currentFinYear", currentFinYear);
        secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "currentFinYearActive", isCurrentFinYearActive());
        navigate(PRODUCT_ADMIN_HOME_PATH);

        window.location.reload();
    };

    const isCurrentFinYearActive = () => {
        const year = finYears.find((finYr) => finYr.id === parseInt(currentFinYear));
        return year ? year.active : false;
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-100 font-sans">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1.5">
                    Select Workspace
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                    Choose the workspace to continue signing in.
                </p>
                {userEmail && (
                    <p className="text-xs text-gray-400 mt-1.5">
                        Signed in as: <span className="text-slate-600 font-medium">{userEmail}</span>
                    </p>
                )}
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Branch Field */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5" htmlFor="branch">
                        Branch
                    </label>
                    <div className="relative">
                        <select
                            id="branch"
                            name="branch"
                            value={currentBranch}
                            onChange={(e) => setCurrentBranch(e.target.value)}
                            className="w-full px-3.5 py-2.5 sm:py-3 text-sm rounded-lg border border-gray-300 text-slate-800 bg-white focus:outline-none focus:border-[#e46230] focus:ring-1 focus:ring-[#e46230] transition-colors cursor-pointer appearance-none pr-10"
                        >
                            <option value="" hidden>Select Branch</option>
                            {dropDownListObject(branches, "branchName", "id").map((branch) => (
                                <option key={branch.value} value={branch.value}>
                                    {branch.show}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Financial Year Field */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5" htmlFor="finyear">
                        Financial Year
                    </label>
                    <div className="relative">
                        <select
                            id="finyear"
                            name="finyear"
                            value={currentFinYear}
                            onChange={(e) => setcurrentFinYear(e.target.value)}
                            className="w-full px-3.5 py-2.5 sm:py-3 text-sm rounded-lg border border-gray-300 text-slate-800 bg-white focus:outline-none focus:border-[#e46230] focus:ring-1 focus:ring-[#e46230] transition-colors cursor-pointer appearance-none pr-10"
                        >
                            <option value="" hidden>Select Financial Year</option>
                            {dropDownFinYear(finYears).map((finyear) => (
                                <option key={finyear.value} value={finyear.value}>
                                    {finyear.show}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Continue Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 sm:py-3 px-4 bg-[#e46230] hover:bg-[#d05322] active:bg-[#bd4516] disabled:opacity-70 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors duration-150 flex items-center justify-center cursor-pointer"
                    >
                        {loading ? "Loading..." : "Continue"}
                    </button>
                </div>

                {/* Back Link */}
                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={() => setIsGlobalOpen(false)}
                        className="text-xs sm:text-sm text-[#e46230] hover:text-[#c54b1d] font-medium transition-colors hover:underline cursor-pointer"
                    >
                        {isLoginPage ? "← Back to Sign In" : "← Cancel"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BranchAndFinYearForm;
