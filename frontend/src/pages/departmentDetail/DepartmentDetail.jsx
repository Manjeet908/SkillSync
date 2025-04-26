import { useParams } from "react-router-dom";
import "./departmentDetail.css"; // Import the CSS

export default function DepartmentDetail() {
  const { deptCode } = useParams();

  return (
    <div className="department-detail">
      <h1 className="department-title">{deptCode} Department</h1>

      <h2 className="section-title">Notes</h2>
      <ul className="list">
        <li>DSA Notes</li>
        <li>OOPS Notes</li>
        <li>Operating System Notes</li>
      </ul>

      <h2 className="section-title">Exam Papers</h2>
      <ul className="list-no-margin">
        <li>Midterm 2023 Paper</li>
        <li>Endterm 2022 Paper</li>
        <li>Quiz Papers</li>
      </ul>
    </div>
  );
}
