import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
const { Aggregate } = mongoose;

const generateAccessAndRefreshTooken = async(userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, error?.message || "some went wrong while generatin referesh and access token")

    }
}


const registerUser = asyncHandler( async(req, res) => {
    

    //get user details from frontend
    const {fullname, email, password }  = req.body

    console.log(fullname)
    
     // valication - not empty
    if ([fullname, email, password].some((field) => field?.trim() === "")) 
    {
        throw new ApiError(400, "All filds are required")
    }

    // check if user is already exists : email
   const existedUser = await User.findOne({
        $or : [{ email }]
    })

    if (existedUser) {
        throw new ApiError(409, "email alrady exist")

    }

    const defaultAvatar = 'https://res.cloudinary.com/dggcrjjv8/image/upload/v1708571228/Web%20image/defaultavatr.webp'

//     //check for images , ckeck profile
//     const avatarLocalpath = req.files?.avatar[0]?.path;

//     if (!avatarLocalpath) {
//         throw new ApiError(409, "Avatar file required")
//     }

//     //upload then cloudinary , profile
//    const avatar = await uploadOnCloudinary(avatarLocalpath)

//    if (!avatar) {
//     throw new ApiError(409, "Avatar file required")
//    }
   
   //create user object -- create entry in db
   const user = await User.create({
    fullname,
    avatar: defaultAvatar,
    email,
    password
   })

    
    //remove password and refresh token filds from response
   const createdUser = await User.findById(user._id).select("-password -refreshToken  -watchHistoryMovie -watchHistoryShow -wishListMovie -wishListShow")


   //check for user creation
   if (!createdUser) {
     throw new ApiError(500, "some thing is wrong while creating user")
   }


   
    // return response
   return res.status(201).json(
    new ApiResponse(200,createdUser , "user rigister successfuly")
   )





})




//login code
const loginUser = asyncHandler(async (req, res) =>{

    const {email, password }  = req.body
    console.log(email);

    if (!email) {
        throw new ApiError(400, "username or email is required")
    }



     //find user
    const user = await  User.findOne({ $or: [{email}]})

    if (!user) {
        throw new ApiError(406, "email dose not exist")
    }

    //password ckeck

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "password invaid")
    }

    //access and refresh token
    const {accessToken , refreshToken} = await generateAccessAndRefreshTooken(user._id)

     //send cookie
     const logedInUser = await User.findById(user._id).select("-password -refreshToken  -watchHistoryMovie -watchHistoryShow -wishListMovie -wishListShow")
        const options = {
            httpOnly : true,
            secure : true ,
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken , options)
        .json(
            new ApiResponse (
                200,
                {
                    user : logedInUser, accessToken, refreshToken
                },
                "user loged in seccucesfully"

            )
        )
})

//logout
const logoutUser = asyncHandler(async(req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken : 1
            }
        },
        {
            new : true 
        }
    )

    const options = {
        httpOnly : true,
        secure : true ,
    }


    return res 
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})


//get current user
 const getCurrentUser = asyncHandler( async(req  , res ) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken  -watchHistoryMovie -watchHistoryShow -wishListMovie -wishListShow")

    if (!user) {
        throw new ApiError(401, "unauthorized request")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshTooken(user._id)


    const options = {
        httpOnly : true,
        secure : true ,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken , options)
    .json(
        new ApiResponse (
            200,
            {
                user : user, accessToken, refreshToken
            },
            "user loged in seccucesfully"

        )
    )
 })



const refreshAccessToken = asyncHandler( async (req , res ) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

try {
    
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "invalide refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken ) {
            throw new ApiError(401, "refresh token are expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken ,newrefreshToken} = await generateAccessAndRefreshTooken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse (
                200,
                {accessToken , refreshToken: newrefreshToken}, "Access token refreshed"
            )
        )
} catch (error) {
    throw new ApiError(401, error?.message || "invead refreshtoken")
}
})


const  changeCurrentPassword = asyncHandler(async(req , res) => {
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect)
    {
        throw new ApiError(400, "Invalid old Password")
    }

    user.password = newPassword
    user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change Succusefully"))


})


const updateAvatar = asyncHandler(async(req, res) =>{
    const avatarLocalPath = req.file?.path
   if(!avatarLocalPath){
     throw new ApiError(400, "Avatar is missing ")
   }

    newavatar = await uploadOconstnCloudinary(avatarLocalPath)

   if (!newavatar.url) {
        throw new ApiError(400, "Error while uploding avatar ")  
   }
 
   //delete on cloudanary
   
   const user = await  User.findByIdAndUpdate(
    req.user?._id,
    {
        $set : {
            avatar: newavatar.url
        },
        
    },
    {new : true}

   ).select("-password")

   return res
   .status(200)
   .json(
    new ApiResponse(200, user, "Avatar image updated")
   )

})

