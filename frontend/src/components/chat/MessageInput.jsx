import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import './MessageInput.css';

const MessageInput = () => {
    const { sendMessage, startTyping, stopTyping, currentRoom } = useChat();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessage(value);
        
        // Handle typing indicators
        if (value.trim()) {
            startTyping();
        } else {
            stopTyping();
        }
        
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() || isSending) return;
        
        const messageToSend = message.trim();
        setMessage('');
        setIsSending(true);
        
        // Stop typing indicator
        stopTyping();
        
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        
        try {
            await sendMessage(messageToSend);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Restore message on error
            setMessage(messageToSend);
        } finally {
            setIsSending(false);
        }
    };

    const handleBlur = () => {
        // Stop typing indicator when input loses focus
        stopTyping();
    };

    const getRoomDisplayName = () => {
        if (currentRoom.type === 'global') {
            return 'Global Chat';
        } else if (currentRoom.type === 'skill') {
            return currentRoom.name || `Skill Chat ${currentRoom.id}`;
        }
        return 'Chat';
    };

    return (
        <div className="message-input-container">
            <div className="message-input-header">
                <span className="room-indicator">
                    {currentRoom.type === 'global' ? '🌐' : '🎯'} {getRoomDisplayName()}
                </span>
            </div>
            
            <div className="message-input-box">
                <div className="input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        onBlur={handleBlur}
                        placeholder={`Message ${getRoomDisplayName()}...`}
                        className="message-textarea"
                        rows="1"
                        disabled={isSending}
                        maxLength={1000}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isSending}
                        className={`send-button ${!message.trim() || isSending ? 'disabled' : 'active'}`}
                        title="Send message (Enter)"
                    >
                        {isSending ? (
                            <div className="sending-spinner"></div>
                        ) : (
                            <svg 
                                viewBox="0 0 24 24" 
                                width="20" 
                                height="20" 
                                fill="currentColor"
                            >
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        )}
                    </button>
                </div>
                
                {message.length > 800 && (
                    <div className="character-count">
                        <span className={message.length > 950 ? 'warning' : ''}>
                            {message.length}/1000
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageInput;