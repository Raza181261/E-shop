import React from 'react'
import DashboardHearder from '../../components/Shop/Layout/DashboardHearder'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import AllProducts from '../../components/Shop/AllProducts'


const ShopAllProducts = () => {
  return (
    <div>
        <DashboardHearder/>

        <div className="flex justify-between w-full">
            <div className="w-[80px] 800px:w-[330px]">
                <DashboardSideBar active={3}/>
            </div>

            <div className="w-full justify-center flex">
                <AllProducts/>
            </div>
        </div>
    </div>
  )
}

export default ShopAllProducts