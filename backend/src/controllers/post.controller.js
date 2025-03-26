import { Post } from '../models/post.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPost = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body

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
        category,
        media: fileUrls,
        creator: req.user._id
    })
    
    return res
    .status(201)
    .json(
        new ApiResponse(201, 'Post created', newPost)
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
        new ApiResponse(200, updatedPost, 'Post updated')
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
            await cloudinary.uploader.destroy(file);
        }
    }

    const deletedPost = await Post.findByIdAndDelete(id)

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedPost, 'Post deleted')
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
        new ApiResponse(200, post, 'Post found')
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
                $project: {
                    "creator.password": 0,
                    "creator.email": 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]), 
        options
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200, posts, "Posts fetched")
    );
})

// getUserPosts to get unpublished/published posts of the owner
const getUserPosts = asyncHandler(async (req, res) => {
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
                $project: {
                    "creator.password": 0,
                    "creator.email": 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]), 
        options
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200, posts, "Posts fetched")
    );
})

export {
    createPost,
    togglePublish,
    deletePost,
    getPostById,
    getAllPosts,
    getUserPosts
}