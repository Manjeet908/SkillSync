import React, { useState, useEffect, useRef } from "react";
import "./comment.css";
import axiosInstance from "../../api/axios"; // Your Axios config with baseURL & auth

function Comment({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const commentEndRef = useRef(null);

  // Fetch comments for the post
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axiosInstance.get(`/comments/${postId}`, {
          params: {
            page: 1,
            limit: 10,
          },
        });
        setComments(res.data.data.docs || []); // response format from your backend
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    fetchComments();
  }, [postId]);

  const scrollToBottom = () => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Submit a new comment
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await axiosInstance.post(`/comments/${postId}`, {
        content: newComment,
        type: "normal", // or "feedback" if needed
      });
      setComments((prev) => [...prev, res.data.data]); // assuming new comment is returned as res.data.data
      setNewComment("");
      scrollToBottom();
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  // Delete a comment
  const handleDelete = async (commentId) => {
    try {
      await axiosInstance.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="comments-container">
      <div className="comments-list">
        {comments.map((c) => (
          <div key={c._id} className="comment-item">
            <div>
              <strong>{c.author?.username || "Unknown"}</strong> {c.content}
              <span className="comment-time">
                • {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
            {c.author?._id === currentUser._id && (
              <button
                className="delete-btn"
                onClick={() => handleDelete(c._id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
        <div ref={commentEndRef} />
      </div>

      <div className="comment-input-area">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={handleCommentSubmit}>Post</button>
      </div>
    </div>
  );
}

export default Comment;
