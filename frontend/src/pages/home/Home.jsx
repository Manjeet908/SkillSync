import React from 'react'
import './Home.css'
import Sidebar from '../../components/sidebar/sidebar'
import Feed from '../../components/feed/feed'
import Rightbar from '../../components/rightbar/rightbar'
import Topbar from '../../components/topbar/Topbar'
function Home() {
  return (
      <>
        <Topbar/>
        <div className="homeContainer">
          <Sidebar/>
          <Feed/>
          <Rightbar/>
        </div>
      </>
  )
}

export default Home