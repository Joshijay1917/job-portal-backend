import { errorHandler } from "./middlewares/errorHandler.middleware.js"
import express from "express"
import emailRouter from "./routes/email.routes.js"
import path from "node:path"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from 'cors'
import jobRouter from "./routes/job.routes.js"
import userRouter from "./routes/user.routes.js"
import savedJobPostRouter from "./routes/savedPosts.routes.js"

const app = express()
const isProduction = process.env.NODE_ENV === "production"

app.use(cors({ origin: function(origin, callback) {
    if(!origin) return callback(null, true);

    if (isProduction) {
        // Only allow production frontend
        if (origin === "https://job-portal-frontend-nine-blue.vercel.app") {
            return callback(null, true);
        }
    } else {
        // Allow all preview deployments
        if (origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }
    }

    callback(new Error("Not allowed by CORS"));
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
app.use("/api/saved-jobs", savedJobPostRouter)

app.use(errorHandler)

export { app }