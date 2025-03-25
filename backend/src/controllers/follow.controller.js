import {isValidObjectId} from "mongoose"
import {Follow} from "../models/follow.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/AsyncHandler.js"


const toggleFollow = asyncHandler(async (req, res) => {

    const { creatorId } = req.params
    const user = req.user

    if (!isValidObjectId(creatorId)) {
        throw new ApiError(400, "Invalid creator ID");
    }

    try {
        const isFollowing = await Follow.findOne({creator: creatorId, follower: user._id})
    
        if(isFollowing){
            const unfollow = await Follow.findByIdAndDelete(isFollowing._id)
    
            if (!unfollow) {
                throw new ApiError(500, "There was a problem while unfollowing")
            }
    
            return res
            .status(200)
            .json(
                new ApiResponse(200, unfollow, "Unfollowed successfully")
            )
        }
        else{
            const follow = await Follow.create({creator: creatorId, follower: user._id})
    
            if(!follow){
                throw new ApiError(500, "There was a problem while following")
            }
    
            return res
            .status(200)
            .json(
                new ApiResponse(200, follow, "Followed successfully")
            )
        }
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while following/unfollowing")
    }
    
})

const toggleEmailNotify = asyncHandler(async (req, res) => {

    const { creatorId } = req.params
    const user = req.user

    if (!isValidObjectId(creatorId)) {
        throw new ApiError(400, "Invalid creator ID");
    }

    try {
        const isFollowing = await Follow.findOne({creator: creatorId, follower: user._id})
    
        if(!isFollowing){
            throw new ApiError(404, "You are not following this user")
        }
    
        isFollowing.emailNotify = !isFollowing.emailNotify
    
        const updatedFollow = await isFollowing.save()
    
        if(!updatedFollow){
            throw new ApiError(500, "There was a problem while updating email notification")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, updatedFollow, "Email notification updated successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while updating email notification")        
    }
})

const getCreatorFollowers = asyncHandler(async (req, res) => {

    const {creatorId} = req.params

    if (!isValidObjectId(creatorId)) {
        throw new ApiError(400, "Invalid creator ID");
    }

    try {
        const followers = await Follow.find({creator: creatorId}).populate("follower")
    
        // only null throws error, empty array is truthy in JS therefore it works fine for 0 size
        if(!followers){
            throw new ApiError(404, "No followers found")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, followers, "Followers found successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while fetching followers")
    }
    
})

const getUserFollowings = asyncHandler(async (req, res) => {

    const {userId} = req.params

    try {
        const followings = await Follow.find({follower: userId}).populate("creator")
    
        // only null throws error, empty array is truthy in JS therefore it works fine for 0 size
        if(!followings){
            throw new ApiError(404, "No followings found")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, followings, "Followings found successfully")
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "There was a problem while fetching followings")
    }
    
    
})

export {
    toggleFollow,
    toggleEmailNotify,
    getCreatorFollowers,
    getUserFollowings
}