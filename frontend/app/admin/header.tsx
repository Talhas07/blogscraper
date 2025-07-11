import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  X,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  user: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    // email?: string;
  } | null;
  handleLogout: () => void;
  isSidebarOpen: boolean; // NEW
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>; // NEW
}

const Header: React.FC<HeaderProps> = ({
  collapsed,
  setCollapsed,
  searchTerm,
  setSearchTerm,
  user,
  handleLogout,
  isSidebarOpen, // NEW
  setIsSidebarOpen, // NEW
}) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center p-4 border-b">
      <div className="flex items-center gap-3 w-full">
        {/* Mobile sidebar toggle button */}
        <button
          className="p-2 hover:bg-gray-100 rounded-md lg:hidden"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        {/* Desktop sidebar toggle button */}
        <button
          className="p-2 hover:bg-gray-100 rounded-md hidden lg:flex"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <h1 className="text-xl lg:text-2xl font-bold flex-shrink-0">
          Dashboard
        </h1>
        {/* User info - Mobile (moved here) */}
        <div className="flex items-center gap-2 justify-end w-full lg:hidden">
          <div className="text-right">
            <p className="text-sm font-medium truncate max-w-[120px]">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer rounded-full hover:ring-2 hover:ring-gray-200 transition-all">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${user?.avatar}` ||
                      ""
                    }
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                  <AvatarFallback>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Search bar - Desktop */}
        {/* <div className="relative flex-1 ml-0 lg:ml-6 h-10 mt-2 lg:mt-0 hidden lg:block">
          <Input
            placeholder="Search for results..."
            className="pl-10 w-full lg:w-72 text-sm lg:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div> */}
      </div>
      {/* Search bar - Mobile (moved to second row) */}
      <div className="relative w-full h-10 lg:hidden">
        <Input
          placeholder="Search for results..."
          className="pl-10 w-full text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      {/* User info - Desktop */}
      <div className="hidden lg:flex items-center gap-2 lg:gap-3 justify-end w-full lg:w-auto">
        <div className="text-right lg:flex-none">
          <p className="text-sm font-medium truncate max-w-[120px] lg:max-w-none">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer rounded-full hover:ring-2 hover:ring-gray-200 transition-all">
              <Avatar className="h-10 w-10 lg:h-11 lg:w-11">
                <AvatarImage
                  src={
                    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${user?.avatar}` ||
                    ""
                  }
                  alt={`${user?.firstName} ${user?.lastName}`}
                />
                <AvatarFallback>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
