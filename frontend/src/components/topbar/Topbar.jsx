import React from 'react'
import './Topbar.css'
import {Search,Person ,Chat,Notifications} from "@mui/icons-material"
function Topbar() {
  return (
    <div className="topbarContainer">
        <div className="topbarLeft">
            <span className="logo">SKILL SYNC</span>
        </div>
        <div className="topbarCenter">
            <div className="searchbar">
                <Search className='searchIcon'/>
                <input placeholder='search for friend,post,commnunity,video' className="searchInput" />
            </div>
        </div>
        <div className="topbarRight">
            <div className="topbarLinks">
                <span className="topbarLink">Home</span>
                <span className="topbarLink">TimeLine</span>
            </div>
            <div className="topbarIcons">
                <div className="topbarIconItem">
                    <Person/>
                    <span className='topbarIconBadge'>1</span>
                </div>
                <div className="topbarIconItem">
                    <Chat/>
                    <span className='topbarIconBadge'>2</span>
                </div>
                <div className="topbarIconItem">
                    <Notifications/>
                    <span className='topbarIconBadge'>3</span>

                </div>
            </div>
            <img src="/assets/person/1.jpg" alt="" className="topbarImg" />
        </div>
        
    </div>
  )
}

export default Topbar