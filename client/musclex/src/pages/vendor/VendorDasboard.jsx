import React from 'react'
import VendorPanel from '../../components/vendor/VendorPanel'
import { Navbar } from '../../components/user/Navbar'
import { Outlet } from 'react-router-dom'

const VendorDasboard = () => {
  return (
  <div className="h-screen flex flex-col" >
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64">
      <VendorPanel />
      </div>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
      </div>
    </div>
  )
}

export default VendorDasboard