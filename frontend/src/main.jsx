import ReactDOM from "react-dom/client"; // ← Use 'react-dom/client'
import App from "./App";
import { AuthContextProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <AuthContextProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthContextProvider>
);