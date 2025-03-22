import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

    const { username, email, fullName, password, bio, location, skills, wantToBeHired } = req.body


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
        field?.trim() === ""))
    ) {
        throw new ApiError(400, "All fields are required")
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
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        bio: bio || "",
        location: userLocation,
        skills: skills || [],
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
        new ApiResponse(200, createdUser, "User Created Successfully")
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

const secureCookie = {
    httpOnly: true,
    secure: true
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
        throw new ApiError(401, "Incorrect Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken", accessToken, secureCookie)
    .cookie("refreshToken", refreshToken, secureCookie)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
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

    return res
    .status(200)
    .clearCookie("accessToken", secureCookie)
    .clearCookie("refreshToken", secureCookie)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

const refreshAccessToken = asyncHandler(async(req, res) => {

    try {
        const incomingRefreshToken = req.cookies?.refreshToken
        if(!incomingRefreshToken)
            throw new ApiError(401, "Unauthrised access")
    
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedRefreshToken._id)
        if(!user)
            throw new ApiError(401, "Invalid refresh token")
    
        if(user?.refreshToken !== incomingRefreshToken)
            throw new ApiError(401, "Refresh token expired")
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, secureCookie)
        .cookie("refreshToken", refreshToken, secureCookie)
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
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }

})


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}