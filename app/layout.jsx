import { Roboto } from 'next/font/google';

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

// Importing the Inter font
const inter = Inter({
  subsets: ["latin"], // Specify which subsets to include
  variable: "--font-inter", // Define a CSS variable
});

export const metadata = {
  title: "CharlesDeep",
  description: "Full stack dev",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <AppContextProvider>
            <Toaster
              toastOptions={{
                success: { className: "toast-success" },
                error: { className: "toast-error" },
              }}
            />
            {children}
          </AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
