import React from 'react'
import './rightbar.css'
import { Users } from '../../dummyData'
import Online from '../online/Online'
function Rightbar() {
  console.log('Users data:', Users); 
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
              { Users.map(u=>(
                <Online key={u.id} user={u}/>
              ))}
        </ul>


      </div>
    </div>
  )
}

export default Rightbar