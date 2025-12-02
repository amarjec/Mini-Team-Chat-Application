import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { FaCircle } from "react-icons/fa";

const ENDPOINT = import.meta.env.VITE_BACKEND_URL;

const ChatPage = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // 1. Fetch All Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/auth/users");
        setAllUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  // 2. Initialize Socket
  useEffect(() => {
    if (user) {
      const newSocket = io(ENDPOINT);
      setSocket(newSocket);
      newSocket.emit("add_user", user._id);
      newSocket.on("get_users", (users) => setOnlineUserIds(users));
      return () => newSocket.close();
    }
  }, [user]);

  // 3. Join Channel
  useEffect(() => {
    if (socket && currentChannel) {
      socket.emit("join_channel", currentChannel._id);
    }
  }, [currentChannel, socket]);

  // --- RESPONSIVE LAYOUT LOGIC ---

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      
      {/* 1. LEFT SIDEBAR */}
      {/* Mobile: Hidden if channel selected. Desktop: Always Flex */}
      <div className={`flex-col h-full w-full md:w-64 bg-gray-900 text-white flex-shrink-0 ${
        currentChannel ? "hidden md:flex" : "flex"
      }`}>
        <Sidebar
          currentChannel={currentChannel}
          setCurrentChannel={setCurrentChannel}
          socket={socket}
        />
      </div>

      {/* 2. MIDDLE CHAT WINDOW */}
      {/* Mobile: Hidden if NO channel selected. Desktop: Always Flex */}
      <div className={`flex-1 flex-col h-full bg-white relative min-w-0 ${
        !currentChannel ? "hidden md:flex" : "flex"
      }`}>
        <ChatWindow
          currentChannel={currentChannel}
          setCurrentChannel={setCurrentChannel}
          socket={socket}
          currentUser={user}
          // Pass function to go back to sidebar on mobile
          onBack={() => setCurrentChannel(null)} 
        />
      </div>

      {/* 3. RIGHT USER LIST */}
      {/* Hidden on Mobile/Tablet, Flex on Large Screens (lg) */}
      <div className="w-64 bg-gray-50 border-l border-gray-200 hidden lg:flex flex-col p-4 overflow-y-auto flex-shrink-0">
        <div className="mb-6">
          <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-4">
            Online - {onlineUserIds.length}
          </h3>
          <ul className="space-y-2">
            {allUsers.map((u) => {
              if (onlineUserIds.includes(u._id)) {
                return (
                  <li key={u._id} className="flex items-center text-sm font-medium text-gray-700 truncate">
                    <FaCircle className="text-green-500 text-[10px] mr-2 flex-shrink-0" />
                    <span className="truncate">{u.username} {user._id === u._id && "(You)"}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-4">
            Offline - {allUsers.length - onlineUserIds.length}
          </h3>
          <ul className="space-y-2 opacity-60">
            {allUsers.map((u) => {
              if (!onlineUserIds.includes(u._id)) {
                return (
                  <li key={u._id} className="flex items-center text-sm text-gray-600 truncate">
                    <FaCircle className="text-gray-300 text-[10px] mr-2 border border-gray-400 rounded-full flex-shrink-0" />
                    <span className="truncate">{u.username}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;