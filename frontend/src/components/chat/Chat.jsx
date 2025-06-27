import React,{useState,useEffect} from 'react'
import './chat.css'
import io from "socket.io-client"


const socket = io("http://localhost:8000");

function Chat() {
    const [message,setMessage]=useState("");
    const [messages,setMessages]=useState([]);

    const sendMessage=()=>{
        if(message.trim()!==""){
            socket.emit("send_message",{text:message});
            setMessage("");

        }
    }
    useEffect(()=>{
        socket.on("receive_message",data=>{
            setMessages(prev=>[...prev,data]);

        });
        return()=>socket.off("receive_message");
    },[]);

  return (
    <div className='chat-container'>
        <h2 className="chat-title">💬 Chat </h2>
        <div className='messages-container'>
            {
                messages.map((m,idx)=>(
                    <div key={idx} className='message'>
                        {m.text}
                    </div>
                    
                ))
            }

        </div>
        <div className='input-container'>
            <input 
                className='message-input'
                value={message}
                onChange={e=>setMessage(e.target.value)}
                placeholder='type message...'
            />
        <button className='send-button' onClick={sendMessage}>Send</button>
        </div>

    </div>
  )
}

export default Chat