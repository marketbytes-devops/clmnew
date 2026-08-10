import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/appContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MarketBytes CLM - Stage 1 Requester Portal",
  description: "Next-Generation Commercial Contract Intake & Orchestration",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#f1f6f0]`}
      style={{ colorScheme: 'light' }}
    >
      <body className="min-h-full flex flex-col bg-[#f1f6f0] text-[#1c2918] selection:bg-[#d5e7cd] selection:text-[#1e3416]">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
