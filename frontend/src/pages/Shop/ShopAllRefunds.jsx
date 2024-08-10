import React from 'react'
import DashboardHearder from '../../components/Shop/Layout/DashboardHearder'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import AllRefundsOrders from '../../components/Shop/AllRefundsOrders'

const ShopAllRefunds = () => {
  return (
    
        <div>
            <div>
            <DashboardHearder/>
    
            <div className="flex justify-between w-full">
                <div className="w-[80px] 800px:w-[330px]">
                    <DashboardSideBar active={10}/>
                </div>
    
                <div className="w-full justify-center flex">
                    <AllRefundsOrders/>
                </div>
            </div>
        </div>
        </div>
      )

}

export default ShopAllRefunds