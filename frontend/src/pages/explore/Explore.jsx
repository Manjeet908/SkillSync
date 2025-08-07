import React, { useState, useEffect } from 'react';
import './Explore.css';
import axiosInstance from '../../api/axios';
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";

function Explore() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axiosInstance.get('/skills/explore');
        setSkills(res.data.data); // Adjust according to your actual response structure
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    };
    fetchSkills();
  }, []);

  const handleFollow = async (skill) => {
    try {
      if(skill.isFollowed) {
        const res = await axiosInstance.patch(`/users/remove-interested-skills`, { skill: skill.name });
      }
      else {
        const res = await axiosInstance.patch(`/users/add-interested-skills`, { skill: skill.name });
      }

      setSkills(prev =>
        prev.map(prevSkill =>
          skill.id === prevSkill.id ? { ...prevSkill, isFollowed: !prevSkill.isFollowed } : prevSkill
        )
      );
    } catch (err) {
      console.error("Error following skill:", err);
    }
  };

  return (
    <>
      <Topbar />
      <div className="explore-container">
        <Sidebar />
        <div className='explore'>
          <h1>Explore New Skills</h1>
          <div className='skill-grid'>
            {skills.map((skill) => (
              <div className='skill-card' key={skill.id}>
                <img src={skill.image} alt={skill.name} />
                <h3>{skill.name}</h3>
                <p>{skill.description}</p>
                <button onClick={() => handleFollow(skill)}>
                  {skill.isFollowed ? "Unfollow" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>
        <Rightbar />
      </div>
    </>
  );
}

export default Explore;