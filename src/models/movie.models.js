
import mongoose, {Schema}  from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const movieSchema = new Schema ({
    movieFile : 
    [{
        type : String,
        required :true
    }],

    moviePoster : 
    {
        type : String,
        required :true
    },

    movieName : 
    {
        type : String,
        required :true
    },

    movieLink : 
    {
        type : String,
        required :true
    },

    movieGenres : 
    {
        type : String,
        required :true
    },

    movieReating : 
    {
        type : String,
        required :true
    },

    movieAbout : 
    {
        type : String,
        required :true
    },

    numMovie :
    {
        type : Number,
        required : true
    },

    trailerLink : 
    {
        type : String,
        required :true
    },

    trending : {
        type : Boolean,
        default : false
    },

    releaseDate : {
        type : Date,
        require : true
    },

    movieCertificate : {
        type: String,
        require : true
    }

    

    
}, {timestamps : true})

movieSchema.plugin(mongooseAggregatePaginate)

export const Movie = mongoose.model("Movie" , movieSchema)

