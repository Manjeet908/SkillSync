import "./profileModal.css";

export default function ProfileModal({ onClose }) {
  const handleClick = (e) => e.stopPropagation();

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={handleClick}>
        <img src="/assets/person/1.jpg" alt="Profile" className="modalProfileImage" />
        <h3 className="modalTitle">Skill Sync</h3>

        <button className="modalBtn upload">Upload Photo</button>
        <button className="modalBtn remove">Remove Current Photo</button>
        <button className="modalBtn cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}