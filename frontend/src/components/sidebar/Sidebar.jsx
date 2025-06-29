import "./sidebar.css";
import {
  RssFeed,
  Chat,
  Group,
  Explore,
  Person,
  Favorite,
  Article,
  LogoutOutlined,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const {user:currentUser, dispatch } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [skills, setSkills] = useState([]);
  
    useEffect(() => {
      const fetchUserSkills = async () => {
        try {
          const res = await axiosInstance.get(
            `/users/get-user-profile/${currentUser.username}`
          );
          const data = res.data.data;
          const allSkills = [
            ...(data.knownSkills || []),
            ...(data.interestedSkills || []),
          ];
          setSkills(allSkills);
        } catch (error) {
          console.error("Failed to fetch skills:", error);
        }
      };
      if (isGlobalChatOpen) fetchUserSkills();
    }, [isGlobalChatOpen, currentUser.username]);
  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/users/logout");
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
    const handleSkillChatNavigate = (skill) => {
      setIsGlobalChatOpen(false); 
      navigate(`/global-chat/${encodeURIComponent(skill)}`);
    };

  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <ul className="sidebarList">
          <li className="sidebarListItem" onClick={() => handleNavigate("/")}>
            <RssFeed className="sidebarIcon" />
            <span className="sidebarListItemText">Feed</span>
          </li>
          <li className="sidebarListItem" onClick={() => handleNavigate("/chat")}>
            <Chat className="sidebarIcon" />
            <span className="sidebarListItemText">Chats</span>
          </li>
          <li className="sidebarListItem" onClick={() => setIsGlobalChatOpen(!isGlobalChatOpen)}>
            <Group className="sidebarIcon" />
            <span className="sidebarListItemText">Gloabal Chat</span>
            <KeyboardArrowDown className="dropdown-arrow" />
          </li>
          {
            isGlobalChatOpen && skills.length > 0 && (
              <div className="skill-dropdown-content">
                {skills.map((skill,index ) => (
                  <li key={index} className="sidebarListItem" onClick={() => handleSkillChatNavigate(skill)}>
                    <span className="sidebarListItemText">{skill}</span>
                  </li>
                ))}
                {skills.length === 0 && (
                  <li className="sidebarListItem">
                    <span className="sidebarListItemText">No skills found</span>
                  </li>
                )}
              </div>
            ) 
          }
          <li className="sidebarListItem" onClick={() => handleNavigate("/explore")}>
            <Explore className="sidebarIcon" />
            <span className="sidebarListItemText">Explore new Skills</span>
          </li>
          
          <li className="sidebarListItem profile-dropdown" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <Person className="sidebarIcon" />
            <span className="sidebarListItemText">Profile</span>
            <KeyboardArrowDown className="dropdown-arrow" />
          </li>
          
          {isProfileOpen && (
            <div className="profile-dropdown-content">
              <li className="sidebarListItem" onClick={() => handleNavigate("/followings")}>
                <Person className="sidebarIcon" />
                <span className="sidebarListItemText">Followings</span>
              </li>
              <li className="sidebarListItem" onClick={() => handleNavigate("/liked-posts")}>
                <Favorite className="sidebarIcon" />
                <span className="sidebarListItemText">Liked Posts</span>
              </li>
              <li className="sidebarListItem" onClick={() => handleNavigate("/your-posts")}>
                <Article className="sidebarIcon" />
                <span className="sidebarListItemText">Your Posts</span>
              </li>
              <li className="sidebarListItem" onClick={handleLogout}>
                <LogoutOutlined className="sidebarIcon" />
                <span className="sidebarListItemText">Logout</span>
              </li>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}