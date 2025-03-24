import { Post } from '../models/post.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const createPost = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body

    if(!title)
        throw new ApiError(400, 'Title is required')

    const files = req.files;
    const fileUrls = [];

    if(Array.isArray(files)) {

        if(files.length > 5) 
            throw new ApiError(400, 'You can upload a maximum of 5 files')

        for (const file of files) {
            const result = await uploadToCloudinary(file.path);
            fileUrls.push(result.secure_url);
        }
    }
        
    const newPost = await Post.create({
        title,
        description,
        category,
        files: fileUrls,
        creator: req.user._id
    })
    
    return res
    .status(201)
    .json(
        new ApiResponse(201, 'Post created', newPost)
    )
})

const hidePost = asyncHandler(async (req, res) => {
    const { id } = req.params

    if(!id)
        throw new ApiError(400, 'Post id is required')

    const post = await Post.findByIdAndUpdate(
        id,
        { isPublic: false },
        { new: true }
    )

    if(!post)
        throw new ApiError(404, 'Post not found')

    return res
    .status(200)
    .json(
        new ApiResponse(200, post, 'Post hidden')
    )

})

const showPost = asyncHandler(async (req, res) => {
    const { id } = req.params

    if(!id)
        throw new ApiError(400, 'Post id is required')

    const post = await Post.findByIdAndUpdate(
        id,
        { isPublic: true },
        { new: true }
    )

    if(!post)
        throw new ApiError(404, 'Post not found')

    return res
    .status(200)
    .json(
        new ApiResponse(200, post, 'Post published')
    )

})

const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params

    if(!id)
        throw new ApiError(400, 'Post id is required')

    const post = await Post.findByIdAndDelete(id)

    if(!post)
        throw new ApiError(404, 'Post not found')

    return res
    .status(200)
    .json(
        new ApiResponse(200, post, 'Post deleted')
    )

})

const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params

    if(!id)
        throw new ApiError(400, 'Post id is required')

    const post = await Post.findById(id)

    if(!post)
        throw new ApiError(404, 'Post not found')

    return res
    .status(200)
    .json(
        new ApiResponse(200, post)
    )
})

const getAllPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10
    };

    const postAggregate = Post.aggregate([]);
    const posts = await Post.aggregatePaginate(postAggregate, options);

    return res.status(200).json(new ApiResponse(200, posts));
})



export {
    createPost,
    hidePost,
    showPost,
    deletePost,
    getPostById,
    getAllPosts
}