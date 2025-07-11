"use client";

import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store/store";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, token, loading } = useSelector(
    (state: RootState) => state.user
  );
  const router = useRouter();

  // Sidebar state
  const [collapsed, setCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !token)) {
      router.push("/auth/login");
    }
    if (!user || !token) {
      router.push("/auth/login");
    }
  }, [user, token, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  /////////////////////////////////

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-white">
        <Sidebar
          collapsed={collapsed}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <main className="flex-1 overflow-auto pt-16 lg:pt-0">{children}</main>
      </div>
    </ThemeProvider>
  );
}
