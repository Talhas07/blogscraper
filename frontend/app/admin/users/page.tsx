"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsersByRole,
  deleteUserById,
  updateUserById,
  createUserThunk,
} from "@/redux/store/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store/store";
import { toast } from "sonner";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define a type for the user object
interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  parentId?: string;
  parent?: {
    name: string;
    email: string;
  };
  industry?: string;
  employeeCount?: string;
  createdAt: string;
  assignedTo?: string;
}

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.user.usersByRole);
  const loading = useSelector((state: RootState) => state.user.loading);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    type: "user",
    assignedTo: "",
    industry: "",
    employeeCount: "",
  });
  const [industries, setIndustries] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchUsersByRole("all"));
    fetchIndustries();
  }, [dispatch]);

  const fetchIndustries = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/industries`
      );
      const data = await response.json();
      console.log("Industries:", data);
      setIndustries(data);
    } catch (error) {
      console.error("Error fetching industries:", error);
      toast.error("Failed to fetch industries");
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await dispatch(deleteUserById(userId)).unwrap();
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser({
      ...user,
      assignedTo: user.parentId || "",
      industry: user.industry || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const userData = {
        ...editingUser,
        ...(editingUser.type === "client" && editingUser.assignedTo
          ? {
              assignedTo: parseInt(editingUser.assignedTo, 10),
            }
          : {}),
      };
      console.log("User Data to Update:", userData);
      await dispatch(
        updateUserById({ userId: userData.id, userData })
      ).unwrap();

      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const filteredUsers = users.filter(
    (user: any) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 bg-[url('/image.png')] bg-cover">
      {/* <Sidebar /> */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-semibold text-gray-800 ">
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage users and their roles
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Created At
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user: any) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.firstName || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap capitalize">
                              {user.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Edit Dialog */}
              {isEditDialogOpen && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Edit User</h2>
                      <button
                        onClick={() => setIsEditDialogOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={editingUser.name || ""}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={editingUser.email || ""}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              email: e.target.value,
                            })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="role"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Role
                        </label>
                        <select
                          id="role"
                          value={editingUser.type || ""}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              type: e.target.value,
                            })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="client">Client</option>
                        </select>
                      </div>
                      {editingUser.type === "client" && (
                        <>
                          <div>
                            <Label htmlFor="industry">Industry</Label>
                            <Select
                              value={editingUser.industry || ""}
                              onValueChange={(value) =>
                                setEditingUser({
                                  ...editingUser,
                                  industry: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                {industries.map((industry: any) => (
                                  <SelectItem
                                    key={industry.id}
                                    value={industry.name}
                                  >
                                    {industry.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label
                              htmlFor="assigned-to"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Assign to User
                            </label>
                            <select
                              id="assigned-to"
                              value={editingUser.assignedTo || ""}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  assignedTo: e.target.value,
                                })
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select a user</option>
                              {users
                                .filter((user: any) => user.type === "user")
                                .map((user: any) => (
                                  <option key={user.id} value={user.id}>
                                    {user.name || user.email}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </>
                      )}
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => setIsEditDialogOpen(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
