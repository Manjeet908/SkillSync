import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { mapSkill, mapSkillArray, expandUserSkills } from "../utils/skills.js"
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const registerUser = asyncHandler(async(req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images - avatar, coverImage
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, email, fullName, password, bio, location, knownSkills = [], interestedSkills = [], wantToBeHired } = req.body

    // Validate skills arrays
    if (!Array.isArray(knownSkills) || !Array.isArray(interestedSkills)) {
        throw new ApiError(400, "knownSkills and interestedSkills must be arrays")
    }

    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if( 
        [username, email, fullName, password].some((field) => (
        field?.trim() === "" || !field))
    ) {
        throw new ApiError(400, `username, email, fullName, password all are required`)
    }
    
    const existingUser = await User.findOne({
        $or: [ {username}, {email} ]
    })
    
    if(existingUser) {
        throw new ApiError(409, "User with same email or username already exists")
    }
    
    let coverImage = "", avatar = ""
    if(avatarLocalPath) {
        avatar = await uploadOnCloudinary(avatarLocalPath)
    }
    if(coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }

    const userLocation = location ? { type: "Point", coordinates: location } : { type: "Point", coordinates: [0, 0] };


    const user = await User.create({
        username,
        email,
        fullName,
        avatar: avatar?.url || "http://localhost:8000/images/default_avatar.jpg",
        coverImage: coverImage?.url || "http://localhost:8000/images/default_coverImage.jpg",
        bio: bio || "",
        location: userLocation,
        knownSkills: mapSkillArray(knownSkills),
        interestedSkills: mapSkillArray(interestedSkills),
        wantToBeHired: wantToBeHired || false,
        password        
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "Internal error while registering new user")
    }

    return res.status(200).json(
        new ApiResponse(200, expandUserSkills(createdUser), "User Created Successfully")
    )

})

const generateAccessAndRefreshToken = async(userId) => {

    try {

        const user = await User.findById(userId)
        
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
    
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")        
    }
    
}

const secureCookieWithExpiry = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
}

const loginUser = asyncHandler(async(req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and referesh token
    // send cookie

    const { email, username, password } = req.body
    
    if(!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    if(!password) {
        throw new ApiError(400, "password field cannot be empty")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404, "user does not exists")
    }

    const isValidPassword = await user.isPasswordCorrect(password)
    if(!isValidPassword) {
        throw new ApiError(400, "Incorrect Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken", accessToken, secureCookieWithExpiry)
    .cookie("refreshToken", refreshToken, secureCookieWithExpiry)
    .json(
        new ApiResponse(
            200,
            expandUserSkills(loggedInUser),
            "user logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    // get user
    // remove refresh token from user, cookie

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const secureCookie = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    }

    return res
    .status(200)
    .clearCookie("accessToken", secureCookie)
    .clearCookie("refreshToken", secureCookie)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

const refreshAccessToken = asyncHandler(async(req, res) => {

    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.headers["x-refresh-token"]
        if(!incomingRefreshToken)
            throw new ApiError(400, "Refresh Token Not Found")
    
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedRefreshToken._id)
        if(!user)
            throw new ApiError(400, "Invalid refresh token")
    
        if(user?.refreshToken !== incomingRefreshToken)
            throw new ApiError(400, "Refresh token expired")
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, secureCookieWithExpiry)
        .cookie("refreshToken", refreshToken, secureCookieWithExpiry)
        .json(
            new ApiResponse(
                200, 
                {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
                "Access Token Refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid refresh Token")
    }

})

const changePassword = asyncHandler(async(req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect)
        throw new ApiError(400, "Invalid Old Password")

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password Updated Successfully"
        )
    )

})

const getCurrentUser = asyncHandler(async(req, res) => {
    // if user is logged out, handle undefined at frontend
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            expandUserSkills(req.user),
            "Current User Sent"
        )
    )
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const { fullName, email, bio, wantToBeHired } = req.body

    const user = await User.findById(req.user?._id).select("-password")

    if(!user) {
        throw new ApiError(400, "Unable to fetch User")
    }

    if(fullName) {
        user.fullName = fullName
    }
    if(email) {
        user.email = email
    }
    if(bio) {
        user.bio = bio
    }
    if(wantToBeHired !== undefined) {
        user.wantToBeHired = wantToBeHired
    }

    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, expandUserSkills(user), "Account details updated successfully"))
})

const updateAvatar = asyncHandler(async(req, res) => {
    
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath)
        throw new ApiError(404, "Avatar File Not Found")

    const newAvatar = await uploadOnCloudinary(avatarLocalPath)
    if(!newAvatar)
        throw new ApiError(500, "Internal Error while uploading avatar on Cloudinary")

    const user = await User.findById(req.user?._id)
    if(!user)
        throw new ApiError(400, "Invalid User Id")

    if(user.avatar)
        await deleteFromCloudinary(user.avatar)

    user.avatar = newAvatar.url
    await user.save({validateBeforeSave: false})

    const userObject = user.toObject()
    delete userObject.password

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            expandUserSkills(userObject),
            "Avatar Updated Successfully"
        )
    )

})

