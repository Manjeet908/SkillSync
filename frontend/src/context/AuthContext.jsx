import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";
import axiosInstance from "../api/axios";

const INITIAL_STATE = {
  user: null,
  isFetching: false,
  error: false,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  
  const checkAndRefreshToken = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      const response = await axiosInstance.post('/users/auth/refresh-token', {}, {
        withCredentials: true,
      });

      if(response.status === 200) {
        const { accessToken } = response.data.data;
        const fullUser = {
          ...user,
          accessToken
        };
        dispatch({ type: "LOGIN_SUCCESS", payload: fullUser });
      }
      else {
        throw new Error("Failed to refresh token");
      }

    } catch (error) {
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    }
  };

  useEffect(() => {
    checkAndRefreshToken();
  }, []);

  useEffect(() => {
    if (state.user) {
      const { accessToken, ...userDataWithoutTokens } = state.user;
      localStorage.setItem("user", JSON.stringify(userDataWithoutTokens));
    }
  }, [state.user]);
  
  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};