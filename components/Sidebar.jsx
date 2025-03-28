import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";
import ChatLabel from "./ChatLabel";

const Sidebar = ({ expand, setExpand }) => {
  const { openSignIn } = useClerk();
  const { user, chats, setChats, createNewChat } = useAppContext();

  // Handle chat renaming (optimized with useCallback)
  const handleRenameChat = useCallback((chatId, newName) => {
    const updatedChats = chats.map((chat) =>
      chat._id === chatId ? { ...chat, title: newName } : chat
    );
    setChats(updatedChats);
  }, [chats, setChats]);

  // Handle chat deletion (optimized with useCallback)
  const handleDeleteChat = useCallback((chatId) => {
    setChats(chats.filter((chat) => chat._id !== chatId));
  }, [chats, setChats]);

  return (
    <div className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all z-50 max-md:absolute max-h-screen ${expand ? "p-4 w-64" : "md:w-20 w-0 max-md:overflow-hidden"} sidebar-transition`}>
      {/* Top Section */}
      <div>
        <div className="flex items-center justify-between">
          <Image
            className={expand ? "w-36" : "w-10"}
            src={expand ? assets.logo_text : assets.logo_icon}
            alt="Logo"
            width={expand ? 144 : 40}
            height={40}
          />
          <button
            onClick={() => setExpand(!expand)}
            className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 rounded-lg cursor-pointer"
          >
            <Image
              src={expand ? assets.sidebar_close_icon : assets.menu_icon}
              alt="Toggle Sidebar"
              width={28}
              height={28}
            />
          </button>
        </div>

        {/* New Chat Button */}
        <button onClick={createNewChat} className={`mt-8 flex items-center justify-center cursor-pointer ${expand ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max" : ""}`}>
          <Image className={expand ? "w-6" : "w-7"} src={expand ? assets.chat_icon : assets.chat_icon_dull} alt="Chat Icon" width={24} height={24} />
          {expand && <p className="text-white text-base font-medium">New chat</p>}
        </button>

        {/* Recent Chats List */}
        {expand && (
          <div className="mt-4">
            <p className="text-gray-400 text-sm mb-2">Recents</p>
            <div className="space-y-2 overflow-y-auto max-h-72 pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-none">
              {chats.map((chat) => (
                <ChatLabel
                  key={chat._id}
                  chatId={chat._id}
                  chatName={chat.title || `Chat`}
                  onRename={handleRenameChat}
                  onDelete={handleDeleteChat}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div onClick={user ? undefined : openSignIn} className={`flex items-center ${expand ? "hover:bg-white/10 rounded-lg" : "justify-center w-full"} gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer`}>
        {user ? <UserButton /> : <Image src={assets.profile_icon} alt="Profile Icon" width={28} height={28} />}
        {expand && <span>{user ? "My Profile" : "Sign In"}</span>}
      </div>
    </div>
  );
};

export default Sidebar;
