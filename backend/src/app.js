import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

// app.use(cors())

app.use(express.json({limit: "16kb"})) 
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import routes
import userRoutes from "./routes/user.routes.js"
import movieRoutes from "./routes/movie.routes.js"
import bookingRoutes from "./routes/booking.routes.js"
import screenRoutes from "./routes/screen.routes.js"

// routes declaration
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/movie", movieRoutes)
app.use("/api/v1/booking", bookingRoutes)
app.use("/api/v1/screen", screenRoutes)

export { app }