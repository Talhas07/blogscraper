"use client";

import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, persistor, RootState } from "@/redux/store/store";
import { logout } from "@/redux/store/slices/userSlice";
import { ChevronLeft, ChevronRight, LogOut, User, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Header from "./header";
const getFullImageUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${path}`;
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, loading } = useSelector(
    (state: RootState) => state.user
  );
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // useEffect(() => {
  //   if (!loading && (!user || !token)) {
  //     router.push("/auth/login");
  //   }
  //   if (!user || !token) {
  //     router.push("/auth/login");
  //   }
  // }, [user, token, loading, router]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  //     </div>
  //   );
  // }
  /////////////////////////////////
  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    router.push("/auth/login");
  };
  return (
    <ThemeProvider>
      <div className="flex h-screen bg-white">
        <Sidebar
          collapsed={collapsed}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <main className="flex-1 overflow-auto lg:pt-0">
          <Header
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            user={user}
            handleLogout={handleLogout}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
