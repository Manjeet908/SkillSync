import "./profileModal.css";
import { useRef, useState } from "react";
import axiosInstance from "../../api/axios";

export default function ProfileModal({ onClose, user }) {
  const handleClick = (e) => e.stopPropagation();
  const PF = import.meta.env.VITE_APP_PUBLIC_FOLDER;
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarButtonClick = () => {
    avatarInputRef.current.click();
  };

  const handleCoverButtonClick = () => {
    coverInputRef.current.click();
  };

  const handleFileChange = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append(type === 'avatar' ? 'avatar' : 'coverImage', file);

      const endpoint = type === 'avatar' ? '/users/update-avatar' : '/users/update-cover-image';
      const response = await axiosInstance.put(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onClose();
      window.location.reload();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Failed to update ${type}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={handleClick}>
        <div className="modalHeader">
          <h3 className="modalTitle">Update Profile</h3>
          <button className="modalCloseBtn" onClick={onClose}>×</button>
        </div>

        <div className="modalContent">
          <div className="modalSection">
            <h4>Profile Picture</h4>
            <img
              src={user.avatar ? user.avatar : PF + "assets/person/1.jpg"}
              alt="Profile"
              className="modalProfileImage"
            />
            <button 
              className="modalBtn upload" 
              onClick={handleAvatarButtonClick}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Change Profile Picture'}
            </button>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={avatarInputRef}
              onChange={(e) => handleFileChange(e, 'avatar')}
            />
          </div>

          <div className="modalSection">
            <h4>Cover Photo</h4>
            <img
              src={user.coverImage ? user.coverImage : PF + "assets/gift/background.jpg"}
              alt="Cover"
              className="modalCoverImage"
            />
            <button 
              className="modalBtn upload" 
              onClick={handleCoverButtonClick}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Change Cover Photo'}
            </button>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={coverInputRef}
              onChange={(e) => handleFileChange(e, 'coverImage')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
