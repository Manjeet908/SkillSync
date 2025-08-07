import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";
import UserCard from "../../components/UserCard/UserCard";
import "./Followings.css";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../api/axios";

export default function Followings() {
  const { user } = useContext(AuthContext);
  const [followings, setFollowings] = useState([]);

  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        const res = await axiosInstance.get(`/follow/get-user-followings/${user.username}`);
        setFollowings(res.data.data);
      } catch (err) {
        console.error("Failed to fetch followings", err);
      }
    };
    if (user?._id) fetchFollowings();
  }, [user]);

  return (
    <>
      <Topbar />
      <div className="followingsContainer">
        <Sidebar />
        <div className="followingsFeed">
          <h2>Your Followings</h2>
          <div className="followingsList">
            {followings.length === 0 ? (
              <div>No followings found.</div>
            ) : (
              followings.map((f) => (
                <UserCard
                  key={f._id}
                  user={f}
                  initialIsFollowing={true}
                />
              ))
            )}
          </div>
        </div>
        <Rightbar />
      </div>
    </>
  );
}
