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
            socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
                withCredentials: true,
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