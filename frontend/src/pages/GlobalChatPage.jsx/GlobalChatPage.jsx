import React from "react";
import { useParams } from "react-router-dom";
import Chat from "../components/groupchat/Chat";

const GlobalChatPage = () => {
  const { skill } = useParams();
  const decodedSkill = decodeURIComponent(skill);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🌐 Global Chat for Skill: {decodedSkill}</h1>
      <Chat skill={decodedSkill} />
    </div>
  );
};

export default GlobalChatPage;
