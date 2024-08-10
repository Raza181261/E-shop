import React from 'react'
import DashboardHearder from '../../components/Shop/Layout/DashboardHearder'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import AllOrders from '../../components/Shop/AllOrders.jsx'

const ShopOrders = () => {
  return (
    <div>
        <div>
        <DashboardHearder/>

        <div className="flex justify-between w-full">
            <div className="w-[80px] 800px:w-[330px]">
                <DashboardSideBar active={2}/>
            </div>

            <div className="w-full justify-center flex">
                <AllOrders/>
            </div>
        </div>
    </div>
    </div>
  )
}

export default ShopOrders