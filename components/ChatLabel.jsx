import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const ChatLabel = ({ chatName, index, onRename, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(chatName);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          className="bg-transparent text-white border border-gray-500 px-2 py-1 rounded-md w-full"
          autoFocus
          role="textbox"
        />
      ) : (
        <span className="text-white">{chatName}</span>
      )}

      {/* Three-Dot Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="opacity-0 group-hover:opacity-100 transition"
        aria-label="Open menu"
        aria-expanded={menuOpen ? "true" : "false"}
        tabIndex={0} // Enables keyboard focus
      >
        <Image src={assets.menu_icon} alt="Menu" width={16} height={16} />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-8 bg-gray-800 text-white text-sm rounded-md shadow-md p-2 z-10"
          style={{ minWidth: "120px" }} // Ensures a proper dropdown size
        >
          <button
            onClick={handleRename}
            className="block w-full hover:bg-gray-600 p-1 rounded"
            aria-label="Rename chat"
          >
            ✏ Rename
          </button>
          <button
            onClick={() => onDelete(index)}
            className="block w-full text-red-500 hover:bg-gray-600 p-1 rounded"
            aria-label="Delete chat"
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatLabel;
