import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/AsyncHandler.js"
import {Comment} from "../models/comment.model.js"
import moongoose, {isValidObjectId} from "mongoose"

const addComment = asyncHandler(async (req, res) => {
    const { postId } = req.params
    const user = req.user
    let { content, type } = req.body

    if (!isValidObjectId(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    if(type !== "feedback")
        type = "normal"

    try {
        const comment = await Comment.create({post: postId, content, type, author: user._id})

        if(!comment){
            throw new ApiError(500, "There was a problem while creating the comment")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment created successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while creating the comment")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const user = req.user

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    try {
        const comment = await Comment.findOneAndDelete({_id: commentId, author: user._id})

        if(!comment){
            throw new ApiError(404, "Comment not found")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment deleted successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while deleting the comment")
    }
})

const getPostComments = asyncHandler(async (req, res) => {

    const { postId } = req.params
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10
    };

    if (!isValidObjectId(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }    

    const mongoosePostId = new moongoose.Types.ObjectId(postId)

    try {
        const comments = await Comment.aggregatePaginate(
            Comment.aggregate([
                { 
                    $match: { post: mongoosePostId } 
                },
                { 
                    $sort: { createdAt: -1 } 
                },
                { 
                    $lookup: { 
                        from: "users", 
                        localField: "author", 
                        foreignField: "_id", 
                        as: "author" 
                    } 
                },
                { 
                    $unwind: "$author" 
                },
                { 
                    $project: { 
                        "author.email": 0, 
                        "author.coverImage": 0,
                        "author.bio": 0,
                        "author.location": 0,
                        "author.skills": 0,
                        "author.wantToBeHired": 0,
                        "author.password": 0,
                        "author.refreshToken": 0,
                    }
                }
            ]), options)

        if(!comments){
            throw new ApiError(404, "Comments not found")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, comments, "Comments fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while fetching the comments")
    }
    
})

export {
    addComment,
    deleteComment,
    getPostComments
}