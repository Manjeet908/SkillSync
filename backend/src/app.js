import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import chatRouter from "./routes/chat.routes.js"
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use("/chats",chatRouter);

// routes
import userRouter from "./routes/user.routes.js"
import followRouter from "./routes/follow.routes.js"
import postRouter from "./routes/post.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"
import notificationRouter from "./routes/notification.routes.js"
import searchRouter from "./routes/search.routes.js"
import skillRouter from "./routes/skill.routes.js"

app.use("/users", userRouter)
app.use("/follow", followRouter)
app.use("/posts", postRouter) 
app.use("/likes", likeRouter)
app.use("/comments", commentRouter)
app.use("/notify", notificationRouter)
app.use("/search", searchRouter)
app.use("/skills", skillRouter)

export default app
