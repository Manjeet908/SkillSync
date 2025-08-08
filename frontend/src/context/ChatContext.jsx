import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';
import { AuthContext } from './AuthContext';
import axiosInstance from '../api/axios';

const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children, privateChatUser = null }) => {
    const socket = useSocket();
    const { user } = useContext(AuthContext);
    
    // Chat state
    const [currentRoom, setCurrentRoom] = useState({ type: 'global', id: null, name: 'Global Chat' });
    const [messages, setMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Refs for managing timeouts
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch chat rooms
    const fetchChatRooms = async () => {
        try {
            const response = await axiosInstance.get('/chats/rooms');
            setChatRooms(response.data.data);
        } catch (error) {
            console.error('Failed to fetch chat rooms:', error);
            setError('Failed to load chat rooms');
        }
    };

    // Fetch messages for current room
    const fetchMessages = async (roomType, roomId = null, page = 1, limit = 50) => {
        setIsLoading(true);
        setError(null);
        
        try {
            let endpoint = '';
            if (roomType === 'global') {
                endpoint = `/chats/global?page=${page}&limit=${limit}`;
            } else if (roomType === 'skill') {
                endpoint = `/chats/skill/${roomId}?page=${page}&limit=${limit}`;
            } else if (roomType === 'private') {
                endpoint = `/chats/private/${roomId}?page=${page}&limit=${limit}`;
            }
            
            const response = await axiosInstance.get(endpoint);
            const newMessages = response.data.data.messages || response.data.data;
            
            if (page === 1) {
                setMessages(newMessages);
            } else {
                setMessages(prev => [...newMessages, ...prev]);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            setError('Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    };

    // Send message
    const sendMessage = async (messageText) => {
        if (!messageText.trim() || !user) return;

        try {
            let endpoint = '';

            if (currentRoom.type === 'global') {
                endpoint = '/chats/global';
            } else if (currentRoom.type === 'skill') {
                endpoint = `/chats/skill/${currentRoom.id}`;
            } else if (currentRoom.type === 'private') {
                endpoint = `/chats/private/${currentRoom.id}`;
            }

            // Send via REST API - backend will handle socket emissions
            const response = await axiosInstance.post(endpoint, { message: messageText });
            
            // If it's a new private conversation, refresh the chat rooms
            if (currentRoom.type === 'private' && !chatRooms.find(room => 
                room.type === 'private' && room.userId === currentRoom.id)) {
                fetchChatRooms();
            }
            
            // Note: Don't add to local state here - let socket listener handle it
            // This prevents duplicates and ensures all clients see messages in sync
            
        } catch (error) {
            console.error('Failed to send message:', error);
            setError('Failed to send message');
        }
    };

    // Handle typing indicators
    const startTyping = () => {
        if (!socket || !user) return;
        
        const typingData = {
            chatType: currentRoom.type,
            ...(currentRoom.type === 'skill' && { skillId: currentRoom.id }),
            ...(currentRoom.type === 'private' && { recipientId: currentRoom.id })
        };
        
        socket.emit('typing_start', typingData);
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 3000);
    };

    const stopTyping = () => {
        if (!socket || !user) return;
        
        const typingData = {
            chatType: currentRoom.type,
            ...(currentRoom.type === 'skill' && { skillId: currentRoom.id }),
            ...(currentRoom.type === 'private' && { recipientId: currentRoom.id })
        };
        
        socket.emit('typing_stop', typingData);
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    };

    // Switch chat room
    const switchRoom = (roomType, roomId = null, roomName = 'Global Chat') => {
        // Stop typing in current room
        stopTyping();
        
        // Clear typing users
        setTypingUsers([]);
        
        // Update current room
        setCurrentRoom({ type: roomType, id: roomId, name: roomName });
        
        // Fetch messages for new room
        fetchMessages(roomType, roomId);
    };

    // Socket event listeners for message reception and typing indicators
    useEffect(() => {
        if (!socket) return;

        // Register user with socket
        socket.emit('register', {});

        // Listen for registration success
        socket.on('registration_success', (data) => {
            // console.log('Successfully registered for chat:', data);
        });

        // Listen for new messages
        socket.on('receive_global_message', (message) => {
            if (currentRoom.type === 'global') {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }
        });

        socket.on('receive_skill_message', (message) => {
            if (currentRoom.type === 'skill' && currentRoom.id === message.skillId) {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }
        });

        socket.on('receive_private_message', (message) => {
            if (currentRoom.type === 'private' && 
                (currentRoom.id === message.sender._id || currentRoom.id === message.recipient._id)) {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }
        });

        // Listen for message edits and deletions
        socket.on('message_edited', (editedMessage) => {
            setMessages(prev => prev.map(msg => 
                msg._id === editedMessage._id ? editedMessage : msg
            ));
        });

        socket.on('message_deleted', (deletedMessage) => {
            setMessages(prev => prev.filter(msg => msg._id !== deletedMessage._id));
        });

        // Listen for typing indicators
        socket.on('user_typing', (typingData) => {
            if (typingData.userId === user._id) return; // Don't show own typing
            
            setTypingUsers(prev => {
                if (typingData.isTyping) {
                    // Add user to typing list
                    if (!prev.find(u => u.userId === typingData.userId)) {
                        return [...prev, typingData];
                    }
                    return prev;
                } else {
                    // Remove user from typing list
                    return prev.filter(u => u.userId !== typingData.userId);
                }
            });
        });

        // Listen for errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
            setError(error.message || 'Socket error occurred');
        });

        return () => {
            socket.off('registration_success');
            socket.off('receive_global_message');
            socket.off('receive_skill_message');
            socket.off('receive_private_message');
            socket.off('message_edited');
            socket.off('message_deleted');
            socket.off('user_typing');
            socket.off('error');
        };
    }, [socket, currentRoom, user]);

    // Fetch initial data
    useEffect(() => {
        if (user) {
            fetchChatRooms();
            fetchMessages('global'); // Start with global chat
        }
    }, [user]);

    // Handle private chat initialization
    useEffect(() => {
        if (privateChatUser && user) {
            // Switch to private chat with the specified user
            switchRoom('private', privateChatUser.id, `Chat with ${privateChatUser.username}`);
        }
    }, [privateChatUser, user]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const value = {
        // State
        currentRoom,
        messages,
        chatRooms,
        typingUsers,
        isLoading,
        error,
        messagesEndRef,
        
        // Actions
        sendMessage,
        switchRoom,
        fetchMessages,
        startTyping,
        stopTyping,
        scrollToBottom,
        
        // Utilities
        setError
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};