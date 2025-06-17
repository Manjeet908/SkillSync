import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { expandPostSkill } from "../utils/skills.js"

const searchUsers = asyncHandler(async (req, res) => {
    
    const { q } = req.query;

    if (!q) {
        throw new ApiError(400, "Search query is required");
    }

    try {
        const users = await User.aggregate([
            {
                $search: {
                    autocomplete: {
                        query: q,
                        path: "username",
                        fuzzy: {
                            maxEdits: 1,
                            prefixLength: 1
                        }
                    }
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                    bio: 1
                }
            }
        ]);
    
        return res.status(200).json(
            new ApiResponse(200, users, "Users fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Internal Error while searching users")
    }
});

const searchPosts = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        throw new ApiError(400, "Search query is required");
    }

    const posts = await Post.aggregate([
        {
            $search: {
                text: {
                    query: q,
                    path: {
                        wildcard: "*"
                    },
                    fuzzy: {
                        maxEdits: 1,
                        prefixLength: 1
                    }
                }
            }
        },
        {
            $match: {
                isPublic: true
            }
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
                _id: 1,
                title: 1,
                description: 1,
                media: 1,
                skillShowcasing: 1,
                createdAt: 1,
                "creator._id": 1,
                "creator.username": 1,
                "creator.fullName": 1,
                "creator.avatar": 1
            }
        },
        {
            $limit: 10
        }
    ]);

    const resPosts = posts.map(post => expandPostSkill(post));

    return res.status(200).json(
        new ApiResponse(200, resPosts, "Posts fetched successfully")
    );
});

export {
    searchUsers,
    searchPosts
};
