import { useChat } from '../../context/ChatContext';
import './RoomSelector.css';

const RoomSelector = () => {
    const { chatRooms, currentRoom, switchRoom } = useChat();

    const handleRoomSwitch = (room) => {
        if (room.type === 'global') {
            switchRoom('global', null, 'Global Chat');
        } else if (room.type === 'skill') {
            switchRoom('skill', room.skillId, room.name);
        } else if (room.type === 'private') {
            switchRoom('private', room.userId, room.name);
        }
    };

    const isRoomActive = (room) => {
        if (room.type === 'global' && currentRoom.type === 'global') {
            return true;
        }
        if (room.type === 'skill' && currentRoom.type === 'skill' && currentRoom.id === room.skillId) {
            return true;
        }
        if (room.type === 'private' && currentRoom.type === 'private' && currentRoom.id === room.userId) {
            return true;
        }
        return false;
    };

    const getRoomIcon = (room) => {
        if (room.type === 'global') {
            return '🌐';
        }
        
        if (room.type === 'private') {
            return '💬';
        }
        
        // Skill-specific icons
        const skillIcons = {
            'Graphic Design': '🎨',
            'Photography': '📸',
            'Music': '🎵',
            'Web Development': '💻',
            'Other': '🎯'
        };
        
        return skillIcons[room.name] || '🎯';
    };


    return (
        <div className="room-selector">
            <div className="room-selector-header">
                <h3>Chat Rooms</h3>
                <span className="room-count">{chatRooms.length} rooms</span>
            </div>
            
            <div className="room-list">
                {/* Global Chat Section */}
                {chatRooms.filter(room => room.type === 'global').map((room, index) => (
                    <div key={room.id || `global-${index}`} className="room-section">
                        <div
                            className={`room-item ${isRoomActive(room) ? 'active' : ''}`}
                            onClick={() => handleRoomSwitch(room)}
                        >
                            <div className="room-icon">
                                {room.type === 'private' && room.avatar ? (
                                    <img 
                                        src={room.avatar} 
                                        alt={room.name}
                                        className="room-avatar"
                                    />
                                ) : room.image ? (
                                    <img 
                                        src={room.image} 
                                        alt={room.name}
                                        className="room-image"
                                    />
                                ) : (
                                    <span className="room-emoji">{getRoomIcon(room)}</span>
                                )}
                            </div>
                            
                            <div className="room-info">
                                <div className="room-name">
                                    {room.name}
                                </div>
                                <div className="room-description">
                                    {room.description || `Chat about ${room.name.toLowerCase()}`}
                                </div>
                            </div>
                            
                            <div className="room-meta">
                                <div className="online-indicator">
                                    {/* <span className="online-dot"></span>
                                    <span className="online-count">{getOnlineCount(room)}</span> */}
                                </div>
                                {isRoomActive(room) && (
                                    <div className="active-indicator">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Skills Section */}
                {chatRooms.filter(room => room.type === 'skill').length > 0 && (
                    <div className="room-section">
                        <div className="room-section-header">
                            <span className="section-title">Skills</span>
                        </div>
                        {chatRooms.filter(room => room.type === 'skill').map((room, index) => (
                            <div
                                key={room.id || `skill-${index}`}
                                className={`room-item ${isRoomActive(room) ? 'active' : ''}`}
                                onClick={() => handleRoomSwitch(room)}
                            >
                                <div className="room-icon">
                                    {room.type === 'private' && room.avatar ? (
                                        <img 
                                            src={room.avatar} 
                                            alt={room.name}
                                            className="room-avatar"
                                        />
                                    ) : room.image ? (
                                        <img 
                                            src={room.image} 
                                            alt={room.name}
                                            className="room-image"
                                        />
                                    ) : (
                                        <span className="room-emoji">{getRoomIcon(room)}</span>
                                    )}
                                </div>
                                
                                <div className="room-info">
                                    <div className="room-name">
                                        {room.name}
                                    </div>
                                    <div className="room-description">
                                        {room.description || `Chat about ${room.name.toLowerCase()}`}
                                    </div>
                                </div>
                                
                                <div className="room-meta">
                                    <div className="online-indicator">
                                        {/* <span className="online-dot"></span>
                                        <span className="online-count">{getOnlineCount(room)}</span> */}
                                    </div>
                                    {isRoomActive(room) && (
                                        <div className="active-indicator">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Private Chats Section */}
                {chatRooms.filter(room => room.type === 'private').length > 0 && (
                    <div className="room-section">
                        <div className="room-section-header">
                            <span className="section-title">Direct Messages</span>
                        </div>
                        {chatRooms.filter(room => room.type === 'private').map((room, index) => (
                            <div
                                key={room.id || `private-${index}`}
                                className={`room-item ${isRoomActive(room) ? 'active' : ''}`}
                                onClick={() => handleRoomSwitch(room)}
                            >
                                <div className="room-icon">
                                    {room.type === 'private' && room.avatar ? (
                                        <img 
                                            src={room.avatar} 
                                            alt={room.name}
                                            className="room-avatar"
                                        />
                                    ) : room.image ? (
                                        <img 
                                            src={room.image} 
                                            alt={room.name}
                                            className="room-image"
                                        />
                                    ) : (
                                        <span className="room-emoji">{getRoomIcon(room)}</span>
                                    )}
                                </div>
                                
                                <div className="room-info">
                                    <div className="room-name">
                                        {room.name}
                                    </div>
                                    <div className="room-description">
                                        {room.lastMessage?.message ? (
                                            <span className="last-message">
                                                {room.lastMessage.message.length > 30 
                                                    ? `${room.lastMessage.message.substring(0, 30)}...` 
                                                    : room.lastMessage.message}
                                            </span>
                                        ) : (
                                            room.description || `Chat with ${room.username}`
                                        )}
                                    </div>
                                </div>
                                
                                <div className="room-meta">
                                    <div className="online-indicator">
                                        {/* <span className="online-dot"></span>
                                        <span className="online-count">{getOnlineCount(room)}</span> */}
                                    </div>
                                    {isRoomActive(room) && (
                                        <div className="active-indicator">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {chatRooms.length === 0 && (
                <div className="no-rooms">
                    <div className="no-rooms-content">
                        <span className="no-rooms-icon">💬</span>
                        <p>No chat rooms available</p>
                        <small>Please try refreshing the page</small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomSelector;