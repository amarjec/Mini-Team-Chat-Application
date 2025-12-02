import { useState, useEffect } from "react";
import axios from "axios";
import { FaHashtag, FaPlus, FaSignOutAlt, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import CreateChannelModal from "./CreateChannelModal";

const Sidebar = ({ currentChannel, setCurrentChannel, socket }) => {
  const [channels, setChannels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (!socket || !user) return;
    const handleNewChannel = (newChannel) => {
      setChannels((prev) => {
        if (prev.find((c) => c._id === newChannel._id)) return prev;
        if (newChannel.type === "private") {
          const isMember = newChannel.members.some((m) =>
            (typeof m === "string" ? m : m._id) === user._id
          );
          if (!isMember) return prev;
        }
        return [newChannel, ...prev];
      });
    };
    socket.on("new_channel", handleNewChannel);
    return () => socket.off("new_channel", handleNewChannel);
  }, [socket, user]);

  const fetchChannels = async () => {
    try {
      const { data } = await axios.get("/api/channels");
      setChannels(data);
      // (User should see list first on mobile)
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateSubmit = async (channelData) => {
    try {
      const { data } = await axios.post("/api/channels/create", {
        name: channelData.name,
        description: channelData.description,
        type: channelData.type,
      });
      setCurrentChannel(data);
      toast.success(`Channel #${data.name} created!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create channel");
    }
  };

  return (
    <>
      <div className="flex flex-col w-full h-full">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 font-bold text-lg truncate shadow-sm bg-gray-900 z-10 flex-shrink-0">
          {user?.username}'s Workspace
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex justify-between items-center mb-4 text-gray-400 group">
            <span className="uppercase text-xs font-semibold tracking-wider group-hover:text-gray-300 transition">
              Channels
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="hover:text-white hover:bg-gray-700 p-1 rounded transition"
              title="Create Channel"
            >
              <FaPlus size={12} />
            </button>
          </div>

          <ul className="space-y-1">
            {channels.map((channel) => (
              <li key={channel._id}>
                <button
                  onClick={() => setCurrentChannel(channel)}
                  className={`w-full flex items-center px-2 py-3 md:py-1.5 rounded text-sm transition-all duration-200 ${
                    currentChannel?._id === channel._id
                      ? "bg-blue-700 text-white shadow-md font-medium"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                  }`}
                >
                  {channel.type === "private" ? (
                    <FaLock className={`mr-2 text-xs flex-shrink-0 ${currentChannel?._id === channel._id ? "text-blue-300" : "opacity-50"}`} />
                  ) : (
                    <FaHashtag className={`mr-2 text-xs flex-shrink-0 ${currentChannel?._id === channel._id ? "text-blue-300" : "opacity-50"}`} />
                  )}
                  <span className="truncate">{channel.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
              <span className="text-sm font-medium truncate">
                {user?.username}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition p-1 hover:bg-gray-700 rounded"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>

      <CreateChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateSubmit}
      />
    </>
  );
};

export default Sidebar;