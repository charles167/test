"use client";  // Add this directive at the top of the file

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

  // Fetch auth token only if user exists
  const fetchAuthToken = useCallback(async () => {
    if (user && !authToken) {
      try {
        const token = await getToken({ template: "charles" });
        setAuthToken(token); // Set token state
      } catch (error) {
        console.error("🚨 Error fetching token:", error);
        toast.error("Failed to fetch authentication token.");
      }
    }
  }, [getToken, user, authToken]);

  // Fetch user chats when user and authToken are available
  const fetchUserChats = useCallback(async () => {
    if (!user || !authToken) return; // Ensure user and authToken are available

    setLoading(true);
    try {
      const { data } = await axios.get("/api/chat/get", { // ✅ Updated API URL
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (data.success) {
        console.log("✅ User Chats:", data.chats);
        setChats(data.chats);

        if (data.chats.length === 0) {
          await createNewChat();
        } else {
          // Sorting chats by last updated time and selecting the most recent chat
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
  }, [user, authToken]);

  // Fetch chats on initial load or when user/authToken changes
  useEffect(() => {
    fetchAuthToken();
  }, [fetchAuthToken]);

  useEffect(() => {
    if (authToken) {
      fetchUserChats(); // Fetch user chats once the authToken is available
    }
  }, [authToken, fetchUserChats]);

  // Create new chat if needed
  const createNewChat = useCallback(async () => {
    if (!user || !authToken) return;
    try {
      setLoading(true);
      const { data } = await axios.post("/api/chat/create", {}, { // ✅ Updated API URL
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (data.success) {
        await fetchUserChats(); // Ensure state updates immediately after creating chat
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("🚨 Error creating chat:", error);
      toast.error("Failed to create chat.");
    } finally {
      setLoading(false);
    }
  }, [user, authToken, fetchUserChats]);

  // Memoize context value to avoid unnecessary re-renders
  const contextValue = useMemo(() => ({
    user, chats, setChats, selectedChat, setSelectedChat, fetchUserChats, createNewChat, loading
  }), [user, chats, selectedChat, loading]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
