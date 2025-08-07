import "./post.css";
import {
  MoreVert,
  Favorite,
  FavoriteBorder,
  Delete,
  ChatBubbleOutline,
  ChatBubble,
} from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import * as timeago from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Comment from "../comment/Comment";

export default function Post({ post }) {  
  const [like, setLike] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [creator, setCreator] = useState(post.creator);
  const [showComments, setShowComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.isFollowing || false); // dummy
  const [showMenu, setShowMenu] = useState(false); // for three dots menu

  const { user: currentUser } = useContext(AuthContext);
  const isOwnProfile = post.creator?._id === currentUser._id;

  useEffect(() => {
    setIsLiked(post.isLiked || false);
  }, [currentUser._id, post.isLiked]);

  useEffect(() => {
    setCreator(post.creator);
  }, [post._id]);

  const likeHandler = async () => {
    try {
      await axiosInstance.post("/likes/post/" + post._id);
    } catch (err) {
      console.log(err);
    }
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  const deleteHandler = async () => {
    try {
      await axiosInstance.delete("/posts/delete-post/" + post._id);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const isVideo = (url) => {
    return url.match(/\.(mp4|webm|ogg)$/i);
  };

  // Dummy follow/unfollow handler
  const followHandler = () => {
    setIsFollowing((prev) => !prev);
  };

  // Dummy interested skill handler
  const addToInterestedSkills = () => {
    alert("Added to interested skills (dummy)");
  };

  // Dummy chat handler
  const chatWithCreator = () => {
    alert("Chat with creator (dummy)");
  };

  return (
    <div className="post">
      <div className="postWrapper">
        {/* Top Section */}
        <div className="postTop">
          <div className="postTopLeft" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link to={`/profile/${creator.username}`}>
              <img
                className="postProfileImg"
                src={creator.avatar ? creator.avatar : PF + "assets/person/1.jpg"}
                alt=""
              />
            </Link>
            <span className="postUsername">{creator.username}</span>
            <button
              className="followBtn"
              onClick={followHandler}
              style={{ marginLeft: "0.5rem" }}
              disabled={isOwnProfile}
            >
              {isOwnProfile ? "You" : isFollowing ? "Unfollow" : "Follow"}
            </button>
            <span className="postDate">{timeago.format(post.createdAt)}</span>
          </div>
          <div className="postTopRight" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Skill name */}
            <span className="postSkillName" style={{ fontWeight: "bold", color: "#1976d2" }}>
              {post.skillShowcasing?.name || "Skill"}
            </span>
            {/* Three dots menu */}
            <div className="postMenu" style={{ position: "relative" }}>
              <MoreVert
                style={{ cursor: "pointer" }}
                onClick={() => setShowMenu((prev) => !prev)}
              />
              {/* Dummy menu dropdown */}
              {showMenu && (
                <div className="postDropdownMenu" style={{ position: "absolute", right: 0, top: "2rem", background: "#fff", border: "1px solid #eee", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 10 }}>
                  <button className="menuItem" onClick={chatWithCreator} style={{ display: "block", width: "100%", padding: "0.5rem 1rem", border: "none", background: "none", textAlign: "left" }}>Chat with Creator</button>
                  <button className="menuItem" onClick={addToInterestedSkills} style={{ display: "block", width: "100%", padding: "0.5rem 1rem", border: "none", background: "none", textAlign: "left" }}>Add to Interested Skills</button>
                  {isOwnProfile && <button className="menuItem" onClick={deleteHandler} style={{ display: "block", width: "100%", padding: "0.5rem 1rem", border: "none", background: "none", textAlign: "left", color: "red" }}>Delete Post</button>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post Media */}
        {post.media && post.media.length > 0 && (
          <div className="postMedia">
            {post.media.map((mediaUrl, index) => (
              <div key={index} className="mediaItem">
                {isVideo(mediaUrl) ? (
                  <video className="postVideo" controls src={mediaUrl} />
                ) : (
                  <img
                    className="postImg"
                    src={mediaUrl}
                    alt={`Post media ${index + 1}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Title */}
        <div className="postTitle" style={{ fontWeight: "bold", fontSize: "1.2rem", margin: "0.5rem 0" }}>
          {post.title || "Post Title"}
        </div>

        {/* Description */}
        <div className="postCenter">
          <span className="postText">{post?.description}</span>
        </div>

        {/* Like and Comment Section */}
        <div className="postBottom">
          <div className="postBottomLeft">
            {isLiked ? (
              <Favorite
                className="likeIcon"
                onClick={likeHandler}
                style={{ color: "red" }}
              />
            ) : (
              <FavoriteBorder className="likeIcon" onClick={likeHandler} />
            )}
            <span className="postLikeCounter">{like} people like it</span>
          </div>

          <div className="postBottomRight">
            <button
              className="postCommentText"
              onClick={() => setShowComments((prev) => !prev)}
              title={showComments ? "Hide Comments" : "Show Comments"}
            >
              {showComments ? (
                <ChatBubble style={{ color: "#222", fontSize: 24 }} />
              ) : (
                <ChatBubbleOutline style={{ color: "#1976d2", fontSize: 24 }} />
              )}
            </button>

            {showComments && (
              <Comment postId={post._id} currentUser={currentUser} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
