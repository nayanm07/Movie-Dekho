 const user = await  User.findByIdAndUpdate(
    req?._id,
    {
        $set : {
            avatar: newavatar.url
        },
        
    },
    {new : true}

   ).select("-password")
