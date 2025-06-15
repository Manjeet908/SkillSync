import React, { useState, useEffect } from 'react';
import './Explore.css';
import axiosInstance from '../../api/axios';

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

  const handleFollow = async (id) => {
    try {
      const res = await axiosInstance.post(`/skills/follow/${id}`);
      setSkills(prev =>
        prev.map(skill =>
          skill._id === id ? { ...skill, isFollowed: !skill.isFollowed } : skill
        )
      );
    } catch (err) {
      console.error("Error following skill:", err);
    }
  };

  return (
    <div className='explore'>
      <h1>Explore New Skills</h1>
      <div className='skill-grid'>
        {skills.map((skill) => (
          <div className='skill-card' key={skill._id}>
            <img src={skill.image} alt={skill.name} />
            <h3>{skill.name}</h3>
            <p>{skill.description}</p>
            <button onClick={() => handleFollow(skill._id)}>
              {skill.isFollowed ? "Unfollow" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Explore;