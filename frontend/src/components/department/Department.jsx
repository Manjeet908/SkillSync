import { useNavigate } from "react-router-dom";
import "./department.css"; // Import the CSS file

export default function Department({ dept }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/courses/${dept.code}`);
  };

  return (
    <div onClick={handleClick} className="department-card">
      <h2 className="department-title">{dept.name}</h2>
    </div>
  );
}
