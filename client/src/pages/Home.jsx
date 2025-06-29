import React from 'react'
import BannerProduct from '../extras/BannerProduct'
import BrandList from '../components/BrandList'

const Home = () => {
  return (
    <div className='mt-15'>
      <BannerProduct/>
      <BrandList />
    </div>
  )
}

export default Home