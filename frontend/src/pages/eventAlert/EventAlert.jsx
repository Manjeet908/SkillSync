import React, { useState, useEffect } from "react";
import "./eventAlert.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";

const EventAlert = () => {
  const [eventText, setEventText] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [poster, setPoster] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        const data = await response.json();
        
        const formattedEvents = data.map(post => ({
          id: post.id,
          title: post.title,
          text: post.body,
          date: new Date().toISOString().split('T')[0],
          poster: null
        }));
        
        setEvents(formattedEvents);
      } catch (err) {
        setError("Failed to load events");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPoster(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!eventTitle.trim() || !eventText.trim()) {
      alert("Please fill in both title and description");
      return;
    }

    const newEvent = {
      id: Date.now(),
      title: eventTitle,
      text: eventText,
      date: new Date().toISOString().split('T')[0],
      poster: previewUrl
    };

    setEvents([newEvent, ...events]);
    setEventTitle("");
    setEventText("");
    setPoster(null);
    setPreviewUrl(null);
  };

  return (
    <>
      <Topbar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div className="eventAlertContainer">
          <h2>📅 College Events</h2>
          
          <div className="eventInputContainer">
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event Title"
              className="eventInput"
            />
            <textarea
              value={eventText}
              onChange={(e) => setEventText(e.target.value)}
              placeholder="Event Description"
              className="eventInput"
              rows="4"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePosterChange}
              className="posterInput"
            />
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Event poster preview" 
                className="posterPreview"
              />
            )}
            <button onClick={handlePost} className="postButton">
              Post Event
            </button>
          </div>

          {isLoading && <div className="loading">Loading events...</div>}
          {error && <div className="error">{error}</div>}
          
          <div className="eventList">
            {events.map(event => (
              <div key={event.id} className="eventItem">
                {event.poster && (
                  <img 
                    src={event.poster} 
                    alt="Event poster" 
                    className="eventPoster"
                  />
                )}
                <h3>{event.title}</h3>
                <p>{event.text}</p>
                <small>Posted on: {event.date}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventAlert;