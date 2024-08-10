import React, { useEffect, useState } from 'react'
import { productData } from '../../../static/data';
import styles from '../../../styles/style';
import ProductCard from "../ProductCard/ProductCard"
import { useSelector } from 'react-redux';

const BestDeals = () => {
    const [data, setData] = useState([]);
  const {allProducts} = useSelector((state) => state.products)


    // useEffect(() => {
    //     //const d = productData && productData.sort((a,b) => b.total_sell - a.total_sell);
    //     const firstFive = products.slice(0, 5);
    //     setData(firstFive);
    // },[])

    // useEffect(() => {
    //   const allProductData = [...allProducts];
    //   const sortedData = allProductData?.sort((a, b) => b.sort_out - a.sort_out);
    //     const five = sortedData && sortedData.slice(0, 5)
    //     // if (Array.isArray(allProducts)) {
    //     //   const firstFive = allProducts.slice(0, 5);
    //     //   setData(firstFive);
    //     // }
    //     setData(five)
    //   }, [allProducts]);

    useEffect(() => {
      if (Array.isArray(allProducts)) {
        const allProductData = [...allProducts];
        const sortedData = allProductData.sort((a, b) => b.sort_out - a.sort_out);
        const five = sortedData.slice(0, 5);
        setData(five);
      } else {
        console.error('allProducts is not an array:', allProducts);
      }
    }, [allProducts]);
  return (
    <div>
        <div className={`${styles.section}`}>
            <div className={`${styles.heading}`}>
                <h1>Best Deals</h1>
            </div>
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 border-0">
                {
                    data && data.map((i, index) => (
                        < ProductCard data={i} key={index}/>
                    ))
                }
            </div>
        </div>
    </div>
  )
}

export default BestDeals