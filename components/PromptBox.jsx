import React, { useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const PromptBox = ({ setIsLoading, isLoading }) => {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null); // Error state
  const { user, chats, setChats, selectedChat, setSelectedChat } = useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  // Helper function to update chat messages
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

  const sendPrompt = async (e) => {
    e.preventDefault();
    const promptCopy = prompt;

    try {
      if (!user) return toast.error("Login to send a message");
      if (isLoading) return toast.error("Please wait for the previous response");

      setIsLoading(true);
      setPrompt("");
      setError(null); // Reset error before making request

      const userPrompt = {
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      };

      // Ensure selectedChat is defined before attempting to access messages
      if (!selectedChat || !selectedChat._id) {
        setError("Please select a chat.");
        setIsLoading(false);
        return;
      }

      updateChatMessages(selectedChat._id, userPrompt);

      // Call API
      const { data } = await axios.post("/api/chat/ai", {
        chatId: selectedChat._id,
        prompt,
      });

      console.log("API response:", data);

      if (data.success) {
        const assistantMessage = {
          role: "assistant",
          content: "Assistant is typing...", // Placeholder text
          timestamp: Date.now(),
        };

        // Update chat with placeholder message
        updateChatMessages(selectedChat._id, assistantMessage);

        // Simulate typing effect
        const message = data.data.content;
        let i = 0;
        const typingInterval = setInterval(() => {
          if (i < message.length) {
            setSelectedChat((prev) => {
              const updatedMessages = [...prev.messages];
              updatedMessages[updatedMessages.length - 1] = {
                ...assistantMessage,
                content: message.slice(0, i + 1),
              };
              return { ...prev, messages: updatedMessages };
            });
            i++;
          } else {
            clearInterval(typingInterval);
          }
        }, 50);
      } else {
        setError(data.message || "An error occurred while processing your request.");
        setPrompt(promptCopy);
      }
    } catch (error) {
      setError(error.message || "An error occurred while sending your message.");
      toast.error(error.message);
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={sendPrompt} className="w-full max-w-2xl bg-[#404045] p-4 rounded-3xl mt-4 transition-all">
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white"
        rows={2}
        placeholder="Message DeepSeek"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
        disabled={isLoading} // Disable input while loading
        aria-placeholder="Message DeepSeek"
      />

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

      <div className="flex items-center justify-between text-sm mt-2">
        {/* Left Buttons */}
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5 w-5" src={assets.deepthink_icon} alt="DeepThink Icon" width={20} height={20} />
            DeepThink (R1)
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5 w-5" src={assets.search_icon} alt="Search Icon" width={20} height={20} />
            Search
          </p>
        </div>

        {/* Right Section - Pin & Submit Button */}
        <div className="flex items-center gap-1">
          {/* Pin Icon */}
          <Image className="h-4 w-4 cursor-pointer" src={assets.pin_icon} alt="Pin Icon" width={16} height={16} />

          {/* Submit Button */}
          <button
            aria-label="Send message"
            className={`${
              prompt && !isLoading ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500"
            } rounded-full p-2 cursor-pointer transition`}
            disabled={!prompt || isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Image
                className="h-4 w-4"
                src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
                alt="Send"
                width={16}
                height={16}
              />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
