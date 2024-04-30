import { Router } from "express"
import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWTAdmin } from "../middlewares/auth.middlewares.js";
import {  deleteMovie, deleteShow, deleteUser, getMovieData, getShowData, getTopMovieData, getTopShowData, getTrendingMovieData, getTrendingShowData, getUserData, removeTopMovie, removeTopShow, removeTrendingMovie, removeTrendingShow, setTopMoive, setTopShow, setTrendingMovie, setTrendingShow, uploadMovie, uploadShow } from "../controllers/admin.controller.js";

const router = Router();

// movie upload
router.route("/uploadMovie").post(verifyJWTAdmin , upload.single("moviePoster"),uploadMovie )

//delete movie
router.route("/deleteMovie").post(verifyJWTAdmin , deleteMovie )

//getMovie
router.route("/getMovies").get(verifyJWTAdmin, getMovieData)



//getShows
router.route("/getShows").get(verifyJWTAdmin, getShowData)

//show upload
router.route("/uploadShow").post(verifyJWTAdmin , upload.single("showPoster"),uploadShow )

//delete show
router.route("/deleteShow").post(verifyJWTAdmin , deleteShow )



//getUser
router.route("/getUser").get(verifyJWTAdmin, getUserData)

//delete user
router.route("/deleteUser").post(verifyJWTAdmin , deleteUser )


//setTopmovie 
router.route("/setTopMovie").post(verifyJWTAdmin , setTopMoive)

//get top movies
router.route("/getTopMovie").get(verifyJWTAdmin , getTopMovieData)

//remove top movie
router.route("/removeTopMovie").post(verifyJWTAdmin , removeTopMovie)



//setTopshow 
router.route("/setTopShow").post(verifyJWTAdmin , setTopShow)

//get top show
router.route("/getTopShow").get(verifyJWTAdmin , getTopShowData)

//remove top show
router.route("/removeTopMovie").post(verifyJWTAdmin , removeTopShow)



//set trening movie
router.route("/setTrendingMovie").post(verifyJWTAdmin , setTrendingMovie)

//set trending Show
router.route("/setTrendingShow").post(verifyJWTAdmin , setTrendingShow)

//remove trending movie 
router.route("/removeTrendingMovie").post(verifyJWTAdmin , removeTrendingMovie)

//remove trending show
router.route("/removeTrendingShow").post(verifyJWTAdmin , removeTrendingShow)

//get Trending movie
router.route("/getTrendingMovies").get(verifyJWTAdmin , getTrendingMovieData)

//get trending show
router.route("/getTrendingShow").get(verifyJWTAdmin , getTrendingShowData)






export default router 