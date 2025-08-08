import "./Post.css";
import {
  MoreVert,
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  ChatBubble,
} from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import * as timeago from "timeago.js";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Comment from "../comment/Comment";

export default function Post({ post }) {  
  const [like, setLike] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [creator, setCreator] = useState(post.creator);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // for three dots menu
  
  const { user: currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const isOwnProfile = post.creator?._id === currentUser._id;
  const PF = import.meta.env.VITE_APP_PUBLIC_FOLDER;

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


  // Interested skill handler
  const skillObj = post.skillShowcasing;
  const skillId = skillObj?.id || skillObj?._id;
  const isSkillInterested = currentUser?.interestedSkills?.some(s => s.id === skillId);

  const handleInterestedSkill = async () => {
    if (!skillId) return;
    try {
      if (!isSkillInterested) {
        await axiosInstance.patch("/users/add-interested-skills", { skill: skillObj.name });
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            ...currentUser,
            interestedSkills: [...currentUser.interestedSkills, skillObj],
          },
        });
      } else {
        await axiosInstance.patch("/users/remove-interested-skills", { skill: skillObj.name });
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            ...currentUser,
            interestedSkills: currentUser.interestedSkills.filter((s) => s.id !== skillId),
          },
        });
      }
    } catch (err) {
      alert("Failed to update interested skills");
      console.log(err);
    }
  };

  // Chat with creator handler
  const chatWithCreator = () => {
    navigate(`/chat?userId=${creator._id}&username=${creator.username}`);
  };

  return (
    <div className="post">
      <div className="postWrapper">
        {/* Top Section */}
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${creator.username}`}>
              <img
                className="postProfileImg"
                src={creator.avatar ? creator.avatar : PF + "assets/person/1.jpg"}
                alt=""
              />
            </Link>
            <span className="postUsername">{creator.username}</span>
            
            <span className="postDate">{timeago.format(post.createdAt)}</span>
          </div>
          <div className="postTopRight">
            {/* Skill name */}
            <span className="postSkillName">
              {post.skillShowcasing?.name || "Skill"}
            </span>
            {/* Three dots menu */}
            <div className="postMenu">
              <MoreVert
                style={{ cursor: "pointer" }}
                onClick={() => setShowMenu((prev) => !prev)}
              />

              {showMenu && (
                <div className="postDropdownMenu">
                  {!isOwnProfile && <button className="menuItem" onClick={chatWithCreator}>Chat with Creator</button>}
                  <button className="menuItem" onClick={handleInterestedSkill}>
                    {isSkillInterested ? "Remove from Interested Skills" : "Add to Interested Skills"}
                  </button>
                  {isOwnProfile && <button className="menuItem deleteMenuItem" onClick={deleteHandler}>Delete Post</button>}
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
        <div className="postTitle">
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
                <ChatBubble className="postCommentIconActive" />
              ) : (
                <ChatBubbleOutline className="postCommentIconInactive" />
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
