import { Post } from '../models/post.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { notifyOnNewPost } from './notification.controller.js';
import { Notification } from '../models/notification.model.js';
import { Like } from '../models/like.model.js';
import { Comment } from '../models/comment.model.js';
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { mapSkill, expandPostSkill, expandUserSkills } from "../utils/skills.js"
import mongoose from 'mongoose';

const createPost = asyncHandler(async (req, res) => {
    const { title, description, skillShowcasing } = req.body

    if(!title)
        throw new ApiError(400, 'Title is required')

    const files = req.files.media;
    const fileUrls = [];

    if(Array.isArray(files)) {

        if(files.length > 5) 
            throw new ApiError(400, 'You can upload a maximum of 5 files')

        for (const file of files) {
            const result = await uploadOnCloudinary(file.path);
            fileUrls.push(result.url);
        }
    }

    const newPost = await Post.create({
        title,
        description,
        skillShowcasing: mapSkill(skillShowcasing),
        media: fileUrls,
        creator: req.user._id,
        creatorUsername: req.user.username
    })

    notifyOnNewPost(newPost, req.user)
    
    return res
    .status(201)
    .json(
        new ApiResponse(201, expandPostSkill(newPost), 'Post created')
    )
})

const togglePublish = asyncHandler(async (req, res) => {
    const { id } = req.params

    if(!id)
        throw new ApiError(400, 'Post id is required')

    const post = await Post.findById(id)

    if(!post)
        throw new ApiError(404, 'Post not found')

    if(post.creator.toString() !== req.user._id.toString())
        throw new ApiError(403, 'You are not authorized to perform this action')

    post.isPublic = !post.isPublic
    const updatedPost = await post.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, expandPostSkill(updatedPost), 'Post updated')
    )
})

const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params

    if(!id)
        throw new ApiError(400, 'Post id is required')

    const post = await Post.findById(id)
    if(!post)
        throw new ApiError(404, 'Post not found')

    if(post.creator.toString() !== req.user._id.toString())
        throw new ApiError(403, 'You are not authorized to perform this action')

    const files = post.media

    if(Array.isArray(files) && files.length > 0) {
        for (const file of files) {
            await deleteFromCloudinary(file);
        }
    }

    const deletedPost = await Post.findByIdAndDelete(id)
    await Notification.deleteMany({contentId: post._id});
    await Like.deleteMany({post: post._id});
    await Comment.deleteMany({post: post._id});

    return res
    .status(200)
    .json(
        new ApiResponse(200, expandPostSkill(deletedPost), 'Post deleted')
    )

})

const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params

    if(!id)
        throw new ApiError(400, 'Post id is required')

    const post = await Post.findById(id)

    if(!post)
        throw new ApiError(404, 'Post not found')

    if(!post.isPublic)
        throw new ApiError(403, 'Post is not public')

    return res
    .status(200)
    .json(
        new ApiResponse(200, expandPostSkill(post), 'Post found')
    )
})

const getAllPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10
    };

    const posts = await Post.aggregatePaginate(
        Post.aggregate([ 
            {
                $match: { isPublic: true }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creator"
                }
            },
            {
                $unwind: "$creator"
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "post",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    isLiked: {
                        $in: [ req.user._id, "$likes.likedBy" ]
                    }
                }
            },
            {
                $project: {
                    "creator.password": 0,
                    "creator.email": 0,
                    "likes": 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]), 
        options
    );

    const resPosts = posts.docs.map((post) => { 
        const postCreator = expandUserSkills(post.creator);
        const resPost = expandPostSkill(post)
        resPost.creator = postCreator
        return resPost
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200, resPosts, "Posts fetched")
    );
})

// getUserPosts to get unpublished/published posts of the owner
const getCurrentUserPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10
    };

    const posts = await Post.aggregatePaginate(
        Post.aggregate([ 
            {
                $match: { creator: req.user?._id }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creator"
                }
            },
            {
                $unwind: "$creator"
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "post",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    isLiked: {
                        $in: [ req.user._id, "$likes.likedBy" ]
                    }
                }
            },
            {
                $project: {
                    "creator.password": 0,
                    "creator.email": 0,
                    "likes": 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]), 
        options
    );

    const resPosts = posts.docs.map((post) => { 
        const postCreator = expandUserSkills(post.creator);
        const resPost = expandPostSkill(post)
        resPost.creator = postCreator
        return resPost
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200, resPosts, "Posts fetched")
    );
})

const getUserPosts = asyncHandler(async (req, res) => {

    const { id: creatorUserId } = req.params
    
    if (!creatorUserId) {
        throw new ApiError(400, "User ID is required")
    }

    let creatorId;
    try {
        creatorId = new mongoose.Types.ObjectId(creatorUserId)
    } catch (error) {
        throw new ApiError(400, "Invalid user ID format")
    }
    
    const { page = 1, limit = 10 } = req.query;

    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10
    };

    const posts = await Post.aggregatePaginate(
        Post.aggregate([ 
            {
                $match: { creator: creatorId }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creator"
                }
            },
            {
                $unwind: "$creator"
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "post",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    isLiked: {
                        $in: [ req.user._id, "$likes.likedBy" ]
                    }
                }
            },
            {
                $project: {
                    "creator.password": 0,
                    "creator.email": 0,
                    "likes": 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]), 
        options
    );

    const resPosts = posts.docs.map((post) => { 
        const postCreator = expandUserSkills(post.creator);
        const resPost = expandPostSkill(post)
        resPost.creator = postCreator
        return resPost
    });
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, resPosts, "Posts fetched")
    );
})

export {
    createPost,
    togglePublish,
    deletePost,
    getPostById,
    getAllPosts,
    getCurrentUserPosts,
    getUserPosts
}