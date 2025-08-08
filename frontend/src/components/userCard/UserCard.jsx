import { useState } from "react";
import axiosInstance from "../../api/axios";
import "./UserCard.css";

function UserCard({ user, initialIsFollowing = false }) {
  
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`follow/toggle-follow/${user.username}`);
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="usercard-item">
      <div className="usercard-user">
        <img
          src={user.avatar || user.profilePicture || "/images/default_avatar.jpg"}
          alt={user.username}
          className="usercard-avatar"
        />
        <span className="usercard-username">{user.username}</span>
        <button
          onClick={handleFollowToggle}
          className={isFollowing ? "btn-unfollow" : "btn-follow"}
          disabled={loading}
          style={{ marginLeft: "auto" }}
        >
          {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>
    </div>
  );
}

export default UserCard;
