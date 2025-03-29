"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { assets } from "@/assets/assets";
import Message from "@/components/Message";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

export default function Home() {
  const [expand, setExpand] = useState(false);
  const [messages, setMessages] = useState([]); // Chat messages
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState("");

  // Handle search input change
  const handleSearch = (e) => setSearchTerm(e.target.value);

  // Fetch response from Gemini API
  const handleSearchSubmit = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key is missing. Check environment variables.");

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        { contents: [{ parts: [{ text: searchTerm }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("API Response:", response.data);
      const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from API.";
      
      setSearchResult(generatedText);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: searchTerm },
        { role: "assistant", content: generatedText },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSearchResult("Error fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to the bottom of the message list when new messages are added
  useEffect(() => {
    const chatContainer = document.querySelector('.space-y-4');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar expand={expand} setExpand={setExpand} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
        <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
          <Image onClick={() => setExpand(!expand)} className="rotate-180 cursor-pointer" src={assets.menu_icon} alt="Menu" width={30} height={30} />
          <Image className="opacity-70 cursor-pointer" src={assets.chat_icon} alt="Chat" width={30} height={30} />
        </div>

        {/* Chat Search */}
        <div className="w-full max-w-2xl mt-4">
          <input type="text" className="w-full px-4 py-2 bg-[#333] text-white rounded-lg" placeholder="Search..." value={searchTerm} onChange={handleSearch} />
          <button onClick={handleSearchSubmit} className="mt-2 px-4 py-2 bg-[#4CAF50] text-white rounded-lg" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Message Area */}
        <div className="w-full max-w-2xl space-y-4 overflow-y-auto mt-4">
          {messages.length > 0 ? messages.map((msg, index) => <Message key={index} role={msg.role} content={msg.content} />) : (
            <div className="flex flex-col items-center mt-4">
              <div className="flex items-center gap-3">
                <Image src={assets.logo_icon} alt="Logo" width={64} height={64} />
                <p className="text-2xl font-medium">Hi, I'm Charlesdeep</p>
              </div>
              <p className="text-sm mt-2">How can I help today?</p>
            </div>
          )}
        </div>

        {/* Prompt Input Box */}
        <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
        <p className="text-xs absolute bottom-1 text-gray-500">AI-generated, for reference only</p>
      </div>
    </div>
  );
}
