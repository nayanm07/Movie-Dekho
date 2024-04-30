import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use (cors ({
    origin : process.nextTick.CORS_ORIGIN,
    credential : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended :true}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import

import userRouter  from './routes/user.routes.js'
import  adminRouter from './routes/admin.routes.js'
import  getData from './routes/getdata.routes.js'

//routes declaration 
app.use("/api/v1/users" , userRouter)
app.use("/api/v1/admin" , adminRouter)
app.use("/api/v1/getData", getData)



export  {app}