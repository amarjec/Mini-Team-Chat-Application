import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS for alerts

// Pages
import AuthPage from "./pages/AuthPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

function App() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* If user is logged in, show Chat, otherwise redirect to Auth */}
        <Route 
          path="/" 
          element={user ? <ChatPage /> : <Navigate to="/auth" />} 
        />
        
        {/* If user is logged in, redirect away from Auth page */}
        <Route 
          path="/auth" 
          element={!user ? <AuthPage /> : <Navigate to="/" />} 
        />
        
        {/* Catch all 404s and send to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;