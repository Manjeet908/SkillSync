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
    console.log('A user connected:', socket.id, 'User:', socket.user.username)

    // Helper function to generate conversation ID for private chats
    const generateConversationId = (userId1, userId2) => {
        const sortedIds = [userId1.toString(), userId2.toString()].sort();
        return `${sortedIds[0]}_${sortedIds[1]}`;
    };

    // Register user and join appropriate chat rooms
    socket.on("register", (data) => {
        try {
            const userId = socket.user._id.toString();
            
            // Join user's private room for direct messages
            socket.join(`user:${userId}`);
            
            // Join global chat room
            socket.join('global-chat');
            
            // Join all skill chat rooms (users can access all skills)
            for (let i = 0; i < 5; i++) {
                socket.join(`skill-chat:${i}`);
            }
            
            console.log(`User ${socket.user.username} registered and joined chat rooms`);
            
            // Emit successful registration
            socket.emit('registration_success', {
                userId: userId,
                username: socket.user.username,
                rooms: ['global-chat', 'skill-chat:0', 'skill-chat:1', 'skill-chat:2', 'skill-chat:3', 'skill-chat:4']
            });
            
        } catch (error) {
            console.error('Error in register event:', error);
            socket.emit('error', { message: error.message, type: 'registration_error' });
        }
    });

    // Handle global chat messages
    socket.on('send_global_message', (data) => {
        try {
            console.log('Global message from:', socket.user.username, data);
            
            // Broadcast to all users in global chat
            socket.to('global-chat').emit('receive_global_message', {
                sender: {
                    _id: socket.user._id,
                    username: socket.user.username,
                    fullName: socket.user.fullName,
                    avatar: socket.user.avatar
                },
                message: data.message,
                chatType: 'global',
                timestamp: new Date(),
                _id: data.messageId // This will be set by the controller
            });
            
        } catch (error) {
            console.error('Error in send_global_message:', error);
            socket.emit('error', { message: error.message, type: 'global_message_error' });
        }
    });

    // Handle skill-specific chat messages
    socket.on('send_skill_message', (data) => {
        try {
            const { skillId, message, messageId } = data;
            console.log(`Skill message from ${socket.user.username} to skill ${skillId}:`, message);
            
            // Broadcast to all users in this skill chat room
            socket.to(`skill-chat:${skillId}`).emit('receive_skill_message', {
                sender: {
                    _id: socket.user._id,
                    username: socket.user.username,
                    fullName: socket.user.fullName,
                    avatar: socket.user.avatar
                },
                message: message,
                chatType: 'skill',
                skillId: parseInt(skillId),
                timestamp: new Date(),
                _id: messageId
            });
            
        } catch (error) {
            console.error('Error in send_skill_message:', error);
            socket.emit('error', { message: error.message, type: 'skill_message_error' });
        }
    });

    // Handle private messages
    socket.on('send_private_message', (data) => {
        try {
            const { recipientId, message, messageId } = data;
            const senderId = socket.user._id.toString();
            
            console.log(`Private message from ${socket.user.username} to user ${recipientId}`);
            
            // Send to recipient's private room
            socket.to(`user:${recipientId}`).emit('receive_private_message', {
                sender: {
                    _id: socket.user._id,
                    username: socket.user.username,
                    fullName: socket.user.fullName,
                    avatar: socket.user.avatar
                },
                recipient: recipientId,
                message: message,
                chatType: 'private',
                conversationId: generateConversationId(senderId, recipientId),
                timestamp: new Date(),
                _id: messageId
            });
            
        } catch (error) {
            console.error('Error in send_private_message:', error);
            socket.emit('error', { message: error.message, type: 'private_message_error' });
        }
    });

    // Handle message editing
    socket.on('edit_message', (data) => {
        try {
            const { messageId, newMessage, chatType, skillId, recipientId } = data;
            
            const editData = {
                _id: messageId,
                message: newMessage,
                isEdited: true,
                editedAt: new Date(),
                sender: {
                    _id: socket.user._id,
                    username: socket.user.username,
                    fullName: socket.user.fullName,
                    avatar: socket.user.avatar
                }
            };

            // Broadcast edit to appropriate room
            if (chatType === 'global') {
                socket.to('global-chat').emit('message_edited', editData);
            } else if (chatType === 'skill') {
                socket.to(`skill-chat:${skillId}`).emit('message_edited', editData);
            } else if (chatType === 'private') {
                socket.to(`user:${recipientId}`).emit('message_edited', editData);
            }
            
        } catch (error) {
            console.error('Error in edit_message:', error);
            socket.emit('error', { message: error.message, type: 'edit_message_error' });
        }
    });

    // Handle message deletion
    socket.on('delete_message', (data) => {
        try {
            const { messageId, chatType, skillId, recipientId } = data;
            
            const deleteData = {
                _id: messageId,
                sender: {
                    _id: socket.user._id,
                    username: socket.user.username
                }
            };

            // Broadcast deletion to appropriate room
            if (chatType === 'global') {
                socket.to('global-chat').emit('message_deleted', deleteData);
            } else if (chatType === 'skill') {
                socket.to(`skill-chat:${skillId}`).emit('message_deleted', deleteData);
            } else if (chatType === 'private') {
                socket.to(`user:${recipientId}`).emit('message_deleted', deleteData);
            }
            
        } catch (error) {
            console.error('Error in delete_message:', error);
            socket.emit('error', { message: error.message, type: 'delete_message_error' });
        }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
        try {
            const { chatType, skillId, recipientId } = data;
            
            const typingData = {
                userId: socket.user._id,
                username: socket.user.username,
                isTyping: true
            };

            if (chatType === 'private') {
                socket.to(`user:${recipientId}`).emit('user_typing', typingData);
            }
            
        } catch (error) {
            console.error('Error in typing_start:', error);
        }
    });

    socket.on('typing_stop', (data) => {
        try {
            const { chatType, skillId, recipientId } = data;
            
            const typingData = {
                userId: socket.user._id,
                username: socket.user.username,
                isTyping: false
            };

            if (chatType === 'private') {
                socket.to(`user:${recipientId}`).emit('user_typing', typingData);
            }
            
        } catch (error) {
            console.error('Error in typing_stop:', error);
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id, socket.user?.username);
    });

    // Handle socket errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        socket.emit('error', { message: 'An error occurred', type: 'socket_error' });
    });
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