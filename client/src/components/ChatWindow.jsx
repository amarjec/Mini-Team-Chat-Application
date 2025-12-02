import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  FaPaperPlane, FaUserPlus, FaSignOutAlt, FaEdit, 
  FaTrash, FaTimes, FaBan, FaSearch, FaLock, FaHashtag, FaArrowLeft 
} from "react-icons/fa";
import moment from "moment";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import AddMemberModal from "./AddMemberModal";

const ChatWindow = ({ currentChannel, socket, currentUser, setCurrentChannel, onBack }) => { 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isMember = currentChannel?.members?.some((member) => {
    if (typeof member === "string") return member === currentUser._id;
    return member._id === currentUser._id;
  });

  useEffect(() => {
    if (currentChannel) {
      setIsSearchOpen(false);
      setSearchQuery("");
      setIsSearching(false);
      setTypingUsers([]);
      cancelEdit();
      fetchMessages();
    }
  }, [currentChannel]);

  const fetchMessages = async (query = "") => {
    try {
      const url = query 
        ? `/api/messages/${currentChannel._id}?search=${query}`
        : `/api/messages/${currentChannel._id}`;
      const { data } = await axios.get(url);
      setMessages(data);
      if (!query) scrollToBottom();
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (!socket) return;
    const handleMessageReceive = (message) => {
      if (isSearching) return;
      if (currentChannel && message.channel === currentChannel._id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        const senderName = message.sender?.username || "User";
        setTypingUsers((prev) => prev.filter(user => user !== senderName));
      }
    };
    const handleTyping = (username) => {
       if(isSearching) return;
       setTypingUsers((prev) => (!prev.includes(username) ? [...prev, username] : prev));
       scrollToBottom();
    };
    const handleStopTyping = (username) => {
       setTypingUsers((prev) => prev.filter((u) => u !== username));
    };
    const handleMessageUpdated = (updatedMsg) => {
      setMessages((prev) => 
        prev.map((msg) => (msg._id === updatedMsg._id ? { ...msg, content: updatedMsg.content, isDeleted: updatedMsg.isDeleted, updatedAt: new Date().toISOString() } : msg))
      );
    };
    const handleMessageDeleted = (deletedId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== deletedId));
    };

    socket.on("receive_message", handleMessageReceive);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("message_updated", handleMessageUpdated);
    socket.on("message_deleted", handleMessageDeleted);

    return () => {
      socket.off("receive_message", handleMessageReceive);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("message_updated", handleMessageUpdated);
      socket.off("message_deleted", handleMessageDeleted);
    };
  }, [socket, currentChannel, isSearching]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !currentChannel) return;
    socket.emit("typing", { channel: currentChannel._id, username: currentUser.username });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { channel: currentChannel._id, username: currentUser.username });
    }, 2000);
  };

  const handleSearchSubmit = (e) => { e.preventDefault(); if (!searchQuery.trim()) return; setIsSearching(true); fetchMessages(searchQuery); };
  const clearSearch = () => { setSearchQuery(""); setIsSearching(false); setIsSearchOpen(false); fetchMessages(); };
  const handleJoinChannel = async () => { try { const { data } = await axios.put(`/api/channels/${currentChannel._id}/join`); setCurrentChannel(data); toast.success(`Joined #${data.name}!`); } catch (error) { toast.error("Failed to join"); }};
  const handleLeaveClick = () => setIsLeaveModalOpen(true);
  const handleConfirmLeave = async () => { try { const { data } = await axios.put(`/api/channels/${currentChannel._id}/leave`); setCurrentChannel(data); toast.info(`Left #${data.name}`); } catch (error) { toast.error("Failed to leave"); }};
  const handleAddMemberClick = () => { setIsAddMemberModalOpen(true); };
  const handleAddMemberSubmit = async (email) => { try { await axios.put(`/api/channels/${currentChannel._id}/add_member`, { email }); toast.success("User added successfully!"); } catch (error) { toast.error(error.response?.data?.message || "Failed to add user"); }};
  const startEdit = (msg) => { setEditingMessageId(msg._id); setNewMessage(msg.content); };
  const cancelEdit = () => { setEditingMessageId(null); setNewMessage(""); };
  const clickDelete = (msgId) => { setMessageToDelete(msgId); setIsDeleteModalOpen(true); };
  const confirmDelete = async () => { try { await axios.delete(`/api/messages/${messageToDelete}`); toast.success("Message deleted"); } catch (error) { toast.error("Failed to delete"); }};
  
  const handleSendOrUpdate = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChannel) return;
    socket.emit("stop_typing", { channel: currentChannel._id, username: currentUser.username });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (editingMessageId) {
      try {
        await axios.put(`/api/messages/${editingMessageId}`, { content: newMessage });
        setMessages((prev) => prev.map((msg) => (msg._id === editingMessageId ? { ...msg, content: newMessage, updatedAt: new Date().toISOString() } : msg)));
        cancelEdit();
        toast.success("Message updated");
      } catch (error) { toast.error("Failed to edit"); }
    } else {
      const messageData = { sender: currentUser._id, channel: currentChannel._id, content: newMessage, createdAt: new Date().toISOString() };
      socket.emit("send_message", messageData);
      setNewMessage("");
    }
  };

  if (!currentChannel) return <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">Select a channel</div>;

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-white relative w-full">
        
        {/* HEADER */}
        <div className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6 justify-between shadow-sm bg-white z-10 shrink-0">
          
          <div className="flex-1 flex items-center min-w-0">
            {/* MOBILE: Back Button */}
            <button 
              onClick={onBack} 
              className="mr-3 text-gray-500 md:hidden p-2 rounded-full hover:bg-gray-100"
            >
              <FaArrowLeft />
            </button>

            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center w-full max-w-md bg-gray-100 rounded-md px-3 py-1">
                 <FaSearch className="text-gray-400 mr-2 shrink-0" />
                 <input 
                    type="text" 
                    className="bg-transparent border-none focus:outline-none flex-1 text-sm min-w-0"
                    placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus
                 />
                 <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600 ml-2"><FaTimes /></button>
              </form>
            ) : (
              <div className="truncate">
                <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2 truncate">
                  {currentChannel.type === 'private' ? <FaLock size={14} className="shrink-0"/> : <FaHashtag size={14} className="shrink-0"/>}
                  <span className="truncate">{currentChannel.name}</span>
                </h2>
                <span className="text-sm text-gray-500">{currentChannel.members?.length || 0} members</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
             {!isSearchOpen && (
               <button onClick={() => setIsSearchOpen(true)} className="text-gray-400 hover:text-blue-600 transition p-2 rounded-full hover:bg-gray-100"><FaSearch /></button>
             )}
             {currentChannel.type === 'private' && isMember && (
                <button onClick={handleAddMemberClick} className="text-gray-400 hover:text-blue-600 transition p-2 rounded-full hover:bg-gray-100"><FaUserPlus size={18} /></button>
             )}
             {isMember && (
                <button onClick={handleLeaveClick} className="text-red-400 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"><FaSignOutAlt size={18} /></button>
             )}
          </div>
        </div>

        {/* SEARCH BANNER */}
        {isSearching && (
           <div className="bg-yellow-50 px-6 py-2 text-xs text-yellow-800 border-b border-yellow-200 flex justify-between items-center shrink-0">
              <span className="truncate">Found {messages.length} result(s)</span>
              <button onClick={clearSearch} className="underline hover:text-yellow-900 ml-2 whitespace-nowrap">Clear</button>
           </div>
        )}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50 custom-scrollbar w-full">
          {messages.length === 0 && isSearching ? (
             <div className="text-center text-gray-400 mt-10">No messages found.</div>
          ) : (
            messages.map((msg, index) => {
                const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
                const isMe = senderId === currentUser._id;
                const senderName = msg.sender?.username || "User";
                const isEdited = !msg.isDeleted && msg.updatedAt && msg.createdAt && msg.updatedAt !== msg.createdAt;

                return (
                <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                    <div className={`relative max-w-[85%] md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 shadow-sm wrap-break-words ${
                    isMe ? "bg-blue-600 text-white" : "bg-white text-gray-800 border border-gray-200"
                    }`}>
                    {!isMe && <p className="text-xs font-bold text-blue-600 mb-1">{senderName}</p>}
                    
                    <p className={`text-sm whitespace-pre-wrap flex items-center gap-2 ${msg.isDeleted ? "italic opacity-60" : ""}`}>
                        {msg.isDeleted && <FaBan className="text-xs shrink-0" />}
                        {msg.content}
                    </p>
                    
                    <div className="flex justify-end items-center mt-1 gap-1">
                        <p className={`text-[10px] ${isMe ? "text-blue-200" : "text-gray-400"}`}>{moment(msg.createdAt).format("LT")}</p>
                        {isEdited && <span className={`text-[10px] italic ${isMe ? "text-blue-200" : "text-gray-400"}`}>(edited)</span>}
                    </div>

                    {isMe && !msg.isDeleted && !isSearching && (
                        <div className="absolute top-0 -left-16 hidden group-hover:flex gap-1 bg-white shadow-md p-1 rounded-md border border-gray-100 z-10">
                        <button onClick={() => startEdit(msg)} className="text-gray-500 hover:text-blue-600 p-1.5 rounded hover:bg-gray-100"><FaEdit size={12} /></button>
                        <button onClick={() => clickDelete(msg._id)} className="text-gray-500 hover:text-red-600 p-1.5 rounded hover:bg-gray-100"><FaTrash size={12} /></button>
                        </div>
                    )}
                    </div>
                </div>
                );
            })
          )}
          
          {!isSearching && typingUsers.length > 0 && (
             <div className="flex justify-start animate-pulse mb-2">
               <div className="bg-gray-200 text-gray-500 text-xs px-4 py-2 rounded-full truncate max-w-full">
                  <span className="font-bold">{typingUsers.join(", ")}</span> is typing...
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* FOOTER */}
        {!isSearching && (
            <div className="p-3 md:p-4 bg-white border-t border-gray-200 shrink-0">
            {isMember ? (
                <form onSubmit={handleSendOrUpdate} className="flex gap-2 relative items-center">
                {editingMessageId && (
                    <div className="absolute -top-10 left-0 right-0 bg-blue-50 text-blue-800 text-xs px-4 py-2 flex justify-between items-center rounded-t-lg border-t border-x border-blue-200">
                    <span>Editing...</span>
                    <button type="button" onClick={cancelEdit} className="hover:text-red-500"><FaTimes /></button>
                    </div>
                )}
                <input
                    type="text"
                    className={`flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 min-w-0 ${
                    editingMessageId ? "border-blue-300 ring-2 ring-blue-500 bg-blue-50" : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Message..."
                    value={newMessage}
                    onChange={handleInputChange}
                />
                <button type="submit" className={`${editingMessageId ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white p-3 rounded-full transition shadow-md shrink-0`}>
                    {editingMessageId ? <FaEdit size={14} /> : <FaPaperPlane size={14} />}
                </button>
                </form>
            ) : (
                <button onClick={handleJoinChannel} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition flex items-center justify-center gap-2">
                <FaUserPlus /> Join
                </button>
            )}
            </div>
        )}
      </div>

      <ConfirmModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} onConfirm={handleConfirmLeave} title="Leave Channel?" message={`Leave #${currentChannel.name}?`} />
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Message?" message="Confirm delete?" />
      <AddMemberModal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} onAdd={handleAddMemberSubmit} channelName={currentChannel.name} />
    </>
  );
};

export default ChatWindow;