import React from 'react'
import DashboardHearder from '../../components/Shop/Layout/DashboardHearder'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import WithdrawMoney from '../../components/Shop/WithdrawMoney'

const ShopWithDrawMoneyPage = () => {
  return (
    <div>
        <div>
        <DashboardHearder/>
        <div className="flex items-start justify-between w-full">
            <div className="w-[80px] 800px:w-[330px]">
                <DashboardSideBar active={7}/>
            </div>
            <WithdrawMoney/>
        </div>
    </div>
    </div>
  )
}

export default ShopWithDrawMoneyPage