import React, { useState } from 'react'

const Accordian = ({ heading, content, bgColor }) => {
    const [open, setOpen] = useState(false)
    return (
        <div
            className="rounded border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800"
            style={{ backgroundColor: bgColor }}>
            <h2 className="mb-0 rounded" id="headingOne">
                <button
                    className="hover:cursor-grab group relative flex w-full  border-0 bg-white py-4 px-5 text-left text-base text-neutral-800 transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none dark:bg-neutral-800 dark:text-white [&:not([data-te-collapse-collapsed])]:bg-white [&:not([data-te-collapse-collapsed])]:text-primary [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(229,231,235)] dark:[&:not([data-te-collapse-collapsed])]:bg-neutral-800 dark:[&:not([data-te-collapse-collapsed])]:text-primary-400 dark:[&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]"
                    type="button"
                    data-te-collapse-init
                    data-te-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                    onClick={() => setOpen(!open)}>
                    {heading}
                    <span
                        className="hover:cursor-pointer ml-auto h-5 w-5 shrink-0 rotate-[-180deg] fill-[#336dec] transition-transform duration-200 ease-in-out group-[[data-te-collapse-collapsed]]:rotate-0 group-[[data-te-collapse-collapsed]]:fill-[#212529] motion-reduce:transition-none dark:fill-blue-300 dark:group-[[data-te-collapse-collapsed]]:fill-white">
                        {
                            open ? <>&#x25BC;</> : <>&#x25B2;</>
                        }
                    </span>
                </button>
            </h2>
            {
                open ?
                    <div
                        id="collapseOne"
                        data-te-collapse-item
                        data-te-collapse-show
                        aria-labelledby="headingOne"
                        data-te-parent="#accordionExample">
                        <div className="py-4 px-5">
                            {content}
                        </div>
                    </div>
                    : ""
            }

        </div>
    )
}

export default Accordian
