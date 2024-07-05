import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
    
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(400, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler( async(req, res) => {
    // get user details from frontend
    // validate them
    // check is user already exists
    // create user object & create entry in db
    // remove password and refreshToken from response
    // check for user creation
    // return res

    const { name, email, phoneNumber, password, role } = req.body;
    // console.log(req.body)
    if(
        [name, email, phoneNumber, password, role].some((field) => {
            if (typeof field === 'number') {
                field = field.toString();
            }
            return field.trim() === "";
        }) 
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{phoneNumber}, {email}]
    })

    if (existedUser) {
        throw new ApiError(400, "User with this name or email already exists")
    }

    const user = await User.create({
        name,
        email,
        phoneNumber,
        password,
        role,
    })

    // if (!user) {
    //     throw new ApiError(400, "Something went wrong")
    // } you dont need to check user here as first u need to check created user and remove password & refreshTOken to give response 

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering User")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
}) 
//  backend/src/controllers/user.controller.js
const loginUser = asyncHandler(async(req, res) => {
    // get user details from frontend
    // validate them
    // find the user
    // check password
    // generate access & refresh Tokens
    // return res & send cookie

    const { email, phoneNumber, password } = req.body;

    if(!email && !phoneNumber){
        throw new ApiError(400, "Email or Phone Number is required")
    }

    const user = await User.findOne({
        $or: [{email}, {phoneNumber}]
    })

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400, "Password is not Valid")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {user: loggedInUser, accessToken, refreshToken},
            "User loggedIn Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
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

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged Out Successfully")
    )
})

const updateUserDetails = asyncHandler(async(req, res) => {
    const { name, email, phoneNumber } = req.body;

    if(!name && !email && !phoneNumber){
        throw new ApiError(400, "Some fields are required!!")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                name,
                email: email,
                phoneNumber,
            }
        },
        {new: true}
    ).select("-password")

    if(!user){
        throw new ApiError(400, "Something went wrong while Updating user details")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, user, "User details updated successfully!!")
    )
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200)
    .json(
        new ApiResponse(200, req.user, "User fetched Successfully")
    )
})

const changePassword = asyncHandler(async(req, res) => {
    // to change the password - will implement if needed
})

export {
    registerUser,
    loginUser,
    logoutUser,
    updateUserDetails,
    getCurrentUser,
}