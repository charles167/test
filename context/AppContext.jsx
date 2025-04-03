"use client";
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

// Create context
const AppContext = createContext(null);

// Custom hook to use the AppContext
export const useAppContext = () => {
  return useContext(AppContext);
};

// Provider component
export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState(null); // Cache token state

  const fetchAuthToken = useCallback(async () => {
    try {
      const token = await getToken({ template: "charles" });
      setAuthToken(token); // Set token state
    } catch (error) {
      console.error("🚨 Error fetching token:", error);
      toast.error("Failed to fetch authentication token.");
    }
  }, [getToken]);

  // Fetch auth token on first load or when user changes
  useEffect(() => {
    if (user && !authToken) {
      fetchAuthToken();
    }
  }, [user, authToken, fetchAuthToken]);

  const createNewChat = async () => {
    try {
      if (!user || !authToken) return;

      setLoading(true);

      const { data } = await axios.post("/api/chat/create", {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (data.success) {
        await fetchUserChats(); // Ensure state updates immediately
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("🚨 Error creating chat:", error);
      toast.error("Failed to create chat.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChats = useCallback(async () => {
    try {
      if (!user || !authToken) return;

      setLoading(true);

      const { data } = await axios.get("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (data.success) {
        console.log("✅ User Chats:", data.chats);
        setChats(data.chats);

        if (data.chats.length === 0) {
          await createNewChat();
        } else {
          data.chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          setSelectedChat(data.chats[0]);
          console.log("🔵 Selected Chat:", data.chats[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("🚨 Error fetching chats:", error);
      toast.error("Failed to load chats.");
    } finally {
      setLoading(false);
    }
  }, [user, authToken, createNewChat]);

  useEffect(() => {
    if (user && authToken) {
      fetchUserChats();
    }
  }, [user, authToken, fetchUserChats]);

  return (
    <AppContext.Provider value={{ user, chats, setChats, selectedChat, setSelectedChat, fetchUserChats, createNewChat, loading }}>
      {children}
    </AppContext.Provider>
  );
};
