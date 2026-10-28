import React from 'react'
import logo from '../../../assets/dotLogo.png'

const Loader = () => {
  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black/10'>
      <img
        src={logo}
        alt="Loading..."
        className='w-24 h-24 animate-ping'
      />
    </div>
  )
}


export default Loader

