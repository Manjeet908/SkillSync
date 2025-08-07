import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import YourPost from "./pages/yourPosts/YourPosts";
import LikedPost from "./pages/like/Like";
import Chat from "./pages/chat/Chat";
import Explore from "./pages/explore/Explore";


function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/register" />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/your-posts" element={user ? <YourPost /> : <Navigate to="/register" />} />
        <Route path="/liked-posts" element={user ? <LikedPost /> : <Navigate to="/register" />} />
        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/register" />} />
        <Route path="/explore" element={user ? <Explore /> : <Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}

export default App;