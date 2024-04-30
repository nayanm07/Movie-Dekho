
import mongoose, {Schema}  from "mongoose";

const topMovieSchema =  new Schema ({
   
    movieId :
    {
        type : Schema.Types.ObjectId,
        ref : "Movie"
    }
}, {timestamps :true})

export const TopMovie = mongoose.model("TopMovie" , topMovieSchema)