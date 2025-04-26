import axiosInstance from "../../api/axios";
import { useRef } from "react";
import "./register.css";
import { useNavigate } from "react-router";

export default function Register() {
  const fullname = useRef();
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();
    if (passwordAgain.current.value !== password.current.value) {
        alert("Passwords do not match!");
        return;
    }
    const user = {
        fullName: fullname.current.value,
        username: username.current.value,
        email: email.current.value,
        password: password.current.value,
      };
      try {
        await axiosInstance.post("/users/register", user);
        navigate("/login");
      } catch (err) {
        console.log(err);
        alert("Failed to register. Try again.");
      }
  };

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">Skill Sync</h3>
          <span className="loginDesc">
            Connect with friends and the world around you on Skill Sync.
          </span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={handleClick}>
            <input 
              placeholder="Full Name" 
              required 
              ref={fullname} 
              className="loginInput" 
            />
            <input
              placeholder="Username"
              required
              ref={username}
              className="loginInput"
            />
            <input
              placeholder="Email"
              required
              ref={email}
              className="loginInput"
              type="email"
            />
            <input
              placeholder="Password"
              required
              ref={password}
              className="loginInput"
              type="password"
              minLength="6"
            />
            <input
              placeholder="Password Again"
              required
              ref={passwordAgain}
              className="loginInput"
              type="password"
            />
            <button className="loginButton" type="submit">
              Sign Up
            </button>
            <button className="loginRegisterButton"
            type="button" 
            onClick={() => navigate("/login")}
            >Log into Account</button>
          </form>
        </div>
      </div>
    </div>
  );
} 