import "./profile.css";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useParams } from "react-router";
import { Edit } from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import ProfileModal from "../../components/profileModal/ProfileModal";
import SkillEditor from "../../components/skillEditor/SkillEditor";

export default function Profile() {
  
  const { user: currentUser } = useContext(AuthContext);
  const username = useParams().username;
  const [user, setUser] = useState({});
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      await axiosInstance.post(`follow/toggle-follow/${user.username}`);
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/users/get-user-profile/${username}`
        );
        setUser(res.data.data);
        setBioInput(res.data.data.bio || "");
        setIsFollowing(res.data.data.isFollowed || false);        
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

  const handleUserUpdate = (updatedData) => {
    setUser(updatedData);
    setBioInput(updatedData.bio || "");
  };

  const handleEditBioClick = () => {
    setIsEditingBio(true);
    setBioInput(user.bio || "");
  };

  const handleCancelBioEdit = () => {
    setIsEditingBio(false);
    setBioInput(user.bio || "");
  };

  const handleSaveBio = async () => {
    try {
      const res = await axiosInstance.patch("/users/update-account-details", { bio: bioInput });
      setUser(res.data.data);
      setIsEditingBio(false);
    } catch (err) {
      console.error("Failed to update bio:", err);
      alert("Failed to update bio");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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
                    : "assets/gift/background.jpg"
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
                src={user.avatar ? user.avatar : "assets/person/1.jpg"}
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
              {/* <p className="profileEmail">{user.email}</p> */}
              <div className="profileInfoDesc">
                {isEditingBio ? (
                  <>
                    <textarea
                      value={bioInput}
                      onChange={e => setBioInput(e.target.value)}
                      rows={3}
                      style={{ width: "100%", resize: "vertical" }}
                    />
                    <div style={{ marginTop: "8px" }}>
                      <button className="saveBioBtn" onClick={handleSaveBio} style={{ marginRight: "8px" }}>Save</button>
                      <button className="cancelBioBtn" onClick={handleCancelBioEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{user.bio || "No bio provided."}</span>
                    {currentUser.username === username && (
                      <button className="editBioBtn" style={{ marginLeft: "10px" }} onClick={handleEditBioClick}>
                        Edit Bio
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

             
            {currentUser.username === username ? (
              <SkillEditor user={user} onUpdate={handleUserUpdate} />
            ) : (
              <div className="profileUsername">
                <button
                  onClick={handleFollowToggle}
                  className={isFollowing ? "btn-unfollow" : "btn-follow"}
                  disabled={followLoading}
                >
                  {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            )}
            
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
