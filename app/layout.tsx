import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import FirebaseStatusBanner from "@/components/FirebaseStatusBanner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ToastContainer from "@/components/ToastContainer";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "StudyMate Hub | Note-Sharing & Peer Learning Platform",
  description: "Share PDF lecture notes, discover study partners, and join course study groups across universities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} bg-[#0b0f19] text-slate-100 font-sans min-h-screen flex flex-col antialiased`}>
        <AuthProvider>
          <FirebaseStatusBanner />
          <Navbar />
          
          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            <Sidebar />
            
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl overflow-x-hidden">
              {children}
            </main>
          </div>

          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
