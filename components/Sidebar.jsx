import { assets } from "@/assets/assets";
import React from "react";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext.jsx"; // Ensure this is correctly imported

const Sidebar = ({ expand, setExpand }) => {
  const { openSignIn } = useClerk();
  const { user } = useAppContext();

  return (
    <div
      className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all z-50 max-md:absolute max-h-screen ${
        expand ? "p-4 w-64" : "md:w-20 w-0 max-md:overflow-hidden"
      }`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Image
            className={expand ? "w-36" : "w-10"}
            src={expand ? assets.logo_text : assets.logo_icon}
            alt="Logo"
            width={expand ? 144 : 40}
            height={40}
          />

          {/* Close/Open Sidebar Button */}
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
        <button
          className={`mt-8 flex items-center justify-center cursor-pointer ${
            expand ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max" : ""
          }`}
        >
          <Image
            className={expand ? "w-6" : "w-7"}
            src={expand ? assets.chat_icon : assets.chat_icon_dull}
            alt="Chat Icon"
            width={24}
            height={24}
          />
          {expand && <p className="text-white text-base font-medium">New chat</p>}
        </button>
      </div>

     {/* Get App Section */}
<div
  className={`relative flex items-center cursor-pointer group ${
    expand
      ? "gap-1 text-white/80 text-sm p-2.5 border-primary rounded-lg hover:bg-white/10"
      : "h-10 w-10 mx-auto hover:bg-gray-500/30 rounded-lg"
  }`}
>
  <Image
    className={expand ? "w-5" : "w-6.5 mx-auto"}
    src={expand ? assets.phone_icon : assets.phone_icon_dull}
    alt="Scan QR"
    width={24}
    height={24}
  />

  {/* QR Code Tooltip */}
  <div
    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-48 bg-black text-white text-center p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition"
  >
    <Image
      src={assets.qrcode}
      alt="QR Code"
      width={160}
      height={160}
      className="mx-auto"
    />
    <p className="mt-2 text-xs">Scan to get DeeoSeek App</p>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-3 h-3 bg-black rotate-45"></div>
  </div>

  {expand && (
    <>
      <span>Get App</span>
      <Image src={assets.new_icon} alt="New Icon" width={16} height={16} />
    </>
  )}
</div>

      {/* Profile Section */}
      <div
        onClick={user ? undefined : openSignIn}
        className={`flex items-center ${
          expand ? "hover:bg-white/10 rounded-lg" : "justify-center w-full"
        } gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer`}
      >
        {user ? <UserButton /> : <Image src={assets.profile_icon} alt="Profile Icon" width={28} height={28} />}
        {expand && <span>My Profile</span>}
      </div>
    </div>
  );
};

export default Sidebar;
