import { useContext, useRef } from "react";
import "./Login.css";
import { AuthContext } from "../../context/AuthContext";
import { CircularProgress } from "@mui/material";
import axiosInstance from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const email = useRef();
  const username = useRef();
  const password = useRef();
  const { isFetching, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = async(e) => {
    e.preventDefault();
    if((!email.current.value && !username.current.value) || email.current.value === "" && username.current.value === "") {
      alert("Please enter either email or username.");
      return;
    }
    dispatch({ type: "LOGIN_START" });
    
    const user = {
      email: email?.current?.value,
      username: username?.current?.value,
      password: password.current.value,
    };

    try {
      const res = await axiosInstance.post("/users/login", user);
      const userDetails = {
        ...res.data.data,
        accessToken: res.data.data.accessToken,
        refreshToken: res.data.data.refreshToken
      };
      dispatch({ type: "LOGIN_SUCCESS", payload: userDetails });

    } catch (err) {
      console.error("Login error:", err);
      dispatch({ type: "LOGIN_FAILURE", payload: err });
      // Optional: Add user-friendly error message
      alert(err.response?.data?.message || "Login failed. Please try again.");
    }
  };


  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">SKILL SYNC</h3>
          <span className="loginDesc">
            Connect with friends and the world around you on SKILL SYNC.
          </span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={handleClick}>
            <input
              placeholder="Email"
              type="email"
              className="loginInput"
              ref={email}
            />
            <input
              placeholder="Username"
              type="text"
              className="loginInput"
              ref={username}
            />
            <input
              placeholder="Password"
              type="password"
              required
              minLength="6"
              className="loginInput"
              ref={password}
            />
            <button className="loginButton" type="submit" disabled={isFetching}>
              {isFetching ? (
                <CircularProgress color="white" size="20px" />
              ) : (
                "Log In"
              )}
            </button>
            <span className="loginForgot">Forgot Password?</span>
             <button 
              className="loginRegisterButton" 
              type="button" 
              onClick={() => navigate("/register")}
            >
              {isFetching ? (
                <CircularProgress color="white" size="20px" />
              ) : (
                "Create a New Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}