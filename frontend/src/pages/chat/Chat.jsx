import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatProvider } from '../../context/ChatContext';
import RoomSelector from '../../components/chat/RoomSelector';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import Topbar from '../../components/topbar/Topbar';
import './Chat.css';

const ChatPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const [privateChatUser, setPrivateChatUser] = useState(null);

    // Check for URL parameters to auto-open private chat
    useEffect(() => {
        const userId = searchParams.get('userId');
        const username = searchParams.get('username');
        
        if (userId && username) {
            setPrivateChatUser({ id: userId, username });
        }
    }, [searchParams]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <ChatProvider privateChatUser={privateChatUser}>
            <div className="chat-page">
                <Topbar />
                
                <div className="chat-container">
                    {/* Mobile header */}
                    <div className="chat-mobile-header">
                        <button 
                            className="mobile-menu-toggle"
                            onClick={toggleMobileMenu}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                            </svg>
                            <span>Chat Rooms</span>
                        </button>
                    </div>

                    <div className="chat-content">
                        {/* Room selector - sidebar */}
                        <div className={`chat-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                            <RoomSelector />
                            
                            {/* Mobile overlay */}
                            {isMobileMenuOpen && (
                                <div 
                                    className="mobile-overlay"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                />
                            )}
                        </div>

                        {/* Main chat area */}
                        <div className="chat-main">
                            <div className="chat-messages">
                                <MessageList />
                            </div>
                            
                            <div className="chat-input">
                                <MessageInput />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ChatProvider>
    );
};

export default ChatPage;