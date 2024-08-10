import React from 'react'
import ShopSettings from "../../components/Shop/ShopSettings"
import DashboardHearder from '../../components/Shop/Layout/DashboardHearder'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'

const ShopSettingsPage = () => {
  return (
    <div>
    <DashboardHearder/>
    <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
            <DashboardSideBar active={11}/>
        </div>
        <ShopSettings/>
    </div>
</div>
)
}

export default ShopSettingsPage