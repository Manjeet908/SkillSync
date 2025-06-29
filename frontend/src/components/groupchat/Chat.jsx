import React, { useState, useEffect } from "react";
import "./chat.css";
import { useSocket } from "../../context/SocketContext";
import { useParams } from "react-router-dom";

export default function Chat({ skill }) {
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", { text: message,room: skill });
      setMessage(""); // Clear the input after sending
    }
  };

  useEffect(() => {
    // When a message is received, add it to the chat
    if (socket && skill) {
      socket.emit("join_room", { room: skill });
      socket.on("receive_message", (data) => {
        setMessages((prev) => [...prev, data]);
      });

      // Cleanup listener when component unmounts
      return () => {
        socket.emit("leave_room", { room: skill });
        socket.off("receive_message");
      }
    }
  }, [socket, skill]);

  return (
    <div className="chat-container">
      <h2 className="chat-title">🌐 Global Chat for ${skill}</h2>
      <div className="messages-container">
        {messages.map((m, i) => (
          <div key={i} className="message">
            {m.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
