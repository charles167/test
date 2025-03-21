"use client";
import { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";

// Create the context
const AppContext = createContext(null);

// Custom hook to use the AppContext
export const useAppContext = () => {
    return useContext(AppContext);
};

// Provider component
export const AppContextProvider = ({ children }) => {
    const { user } = useUser();

    const value = {
        user,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
