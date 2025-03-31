import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const PromptBox = ({ setIsLoading, isLoading }) => {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const [typingMessage, setTypingMessage] = useState("");
  const { user, chats, setChats, selectedChat, setSelectedChat } = useAppContext();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  const updateChatMessages = (chatId, newMessage) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === chatId ? { ...chat, messages: [...chat.messages, newMessage] } : chat
      )
    );
    setSelectedChat((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const sendPrompt = async () => {
    if (!prompt.trim()) return;
    if (!user) return toast.error("Login to send a message");
    if (isLoading) return toast.error("Please wait for the previous response");

    setIsLoading(true);
    setError(null);
    setPrompt("");

    const userPrompt = { role: "user", content: prompt, timestamp: Date.now() };
    updateChatMessages(selectedChat._id, userPrompt);

    try {
      const { data } = await axios.post("/api/chat/ai", { chatId: selectedChat._id, prompt });
      if (!data.success) throw new Error(data.message || "An error occurred");

      setTypingMessage("Assistant is typing...");
      let i = 0;
      const interval = setInterval(() => {
        if (i < data.data.content.length) {
          setTypingMessage(data.data.content.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          updateChatMessages(selectedChat._id, { role: "assistant", content: data.data.content, timestamp: Date.now() });
          setTypingMessage("");
        }
      }, 50);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); sendPrompt(); }} className="w-full max-w-2xl bg-[#404045] p-4 rounded-3xl mt-4">
      <textarea
        ref={textareaRef}
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden bg-transparent text-white"
        rows={2}
        placeholder="Message Gemini"
        required
        onChange={(e) => { setPrompt(e.target.value); setError(null); }}
        value={prompt}
        disabled={isLoading}
      />
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <div className="flex items-center justify-between mt-2">
        <button className={`p-2 rounded-full transition ${!prompt.trim() || isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`} disabled={!prompt.trim() || isLoading}>
          {isLoading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Image src={assets.arrow_icon} alt="Send" width={16} height={16} />}
        </button>
      </div>
    </form>
  );
};

export default PromptBox;