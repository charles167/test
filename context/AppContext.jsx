"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

const AppContext = createContext(null);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Fetch token only if not already set
  const fetchAuthToken = useCallback(async () => {
    if (!authToken) {
      try {
        const token = await getToken({ template: "charles" });
        setAuthToken(token);
      } catch (error) {
        console.error("🚨 Error fetching token:", error);
        toast.error("Failed to fetch authentication token.");
      }
    }
  }, [getToken, authToken]);

  useEffect(() => {
    if (user) {
      fetchAuthToken();  // Fetch token when the user is available
    }
  }, [user, fetchAuthToken]);

  const fetchUserChats = useCallback(async () => {
    if (!authToken || loading) return;

    setLoading(true);

    try {
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (data.success) {
        console.log("✅ User Chats:", data.chats);
        setChats(data.chats);
        if (data.chats.length > 0) {
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
  }, [authToken, loading]);

  useEffect(() => {
    if (user && authToken) {
      fetchUserChats(); // Fetch chats once user and token are available
    }
  }, [user, authToken, fetchUserChats]);

  return (
    <AppContext.Provider
      value={{ user, chats, setChats, selectedChat, setSelectedChat, fetchUserChats, loading }}
    >
      {children}
    </AppContext.Provider>
  );
};
