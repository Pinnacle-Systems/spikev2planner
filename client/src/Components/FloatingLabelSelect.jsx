import React, { useState } from 'react'

const FloatingLabelSelect = ({ label, required = false, value, setValue, autoFocus = false, disabled = false, options }) => {
    const [focus, setFocus] = useState(autoFocus);
    return (
        <div className='static flex flex-col p-6'>
            {label && <label className={(focus || value) ? "z-0 absolute -translate-y-6 duration-300 " : "absolute mx-1 duration-300 text-gray-400"}>{label}</label>}
            <select disabled={disabled} name="" id="" required={required} value={value} onFocus={(e) => setFocus(true)} onBlur={(e) => setFocus(false)} onChange={(e) => { setValue(e.target.value) }} autoFocus={autoFocus} className="z-10 transparent border-2 rounded" >
                {options.map(item =>
                    <option key={item.value} value={item.value}>{item.show}</option>
                )}
            </select>
        </div>
    )
}

export default FloatingLabelSelect
