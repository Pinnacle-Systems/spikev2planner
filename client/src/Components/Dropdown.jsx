import React from 'react'
import { Dropdown } from 'semantic-ui-react'

const DropdownWithSearch = ({ options, placeholder = "Select", value, onChange }) => {
    return (<Dropdown
        search
        placeholder={placeholder}
        onBlur={(e) => { e.preventDefault() }}
        options={options}
        value={value}
        onChange={onChange}
        selectOnBlur={false}
    />)
}


export default DropdownWithSearch