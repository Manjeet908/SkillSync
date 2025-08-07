import './YourPosts.css';
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";
import YourPost from "../../components/YourPost/YourPost";

export default function YourPosts() {
  return (
    <>
      <Topbar />
      <div className="your-posts-container">
        <Sidebar />
        <YourPost />
        <Rightbar />
      </div>
    </>
  );
}
