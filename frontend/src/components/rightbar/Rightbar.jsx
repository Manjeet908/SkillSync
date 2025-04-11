import React from 'react'
import './rightbar.css'
function Rightbar() {
  return (
    <div className='rightbar'>
      <div className="rightbarWrapper">
        <div className="birthdayContainer">
          <img className='birthdayImg' src="/assets/gift/gift.png" alt="" />  
          <span className="birthdayText">
            <b>Aditya</b> and <b>3 other friends</b> have a birthday today.
          </span>     
        </div>
        <img src="/assets/gift/ad.png" alt="" className="rightbarAd" />
        <h4 className="rightbarTitle">Online Friends</h4>
        <ul className='rightbarFriendList'>

          <li className="rightbarFriend">
            <div className="rightbarProfileImgContainer">
              <img src="/assets/post/2.jpg" alt="" className="rightbarProfileImg" />
              <span className="rightbarOnline"></span>
            </div>
            <span className="rightbarUsername">Aditya</span>
          </li>
          </ul>


      </div>
    </div>
  )
}

export default Rightbar