import 'dotenv/config'
import connectDB from "./db/index.js";
import app from './app.js'
import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true
    }
})

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)

    socket.on("register", (userId) => {
        socket.join(userId);
        console.log("User registered", userId)
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
    })
})

connectDB()
.then(() => {
    const port = process.env.PORT || 8000
    httpServer.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })

    httpServer.on('error', (error) => {
        console.error('Server error:', error);
        process.exit(1);
    });
})
.catch((error) => {
    console.error("Connection error in DB", error);
})

export { io }