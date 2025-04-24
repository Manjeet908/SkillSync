import "./rightbar.css";
import Online from "../online/Online";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Add, Remove } from "@mui/icons-material";

export default function Rightbar({ user }) {
  const apiUrl = import.meta.env.VITE_APP_API_URL
  // const PF = import.meta.env.VITE_APP_PUBLIC_FOLDER;
  const [friends, setFriends] = useState([]);
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [followed, setFollowed] = useState(
    currentUser?.followings?.includes(user?.id)
  );

  useEffect(() => {
    const getFriends = async () => {
      try {
        const friendList = await axios.get(`${apiUrl}/follow/get-user-followings${user._id}`);
        setFriends(friendList.data);
      } catch (err) {
        console.log(err);
      }
    };
    getFriends();
  }, [user]);

  const handleClick = async () => {
    try {
      if (followed) {
        await axios.post(`${apiUrl}/follow/toggle-follow/{}`, {
          userId: currentUser._id,
        });
        dispatch({ type: "UNFOLLOW", payload: user._id });
      } else {
        await axios.put(`/users/${user._id}/follow`, {
          userId: currentUser._id,
        });
        dispatch({ type: "FOLLOW", payload: user._id });
      }
      setFollowed(!followed);
    } catch (err) {
    }
  };


  const ProfileRightbar = () => {
    return (
      <>
        {user.username !== currentUser.username && (
          <button className="rightbarFollowButton" onClick={handleClick}>
            {followed ? "Disconnect" : "Connect"}
            {followed ? <Remove /> : <Add />}
          </button>
        )}
        <div className="rightbarInfo">
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">Club Member:</span>
            <span className="rightbarInfoValue">{user.club}</span>
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">Coding Profile:</span>
            <span className="rightbarInfoValue">{user.cfRating}</span>
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">Hobbies:</span>
            <span className="rightbarInfoValue">{user.hobbies}</span>
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">Place of Birth:</span>
            <span className="rightbarInfoValue">{user.birthPlace}</span>
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">Schooling:</span>
            <span className="rightbarInfoValue">{user.school}</span>
          </div>
        </div>
        <h4 className="rightbarTitle">User friends</h4>
        <div className="rightbarFollowings">
          {friends && friends.length > 0 ? (
            friends.map((friend) => (
              <Link
                to={"/profile/" + friend?.username}
                style={{ textDecoration: "none" }}
                key={friend?._id}
              >
                <div className="rightbarFollowing">
                  <img
                    src={
                      friend?.profilePicture
                        ? PF + friend.profilePicture
                        : PF + "person/noAvatar.png"
                    }
                    alt=""
                    className="rightbarFollowingImg"
                  />
                  <span className="rightbarFollowingName">{friend?.username}</span>
                </div>
              </Link>
            ))
          ) : (
            <span>No friends to display</span> 
          )}
        </div>
      </>
    );
  };
  return (
    <div className="rightbar">
      <div className="rightbarWrapper">
        {user ? <ProfileRightbar /> : null}
      </div>
    </div>
  );
}