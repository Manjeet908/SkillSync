import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import UserCard from "../UserCard/UserCard";
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
        <UserCard
          key={user._id}
          user={user}
          initialIsFollowing={false}
        />
      ))}
    </div>
  );
}

export default FriendSuggestions;
