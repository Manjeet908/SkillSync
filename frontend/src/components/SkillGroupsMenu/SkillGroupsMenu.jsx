import React, { useState, useEffect } from "react";
import axios from "axios";

const SkillGroupsMenu = ({ onOpenGlobalChat }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [knownSkills, setKnownSkills] = useState([]);
  const [interestedSkills, setInterestedSkills] = useState([]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        // Replace `/api/user/skills` with your actual API endpoint.
        const res = await axios.get("/api/user/skills");
        setKnownSkills(res.data.knownSkills || []);
        setInterestedSkills(res.data.interestedSkills || []);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      }
    };
    fetchSkills();
  }, []);

  return (
    <div className="skill-groups-menu">
      <div className="menu-item" onClick={toggleExpand}>
        <span>Groups</span>
        <span>{isExpanded ? "▲" : "▼"}</span>
      </div>

      {isExpanded && (
        <div className="skills-sections">
          <div className="skills-section">
            <h4>Known Skills</h4>
            {knownSkills.length === 0 && <p>No known skills found.</p>}
            {knownSkills.map((skill) => (
              <div
                key={skill}
                className="skill-item"
                onClick={() => onOpenGlobalChat(skill)}
              >
                {skill}
              </div>
            ))}
          </div>

          <div className="skills-section">
            <h4>Interested Skills</h4>
            {interestedSkills.length === 0 && (
              <p>No interested skills found.</p>
            )}
            {interestedSkills.map((skill) => (
              <div
                key={skill}
                className="skill-item"
                onClick={() => onOpenGlobalChat(skill)}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGroupsMenu;
