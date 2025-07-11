"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store/store";
import Link from "next/link";

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, token } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user && token) {
      router.push("/dashboard");
    }
  }, [user, token, router]);

  return (
    <main className="h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow">
        {/* Logo */}
        <div className="text-2xl font-bold text-brown-600 flex items-center space-x-2 justify-center">
          <img src="/gold.png" alt="Logo" className="h-10" />

          <Link className="mt-2" href="/">
            GoldBuzz
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="space-x-4">
          {/* <Link href="/auth/register">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 border-3 border-blue-500 text-white rounded-lg ">
              Register
            </button>
          </Link> */}
          <Link href="/auth/login">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 border-3  border-blue-500 text-white rounded-lg ">
              Login
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-280px)] ">
        {children}
      </div>
    </main>
  );
}
