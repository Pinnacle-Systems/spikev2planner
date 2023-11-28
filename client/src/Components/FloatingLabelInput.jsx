import React, { useState } from 'react'

const FloatingLabelInput = ({ label, type = "text", required = false, value, setValue, autoFocus = false, disabled=false }) => {
    const [focus, setFocus] = useState(autoFocus);
    return (
        <div  className='static flex flex-col p-6'>
            <label className={(focus || value) ? "z-0 absolute -translate-y-6 duration-300 " : "absolute mx-1 duration-300 text-gray-400"}>{label}</label>
            <input disabled={disabled} id={label} type={type} className="z-10 transparent border-2 rounded" required={required} value={value} onFocus={(e) => setFocus(true)} onBlur={(e) => setFocus(false)} onChange={(e) => { setValue(e.target.value) }} autoFocus={autoFocus} />
        </div>
    )
}

export default FloatingLabelInput
