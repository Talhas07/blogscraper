"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/redux/store/slices/userSlice";
import { AppDispatch } from "@/redux/store/store";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resultAction = await dispatch(login({ email, password }));
      console.log("Login result:", resultAction);
      if (login.fulfilled.match(resultAction)) {
        toast.success("Login successful!");
        const type = resultAction.payload.user.type;
        router.push(
          type === "admin" || type === "user"
            ? "/admin/add-blog"
            : "/admin/add-blog"
        );
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/gold.png" alt="Logo" className="h-10" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
          Sign In
        </h2>
        {/* <p className="text-sm text-center text-gray-500 mb-6">
          Welcome back Jhon!
        </p> */}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="adminnextjs@gmail.com"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex justify-between">
              <span>Password</span>
              <a href="#" className="text-red-500 text-sm hover:underline">
                Forget password?
              </a>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-indigo-600"
            />
            <label htmlFor="remember" className="text-sm text-gray-600">
              Remember password?
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition duration-200"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <a href="#" className="text-indigo-600 hover:underline font-medium">
            Sign Up
          </a>
        </p>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Socials */}
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full">
            <i className="fab fa-facebook-f"></i>
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full">
            <i className="fab fa-google"></i>
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full">
            <i className="fab fa-microsoft"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
