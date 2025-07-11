"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FolderPlus, Tag, Send, Plus, Edit, X, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export default function CategorySubcategoryForm() {
  const { token } = useSelector((state: RootState) => state.user);

  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] =
    useState<Category | null>(null);

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`
      );
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`,
        { name: categoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Category added successfully");
      setCategoryName("");
      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategories`,
        {
          name: subcategoryName,
          categoryId: selectedCategoryId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Subcategory added successfully");
      setSubcategoryName("");
      setSelectedCategoryId("");
      setIsSubcategoryModalOpen(false);
      setSelectedCategoryForSubcategory(null);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to add subcategory");
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategories/${subcategoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Subcategory deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete subcategory");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const openSubcategoryModal = (category: Category) => {
    setSelectedCategoryForSubcategory(category);
    setSelectedCategoryId(category.id);
    setIsSubcategoryModalOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 to-slate-100 bg-[url('/image.png')] bg-cover bg-center bg-no-repeat p-4">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header with Add Category Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Categories & Subcategories
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage your content categories and subcategories
            </p>
          </div>

          <Dialog
            open={isCategoryModalOpen}
            onOpenChange={setIsCategoryModalOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="mx-auto w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-2">
                  <FolderPlus className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Add New Category
                </DialogTitle>
                <DialogDescription className="text-center text-sm sm:text-base text-gray-600">
                  Create a new category to organize your content
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddCategory} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="categoryName"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Category Name
                  </Label>
                  <Input
                    id="categoryName"
                    type="text"
                    placeholder="Enter category name..."
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                    className="h-10 text-base border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    className="w-full h-10 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Table */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Subcategories</TableHead>
                  <TableHead className="font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FolderPlus className="w-4 h-4 text-purple-600" />
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories &&
                        category.subcategories.length > 0 ? (
                          category.subcategories.map((subcategory) => (
                            <span
                              key={subcategory.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm group hover:bg-red-50 transition-colors"
                            >
                              <Tag className="w-3 h-3" />
                              {subcategory.name}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    className="ml-1 p-0.5 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete subcategory"
                                  >
                                    <X className="w-3 h-3 text-red-600" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the subcategory "
                                      {subcategory.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteSubcategory(subcategory.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No subcategories
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubcategoryModal(category)}
                          className="hover:bg-purple-50 hover:border-purple-300"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Subcategory
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-red-50 hover:border-red-300 text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete Category
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the category "{category.name}
                                " and all its subcategories.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-gray-500"
                    >
                      No categories found. Add your first category to get
                      started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Subcategory Modal */}
        <Dialog
          open={isSubcategoryModalOpen}
          onOpenChange={setIsSubcategoryModalOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-2">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Add New Subcategory
              </DialogTitle>
              <DialogDescription className="text-center text-base text-gray-600">
                Create a subcategory under "
                {selectedCategoryForSubcategory?.name}"
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddSubcategory} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label
                  htmlFor="parentCategory"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  Parent Category
                </Label>
                <Input
                  value={selectedCategoryForSubcategory?.name || ""}
                  disabled
                  className="h-10 text-base bg-gray-50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="subcategoryName"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  Subcategory Name
                </Label>
                <Input
                  id="subcategoryName"
                  type="text"
                  placeholder="Enter subcategory name..."
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  required
                  className="h-10 text-base border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  className="w-full h-10 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Add Subcategory
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
