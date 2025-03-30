import React, { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";
import ChatLabel from "./ChatLabel";
import axios from "axios";
import { toast } from "react-toastify";
import ReactLoading from "react-loading"; 

const Sidebar = ({ expand, setExpand }) => {
  const { openSignIn } = useClerk();
  const { user, chats = [], setChats, createNewChat } = useAppContext();
  const [newChatName, setNewChatName] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Function to create a new chat
  const handleCreateNewChat = async () => {
    if (!newChatName.trim()) {
      toast.error("Chat name cannot be empty.");
      return;
    }

    setIsCreatingChat(true);
    try {
      const { data } = await axios.post("/api/chat/ai", { title: newChatName });
      setChats((prevChats) => [...prevChats, data.chat]);
      setNewChatName("");
    } catch (error) {
      toast.error("Failed to create chat.");
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Fetch chats
  const fetchChats = async () => {
    setIsLoading(true);
    setError(null); 
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key is missing.");
  
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        { contents: [{ parts: [{ text: "Hello, Gemini!" }] }] },
        { headers: { "Content-Type": "application/json" } }
      );
  
      const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from API.";
      setChats([generatedText]);
    } catch (error) {
      console.error("Error fetching chats:", error.response?.data || error.message);
      setError("Failed to load chats. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const filteredChats = useMemo(() => 
    chats.filter(chat => chat?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false), 
    [chats, searchQuery]
  );

  // Keyboard accessibility for expanding sidebar and dark mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        setExpand(!expand);
      }
      if (e.key === "d" || e.key === "D") {
        setIsDarkMode(!isDarkMode);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expand, isDarkMode]);

  return (
    <div className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all z-50 max-md:absolute max-h-screen ${expand ? "p-4 w-64" : "md:w-20 w-0 max-md:overflow-hidden"} sidebar-transition`}>
      {/* Top Section */}
      <div>
        <div className="flex items-center justify-between">
          <Image className={expand ? "w-36" : "w-10"} src={expand ? assets.logo_text : assets.logo_icon} alt="Logo" width={expand ? 144 : 40} height={40} />
          <button onClick={() => setExpand(!expand)} className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 rounded-lg cursor-pointer">
            <Image src={expand ? assets.sidebar_close_icon : assets.menu_icon} alt="Toggle Sidebar" width={28} height={28} />
          </button>
        </div>

        {/* New Chat Button */}
        <button onClick={handleCreateNewChat} className={`mt-8 flex items-center justify-center cursor-pointer ${expand ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max" : ""}`}>
          <Image className={expand ? "w-6" : "w-7"} src={expand ? assets.chat_icon : assets.chat_icon_dull} alt="Chat Icon" width={24} height={24} />
          {expand && <p className="text-white text-base font-medium">New chat</p>}
        </button>

        {/* Chat Creation Input */}
        {expand && (
          <div className="mt-4">
            <input type="text" placeholder="Enter new chat name" value={newChatName} onChange={(e) => setNewChatName(e.target.value)} className="p-2 bg-gray-800 text-white rounded-md" />
          </div>
        )}

        {/* Recent Chats List */}
        {expand && (
          <div className="mt-4">
            <p className="text-gray-400 text-sm mb-2">Recents</p>
            <input type="text" placeholder="Search chats" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-2 mb-4 bg-gray-800 text-white rounded-md" />
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <ReactLoading type="spin" color="#ffffff" height={40} width={40} />
              </div>
            ) : (
              <>
                {error && (
                  <div className="text-red-500 text-center mt-4">
                    {error}
                    <button
                      onClick={fetchChats}
                      className="mt-2 bg-blue-500 text-white p-2 rounded-lg"
                    >
                      Retry
                    </button>
                  </div>
                )}
                <div className="space-y-2 overflow-y-auto max-h-72 pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-none">
                  {filteredChats.map((chat) => (
                    <ChatLabel key={chat._id} chatId={chat._id} chatName={chat.title || "Untitled Chat"} onRename={handleRenameChat} onDelete={handleDeleteChat} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div onClick={user ? () => setIsProfileDropdownOpen(!isProfileDropdownOpen) : openSignIn} className={`flex items-center ${expand ? "hover:bg-white/10 rounded-lg" : "justify-center w-full"} gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer`}>
        {user ? <UserButton /> : <Image src={assets.profile_icon} alt="Profile Icon" width={28} height={28} />}
        {expand && <span>{user ? "My Profile" : "Sign In"}</span>}
      </div>

      {/* Profile Dropdown */}
      {isProfileDropdownOpen && (
        <div className="absolute mt-2 right-0 bg-gray-800 text-white rounded-lg shadow-lg w-48">
          <button className="block w-full p-2 hover:bg-gray-600 text-left" onClick={() => console.log('Profile settings')}>Profile Settings</button>
          <button className="block w-full p-2 hover:bg-gray-600 text-left" onClick={() => console.log('Sign out')}>Sign Out</button>
        </div>
      )}

      {/* Dark Mode Toggle */}
      <div className="mt-4">
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="bg-primary p-2 rounded-lg text-white">
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
