import { useState } from "react";
import { FaUserPlus, FaTimes, FaEnvelope } from "react-icons/fa";

const AddMemberModal = ({ isOpen, onClose, onAdd, channelName }) => {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onAdd(email);
    setEmail(""); // Reset input
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-blue-600">
             <div className="bg-blue-100 p-2 rounded-full">
               <FaUserPlus size={16} />
             </div>
             <h2 className="text-lg font-bold text-gray-800">Add Member</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FaTimes />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Add a user to <span className="font-bold text-gray-700">#{channelName}</span> by their email address.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              User Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <FaEnvelope />
              </span>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition transform active:scale-95"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;