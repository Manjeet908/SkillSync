import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import "./FriendSuggestions.css";
function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleFollow = async(username) => {
    await axiosInstance.post(`follow/toggle-follow/${username}`)
    // complete it later
  }

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await axiosInstance.get("users/suggest-people", {
          withCredentials: true,
        });
        setSuggestions(res.data.data);
      } catch {
        console.error("Error fetching friend suggestions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);
  return (
    <div className="suggestions-container">
      <h2 className="suggestions-title">Friend Suggestions</h2>
      {suggestions.map((user) => (
        <div className="suggestion-item" key={user._id}>
          <div className="suggestion-user">
            <img
              src={user.avatar}
              alt={user.username}
              className="suggestion-avatar"
            />
            <span>{user.username}</span>
            <div>
              <button
                onClick={() => handleFollow(user.username)}
                className="btn-follow"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FriendSuggestions;
