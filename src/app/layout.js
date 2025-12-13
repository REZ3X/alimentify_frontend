import { Space_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ChatBubble from "@/components/ChatBubble";

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata = {
  title: "Alimentify - Know Your Nutrition",
  description: "AI-powered food nutrition analysis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${spaceMono.variable} antialiased font-sans`}
      >
        <AuthProvider>
          {children}
          <ChatBubble />
        </AuthProvider>
      </body>
    </html>
  );
}
