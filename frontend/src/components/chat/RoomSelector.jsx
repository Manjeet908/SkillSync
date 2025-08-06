import { useChat } from '../../context/ChatContext';
import './RoomSelector.css';

const RoomSelector = () => {
    const { chatRooms, currentRoom, switchRoom } = useChat();

    const handleRoomSwitch = (room) => {
        if (room.type === 'global') {
            switchRoom('global', null, 'Global Chat');
        } else if (room.type === 'skill') {
            switchRoom('skill', room.skillId, room.name);
        }
    };

    const isRoomActive = (room) => {
        if (room.type === 'global' && currentRoom.type === 'global') {
            return true;
        }
        if (room.type === 'skill' && currentRoom.type === 'skill' && currentRoom.id === room.skillId) {
            return true;
        }
        return false;
    };

    const getRoomIcon = (room) => {
        if (room.type === 'global') {
            return '🌐';
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
                {chatRooms.map((room, index) => (
                    <div
                        key={room.id || index}
                        className={`room-item ${isRoomActive(room) ? 'active' : ''}`}
                        onClick={() => handleRoomSwitch(room)}
                    >
                        <div className="room-icon">
                            {room.image ? (
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