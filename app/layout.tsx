import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import FirebaseStatusBanner from "@/components/FirebaseStatusBanner";
import AppShell from "@/components/AppShell";
import ToastContainer from "@/components/ToastContainer";

const fontClassName = "font-sans";

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
      <body className={`${fontClassName} bg-[#0b0f19] text-slate-100 min-h-screen flex flex-col antialiased`}>
        <AuthProvider>
          <FirebaseStatusBanner />
          <AppShell>{children}</AppShell>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
