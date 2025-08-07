import { useState, useEffect, useRef } from "react";
import { Delete } from "@mui/icons-material";
import "./comment.css";
import axiosInstance from "../../api/axios";

function Comment({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState("general");
  const commentEndRef = useRef(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axiosInstance.get(`/comments/${postId}`, {
          params: {
            page: 1,
            limit: 50,
          },
        });
        setComments(res.data.data.docs || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [postId]);

  const scrollToBottom = () => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axiosInstance.post(`/comments/new/${postId}`, {
        content: newComment,
        type: commentType,
      });
      setComments((prev) => [...prev, res.data.data]);
      setNewComment("");
      scrollToBottom();
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axiosInstance.delete(`/comments/delete/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  // Separate comments by type
  const generalComments = comments.filter((c) => c.type === "general" || c.type === "normal");
  const feedbackComments = comments.filter((c) => c.type === "feedback");

  return (
    <div className="comments-container">
      <div className="comment-input-area">
        <select value={commentType} onChange={e => setCommentType(e.target.value)} className="comment-type-select">
          <option value="general">General</option>
          <option value="feedback">Feedback</option>
        </select>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button className="comment-post-btn" onClick={handleCommentSubmit}>Post</button>
      </div>

      <div className="comments-columns">
        <div className="comments-list general-comments">
          <h3>General Comments</h3>
          {generalComments.map((c) => (
            <div key={c._id} className="comment-item">
              <div className="comment-content">
                <span className="comment-author">{c.author?.username || "Unknown"}</span>
                <span className="comment-text">{c.content}</span>
              </div>
              {c.author?._id === currentUser._id && (
                <button className="delete-btn" onClick={() => handleDelete(c._id)} title="Delete">
                  <Delete style={{ fontSize: 20 }} />
                </button>
              )}
            </div>
          ))}
          <div ref={commentEndRef} />
        </div>
        <div className="comments-list feedback-comments">
          <h3>Feedback Comments</h3>
          {feedbackComments.map((c) => (
            <div key={c._id} className="comment-item">
              <div className="comment-content">
                <span className="comment-author">{c.author?.username || "Unknown"}</span>
                <span className="comment-text">{c.content}</span>
              </div>
              {c.author?._id === currentUser._id && (
                <button className="delete-btn" onClick={() => handleDelete(c._id)} title="Delete">
                  <Delete style={{ fontSize: 20 }} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Comment;
