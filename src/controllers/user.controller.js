import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import { User } from "../modals/user.model.js";  // Ensure the correct path
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateRefreshToken()
        const refreshToken = await user.generateAccessToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Cant generate token");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body;

    if (!fullName || !email || !userName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    if (await User.findOne({ $or: [{ userName }, { email }] })) {
        throw new ApiError(409, "User with email or username already exists.");
    }

    const avatarPath = req.files?.avatar?.[0]?.path;
    const coverPath = req.files?.coverImage?.[0]?.path;
    if (!avatarPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarPath);
    console.log(avatar);

    if (!avatar) {
        throw new ApiError(500, "Avatar image could not be uploaded");
    }

    let coverImageUrl;
    if (coverPath) {
        const coverImage = await uploadOnCloudinary(coverPath);
        if (coverImage) {
            coverImageUrl = coverImage.url;
        }
    }

    const user = await User.create({
        fullName,
        email,
        userName: userName.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImageUrl || "",
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Error registering user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "Successfully registered")
    );
});


const logInUser = asyncHandler(async (req, res) => {
    const { email, password, userName } = req.body;
    console.log(email, password, userName);

    if (!userName && !email) {
        throw new ApiError(401, "Email or user name required");
    }

    const user = await User.findOne({
        $or: [{ email }, { userName }]
    });

    if (!user) {
        throw new ApiError(402, "Account not found");
    }

    const verified = await user.isPasswordCorrect(password);

    if (!verified) {
        throw new ApiError(403, "Password is incorrect");
    }
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

    user.password = null;
    user.refreshToken = null;

    // Set cookie options
    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201,
                { user: user, accessToken },
                "You have successfully logged in"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    })
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, "user logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const userToken = req.cookies.refreshToken || req.body.requestToken
    if (!userToken) { throw new ApiError(403, "Unauthorized request") }
    const decodedToken = await jwt.verify(userToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id).select("-password")
    if (!user) { throw new ApiError(400, "Invalid Refresh Token") }
    if (userToken !== user?.refreshToken) {
        throw new ApiError(400, "Refresh token expired please login")
    }
    // Set cookie options
    const options = {
        httpOnly: true,
        secure: true
    };
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{accessToken,refreshToken},"Token successfully refreshed"))
})

const resetPassword = asyncHandler(async(req, res) => {
    const {oldPassword , newPassword } = req.body;
    const user =await User.findById(req.user?._id)
    const verified = user.isPasswordCorrect(oldPassword)

    if(!verified) {
        throw new ApiError(400,"not a valid password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res.status(201).json(new ApiResponse(201,"Password changed"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(new ApiResponse(201,req.user,"Current user data"))
})

const updateUserDetails = asyncHandler(async(req, res) => {
    const { fullName , email } = req.body;
    if( !fullName && !email) {
        throw new ApiError(400,"Email or name required")
    }
    const user = User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,email
            }
        },{new : true}
    ).select("-password")
    return res.status(200).json(new ApiResponse(201,user,"User data updated successfully"))
})

const updateAvatar = asyncHandler(async(req, res) => {
    const avatar = req.file?.path;

    if(!avatar){
        throw new ApiError(400,"File is required")
    }
    const avatarUrl = await uploadOnCloudinary(avatar)
    if(!avatarUrl.url){
        throw new ApiError(400,"Avatar is not uploaded correctly")
    }

    const updatedData = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:avatarUrl.url
        }
    },{new:true}).select("-password")

    return res.status(200).json(new ApiResponse( 201, updatedData ,"User data updated successfully"))
})



export { registerUser, logInUser, logoutUser, refreshAccessToken , resetPassword , getCurrentUser , updateUserDetails , updateAvatar };