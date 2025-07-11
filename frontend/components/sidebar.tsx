"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart,
  Menu,
  X,
  Users,
  UserCircle2,
  LayoutDashboardIcon,
  CreativeCommonsIcon,
  Book,
} from "lucide-react";

export default function Sidebar({
  collapsed,
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  collapsed: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.user);
  const isAdmin = user?.type === "admin";
  const isUser = user?.type === "user";
  const isClient = user?.type === "client";

  const routes = [
    ...(isAdmin
      ? [
          {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboardIcon,
          },
          {
            name: "Create Blog",
            path: "/admin/add-blog",
            icon: Book,
          },
          {
            name: "Create a Category",
            path: "/admin/add-category",
            icon: ClipboardList,
          },
          {
            name: "All Blogs",
            path: "/admin/blogs",
            icon: BarChart,
          },
        ]
      : []),
    ...(isUser
      ? [
          // {
          //   name: "Dashboard",
          //   path: "/dashboard",
          //   icon: LayoutDashboard,
          // },
          // {
          //   name: "Reports",
          //   path: "/dashboard/reports",
          //   icon: BarChart,
          // },
          // {
          //   name: "Assessments",
          //   path: "/dashboard/clients",
          //   icon: UserCircle2,
          // },
          {
            name: "Create Blog",
            path: "/admin/add-blog",
            icon: LayoutDashboard,
          },
          {
            name: "Create a Category",
            path: "/admin/add-category",
            icon: ClipboardList,
          },
          {
            name: "All Blogs",
            path: "/admin/blogs",
            icon: BarChart,
          },
        ]
      : []),
    ...(isClient
      ? [
          {
            name: "Dashboard",
            path: "/dashboard/client-dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Reports",
            path: "/dashboard/client-reports",
            icon: BarChart,
          },
          {
            name: "Assessments",
            path: "/dashboard/client-assessment",
            icon: UserCircle2,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static h-screen bg-white border-r transition-all duration-300 ease-in-out z-40 flex flex-col",
          collapsed ? "w-20" : "w-56",
          "top-0 left-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "p-3.5 border-b hidden lg:flex items-center justify-center gap-2  transition-all duration-300",
            collapsed && "justify-center p-3.5"
          )}
        >
          <Link href="/admin/add-blog" className="flex items-center gap-2">
            <Image
              src="/gold.png"
              alt="CyberAssess Logo"
              width={collapsed ? 48 : 48}
              height={collapsed ? 48 : 48}
              className="text-blue-500"
            />
            {!collapsed && (
              <span className="font-semibold mt-3 text-brown-600 ">
                GoldBuzz
              </span>
            )}
          </Link>
        </div>
        <nav
          className={cn(
            "flex-1 p-4 space-y-1 mt-16 lg:mt-0 transition-all duration-300",
            collapsed && "p-2"
          )}
        >
          {routes.map((route) => {
            const isActive =
              route.path === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(route.path);
            const Icon = route.icon;

            return (
              <Link
                key={route.path}
                href={route.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-violet-50 text-violet-500 font-medium"
                    : "text-gray-600 hover:bg-gray-100",
                  collapsed && "justify-center px-2 gap-0"
                )}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span className="ml-2">{route.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
