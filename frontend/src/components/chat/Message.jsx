import React from 'react';
import { format } from 'timeago.js';
import './Message.css';

const Message = ({ message, isOwnMessage, showAvatar = true }) => {
    const formatTime = (timestamp) => {
        try {
            return format(new Date(timestamp));
        } catch (error) {
            return 'Just now';
        }
    };

    return (
        <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
            {showAvatar && !isOwnMessage && (
                <div className="message-avatar">
                    <img 
                        src={message.sender?.avatar || '/assets/person/1.jpg'} 
                        alt={message.sender?.username || 'User'}
                        className="avatar-img"
                    />
                </div>
            )}
            
            <div className="message-content">
                {!isOwnMessage && (
                    <div className="message-header">
                        <span className="message-sender">
                            {message.sender?.fullName || message.sender?.username || 'Unknown User'}
                        </span>
                        <span className="message-time">
                            {formatTime(message.timestamp || message.createdAt)}
                        </span>
                    </div>
                )}
                
                <div className="message-text">
                    {message.message}
                    {message.isEdited && (
                        <span className="edited-indicator" title={`Edited ${formatTime(message.editedAt)}`}>
                            (edited)
                        </span>
                    )}
                </div>
                
                {isOwnMessage && (
                    <div className="message-time own-time">
                        {formatTime(message.timestamp || message.createdAt)}
                        {message.isEdited && (
                            <span className="edited-indicator">
                                (edited)
                            </span>
                        )}
                    </div>
                )}
            </div>
            
            {showAvatar && isOwnMessage && (
                <div className="message-avatar">
                    <img 
                        src={message.sender?.avatar || '/assets/person/1.jpg'} 
                        alt={message.sender?.username || 'You'}
                        className="avatar-img"
                    />
                </div>
            )}
        </div>
    );
};

export default Message;