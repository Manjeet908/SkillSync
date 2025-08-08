import "./Notification.css";

const NotificationPanel = ({ notifications, onClear }) => {
  const PF = import.meta.env.VITE_APP_PUBLIC_FOLDER;

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button onClick={onClear} className="clear-btn">
          Clear All
        </button>
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index} className="notification-item">
              <img
                src={notification.sender?.avatar || PF + "assets/person/1.jpg"}
                alt=""
                className="notification-avatar"
              />
              <div className="notification-content">
                <p className="notification-text">{notification.message}</p>
                <span className="notification-time">{notification.createdAt}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">No notifications</div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel; 