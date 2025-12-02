import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // For nice error alerts

// --- Axios Configuration ---
axios.defaults.withCredentials = true; // to send cookies with requests
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // 1. Initialize user from localStorage if available (Persist on refresh)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userInfo");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // --- LOGIN FUNCTION ---
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data)); // Save to local storage
      toast.success("Login Successful!");
      return true; 
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- SIGNUP FUNCTION ---
  const signup = async (username, email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/signup", {
        username,
        email,
        password,
      });

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast.success("Account Created!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup Failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT FUNCTION ---
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout"); // Clear backend cookie
      setUser(null);
      localStorage.removeItem("userInfo"); // Clear frontend storage
      toast.info("Logged out");
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  // Value object exposed to the rest of the app
  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};