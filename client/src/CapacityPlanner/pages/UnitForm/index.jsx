import React, { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { UNITS_API } from "../../../Constants/Api";
import { toast } from 'react-toastify';
import { toasterTrigger } from "../../../utils/helper";
import FloatingLabelInput from "../../../Components/FloatingLabelInput";
import Report from './Report'
import LineDetails from "./LineDetails"

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const UnitForm = () => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [lines, setLines] = useState([]);

  const populateData = useCallback((data) => {
    setId(data.id);
    setName(data.name);
    setLocation(data.location);
    setLines(data.line);
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault();
    axios({
      method: id ? "put" : "post",
      url: id ? `${BASE_URL}${UNITS_API}/${id}` : BASE_URL + UNITS_API,
      data: { name, location, lines: lines.filter(line => line.name) }
    }).then((result) => {
      console.log("result", result.data.response);
      if (result.status === 200 || result.status === 304) {
        if (result.data.statusCode === 0) {
          window.location.reload();
          localStorage.setItem("res", "success");
          localStorage.setItem("success", `Order Saved Successfully!!!`);
        }
        else if (result.data.statusCode === 1) {
          toast.warning(result.data.message, { autoClose: 5000 })
        }
      } else {
        console.log(result);
      }
    }, (error) => {
      console.log(error.status)
      toast.error("Server Down", { autoClose: 5000 })
    });
  };


  useEffect(toasterTrigger, []);


  const populateCall = useCallback((unitId) => {
    sessionStorage.setItem("currentUnitId", unitId);
    axios({
      method: 'get',
      url: BASE_URL + UNITS_API + `/${unitId}`,
    }).then((result) => {
      populateData(result.data.data);
    }, (error) => {
      toast.error("Server Down", { autoClose: 5000 });
    });
  }, [populateData])

  // useEffect(() => {
  //   const unitId = sessionStorage.getItem("currentUnitId");
  //   if (unitId) {
  //     populateCall(unitId)
  //   }
  // }, [populateCall])

  const resetForm = () => {
    setId("");
    setName("");
    setLocation("");
    setLines("");
  }

  return (
    <div className='h-screen w-screen'>
      <div className='p-1 h-full border w-4/6 float-left'>
        <div className="flex h-full w-full">
          <form className="mx-auto p-1 w-full h-full" onSubmit={handleSubmit}>
            <div className="flex">
              <header className="text-xl w-full text-gray-700 text-center font-bold" style={{ height: "5%" }}>
                Unit Details Form
              </header>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold hover:rounded p-1 disabled:bg-red-300"
                type="button"
                onClick={resetForm}
              >
                New
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-1" style={{ height: "15%" }}>
              <FloatingLabelInput label={"Unit Name"} autoFocus={true} value={name} setValue={setName} />
              <FloatingLabelInput label={"Unit Location"} value={location} setValue={setLocation} />
            </div>

            <div className='border' style={{ height: "70%" }}>
              <LineDetails lines={lines} setLines={setLines} />
            </div>
          </form>
        </div>
      </div>
      <div className='p-1 h-full w-2/6 float-right'>
        <Report populateCall={populateCall} />
      </div>
    </div>
  )
}

export default UnitForm
