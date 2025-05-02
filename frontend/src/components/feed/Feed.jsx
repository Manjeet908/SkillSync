import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axiosInstance from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

export default function Feed({ username }) {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = username ? await axiosInstance.get("/posts/profile/" + username) : await axiosInstance.get("posts/get-all-posts/");

        if (!res.data || !Array.isArray(res.data.data.docs)) {
          console.error("Invalid response data:", res.data);
          return;
        }

        setPosts(
          res.data.data.docs.sort((p1, p2) => {
            return new Date(p2.createdAt) - new Date(p1.createdAt);
          })
        );
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, [username, user._id]);

  return (
    <div className="feed">
      <div className="feedWrapper">
        {(!username || username === user.username) && <Share />}
        {
          posts.map((p) => (
            <Post key={p._id} post={p} />
          ))
        }
      </div>
    </div>
  );
}