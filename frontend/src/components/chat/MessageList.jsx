import React, { useEffect, useRef } from 'react';
import Message from './Message';
import { useChat } from '../../context/ChatContext';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './MessageList.css';

const MessageList = () => {
    const { messages, typingUsers, isLoading, error, messagesEndRef } = useChat();
    const { user } = useContext(AuthContext);
    const messagesContainerRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 1;
            
            if (isScrolledToBottom || messages.length === 1) {
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [messages, messagesEndRef]);

    if (error) {
        return (
            <div className="message-list-error">
                <div className="error-content">
                    <span className="error-icon">⚠️</span>
                    <p>Failed to load messages</p>
                    <small>{error}</small>
                </div>
            </div>
        );
    }

    return (
        <div className="message-list-container">
            <div className="message-list" ref={messagesContainerRef}>
                {isLoading && messages.length === 0 ? (
                    <div className="loading-messages">
                        <div className="loading-spinner"></div>
                        <span>Loading messages...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="no-messages">
                        <div className="no-messages-content">
                            <span className="no-messages-icon">💬</span>
                            <h3>No messages yet</h3>
                            <p>Be the first to start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isOwnMessage = message.sender?._id === user?._id;
                            const previousMessage = index > 0 ? messages[index - 1] : null;
                            const showAvatar = !previousMessage || previousMessage.sender?._id !== message.sender?._id;
                            
                            return (
                                <Message
                                    key={message._id || index}
                                    message={message}
                                    isOwnMessage={isOwnMessage}
                                    showAvatar={showAvatar}
                                />
                            );
                        })}
                        
                        {/* Typing indicators */}
                        {typingUsers.length > 0 && (
                            <div className="typing-indicators">
                                {typingUsers.map((typingUser, index) => (
                                    <div key={typingUser.userId} className="typing-indicator">
                                        <div className="typing-avatar">
                                            <img 
                                                src="/assets/person/1.jpg" 
                                                alt={typingUser.username}
                                                className="avatar-img"
                                            />
                                        </div>
                                        <div className="typing-content">
                                            <span className="typing-name">{typingUser.username}</span>
                                            <div className="typing-animation">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
        </div>
    );
};

export default MessageList;