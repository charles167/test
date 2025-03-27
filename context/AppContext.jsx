"use client";
import { createContext, useContext, useEffect, useState } from "react";
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

    const createNewChat = async () => {
        try {
            if (!user) return null;

            setLoading(true); // Prevent multiple requests
            const token = await getToken();

            const { data } = await axios.post("/api/chat/create", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                await fetchUserChats(); // Ensure state updates immediately
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error creating chat:", error);
            toast.error("Failed to create chat.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserChats = async () => {
        try {
            if (!user) return;

            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get("/api/chat/get", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                console.log("User Chats:", data.chats);
                setChats(data.chats);

                // If no chats exist, create a new one automatically
                if (data.chats.length === 0) {
                    await createNewChat();
                } else {
                    // Sort chats by updated date (latest first)
                    data.chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setSelectedChat(data.chats[0]);
                    console.log("Selected Chat:", data.chats[0]);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching chats:", error);
            toast.error("Failed to load chats.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserChats();
        }
    }, [user]);

    const value = {
        user,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchUserChats,
        createNewChat,
        loading
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
