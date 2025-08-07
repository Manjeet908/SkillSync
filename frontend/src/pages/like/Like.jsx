import './Like.css';
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";
import LikedPost from "../../components/LikedPost/LikedPost";

export default function Like() {
  return (
    <>
      <Topbar />
      <div className="like-container">
        <Sidebar />
        <LikedPost />
        <Rightbar />
      </div>
    </>
  );
}