const updateCoverImage = asyncHandler(async(req, res) => {
    
    const coverImageLocalPath = req?.file?.path
    if(!coverImageLocalPath)
        throw new ApiError(404, "Cover Image File Not Found")

    const newCoverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!newCoverImage)
        throw new ApiError(500, "Internal Error while uploading Cover Image on Cloudinary")

    const user = await User.findById(req.user._id)
    if(!user)
        throw new ApiError(400, "Invalid User Id")

    if(user.coverImage)
        await deleteFromCloudinary(user.coverImage)

    user.coverImage = newCoverImage.url
    await user.save({validateBeforeSave: false})

    const userObject = user.toObject()
    delete userObject.password

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            expandUserSkills(userObject),
            "Cover Image Updated Successfully"
        )
    )

})

const updateWantToBeHired = asyncHandler(async(req, res) => {
    const { wantToBeHired } = req.body

    if(wantToBeHired === undefined)
        throw new ApiError(400, "wantToBeHired field is required")

    const user = await User.findById(req.user._id).select("-password")
    if(!user)
        throw new ApiError(500, "Unable to fetch User Id")

    if(user.wantToBeHired !== wantToBeHired) {
        user.wantToBeHired = wantToBeHired
        await user.save({validateBeforeSave: false})
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            expandUserSkills(user),
            "wantToBeHired field updated successfully"
        )
    )
})

const addToKnownSkills = asyncHandler(async(req, res) => {
    const { skill } = req.body

    if(!skill)
        throw new ApiError(400, "skill field is required")

    const user = await User.findById(req.user._id).select("-password")
    if(!user)
        throw new ApiError(500, "Unable to fetch User Id")

    const skillId = mapSkill(skill);
    if(!user.knownSkills.includes(skillId)) {
        user.knownSkills.push(skillId)
        await user.save({validateBeforeSave: false})
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            expandUserSkills(user),
            "Skill added to known skills successfully"
        )
    )
})

const removeFromKnownSkills = asyncHandler(async(req, res) => {
    const { skill } = req.body
    if(!skill)
        throw new ApiError(400, "skill field is required")
    
    const user = await User.findById(req.user._id).select("-password")
    if(!user)
        throw new ApiError(500, "Unable to fetch User Id")
    
    const skillId = mapSkill(skill);
    if(user.knownSkills.includes(skillId)) {
        user.knownSkills = user.knownSkills.filter(s => s !== skillId)
        await user.save({validateBeforeSave: false})
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            expandUserSkills(user),
            "Skill removed from known skills successfully"
        )
    )
})

const addToInterestedSkills = asyncHandler(async(req, res) => {
    const { skill } = req.body

    if(!skill)
        throw new ApiError(400, "skill field is required")

    const user = await User.findById(req.user._id).select("-password")
    if(!user)
        throw new ApiError(500, "Unable to fetch User Id")

    const skillId = mapSkill(skill);
    if(!user.interestedSkills.includes(skillId)) {
        user.interestedSkills.push(skillId)
        await user.save({validateBeforeSave: false})
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            expandUserSkills(user),
            "Skill added to interested skills successfully"
        )
    )
})

const removeFromInterestedSkills = asyncHandler(async(req, res) => {
    const { skill } = req.body
    if(!skill)
        throw new ApiError(400, "skill field is required")
    
    const user = await User.findById(req.user._id).select("-password")
    if(!user)
        throw new ApiError(500, "Unable to fetch User Id")
    
    const skillId = mapSkill(skill);
    if(user.interestedSkills.includes(skillId)) {
        user.interestedSkills = user.interestedSkills.filter(s => s !== skillId)
        await user.save({validateBeforeSave: false})
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            expandUserSkills(user),
            "Skill removed from interested skills successfully"
        )
    )
})

