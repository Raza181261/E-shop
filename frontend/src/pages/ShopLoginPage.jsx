import React, { useEffect } from 'react'
import ShopLogin from "../components/Shop/ShopLogin"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ShopLoginPage = () => {
    const { isSeller, isLoading} = useSelector((state) => state.seller);
    const navigate = useNavigate()
    
    useEffect(() => {
        if (isSeller) {
          navigate(`/dashboard`);
        }
      }, [isLoading, isSeller]);
  return (
    <ShopLogin/>
  )
}

export default ShopLoginPage