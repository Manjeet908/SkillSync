import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/AsyncHandler.js"
import {Like} from "../models/like.model.js"
import {isValidObjectId} from "mongoose"

const togglePostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params
    const user = req.user

    if (!isValidObjectId(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    try {
        const isLiked = await Like.findOne({post: postId, likedBy: user._id})
    
        if(isLiked){
            const unlike = await Like.findByIdAndDelete(isLiked._id)
    
            if (!unlike) {
                throw new ApiError(500, "There was a problem while unliking")
            }
    
            return res
            .status(200)
            .json(
                new ApiResponse(200, unlike, "Unliked successfully")
            )
        }
        else{
            const like = await Like.create({post: postId, likedBy: user._id})
    
            if(!like){
                throw new ApiError(500, "There was a problem while liking")
            }
    
            return res
            .status(200)
            .json(
                new ApiResponse(200, like, "Liked successfully")
            )
        }
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while liking/unliking")
    }
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const user = req.user

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    try {
        const isLiked = await Like.findOne({comment: commentId, likedBy: user._id})
    
        if(isLiked){
            const unlike = await Like.findByIdAndDelete(isLiked._id)
    
            if (!unlike) {
                throw new ApiError(500, "There was a problem while unliking")
            }
    
            return res
            .status(200)
            .json(
                new ApiResponse(200, unlike, "Unliked successfully")
            )
        }
        else{
            const like = await Like.create({comment: commentId, likedBy: user._id})
    
            if(!like){
                throw new ApiError(500, "There was a problem while liking")
            }
    
            return res
            .status(200)
            .json(
                new ApiResponse(200, like, "Liked successfully")
            )
        }
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while liking/unliking")
    }
    
})

const getLikedPosts = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10 } = req.query;
    
    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10
    };
    const user = req.user


    try {
        const likedPosts = await Like.aggregatePaginate(
            Like.aggregate([
                {
                    $match: {likedBy: user._id, post: {$exists: true}}
                },
                {
                    $lookup: {
                        from: "posts",
                        localField: "post",
                        foreignField: "_id",
                        as: "post"
                    }
                },
                {
                    $unwind: "$post"
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "post.creator",
                        foreignField: "_id",
                        as: "post.creator"
                    }
                },
                {
                    $unwind: "$post.creator"
                },
                {
                    $project: {
                        "post.creator.password": 0,
                        "post.creator.email": 0
                    }
                }
            ], options)
        )

        return res
        .status(200)
        .json(
            new ApiResponse(200, likedPosts, "Liked posts fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while fetching liked posts")
    }
    
})

export {
    togglePostLike,
    toggleCommentLike,
    getLikedPosts
}