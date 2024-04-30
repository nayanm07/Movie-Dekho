
import mongoose, {Schema}  from "mongoose";

const topShowSchema =  new Schema ({
    
    showId :
    {
        type : Schema.Types.ObjectId,
        ref : "Show"
    }
}, {timestamps :true})

export const TopShow = mongoose.model("TopShow" , topShowSchema)