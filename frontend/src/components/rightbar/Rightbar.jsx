import "./rightbar.css";
import Online from "../online/Online";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Add, Remove } from "@mui/icons-material";

export default function Rightbar({ user }) {
  const PF = import.meta.env.VITE_APP_PUBLIC_FOLDER;
  const [followings, setFollowings] = useState([]);
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [followed, setFollowed] = useState(false);


  useEffect(() => {
    const getFollowings = async () => {
      try {
        const res = await axiosInstance.get(`/follow/get-user-followings/${user.username}`);
        const followingsList = res.data.data;
        setFollowings(followingsList);
      } catch (err) {
        console.log(err);
      }
    };

    const checkFollowingStatus = async () => {
      try {
        const res = await axiosInstance.get(`/follow/check-following/${user.username}`);
        setFollowed(res.data.data.isFollowing);
      } catch (err) {
        console.log(err);
      }
    };

    if(user.username) {
      getFollowings();
      checkFollowingStatus();
    }
  }, [user]);

  const handleClick = async () => {
    try {
      await axiosInstance.post(`/follow/toggle-follow/${user.username}`);
      // if (followed) {
      //   dispatch({ type: "UNFOLLOW", payload: user._id });
      // } else {
      //   dispatch({ type: "FOLLOW", payload: user._id });
      // }
      setFollowed(!followed);
    } catch (err) {
      console.log(err);
    }
  };

  const ProfileRightbar = () => {
    return (
      <>
        {user._id !== currentUser?._id && (
          <button className="rightbarFollowButton" onClick={handleClick}>
            {followed ? "Disconnect" : "Connect"}
            {followed ? <Remove /> : <Add />}
          </button>
        )}
        <div className="rightbarInfo">
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">Skills:</span>
            <span className="rightbarInfoValue">{user.skills}</span>
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">Country of Origin:</span>
            <span className="rightbarInfoValue">{user.birthPlace}</span>
          </div>
        </div>
        <h4 className="rightbarTitle">User Followings</h4>
        <div className="rightbarFollowings">
          {followings && followings.length > 0 ? (
            followings.map((following) => (
              <Link
                to={"/profile/" + following?.creator?.username}
                style={{ textDecoration: "none" }}
                key={following?._id}
              >
                <div className="rightbarFollowing">
                  <img
                    src={
                      following?.creator?.avatar ? following?.creator?.avatar : PF + "person/noAvatar.png"
                    }
                    alt=""
                    className="rightbarFollowingImg"
                  />
                  <span className="rightbarFollowingName">{following?.creator?.username}</span>
                </div>
              </Link>
            ))
          ) : (
            <span>No followings to display</span> 
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