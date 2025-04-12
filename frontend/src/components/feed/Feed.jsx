import { useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "axios";

export default function Feed({ username }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/posts/profile/" + username);
        setPosts(
          res.data.sort((p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt))
        );
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    if (username) {
      fetchPosts();
    }
  }, [username]);

  return (
    <div className="feed">
      <div className="feedWrapper">
        {posts.map((p) => (
          <Post key={p._id} post={p} />
        ))}
      </div>
    </div>
  );
}