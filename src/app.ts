import express from "express"
import emailRouter from "./routes/email.routes.js"
import { errorHandler } from "./middlewares/errorHandler.middleware.js"
import path from "node:path"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from 'cors'
import jobRouter from "./routes/job.routes.js"
import userRouter from "./routes/user.routes.js"
import { envConfig } from "./config/envConfig.js"

const app = express()
const allowedOrigins = envConfig()

app.use(cors({ origin: function(origin, callback) {
    if(!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
    } else {
        callback(new Error('Not allowed by CORS:' + origin))
    }
}, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.set('view engine', 'ejs');
app.set('views', path.join("src", "views"))

app.use("/api/auth", authRouter)
app.use("/api/email", emailRouter)
app.use("/api/user", userRouter)
app.use("/api/job", jobRouter)

app.use(errorHandler)

export { app }