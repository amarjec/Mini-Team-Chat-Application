import { useState } from "react";
import { FaTimes, FaLock, FaGlobe } from "react-icons/fa";

const CreateChannelModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name, description, type: isPrivate ? "private" : "public" });
    setName("");
    setDescription("");
    setIsPrivate(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Create New Channel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- CHANNEL NAME INPUT --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel Name
            </label>
            <div className="relative">
              {/* Hash Icon */}
              <span className="absolute left-3 top-2.5 text-gray-500 z-10 select-none">#</span>
              
              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                }
                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                placeholder="e.g. general-chat" 
                required
                autoFocus
              />
            </div>
          </div>

          {/* --- DESCRIPTION INPUT --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
              placeholder="What's this channel about?"
            />
          </div>

          {/* --- PRIVACY TOGGLE --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                  !isPrivate
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-200 text-gray-600 bg-white"
                }`}
              >
                <FaGlobe /> Public
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                  isPrivate
                    ? "bg-red-50 border-red-500 text-red-700"
                    : "border-gray-200 text-gray-600 bg-white"
                }`}
              >
                <FaLock /> Private
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isPrivate
                ? "Only invited members can view and join this channel."
                : "Anyone in the workspace can view and join this channel."}
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;