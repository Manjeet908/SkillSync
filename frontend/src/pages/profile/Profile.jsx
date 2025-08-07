import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import { useEffect, useState, useContext } from "react";
import axiosInstance from "../../api/axios";
import { useParams } from "react-router";
import ProfileModal from "../../components/profileModal/ProfileModal";
import { Edit } from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
import SkillEditor from "../../components/skillEditor/SkillEditor";

export default function Profile() {
  const [user, setUser] = useState({});
  const { user: currentUser } = useContext(AuthContext);
  const username = useParams().username;
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(
          `/users/get-user-profile/${username}`
        );
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, [username]);

  const handleUserUpdate = (updatedData) => {
    setUser(updatedData);
  };

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
                  user.coverImage
                    ? user.coverImage
                    : PF + "assets/gift/background.jpg"
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
                src={user.avatar ? user.avatar : PF + "assets/person/1.jpg"}
                alt=""
                onClick={() =>
                  currentUser.username === username &&
                  setIsAvatarModalOpen(true)
                }
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">
                {user.fullName || user.username}
              </h4>
              <p className="profileUsername">@{user.username}</p>
              <p className="profileEmail">{user.email}</p>
              <p className="profileInfoDesc">
                {user.bio || "No bio provided."}
              </p>
            </div>

            {/* Render SkillEditor only if the profile belongs to the current user */}
            {currentUser.username === username && (
              <SkillEditor user={user} onUpdate={handleUserUpdate} />
            )}
            {/* <div className="profileStatus">
              <p>
                <strong>Looking for Jobs:</strong>{" "}
                {user.wantToBeHired ? "Yes" : "No"}
              </p>
            </div> */}
          </div>
        </div>
      </div>

      {isAvatarModalOpen && (
        <ProfileModal onClose={() => setIsAvatarModalOpen(false)} user={user} />
      )}
      {isCoverModalOpen && (
        <ProfileModal onClose={() => setIsCoverModalOpen(false)} user={user} />
      )}
    </>
  );
}
