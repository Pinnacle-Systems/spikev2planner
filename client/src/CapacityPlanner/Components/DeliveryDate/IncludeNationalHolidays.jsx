import React from 'react'

const IncludeNationalHolidays = () => {
  return (
    <div className='m-5'>
      <h2 className='font-bold'>Include Holidays into Planning ?</h2>
      <div className='flex justify-between p-1 my-4'>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded "
          type="button"
        >
          Yes
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded "
          type="button"
        >
          No
        </button>
      </div>
    </div>
  )
}

export default IncludeNationalHolidays
