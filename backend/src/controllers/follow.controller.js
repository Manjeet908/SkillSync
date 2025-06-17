import {Follow} from "../models/follow.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/AsyncHandler.js"
import {User} from "../models/user.model.js"
import {expandUserSkills} from "../utils/skills.js"

const toggleFollow = asyncHandler(async (req, res) => {

    const { username } = req.params
    const user = req.user

    const creator = await User.findOne({username: username}).select("_id")
    if(!creator){
        throw new ApiError(404, "Creator not found")
    }

    const creatorId = creator._id

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

const toggleNotify = asyncHandler(async (req, res) => {

    const { username } = req.params
    const user = req.user

    const creator = await User.findOne({username: username}).select("_id")
    if(!creator){
        throw new ApiError(404, "Creator not found")
    }
    
    const creatorId = creator._id

    try {
        const isFollowing = await Follow.findOne({creator: creatorId, follower: user._id})
    
        if(!isFollowing){
            throw new ApiError(404, "You are not following this user")
        }
    
        isFollowing.Notify = !isFollowing.Notify
    
        const updatedFollow = await isFollowing.save()
    
        if(!updatedFollow){
            throw new ApiError(500, "There was a problem while updating notification")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, updatedFollow, "notification updated successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while updating notification")        
    }
})

const getCreatorFollowers = asyncHandler(async (req, res) => {

    const { username } = req.params
    const creator = await User.findOne({username: username}).select("_id")
    if(!creator){
        throw new ApiError(404, "Creator not found")
    }
    
    const creatorId = creator._id

    try {
        const followers = await Follow.find({creator: creatorId}).populate("follower")
    
        // only null throws error, empty array is truthy in JS therefore it works fine for 0 size
        if(!followers){
            throw new ApiError(404, "No followers found")
        }

        const resFollowers = followers.map(follow => expandUserSkills(follow.creator));
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, resFollowers, "Followers found successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "There was a problem while fetching followers")
    }
    
})

const getUserFollowings = asyncHandler(async (req, res) => {

    const { username } = req.params

    const user = await User.findOne({username: username}).select("_id")
    if(!user){
        throw new ApiError(404, "user not found")
    }

    const userId = user._id

    try {
        const followings = await Follow.find({follower: userId}).populate("creator")
    
        // only null throws error, empty array is truthy in JS therefore it works fine for 0 size
        if(!followings){
            throw new ApiError(404, "No followings found")
        }

        const resFollowings = followings.map(follow => expandUserSkills(follow.creator));
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, resFollowings, "Followings found successfully")
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "There was a problem while fetching followings")
    }
    
    
})

const checkIsFollowing = asyncHandler(async (req, res) => {
    const { username } = req.params
    const currentUser = req.user

    if (!username?.trim()) {
        throw new ApiError(400, "Username is required")
    }

    const userToCheck = await User.findOne({ username: username.toLowerCase() })
    if (!userToCheck) {
        throw new ApiError(404, "User not found")
    }

    const isFollowing = await Follow.findOne({
        creator: userToCheck._id,
        follower: currentUser._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isFollowing: isFollowing ? true : false },
                "Following status checked successfully"
            )
        )
})

export {
    toggleFollow,
    toggleNotify,
    getCreatorFollowers,
    getUserFollowings,
    checkIsFollowing
}