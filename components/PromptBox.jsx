import React, { useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const PromptBox = ({ setIsLoading, isLoading }) => {
  const [prompt, setPrompt] = useState("");

  console.log("Arrow Icon Path:", assets.arrow_icon); // Debugging

  return (
    <form className="w-full max-w-2xl bg-[#404045] p-4 rounded-3xl mt-4 transition-all">
      <textarea
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white"
        rows={2}
        placeholder="Message DeepSeek"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

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
          <Image
            className="h-4 w-4 cursor-pointer"
            src={assets.pin_icon}
            alt="Pin Icon"
            width={16}
            height={16}
          />

          {/* Submit Button */}
          <button
            className={`${
              prompt ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500"
            } rounded-full p-2 cursor-pointer transition`}
            disabled={!prompt}
          >
            <Image
              className="h-4 w-4"
              src={prompt ? assets.arrow_icon || "/default-arrow.svg" : assets.arrow_icon_dull || "/default-arrow-dull.svg"}
              alt="Send"
              width={16}
              height={16}
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
