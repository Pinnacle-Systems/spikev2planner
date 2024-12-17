import React from 'react'
import { Dropdown } from 'semantic-ui-react'

const DropdownWithSearch = ({ options, placeholder = "Select", value, onChange }) => (
    <Dropdown
        placeholder={placeholder}
        fluid
        selection
        options={options}
        value={value}
        onChange={onChange}
    // handle
    />
)

export default DropdownWithSearch