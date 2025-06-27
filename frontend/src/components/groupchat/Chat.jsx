import React, { useState, useEffect } from "react";
import './chat.css';
import io from "socket.io-client";

const socket = io("http://localhost:8000"); // Backend port

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", { text: message });
      setMessage(""); // Clear the input after sending
    }
  };

  useEffect(() => {
    // When a message is received, add it to the chat
    socket.on("receive_message", data => {
      setMessages(prev => [...prev, data]);
    });

    // Cleanup listener when component unmounts
    return () => socket.off("receive_message");
  }, []);

  return (
    <div className="chat-container">
      <h2 className="chat-title">🌐 Global Chat</h2>
      <div className="messages-container">
        {messages.map((m, i) => (
          <div key={i} className="message">{m.text}</div>
        ))}
      </div>
      <div className="input-container">
        <input
          className="message-input"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}