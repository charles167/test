import { assets } from "@/assets/assets";
import Image from "next/image";
import React from "react";

const Message = ({ role, content, onCopy, onEdit, onRegenerate, onLike, onDislike }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div className={`flex flex-col w-full mb-8 ${role === "user" ? "items-end" : ""}`}>
        <div
          className={`group relative flex max-w-2xl py-3 rounded-xl transition ${role === "user" ? "bg-[#414158] px-5" : "gap-3"}`}
        >
          {/* Hover Icons */}
          <div
            className={`opacity-0 group-hover:opacity-100 absolute transition-all flex items-center gap-2 ${
              role === "user" ? "-left-10 top-2.5" : "left-10 bottom-6"
            }`}
          >
            <Image
              src={assets.copy_icon}
              alt="Copy message"
              width={16}
              height={16}
              className="cursor-pointer hover:bg-gray-500 p-1 rounded-full"
              onClick={onCopy}
              aria-label="Copy message"
            />
            {role === "user" ? (
              <Image
                src={assets.pencil_icon}
                alt="Edit message"
                width={16}
                height={16}
                className="cursor-pointer hover:bg-gray-500 p-1 rounded-full"
                onClick={onEdit}
                aria-label="Edit message"
              />
            ) : (
              <>
                <Image
                  src={assets.regenerate_icon}
                  alt="Regenerate message"
                  width={16}
                  height={16}
                  className="cursor-pointer hover:bg-gray-500 p-1 rounded-full"
                  onClick={onRegenerate}
                  aria-label="Regenerate message"
                />
                <Image
                  src={assets.like_icon}
                  alt="Like message"
                  width={16}
                  height={16}
                  className="cursor-pointer hover:bg-gray-500 p-1 rounded-full"
                  onClick={onLike}
                  aria-label="Like message"
                />
                <Image
                  src={assets.dislike_icon}
                  alt="Dislike message"
                  width={16}
                  height={16}
                  className="cursor-pointer hover:bg-gray-500 p-1 rounded-full"
                  onClick={onDislike}
                  aria-label="Dislike message"
                />
              </>
            )}
          </div>

          {/* Message Content */}
          {role === "user" ? (
            <span className="text-white/90 break-words">{content}</span>
          ) : (
            <div className="flex gap-3 items-start w-full">
              <Image
                src={assets.logo_icon}
                alt="Logo"
                width={36}
                height={36}
                className="p-1 border border-white/15 rounded-full"
              />
              <div className="space-y-4 w-full overflow-hidden break-words">{content}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
