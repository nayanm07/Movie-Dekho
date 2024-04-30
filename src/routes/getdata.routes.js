import { Router } from "express"
import { upload } from "../middlewares/multer.middlewares.js"
import { getMovieById, getMovieWithGenre, getMovies,  getTopMovieData, getTrendingMovieData, searchMovie } from "../controllers/getdata.controllers.js";



const router = Router();

router.route("/getMovies").get(getMovies);

router.route("/getTopMovies").get(getTopMovieData);

router.route("/getTrendingMovies").get(getTrendingMovieData);

router.route("/getMovie/:movieId").get(getMovieById);


router.route("/search").get(searchMovie);


router.route("/getMovieWithGenre/:genre").get(getMovieWithGenre);


export default router 