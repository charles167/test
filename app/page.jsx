"use client";
import { assets } from "@/assets/assets";
import Message from "@/components/Message";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [expand, setExpand] = useState(false);
  const [messages, setMessages] = useState([]); // Chat messages
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar expand={expand} setExpand={setExpand} />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
          
          {/* Mobile Menu */}
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image
              onClick={() => setExpand(!expand)}
              className="rotate-180 cursor-pointer"
              src={assets.menu_icon}
              alt="Menu"
              width={30}
              height={30}
            />
            <Image 
              className="opacity-70 cursor-pointer" 
              src={assets.chat_icon} 
              alt="Chat" 
              width={30} 
              height={30} 
            />
          </div>

          {/* Message Area */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                <Image src={assets.logo_icon} alt="Logo" width={64} height={64} />
                <p className="text-2xl font-medium">Hi, I'm Charlesdeep</p>
              </div>
              <p className="text-sm mt-2">How can I help today?</p>
            </div>
          ) : (
            <div className="w-full max-w-2xl space-y-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <Message key={index} role={msg.role} content={msg.content} />
              ))}
            </div>
          )}

          {/* Prompt Input Box */}
          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />

          {/* Disclaimer */}
          <p className="text-xs absolute bottom-1 text-gray-500">
            AI-generated, for reference only
          </p>
        </div>
      </div>
    </div>
  );
}
