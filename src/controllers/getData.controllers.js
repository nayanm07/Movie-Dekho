import { asyncHandler } from "../utils/asyncHandler.js"
import { Movie } from "../models/movie.models.js"
import { Show } from "../models/show.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { TopMovie } from "../models/topmovie.models.js"

const getMovies = asyncHandler(async (req, res) => {
    const movies = await Movie.find({}).select(" movieCertificate movieReating movieName movieGenres moviePoster movieAbout releaseDate")
  
    if (!movies) {
        throw new ApiError(404, "No movies found");
    }

    return res.status(200).json({ status: 200, data: movies, message: "Movies found" }) // new ApiResponse(200, movies, "Movies found")
})







//get top movies

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
                    
                    "_id": "$movieDetails._id",
                    "movieName": "$movieDetails.movieName",
                    "movieGenres": "$movieDetails.movieGenres",
                    "movieReating": "$movieDetails.movieReating",
                    "movieCertificate": "$movieDetails.movieCertificate",
                    "movieGenres": "$movieDetails.movieGenres",
                    "moviePoster": "$movieDetails.moviePoster",
                    "movieAbout": "$movieDetails.movieAbout",
                    
                    
                   
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



const getTrendingMovieData = asyncHandler(async (req, res) => {
    console.log("getTrendingMovieData");
    const trendingMovies = await Movie.find({ trending: true }).select(" movieCertificate movieReating movieName movieGenres moviePoster movieAbout releaseDate ");

    return res.status(200).json(new ApiResponse(200, trendingMovies, "Trending movies data retrieved successfully"));
});



// get movie details by id
const getMovieById = asyncHandler(async (req, res) => {
    const { movieId } = req.params;



   if (!movieId) {
       throw new ApiError(400, "Movie id is required");
   }

   const movie = await Movie.findById(movieId);

  

   if (!movie) {
       throw new ApiError(404, "Movie not found");
   }

    return res.status(200).json(new ApiResponse(200, movie, "Movie details retrieved successfully"));
});

const getMovieWithGenre = asyncHandler(async (req, res) => {
    const { genre } = req.params; 
    
    console.log(genre);

    if (!genre) {
        throw new ApiError(402, "Genre is required");
    }

    const moviesWithGenre = await Movie.find({ movieGenres: genre }).select(" movieCertificate movieReating movieName movieGenres moviePoster releaseDate ");

    if (!moviesWithGenre) {
        throw new ApiError(404, "Movies not found");
    }

    return res.status(200).json(new ApiResponse(200, moviesWithGenre, "Movies with genre retrieved successfully"));
})



const searchMovie = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        throw new ApiError(400, "Query is required");
    }

    const movies = await Movie.find({
        $or: [
            { movieName: { $regex: query, $options: 'i' } },
            { movieGenres: { $regex: query, $options: 'i' } }
        ]
    }).select(" movieCertificate movieReating movieName movieGenres moviePoster releaseDate ");

    if (!movies) {
        throw new ApiError(404, "Movies not found");
    }

    return res.status(200).json(new ApiResponse(200, movies, "Movies searched successfully"));
})





export { 
    getMovies,
    getTopMovieData,
    getTrendingMovieData,
    getMovieById,
    getMovieWithGenre,
    searchMovie
    
    
}


