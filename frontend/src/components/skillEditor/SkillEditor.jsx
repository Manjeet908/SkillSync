import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import "./Skilleditor.css"

export default function SkillEditor({ user, onUpdate }) {
  const [knownSkills, setKnownSkills] = useState(user.knownSkills || []);
  const [interestedSkills, setInterestedSkills] = useState(
    user.interestedSkills || []
  );
  const [newKnownSkill, setNewKnownSkill] = useState("");
  const [newInterestedSkill, setNewInterestedSkill] = useState("");

  useEffect(() => {
    if (user.knownSkills) {
      setKnownSkills(user.knownSkills);
    }
    if (user.interestedSkills) {
      setInterestedSkills(user.interestedSkills);
    }    
  }, [user]);

  const handleAddKnownSkill = async() => {
    if (newKnownSkill.trim() && !knownSkills.includes(newKnownSkill.trim())) {
      setKnownSkills([...knownSkills, newKnownSkill.trim()]);
      setNewKnownSkill("");
    }
    try {
      const res = await axiosInstance.patch(
        `/users/add-known-skills`,
        {
          skill: newKnownSkill,
        }
      );
      onUpdate(res.data.data);
      alert("Skills updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update skills.");
    }

  };

  const handleRemoveKnownSkill = async(index) => {
    try {
      const res = await axiosInstance.patch(
        `/users/remove-known-skills`,
        {
          skill: knownSkills[index],
        }
      );
      onUpdate(res.data.data);
      alert("Skills updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update skills.");
    }
    const updatedSkills = [...knownSkills];
    updatedSkills.splice(index, 1);
    setKnownSkills(updatedSkills);
  };

  const handleAddInterestedSkill = async() => {
    if (
      newInterestedSkill.trim() &&
      !interestedSkills.includes(newInterestedSkill.trim())
    ) {
      setInterestedSkills([...interestedSkills, newInterestedSkill.trim()]);
      setNewInterestedSkill("");
    }
    try {
      const res = await axiosInstance.patch(
        `/users/add-interested-skills`,
        {
          skill: newInterestedSkill,
        }
      );
      onUpdate(res.data.data);
      alert("Skills updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update skills.");
    }
  };

  const handleRemoveInterestedSkill = async(index) => {
    try {
      const res = await axiosInstance.patch(
        `/users/remove-interested-skills`,
        {
          skill: interestedSkills[index],
        }
      );
      onUpdate(res.data.data);
      alert("Skills updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update skills.");
    }
    const updatedSkills = [...interestedSkills];
    updatedSkills.splice(index, 1);
    setInterestedSkills(updatedSkills);
  };

  return (
    <div className="profileSkills">
      <h3>Known Skills</h3>
      <div className="skillList">
        {knownSkills.map((skill, index) => (
          <div key={index} className="skillItem">
            {skill.name}
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
            {typeof skill === 'string' ? skill : skill.name}
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
    </div>
  );
}
