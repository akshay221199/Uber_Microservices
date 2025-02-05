import User from "../models/User.js"
import { AsyncHandler } from "../utility/AsyncHandler.js"
import { ApiError } from "../utility/ApiError.js"
import { ApiResponse } from "../utility/ApiResponse.js"
import { uploadOnCloudinary } from "../utility/Couldinary.js"


const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();  // Call the method to generate the access token
        const refreshToken = user.generateRefreshToken(); // Call the method to generate the refresh token

        user.refreshToken = refreshToken; // Assign the generated refresh token to the user
        user.accessToken = accessToken;
        await user.save({ validateBeforeSave: false }); // Save the user document

        return { refreshToken, accessToken };

    } catch (error) {
        throw new ApiError(401, 'Failed to generate Refresh and Access Tokens');
    }
};

const createUser = AsyncHandler(async (req, res, next) => {
    const { name, email, contact, password } = req.body;

    const existedUser = await User.findOne({
        $or: [{ contact }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // const avatarLocalpath = req.files?.avatar[0]?.path;
    // console.log('avatar local path uber', avatarLocalpath);
    
    // let coverImgLocalpath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImgLocalpath = req.files.coverImage[0].path
    // }
    // console.log('coverimage localpath uber', coverImgLocalpath);
    

    // if (!avatarLocalpath) {
    //     throw new ApiError(404, 'Avatar is required');
    // }
    // if (!coverImgLocalpath) {
    //     throw new ApiError(404, 'Cover Image is required');
    // }
    // const avatar = await uploadOnCloudinary(avatarLocalpath);

    // const coverImg= await uploadOnCloudinary(coverImgLocalpath);


    // if (!avatar) {
    //     throw new ApiError(404, 'Avatar is Not Available');
    // }
    // if (!coverImg) {
    //     throw new ApiError(404, 'CoverImage is Not Available');
    // }

    const CreateUser = await User.create({
        name,
        email,
        contact,
        password
        // avatar,
        // coverImage
    });

    const createdUser = await User.findById(CreateUser._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(createdUser._id);
    // const accessToken = createdUser.generateAccessToken();
    // const refreshToken = createdUser.generateRefreshToken();
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(createdUser._id); // Generate tokens using the function


    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, "User registered Successfully", createdUser)
        )
});


const userLogin = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(401, 'Email and Password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, 'Invalid username or password');
    }

    const passwordCheck = await user.isPasswordCorrect(password);
    if (!passwordCheck) {
        throw new ApiError(401, 'Invalid username or password');
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken -contact');

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    // Setting cookies
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Sending response
    return res.status(201).json(new ApiResponse(201, 'Successfully Logged In', loggedInUser));
});

const logoutUser = AsyncHandler(async (req, res) => {
    const userId = req.user?._id; // Ensure req.user is populated by middleware
    console.log('logged out user id', userId);
    
    if (!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    // Unset the refresh token in the database
    const user = await User.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Define cookie options
    const cookieOptions = {
        httpOnly: true,
        sameSite: 'None',
    };

    // Clear cookies and send response
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.send('Logged out successfully');

    return res.status(200).json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const updateAccountDetails = AsyncHandler(async(req, res) => {
    const {name, email, contact} = req.body

        console.log(req.body);
        

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name,
                contact,
                email
            }
        },
        {new: true}
        
    ).select("-password")
    
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const changeCurrentPassword = AsyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
});

const getCurrentUser = AsyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})


const deleteAvatar = AsyncHandler(async(req, res)=>{

    const avatarLocalPath  = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(401, 'Avatar Not Found');
    }
    const avatar = await User.findByIdAndUpdate(req.user?._id, {
        $set:{
            avatar:null
        }
    },
    {new:true}
).select("-password");

});

const updateUserAvatar = AsyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar?.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar?.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    );

})

const profile = AsyncHandler(async (req, res) => {
    try {
        // Assuming `req.user` contains the authenticated user's ID from middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ ok: false, message: 'Unauthorized: No user ID provided' });
        }

        // Fetch the user's profile from the database
        const user = await User.findById(userId).select('-password'); // Exclude the password field

        if (!user) {
            return res.status(404).json({ ok: false, message: 'User not found' });
        }

        // Send the user's profile data
        res.status(200).json({
            ok: true,
            user,
        });
    } catch (error) {
        // The AsyncHandler will handle the error and send a 500 status
        throw new Error('Error retrieving user profile');
    }
});

export { createUser,profile, userLogin, logoutUser, updateAccountDetails, changeCurrentPassword, getCurrentUser, deleteAvatar, updateUserAvatar };