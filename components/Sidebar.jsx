import React, { useState, useEffect } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import ReactLoading from "react-loading";

const Sidebar = ({ expand, setExpand }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    // Simulate fetching chats (replace with actual API call if needed)
    setIsLoading(true);
    setTimeout(() => {
      setChats([{ title: "Chat 1" }, { title: "Chat 2" }]); // Example chats
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex flex-col bg-[#212327] pt-7 transition-all z-50 ${expand ? "p-4 w-64" : "w-20"}`}>
      <div className="flex items-center justify-between">
        <Image src={assets.logo_icon} alt="Logo" width={40} height={40} />
        <button onClick={() => setExpand(!expand)} className="p-2">
          <Image src={assets.menu_icon} alt="Toggle Sidebar" width={28} height={28} />
        </button>
      </div>

      <button onClick={() => {}} className="mt-8 p-2 text-white">
        New Chat
      </button>

      {expand && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded-md w-full"
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <ReactLoading type="spin" color="#ffffff" height={40} width={40} />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredChats.map((chat, index) => (
            <div key={index} className="text-white">{chat.title}</div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="bg-primary p-2 rounded-lg text-white">
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
