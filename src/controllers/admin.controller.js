import { asyncHandler } from "../utils/asyncHandler.js"
import { Movie } from "../models/movie.models.js"
import { Show } from "../models/show.models.js"
import { uploadOnCloudinary , deleteFromCloudinary } from "../utils/cloudinary.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js"
import { TopMovie } from "../models/topmovie.models.js"
import { TopShow } from "../models/topShow.models.js"
import { convertToEmbeddedLink } from "../utils/EmbeddedLinkConveter.js"


const getUserData = asyncHandler(async (req, res) => {
    try {

        const users = await User.find({}).select("-password -refreshToken  -watchHistoryMovie -watchHistoryShow -wishListMovie -wishListShow -createdAt -updatedAt -avatar -__v");
       
        return res.status(200).json(new ApiResponse(200, users, "User data retrieved successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while fetching user data");
    }
});

const getMovieData = asyncHandler(async (req, res) => {
    try {

        const movies = await Movie.find({}).select("movieName movieGenres movieReating");
       
        return res.status(200).json(new ApiResponse(200, movies, "movies data retrieved successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while fetching movies data");
    }
});

const getShowData = asyncHandler(async (req, res) => {
    try {

        const show = await Show.find({}).select("-password -refreshToken  -watchHistoryMovie -watchHistoryShow -wishListMovie -wishListShow -createdAt -updatedAt -avatar -__v");
       
        return res.status(200).json(new ApiResponse(200, show, "Show data retrieved successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while fetching show data");
    }
});


const deleteUser = asyncHandler(async (req, res) => {
    
    const   { rowId } = req.body;

    
    
    console.log(rowId);

    const user = await User.findByIdAndDelete(rowId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
})


const deleteMovie = asyncHandler(async (req , res) => {
   
    const   { rowId } = req.body;
    
    const movie  = await Movie.findByIdAndDelete(rowId);
    
    

    if (!movie) {
        throw new ApiError(404, "Movie not found")
    }

    const moviePoster = deleteFromCloudinary(movie.moviePoster)

    return res.status(200).json(new ApiResponse(200, null, "Movie deleted successfully"));

     
})



const deleteShow = asyncHandler(async (req , res) => {
   
    const   { rowId } = req.body;

    const show  = await Show.findByIdAndDelete(rowId)

    if (!show) {
        throw new ApiError(404, "show not found")
    }

    const showPoster = deleteFromCloudinary(show.showPoster)


    return res.status(200).json(new ApiResponse(200, null, "show deleted successfully"));

     
})



const uploadMovie = asyncHandler( async(req, res) => {

  

    const { movieName, movieGenres, movieReating, movieAbout, numMovie, trailerLink, releaseDate ,movieCertificate , movieLink } = req.body ;

if (!movieName || !movieGenres || !movieReating || !movieAbout || !numMovie || !trailerLink || !releaseDate || !movieCertificate || !movieLink) {
    throw new ApiError(400, "All fields are required");
}



    const posterlocalPath = req.file?.path

   

    const movielocalFile = 'https://res.cloudinary.com/dggcrjjv8/video/upload/v1712228161/h2wzuwuslgdrcteei4lh.mp4'
    if (!posterlocalPath) {
        throw new ApiError(409, "Poster file required")  
    }
    
    const poster = await uploadOnCloudinary(posterlocalPath)

    if (!poster) {
        throw new ApiError(409, "Poster file required")
    }


    const EmbeddedLink = convertToEmbeddedLink(trailerLink);

    if (!EmbeddedLink) {
        throw new ApiError(410, "invailed link")
    }


    const movie = await Movie.create({
        movieName, movieGenres, movieReating, movieAbout, numMovie, releaseDate ,movieCertificate, movieLink,
        movieFile: movielocalFile,
        trailerLink : EmbeddedLink,
        moviePoster : poster.url

    })

    const uplodedmovie = await Movie.findById(movie._id)
       
    if (!uplodedmovie) {
        throw new ApiError(500, "some thing is wrong while uploaded")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, uplodedmovie , "movie successfuly uploaded")
    )

})

const uploadShow = asyncHandler( async(req, res) => {

    const { showName, showGenres, showReating, showAbout, numberofSession,numberofEpisode , trailerLink } = req.body ;

    if (!showName || !showGenres || !showReating || !showAbout || !numberofSession || !numberofEpisode || !trailerLink) {
        throw new ApiError(400, "All fields are required");
    }

    const posterlocalPath = req.file?.path
    const showlocalFile = '../Backend/public/video/video.mp4'
    if (!posterlocalPath) {
        throw new ApiError(409, "Poster file required")  
    }

    const poster = await uploadOnCloudinary(posterlocalPath)

    if (!poster) {
        throw new ApiError(409, "Poster file required")
    }

    const show = await Show.create({
        showName,
        showGenres,
        showReating,
        showAbout,
        numberofSession,
        numberofEpisode,
        trailerLink,
        showFile: showlocalFile,
        showPoster : poster.url

    })

    const uplodedshow = await Show.findById(show._id)
       
    if (!uplodedshow) {
        throw new ApiError(500, "some thing is wrong while uploaded")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, uploadMovie , "show successfuly uploaded")
    )

})


//set top movie 
const setTopMoive  = asyncHandler (async (req, res) =>{
    const   { rowId } = req.body;

    if (!rowId) {
        throw new ApiError(401, " rowid is required")
    }

    const topMovie = await TopMovie.findOne({movieId : rowId })

  

    if (topMovie) {
        throw new ApiError(402, "Movie already added in Top")
    }

    const movieTop = await TopMovie.create({
        movieId : rowId 
    })

    const addedTopList = await TopMovie.findById(movieTop._id)

    if (!addedTopList) {
        throw new ApiError(403, "somting is worng")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(200, "Added in Top List")
    )

})


//set top Show
const setTopShow  = asyncHandler (async (req, res) =>{
    const   { rowId } = req.body;

    if (!rowId) {
        throw new ApiError(401, " rowid is required")
    }

    const topShow = await TopShow.find({showId : rowId })

    if (topShow) {
        throw new ApiError(402, " Movie already added in Top")
    }

    const showTop = await TopShow.create({
        showId : rowId 
    })

    const addedTopList = await TopShow.findById(showTop._id)

    if (addedTopList) {
        throw new ApiError(403, "somting is worng")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(200, "Added in Top List")
    )

})

// Get top movies data also movie 
//not working

const getTopMovieData = asyncHandler(async (req, res) => {
    try {
        const topMovies = await TopMovie.aggregate([
            {
                $lookup: {
                    from: "movies",
                    localField: "movieId",
                    foreignField: "_id",
                    as: "movieDetails"
                }
            },
            {
                $unwind: "$movieDetails"
            },
            {
                $project: {
                    
                    "_id": "$_id",
                    "movieName": "$movieDetails.movieName",
                    "movieGenres": "$movieDetails.movieGenres",
                    "movieReating": "$movieDetails.movieReating"
                    // Add more fields as needed
                }
            }
        ]);
        return res.status(200).json({
            status: 200,
            data: topMovies,
            message: "Top Movie data retrieved successfully"
        });
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Error while fetching top movies data");
    }
});


// Get top Show
const getTopShowData = asyncHandler(async (req, res) => {
    try {
        const topShows = await TopShow.aggregate([
            {
                $lookup: {
                    from: "shows",
                    localField: "showId",
                    foreignField: "_id",
                    as: "showDetails"
                }
            },
            {
                $project: {
                    "_id": 1, // Include _id field of top show
                    "showDetails.showName": 1, // Include title field of show
                    "showDetails.genre": 1, // Include genre field of show
                    "showDetails.releaseDate": 1 // Include releaseDate field of show
                    // Add more fields as needed
                }
            }
        ]);

        return res.status(200).json({
            status: 200,
            data: topShows,
            message: "Top shows data retrieved successfully"
        });
    } catch (error) {
        throw new ApiError(500, "Error while fetching top shows data");
    }
});


const removeTopMovie = asyncHandler(async (req , res) => {
   
    const   { rowId } = req.body;
    
    const movie  = await TopMovie.findByIdAndDelete(rowId);
    
    

    if (!movie) {
        throw new ApiError(404, "Movie not found")
    }

  

    return res.status(200).json(new ApiResponse(200, null, "Movie movie successfully"));

     
});


const removeTopShow = asyncHandler(async (req , res) => {
   
    const   { rowId } = req.body;
    
    const show  = await TopShow.findByIdAndDelete(rowId);
    
    

    if (!show) {
        throw new ApiError(404, "show not found")
    }

  

    return res.status(200).json(new ApiResponse(200, null, "show remove successfully"));

     
});



// set trinding movie
const setTrendingMovie = asyncHandler(async (req, res) => {
    const { rowId } = req.body;

    //check allready trending

    const trendingMovie = await Movie.findOne({ trending: true, _id: rowId });

    if (trendingMovie) {    
        throw new ApiError(402, "Movie already added in trending");
    }


    const movie = await Movie.findByIdAndUpdate(rowId, { trending: true });

    if (!movie) {
        throw new ApiError(404, "Movie not found");
    }

    return res.status(200).json(new ApiResponse(200, movie, "Movie set as trending successfully"));
});



const setTrendingShow = asyncHandler(async (req, res) => {
    const { rowId } = req.body;

    const show = await Show.findByIdAndUpdate(rowId, { trending: true });

    if (!show) {
        throw new ApiError(404, "Show not found");
    }

    return res.status(200).json(new ApiResponse(200, show, "Show set as trending successfully"));
});

//remove trending movie
const removeTrendingMovie = asyncHandler(async (req, res) => {
    const { rowId } = req.body;

    const movie = await Movie.findByIdAndUpdate(rowId, { trending: false });

    if (!movie) {
        throw new ApiError(404, "Movie not found");
    }

    return res.status(200).json(new ApiResponse(200, movie, "Movie removed from trending successfully"));
});


//remove tending show
const removeTrendingShow = asyncHandler(async (req, res) => {
    const { rowId } = req.body;

    const show = await Show.findByIdAndUpdate(rowId, { trending: false });

    if (!show) {
        throw new ApiError(404, "Show not found");
    }

    return res.status(200).json(new ApiResponse(200, show, "Show removed from trending successfully"));
});


const getTrendingMovieData = asyncHandler(async (req, res) => {
  
    const trendingMovies = await Movie.find({ trending: true }).select("movieName movieGenres movieReating");

    return res.status(200).json(new ApiResponse(200, trendingMovies, "Trending movies data retrieved successfully"));
});

//get Trending show
const getTrendingShowData = asyncHandler(async (req, res) => {
    const trendingShows = await Show.find({ trending: true }).select("showName showPoster releaseDate");

    return res.status(200).json(new ApiResponse(200, trendingShows, "Trending shows data retrieved successfully"));
});





//get Trending movie





export {
    getUserData,
    getMovieData,
    getShowData,
    uploadMovie,
    uploadShow,
    deleteMovie,   
    deleteShow,
    deleteUser,
    setTopMoive,
    getTopMovieData,
    setTopShow,
    getTopShowData,
    removeTopMovie,
    removeTopShow,
    setTrendingMovie,
    setTrendingShow,
    removeTrendingMovie,
    removeTrendingShow,
    getTrendingMovieData,
    getTrendingShowData

}