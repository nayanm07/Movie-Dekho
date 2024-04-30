
import mongoose, {Schema}  from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const showSchema = new Schema ({
    showFile : 
    {
        type : String,
        required :true
    },

    showPoster : 
    {
        type : String,
        required :true
    },

    showName : 
    {
        type : String,
        required :true
    },

    showGenres : 
    {
        type : String,
        required :true
    },

    showReating : 
    {
        type : String,
        required :true
    },

    showAbout : 
    {
        type : String,
        required :true
    },

    numberofSession :
    {
        type : Number,
        required : true
    },

    numberofEpisode :
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
    }
    
}, {timestamps : true})

showSchema.plugin(mongooseAggregatePaginate)

export const Show = mongoose.model("Show" , showSchema)

