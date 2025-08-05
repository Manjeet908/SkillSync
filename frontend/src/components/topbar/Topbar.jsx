import "./Topbar.css";
import { useEffect, useState } from "react";
import { Search, Notifications } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from "../notification/NotificationPanel";
import axiosInstance from "../../api/axios";
import Searchbar from "../searchbar/Searchbar";


export default function Topbar() {
  const { user } = useContext(AuthContext);
  const PF = import.meta.env.VITE_APP_PUBLIC_FOLDER;
  const socket = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notify/user-notifications");
        setNotifications(response.data.data);
        setNotificationCount(response.data.data.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    if (socket) {
      socket.on('new_notification', (data) => {
        console.log(data)
        setNotifications(prev => [data, ...prev]);
        setNotificationCount(prev => prev + 1);
      });

      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      axiosInstance.patch("/notify/mark-read-all")
      setNotificationCount(0);
    }
  };

  const clearNotifications = () => {
    axiosInstance.delete("/notify/delete-read")
    setNotifications([]);
  };

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">Skill Sync</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="topbarCenter">
          <Searchbar />
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarIcons">
          <div className="topbarIconItem" onClick={toggleNotifications}>
            <Notifications />
            {notificationCount > 0 && (
              <span className="topbarIconBadge">{notificationCount}</span>
            )}
            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onClear={clearNotifications}
              />
            )}
          </div>
        </div>
        <Link to={`/profile/${user.username}`}>
          <img
            src={user.avatar ? user.avatar : PF + "assets/person/1.jpg"}
            alt=""
            className="topbarImg"
          />
        </Link>
      </div>
    </div>
  );
}
