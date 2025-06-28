import 'dotenv/config'
import connectDB from "./db/index.js";
import app from './app.js'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { User } from './models/user.model.js'
import { ApiError } from './utils/ApiError.js';
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import { log } from 'console';

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true
    },
    pingTimeout: 60000, 
    pingInterval: 25000 
})

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
    try {
        // Get cookies from handshake headers
        const cookies = cookie.parse(socket.handshake.headers.cookie || '')
        const accessToken = cookies.accessToken

        if (!accessToken) {
            return next(new ApiError(401, "Authentication error: No token provided"))
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decoded._id).select("-password -refreshToken")
        
        if (!user) {
            return next(new ApiError(401, "Authentication error: User not found"))
        }

        socket.user = user
        next()
    } catch (error) {
        next(new ApiError(401, "Authentication error: Invalid token"))
    }
})

io.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error)
})

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)

    socket.on("register", (userId) => {
        try {
            // Verify that the userId matches the authenticated user
            if (userId !== socket.user._id.toString()) {
                throw new Error(`Unauthorized: User ID mismatch, ${userId}, ${socket.user._id.toString()}`)
            }
            
            socket.join(userId)
            console.log("User registered:", userId)
        } catch (error) {
            console.error('Error in register event:', error)
            socket.emit('error', error.message)
        }
    })

    socket.on("send_message", (data) => {
        log('Message received:', data)
        io.emit("receive_message", data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
    })

    socket.on('error', (error) => {
        console.error('Socket error:', error)
        socket.emit('error', 'An error occurred')
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