const getWatchHistory = asyncHandler(async (req , res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "movies",
                localField: "watchHistoryMovie",
                foreignField: "_id",
                as: "watchHistoryMovie",
                pipeline: [
                    {
                        $project: {
                            _id : 1,
                            moviePoster:1,
                            movieName:1,
                            movieReating:1,
                            movieGenres:1,
                            movieCertificate:1,
                            releaseDate:1
                        }
                    }
                ]
                
            }
        },
    ])

    return res 
    .status(200)
    .json(
        new ApiResponse (
            200,
            user[0].watchHistoryMovie,
            "watch History Show and Movie"

            
        )
    )
})

const getWishList =  asyncHandler( async (req , res) => {

  

    const user = await User.aggregate([
        {
            $match: {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from:"shows",
                localField: "wishListShow",
                foreignField: "_id",
                as: "wishListShow",
                pipeline: [
                    {
                        $project: {
                            _id : 1,
                            showPoster:1,
                            showName:1,
                            showAbout:1,
                            showReating:1
                        }
                    }
                ]
            }
        },
        {
            $lookup : {
                from:"movies",
                localField: "wishListMovie",
                foreignField: "_id",
                as: "wishListMovie",
                pipeline: [
                    {
                        $project: {
                            _id : 1,
                            moviePoster:1,
                            movieName:1,
                            movieReating:1,
                            movieGenres:1,
                            movieCertificate:1,
                            releaseDate:1
                        }
                    }
                ]
            }
        }
    ])

    
    return res
    .status(200)
    .json(
        new ApiResponse (
            200,
            user[0].wishListMovie,
            "with list  Show and Movie"
        )
    ) 

})



const addWishListMovie = asyncHandler (async (req , res) => {

    const { movieId } = req.params;

    // check is movies already in wish list
    const isMovieAlreadyInWishList = await User.findOne({
        _id: req.user._id,
        wishListMovie: {
            $in : [movieId]
        }
    })

    if (isMovieAlreadyInWishList) {
        throw new ApiError(400, "Movie already in wish list");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $push: {
                wishListMovie: movieId
            }
        },
        {
            new: true
        }
    )

    if (!user) {
        throw new ApiError(401, "some this is wong");
    }

    return res
    .status(200)
    .json(
        new ApiResponse (
            200,
            "Movie added to wish list"
        )
    )

})


const addWatchHistoryMovie = asyncHandler (async (req , res) => {   

    const { movieId } = req.params;

    // check is movies already in watch history
    const isMovieAlreadyInWatchHistory = await User.findOne({
        _id: req.user._id,
        watchHistoryMovie: {
            $in : [movieId]
        }
    })


    if (isMovieAlreadyInWatchHistory) {

        await User.findByIdAndUpdate(
            req.user._id,
            {
                $pull: {
                    watchHistoryMovie: movieId
                }
            }
        )
    }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $push: {
                    watchHistoryMovie: {
                        $each: [movieId],
                        $position: 0
                    }
                }
            },
            {
                new: true
            }
        )

        if (!user) {
            throw new ApiError(401, "some this is wong");
        }   


        return res
        .status(200)
        .json(  
            new ApiResponse (
                200,
                "Movie added to watch history"
            )   
        )



    })



    const removeWishListMovie = asyncHandler (async (req , res) => {
        const { movieId } = req.params; 

        const user = await User.findByIdAndUpdate(
            req.user._id,   
            {
                $pull: {
                    wishListMovie: movieId
                }
            },
            {
                new: true
            }
        )

        if (!user) {
            throw new ApiError(401, "some this is wong");
        }


        return res
        .status(200)
        .json(
            new ApiResponse (
                200,
                "Movie removed from wish list"
            )
        ) 

    })  


    const removeWatchHistoryMovie = asyncHandler (async (req , res) => {
        const { movieId } = req.params;

        const user = await User.findByIdAndUpdate(  
            req.user._id,
            {
                $pull: {
                    watchHistoryMovie: movieId
                }
            },
            {
                new: true
            }
        )

        if (!user) {
            throw new ApiError(401, "some this is wong");   
        }   


        return res
        .status(200)
        .json(
            new ApiResponse (
                200,
                "Movie removed from watch history"
            )
        )   

    })


   






export {
    getCurrentUser,
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAvatar,
    getWatchHistory,
    getWishList,
    addWishListMovie,
    addWatchHistoryMovie,
    removeWishListMovie,
    removeWatchHistoryMovie,

}