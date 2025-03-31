import React, { useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { motion, AnimatePresence } from "framer-motion";

const ChatLabel = ({ chatName, index, onRename, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(chatName);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleRename = () => {
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleSave = () => {
    if (newName.trim() !== "" && newName !== chatName) {
      onRename(index, newName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
    setMenuOpen(false);
  };

  const confirmDelete = () => {
    onDelete(index);
    setShowDeleteConfirmation(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="relative group flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 transition">
      {/* Chat Name or Input Field */}
      {isEditing ? (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-white border border-gray-500 px-2 py-1 rounded-md w-full focus:ring focus:ring-indigo-400"
          autoFocus
        />
      ) : (
        <span className="text-white truncate">{chatName}</span>
      )}

      {/* Three-Dot Menu Button */}
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="opacity-0 group-hover:opacity-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 p-1 rounded"
        aria-label="Open menu"
      >
        <Image src={assets.menu_icon} alt="Menu" width={16} height={16} />
      </button>

      {/* Dropdown Menu with Animation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-8 bg-gray-800 text-white text-sm rounded-md shadow-md p-2 z-10"
          >
            <button
              onClick={handleRename}
              className="block w-full hover:bg-gray-600 p-1 rounded transition"
            >
              ✏ Rename
            </button>
            <button
              onClick={handleDelete}
              className="block w-full text-red-500 hover:bg-gray-600 p-1 rounded transition"
            >
              🗑 Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white text-black p-4 rounded-md shadow-lg"
            >
              <p>Are you sure you want to delete this chat?</p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={cancelDelete}
                  className="bg-gray-300 p-2 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-500 p-2 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatLabel;
