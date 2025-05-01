import "./profileModal.css";
import { useRef } from "react";
import axiosInstance from "../../api/axios";
export default function ProfileModal({ onClose, user }) {
  const handleClick = (e) => e.stopPropagation();
  const PF = import.meta.env.VITE_APP_PUBLIC_FOLDER;
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Programmatically click the hidden file input
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      try {
        const formData = new FormData();
        formData.append("avatar", file); // "avatar" should match the field name expected by Multer

        await axiosInstance.put("/users/update-avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("File uploaded successfully");
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={handleClick}>
        <img
          src={user.avatar ? user.avatar : PF + "assets/person/1.jpg"}
          alt="Profile"
          className="modalProfileImage"
        />
        <h3 className="modalTitle">{user.fullName}</h3>

        <button className="modalBtn upload" onClick={handleButtonClick}>
          Upload Photo
        </button>

        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button className="modalBtn remove">Remove Current Photo</button>
        <button className="modalBtn cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
