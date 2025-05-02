import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import { useEffect, useState, useContext } from "react";
import axiosInstance from "../../api/axios";
import { useParams } from "react-router";
import ProfileModal from "../profileModal/ProfileModal";
import { Edit } from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";

export default function Profile() {
  const PF = import.meta.env.VITE_APP_PUBLIC_FOLDER;
  const [user, setUser] = useState({});
  const { user: currentUser } = useContext(AuthContext);
  const username = useParams().username;
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axiosInstance.get(`/users/get-user-profile/${username}`);
      setUser(res.data.data);
    };
    fetchUser();
  }, [username]);

  // console.log("hi", currentUser)
  // console.log("hi2", user)
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
              
              {currentUser.username === username && (
                <button 
                  className="editCoverBtn"
                  onClick={() => setIsCoverModalOpen(true)}
                >
                  <Edit className="editIcon" />
                  Edit Cover Photo
                </button>
              )}
              <img
                className="profileUserImg"
                src={
                  user.avatar ? user.avatar : PF + "assets/person/1.jpg"
                }
                alt=""
                onClick={() => currentUser.username === username &&  setIsAvatarModalOpen(true)}
              />
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
      {isAvatarModalOpen && <ProfileModal onClose={() => setIsAvatarModalOpen(false)} user={user}/>}
      {isCoverModalOpen && <ProfileModal onClose={() => setIsCoverModalOpen(false)} user={user}/>}
    </>
  );
}