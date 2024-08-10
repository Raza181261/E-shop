import React from 'react'
import DashboardHearder from '../../components/Shop/Layout/DashboardHearder'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import AllCoupons from '../../components/Shop/AllCoupons'

const ShopAllCoupouns = () => {
  return (
    <div>
        <DashboardHearder/>

        <div className="flex justify-between w-full">
            <div className="w-[80px] 800px:w-[330px]">
                <DashboardSideBar active={9}/>
            </div>

            <div className="w-full justify-center flex">
                <AllCoupons/>
            </div>
        </div>
    </div>
  )
}

export default ShopAllCoupouns