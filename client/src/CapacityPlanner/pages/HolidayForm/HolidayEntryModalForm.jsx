import React, { useState, useRef } from 'react';
import FloatingLabelInput from '../../../Components/FloatingLabelInput';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HOLIDAYS_API } from '../../../Constants/Api';
import { isHoliday } from './helper';

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const HolidayEntryModalForm = ({ holidays, selectedDate, onClose }) => {
  const holiday = isHoliday(selectedDate, holidays);
  const id = useRef(holiday ? holiday.id : "");
  const [holidayDescription, setHolidayDescription] = useState(holiday ? holiday.description : "");


  const handleSubmit = (event) => {
    event.preventDefault();
    axios({
      method: `${id.current ? "put" : "post"}`,
      url: BASE_URL + HOLIDAYS_API + `/${id.current}`,
      data: { date: selectedDate, description: holidayDescription }
    }).then((result) => {
      console.log("result", result.data.response);
      if (result.status === 200 || result.status === 304) {
        if (result.data.statusCode === 0) {
          window.location.reload();
          sessionStorage.setItem("selectedMonth", selectedDate)
          localStorage.setItem("res", "success");
          localStorage.setItem("success", `Holiday Saved Successfully!!!`);
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

  const handleDelete = () => {
    axios({
      method: 'delete',
      url: BASE_URL + HOLIDAYS_API + `/${id.current}`
    }).then((result) => {
      if (result.status === 200) {
        if (result.data.statusCode === 0) {
          window.location.reload();
          sessionStorage.setItem("selectedMonth", selectedDate)
          localStorage.setItem(sessionStorage.getItem("sessionId") + "res", "success");
          localStorage.setItem(sessionStorage.getItem("sessionId") + "success", `Holiday Deleted Successfully!!!`);
        } else if (result.data.statusCode === 1) {
          toast.warning(result.data.message, { autoClose: 5000 });
        }
      }
    }, (error) => {
      console.log(error);
      toast.error("Server Down", { autoClose: 5000 });
    });
  }


  return (
    <form onSubmit={handleSubmit} className='m-4'>
      <FloatingLabelInput label={"Date"} type={"date"} value={moment.utc(selectedDate).format("YYYY-MM-DD")} disabled={true} />
      <FloatingLabelInput label={"Holiday Description"} autoFocus={true} value={holidayDescription} setValue={setHolidayDescription} />
      <div className='flex justify-evenly'>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold hover:rounded p-1 mx-20"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
        <button
          disabled={!id.current}
          className="bg-red-600 hover:bg-red-700 text-white font-bold hover:rounded p-1 mx-20 disabled:bg-red-300"
          type="button"
          onClick={handleDelete}
        >{console.log(id, "id")}
          Delete
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold hover:rounded p-1 mx-20"
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  )
}

export default HolidayEntryModalForm
