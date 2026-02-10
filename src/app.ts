import express from "express"
import userRouter from "./routes/user.routes.js"
import emailRouter from "./routes/email.routes.js"
import { errorHandler } from "./middlewares/errorHandler.middleware.js"
import path from "node:path"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from 'cors'
import jobRouter from "./routes/job.routes.js"

const app = express()

app.use(express.json())
app.use(cors({ origin: ['http://localhost:5173', process.env.CORS!], credentials: true }))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.set('view engine', 'ejs');
app.set('views', path.join("src", "views"))

app.use("/api/auth", authRouter)
app.use("/api/email", emailRouter)
app.use("/api/job", jobRouter)

app.use(errorHandler)

export { app }