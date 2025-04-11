import React from 'react'
import './Post.css'
import { MoreVert } from '@mui/icons-material'
function Post() {
  return (
    <div className='post'>
        <div className="postWrapper">
            <div className="postTop">
                <div className="postTopLeft">
                    <img className='postProfileImg' src="/assets/person/1.jpg" alt="" />
                    <span className="postUsername">Abdul Kalam</span>
                    <span className="postDate">5 mins ago</span>
                </div>
                <div className="postTopRight">
                    <MoreVert />
                </div>
            </div>
            <div className="postCentre">
                <span className="postText">Memories of LSG vs MI</span>
                <img className='postImg' src="/assets/post/2.jpeg" alt="" />
            </div>
            <div className="postBotton">
                <div className="postBottomLeft">
                    <img className='likeIcon' src="/assets/post/like.png" alt="" />
                    <img className='likeIcon' src="/assets/post/like2.png" alt="" />
                    <span className="postLikeCounter">21 people like it</span>
                </div>
                <div className="postBottomRight">
                    <span className="postCommentText">9 comments</span>
                </div>
            </div>

        </div>

    </div>
  )
}

export default Post