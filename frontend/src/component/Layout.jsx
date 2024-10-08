import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <div className='flex flex-row bg-neutral-100 max-h-full max-w-full min-h-screen min-w-screen  '>
    <Sidebar/>
    <div className='p-4 '>
    <div>{<Outlet/>}</div></div>
    </div>
  )
}

export default Layout