const updateLocation = asyncHandler(async(req, res) => {
    const { location } = req.body

    if(!location || !Array.isArray(location) || location.length !== 2)
        throw new ApiError(400, "location field is required")

    const user = await User.findById(req.user._id).select("-password")
    if(!user)
        throw new ApiError(500, "Unable to fetch User Id")

    user.location = { type: "Point", coordinates: location }
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            expandUserSkills(user),
            "Location updated successfully"
        )
    )
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "User with this email does not exist")
    }

    const resetToken = jwt.sign(
        { 
            email: user.email
        }, 
        process.env.RESET_PASSWORD_SECRET, 
        { 
            expiresIn: process.env.RESET_PASSWORD_EXPIRY
        }
    )
    // provide frontend url instead of api/v1/users/reset-password
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`

    const mailOptions = {
        to: user.email,
        subject: "Password Reset",
        text: `Forgot your password? Click here to generate a new password: ${resetURL}\nIf you didn't request a password reset, please ignore this email.`,
        html: `
            <p>Forgot your password?</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetURL}">Reset Password</a>
            <p>If you didn't request a password reset, please ignore this email.</p>
        `
    };

    const emailStatus = await sendEmail(mailOptions)

    if(!emailStatus) {
        throw new ApiError(500, "Internal error while sending email")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, emailStatus, "Token sent to email")
    );
})

/*
frontend:
const { token } = useParams()
const res = await axios.patch(
    `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/reset-password/${token}`,
    { password }
)
*/

const resetPassword = asyncHandler(async (req, res) => {
    // add reset passwrod token clearing
    const { token } = req.params
    const { password } = req.body

    let decoded
    try {
        decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET)
    } catch (error) {
        throw new ApiError(400, "Token is invalid or has expired")
    }

    const user = await User.findOne({ 
        email: decoded.email 
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.password = password;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));
})

const getUserProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const userProfile = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "creator",
                as: "followers"
            }
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "follower",
                as: "followings"
            }
        },
        {
            $addFields: {
                followersCount: {
                    $size: "$followers"
                },
                followingsCount: {
                    $size: "$followings"
                },
                isFollowed: {
                    $cond: {
                        if: {$in: [userId, "$followers.follower"]},
                        then: true,
                        else: false
                    }
                },
                // testing required                
                canEmailNotify: {
                    $eq: [
                        {
                            $size: {
                                $filter: {
                                    input: "$followers",
                                    as: "f",
                                    cond: {
                                        $and: [
                                            { $eq: ["$$f.follower", userId] },
                                            { $eq: ["$$f.emailNotify", true] }
                                        ]
                                    }
                                }
                            }
                        },
                        1
                    ]
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                followersCount: 1,
                followingsCount: 1,
                isFollowed: 1,
                avatar: 1,
                coverImage: 1,
                // Only project email if the requesting user is viewing their own profile
                email: {
                    $cond: [
                        { $eq: [ "$username", req.user?.username ] },
                        "$email",
                        "$$REMOVE"
                    ]
                },
                bio: 1,
                location: 1,
                knownSkills: 1,
                interestedSkills: 1,
                wantToBeHired: 1,
                canEmailNotify: 1
            }
        }
    ])


    if (!userProfile?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, expandUserSkills(userProfile[0]), "User channel fetched successfully")
    )
})


const suggestUsers = asyncHandler(async (req, res) => {
    
    const currentUser = req.user;
    if(!currentUser)
        throw new ApiError(500, "Unable to fetch current user in suggestUser");

    const knownSkills = currentUser.knownSkills || [];
    const interestedSkills = currentUser.interestedSkills || [];

    const suggestedUsers = await User.aggregate([
        {
            $match: {
                _id: { $ne: req.user?._id }, // Exclude current user
                $or: [
                    { knownSkills: { $in: knownSkills } },
                    { interestedSkills: { $in: interestedSkills } }
                ]
            }
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "creator",
                as: "followers"
            }
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "follower",
                as: "followings"
            }
        },
        {
            $addFields: {
                followersCount: { $size: "$followers" },
                followingsCount: { $size: "$followings" },
                isFollowed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$followers.follower"] },
                        then: true,
                        else: false
                    }
                },
                // Calculate relevance score based on matching skills
                relevanceScore: {
                    $add: [
                        {
                            $size: {
                                $setIntersection: ["$knownSkills", knownSkills]
                            }
                        },
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $setIntersection: ["$interestedSkills", interestedSkills]
                                    }
                                },
                                0.5 // Give less weight to interested skills matches
                            ]
                        }
                    ]
                }
            }
        },
        {
            $match: {
                isFollowed: false
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                bio: 1,
                knownSkills: 1,
                interestedSkills: 1,
                wantToBeHired: 1,
                followersCount: 1,
                followingsCount: 1,
                isFollowed: 1,
                relevanceScore: 1
            }
        },
        {
            $sort: { relevanceScore: -1 }
        },
        {
            $limit: 10
        }
    ]);

    const resUsers = suggestedUsers.map(user => {
        return expandUserSkills(user);
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                resUsers,
                "Suggested users fetched successfully"
            )
        );
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    updateWantToBeHired,
    addToKnownSkills,
    removeFromKnownSkills,
    addToInterestedSkills,
    removeFromInterestedSkills, 
    updateLocation,
    forgotPassword,
    resetPassword,
    getUserProfile,
    suggestUsers
}