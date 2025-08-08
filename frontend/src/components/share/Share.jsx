import "./Share.css";
import {
  PermMedia,
  Cancel,
} from "@mui/icons-material";
import { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../api/axios";

export default function Share() {
  const { user } = useContext(AuthContext);
  const titleRef = useRef();
  const descRef = useRef();
  const [file, setFile] = useState(null);
  const [skill, setSkill] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [skillsList, setSkillsList] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axiosInstance.get("/skills/explore");
        const skillsArr = res.data.data || [];
        setSkillsList(skillsArr);
        if (skillsArr.length > 0) setSkill(skillsArr[0].name);
      } catch (err) {
        setSkillsList([{ id: 0, name: "Other" }]);
        setSkill("Other");
      }
    };
    fetchSkills();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    const newPost = new FormData();
    newPost.append("title", titleRef.current.value);
    newPost.append("description", descRef.current.value);
    newPost.append("skillShowcasing", skill);
    newPost.append("isPublic", isPublic);
    if (file) {
      newPost.append("media", file);
    }
    try {
      await axiosInstance.post("/posts/create-post", newPost, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <img
            className="shareProfileImg"
            src={user.avatar ? user.avatar : PF + "person/noAvatar.png"}
            alt=""
          />
          <input
            placeholder={"Title (required)"}
            className="shareInput"
            ref={titleRef}
            maxLength={150}
            required
          />
        </div>
        <div style={{ margin: "10px 0" }}>
          <textarea
            placeholder="Description"
            className="shareInput"
            ref={descRef}
            rows={2}
            style={{ width: "100%", resize: "vertical" }}
          />
        </div>

        <div style={{ margin: "10px 0" }}>
          <label>Skill Showcasing: </label>
          <select value={skill} onChange={e => setSkill(e.target.value)}>
            {skillsList.map(skillObj => (
              <option key={skillObj.id} value={skillObj.name}>{skillObj.name}</option>
            ))}
          </select>
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
            Public
          </label>
        </div>
        <hr className="shareHr" />
        {file && (
          <div className="shareImgContainer">
            {file.type.startsWith("image/") ? (
              <img className="shareImg" src={URL.createObjectURL(file)} alt="preview" />
            ) : file.type.startsWith("video/") ? (
              <video className="shareImg" src={URL.createObjectURL(file)} controls />
            ) : null}
            <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
              <span>{file.name}</span>
              <Cancel className="shareCancelImg" style={{ marginLeft: "8px" }} onClick={() => setFile(null)} />
            </div>
          </div>
        )}
        <form className="shareBottom" onSubmit={submitHandler}>
          <div className="shareOptions">
            <label htmlFor="file" className="shareOption">
              <PermMedia htmlColor="tomato" className="shareIcon" />
              <span className="shareOptionText">Photo or Video</span>
              <input
                style={{ display: "none" }}
                type="file"
                id="file"
                accept=".png,.jpeg,.jpg,.mp4,.mov,.avi"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            {/* Removed Tag icon and option */}
          </div>
          <button className="shareButton" type="submit">
            Share
          </button>
        </form>
      </div>
    </div>
  );
}