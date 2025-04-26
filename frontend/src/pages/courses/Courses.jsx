import Department from "../../components/department/Department";
import "./courses.css"; // Import the new CSS file

export default function Courses() {
  const departments = [
    { name: "Computer Science", code: "CSE" },
    { name: "Electronics", code: "ECE" },
    { name: "Mechanical", code: "ME" },
    { name: "Civil", code: "CE" },
    { name: "Electrical", code: "EE" },
    { name: "Chemical", code: "CHE" },
    { name: "Biotechnology", code: "BT" },
    { name: "Production", code: "PROD" },
  ];

  return (
    <div className="courses-page">
      <h1 className="page-title">Departments</h1>
      <div className="departments-grid">
        {departments.map((dept) => (
          <Department key={dept.code} dept={dept} />
        ))}
      </div>
    </div>
  );
}
