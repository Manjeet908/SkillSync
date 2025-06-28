import React, { useState } from "react";
import axiosInstance from "../../api/axios";
import "./skillEditor.css";

export default function SkillEditor({ user, onUpdate }) {
  const [knownSkills, setKnownSkills] = useState(user.knownSkills || []);
  const [interestedSkills, setInterestedSkills] = useState(
    user.interestedSkills || []
  );
  const [newKnownSkill, setNewKnownSkill] = useState("");
  const [newInterestedSkill, setNewInterestedSkill] = useState("");

  const handleAddKnownSkill = () => {
    if (newKnownSkill.trim() && !knownSkills.includes(newKnownSkill.trim())) {
      setKnownSkills([...knownSkills, newKnownSkill.trim()]);
      setNewKnownSkill("");
    }
  };

  const handleRemoveKnownSkill = (index) => {
    const updatedSkills = [...knownSkills];
    updatedSkills.splice(index, 1);
    setKnownSkills(updatedSkills);
  };

  const handleAddInterestedSkill = () => {
    if (
      newInterestedSkill.trim() &&
      !interestedSkills.includes(newInterestedSkill.trim())
    ) {
      setInterestedSkills([...interestedSkills, newInterestedSkill.trim()]);
      setNewInterestedSkill("");
    }
  };

  const handleRemoveInterestedSkill = (index) => {
    const updatedSkills = [...interestedSkills];
    updatedSkills.splice(index, 1);
    setInterestedSkills(updatedSkills);
  };

  const handleSaveSkills = async () => {
    try {
      const res = await axiosInstance.put(
        `/users/update-skills/${user.username}`,
        {
          knownSkills,
          interestedSkills,
        }
      );
      onUpdate(res.data.data);
      alert("Skills updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update skills.");
    }
  };

  return (
    <div className="profileSkills">
      <h3>Known Skills</h3>
      <div className="skillList">
        {knownSkills.map((skill, index) => (
          <div key={index} className="skillItem">
            {skill}
            <button onClick={() => handleRemoveKnownSkill(index)}>✖</button>
          </div>
        ))}
      </div>
      <div className="skillInput">
        <input
          type="text"
          placeholder="Add known skill..."
          value={newKnownSkill}
          onChange={(e) => setNewKnownSkill(e.target.value)}
        />
        <button onClick={handleAddKnownSkill}>Add</button>
      </div>

      <h3>Interested Skills</h3>
      <div className="skillList">
        {interestedSkills.map((skill, index) => (
          <div key={index} className="skillItem">
            {skill}
            <button onClick={() => handleRemoveInterestedSkill(index)}>✖</button>
          </div>
        ))}
      </div>
      <div className="skillInput">
        <input
          type="text"
          placeholder="Add interested skill..."
          value={newInterestedSkill}
          onChange={(e) => setNewInterestedSkill(e.target.value)}
        />
        <button onClick={handleAddInterestedSkill}>Add</button>
      </div>

      <button className="saveSkillsBtn" onClick={handleSaveSkills}>
        Save Changes
      </button>
    </div>
  );
}
