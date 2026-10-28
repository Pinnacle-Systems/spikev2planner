import React from 'react'
import logo from '../../../assets/dotLogo.png'

const Loader = () => {
  return (
    <div className='fixed z-99 top-1/2 left-1/2'>
      <img
        src={logo}
        className='w-24 h-24 animate-ping' />
      {/* <Triangle
        height="80"
        width="80"
        color="blue"
        ariaLabel="tail-spin-loading"
        radius="1"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      /> */}
    </div>
  )
}

export default Loader

