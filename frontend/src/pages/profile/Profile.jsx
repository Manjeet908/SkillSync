import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { useParams } from "react-router";
import ProfileModal from "../profileModal/ProfileModal";

export default function Profile() {
  const PF = import.meta.env.VITE_APP_PUBLIC_FOLDER;
  const [user, setUser] = useState({});
  const username = useParams().username;
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axiosInstance.get(`/users/get-user-profile/${username}`);
      setUser(res.data.data);
    };
    fetchUser();
  }, [username]);

  // console.log("hi", user)
  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
            <img
              className="profileCoverImg"
              src={
                user.coverImage ? user.coverImage : PF + "assets/gift/background.jpg"
              }
              alt=""
            />
              <img
                className="profileUserImg"
                src={
                  user.avatar ? user.avatar : PF + "assets/person/1.jpg"
                }
                alt=""
                onClick={() => setIsModalOpen(true)}
              />
              {isModalOpen && <ProfileModal onClose={() => setIsModalOpen(false)} user={user}/>}
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{user.username}</h4>
              <span className="profileInfoDesc">{user.bio}</span>
            </div>
          </div>
          <div className="profileRightBottom">
            {/* why feed? */}
            <Feed username={username} /> 
            <Rightbar user={user} />
          </div>
        </div>
      </div>
    </>
  );
}