import React from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import UserOrderDeatils from '../components/UserOrderDeatils'

const OrderDetailsPage = () => {
  return (
    <div>
        <Header/>
        <UserOrderDeatils/>
        <Footer/>
    </div>
  )
}

export default OrderDetailsPage