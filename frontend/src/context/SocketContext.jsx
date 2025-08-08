import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        let socketInstance = null;

        if (user) {
            // Use dedicated socket URL or fallback to API URL without path
            const socketUrl = import.meta.env.VITE_APP_SOCKET_URL || 
                (import.meta.env.VITE_APP_API_URL 
                    ? import.meta.env.VITE_APP_API_URL.replace('/api/v1', '') 
                    : 'http://localhost:8000');
            
            socketInstance = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
                timeout: 20000, // Connection timeout
                forceNew: true, // Force a new connection
                reconnection: true, // Enable reconnection
                reconnectionDelay: 1000, // Initial delay before reconnection
                reconnectionAttempts: 5, // Number of reconnection attempts
                reconnectionDelayMax: 5000, // Maximum delay between reconnections
            });

            socketInstance.on('connect', () => {
                console.log('Connected to socket server:', socketInstance.id);
                socketInstance.emit('register', user._id);
            });

            socketInstance.on('disconnect', () => {
                // console.log('Disconnected from socket server');
            });

            socketInstance.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                console.error('Socket URL attempted:', socketUrl);
                console.error('Error details:', {
                    message: error.message,
                    description: error.description,
                    context: error.context,
                    type: error.type
                });
            });

            socketInstance.on('reconnect', (attemptNumber) => {
                console.log('Socket reconnected after', attemptNumber, 'attempts');
            });

            socketInstance.on('reconnect_error', (error) => {
                console.error('Socket reconnection error:', error);
            });

            setSocket(socketInstance);
        }

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
                setSocket(null);
            }
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}; 