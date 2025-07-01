import React from 'react'
import BannerProduct from '../extras/BannerProduct'
import BrandList from '../components/BrandList'
import CategoryRows from './products/CategoryRows'

const Home = () => {
  return (
    <div className='mt-15'>
      <BannerProduct/>
      <BrandList />
      <CategoryRows />
    </div>
  )
}

export default Home