import "./post.css";
import { MoreVert, Favorite, FavoriteBorder } from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import * as timeago from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Post({ post }) {
  const [like, setLike] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [creator, setCreator] = useState(post.creator);
  const PF = import.meta.env.VITE_APP_PUBLIC_FOLDER;
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    setIsLiked(post.isLiked || false);
  }, [currentUser._id, post.isLiked]);

  useEffect(() => {
    setCreator(post.creator)
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

  const isVideo = (url) => {
    return url.match(/\.(mp4|webm|ogg)$/i);
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${creator.username}`}>
              <img
                className="postProfileImg"
                src={
                    creator.avatar ? creator.avatar : PF + "assets/person/1.jpg"
                }
                alt=""
              />
            </Link>
            <span className="postUsername">{creator.username}</span>
            <span className="postDate">{timeago.format(post.createdAt)}</span>
          </div>
          <div className="postTopRight">
            <MoreVert />
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post?.description}</span>
          {post.media && post.media.length > 0 && (
            <div className="postMedia">
              {post.media.map((mediaUrl, index) => (
                <div key={index} className="mediaItem">
                  {isVideo(mediaUrl) ? (
                    <video 
                      className="postVideo"
                      controls
                      src={mediaUrl}
                    />
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
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            {isLiked ? (
              <Favorite
                className="likeIcon"
                onClick={likeHandler}
                style={{ color: "red" }}
              />
            ) : (
              <FavoriteBorder
                className="likeIcon"
                onClick={likeHandler}
              />
            )}
            <span className="postLikeCounter">{like} people like it</span>
          </div>
          {/* TODO */}
          <div className="postBottomRight">
            <span className="postCommentText">{post.comment} comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}