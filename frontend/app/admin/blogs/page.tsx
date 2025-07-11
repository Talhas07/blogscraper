"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Trash2,
  Calendar,
  User,
  Tag,
  FileText,
  Loader2,
  Edit,
  PenTool,
  ImageIcon,
  Save,
} from "lucide-react";
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
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import "react-quill-new/dist/quill.snow.css";
import CustomQuillEditor from "@/components/QuillEditor";

interface Blog {
  id: number;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: string;
  image?: string;
  mediaType?: 'image' | 'video' | null;
  titleImage?: string;
  createdAt: string;

  subCategory: {
    id: string;
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
}

interface SubCategory {
  id: string;
  name: string;
}

// Helper to get full image URL
const getFullImageUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${path}`;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editMetaTitle, setEditMetaTitle] = useState("");
  const [editMetaDescription, setEditMetaDescription] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSubCategoryId, setEditSubCategoryId] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editTitleImage, setEditTitleImage] = useState<File | null>(null);
  const [editTitleImagePreviewUrl, setEditTitleImagePreviewUrl] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const { user, token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    fetchBlogs();
    fetchSubCategories();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blogs/user/${user?.id}`
      );
      setBlogs(response.data);
    } catch (error) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategories`
      );
      setSubCategories(response.data);
    } catch (error) {
      toast.error("Failed to load subcategories");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blogs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Blog deleted successfully");
      setBlogs(blogs.filter((blog) => blog.id !== id));
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  const handleView = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setEditTitle(blog.title);
    setEditMetaTitle(blog.metaTitle || "");
    setEditMetaDescription(blog.metaDescription || "");
    setEditContent(blog.content);
    setEditSubCategoryId(blog.subCategory.id);
    setEditImage(null);
    setEditTitleImage(null);
    setEditTitleImagePreviewUrl(null);
    setIsEditDialogOpen(true);
  };

  // Handle title image preview in edit form
  const handleEditTitleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditTitleImage(file);

    // Clear previous preview
    if (editTitleImagePreviewUrl) {
      URL.revokeObjectURL(editTitleImagePreviewUrl);
      setEditTitleImagePreviewUrl(null);
    }

    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setEditTitleImagePreviewUrl(url);
    }
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (editTitleImagePreviewUrl) {
        URL.revokeObjectURL(editTitleImagePreviewUrl);
      }
    };
  }, [editTitleImagePreviewUrl]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlog) return;

    setEditLoading(true);

    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("metaTitle", editMetaTitle);
    formData.append("metaDescription", editMetaDescription);
    formData.append("content", editContent);
    formData.append("subCategoryId", editSubCategoryId);

    if (editImage) {
      formData.append("image", editImage);
    }
    if (editTitleImage) {
      formData.append("titleImage", editTitleImage);
    }

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blogs/${selectedBlog.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Blog updated successfully!");
      setIsEditDialogOpen(false);

      // Update the blog in the local state
      setBlogs(
        blogs.map((blog) =>
          blog.id === selectedBlog.id ? { ...blog, ...response.data } : blog
        )
      );

      // Reset form
      setEditTitle("");
      setEditMetaTitle("");
      setEditMetaDescription("");
      setEditContent("");
      setEditSubCategoryId("");
      setEditImage(null);
      setEditTitleImage(null);
      setEditTitleImagePreviewUrl(null);
      setSelectedBlog(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update blog");
    } finally {
      setEditLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.subCategory?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 bg-[url('/image.png')] bg-contain ">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Blog Management</h1>
          <p className="text-slate-600 text-lg">
            Manage and view all your blog posts
          </p>
        </div>

        {/* Search and Stats */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search blogs, authors, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{filteredBlogs.length}</span>
                  <span>blogs found</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading blogs...</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
            {filteredBlogs.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No blogs found
                  </h3>
                  <p className="text-slate-600">
                    Try adjusting your search criteria
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Blog Title Image - Responsive */}
                      {blog.titleImage && (
                        <div className="w-full sm:w-48 h-32 sm:h-32 flex-shrink-0">
                          <img
                            src={getFullImageUrl(blog.titleImage)}
                            alt={blog.title}
                            className="w-full h-full object-cover rounded-lg shadow-sm"
                          />
                        </div>
                      )}

                      {/* Blog Content - Responsive */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                            {blog.title}
                          </h3>
                          {blog.metaTitle && (
                            <p className="text-sm text-slate-600 mb-2">
                              Meta Title: {blog.metaTitle}
                            </p>
                          )}
                          {blog.metaDescription && (
                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                              Meta Description: {blog.metaDescription}
                            </p>
                          )}
                          <div 
                            className="text-slate-600 text-sm line-clamp-2 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                          />
                        </div>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs bg-slate-100 text-slate-700">
                                {getInitials(
                                  blog.user?.firstName,
                                  blog.user?.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-slate-700 font-medium">
                              {blog.user?.firstName} {blog.user?.lastName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {blog.subCategory?.name && (
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {blog.subCategory.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions - Responsive */}
                      <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                        <Button
                          onClick={() => handleView(blog)}
                          variant="outline"
                          size="sm"
                          className="border-slate-200 hover:bg-slate-50 h-10 px-3 w-full"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleEdit(blog)}
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 h-10 px-3 w-full"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-10 px-3 w-full"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(blog.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="space-y-4">
                {/* Title Image in View Dialog */}
                {selectedBlog?.titleImage && (
                  <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                    <img
                      src={getFullImageUrl(selectedBlog.titleImage)}
                      alt={selectedBlog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <DialogTitle className="text-2xl font-bold text-slate-900 pr-8">
                  {selectedBlog?.title}
                </DialogTitle>
                {selectedBlog?.metaTitle && (
                  <p className="text-sm text-slate-600">
                    Meta Title: {selectedBlog.metaTitle}
                  </p>
                )}
                {selectedBlog?.metaDescription && (
                  <p className="text-sm text-slate-600">
                    Meta Description: {selectedBlog.metaDescription}
                  </p>
                )}
              </div>
            </DialogHeader>

            {selectedBlog && (
              <div className="space-y-6">
                {/* Featured Media */}
                {selectedBlog.image && (
                  <div className="w-full">
                    {selectedBlog.mediaType === 'video' ? (
                      <video
                        src={getFullImageUrl(selectedBlog.image)}
                        controls
                        className="w-full max-h-96 object-contain rounded-lg shadow-md"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={getFullImageUrl(selectedBlog.image)}
                        alt={selectedBlog.title}
                        className="w-full max-h-96 object-contain rounded-lg shadow-md"
                      />
                    )}
                  </div>
                )}

                {/* Meta Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="h-4 w-4" />
                      <span>Author</span>
                    </div>
                    <p className="font-medium text-slate-900">
                      {selectedBlog.user?.firstName}{" "}
                      {selectedBlog.user?.lastName}
                    </p>
                  </div>

                  <div className="space-y-1  max-w-xs">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Tag className="h-4 w-4" />
                      <span>Category</span>
                    </div>
                    <p className="font-medium text-slate-900 truncate break-words">
                      {selectedBlog.subCategory?.name || "Uncategorized"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>Published</span>
                    </div>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedBlog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Blog Content */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content
                  </h4>
                  <div className="prose prose-slate max-w-none">
                    <div 
                      className="text-slate-700 leading-relaxed bg-white p-6 rounded-lg border border-slate-200 quill-content"
                      dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                    />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent
            className="!w-[900px] max-w-none max-h-[90vh] overflow-y-auto "
            style={{ width: "900px", maxWidth: "95vw" }} // You can adjust 900px as needed
          >
            <DialogHeader>
              <div className="text-center space-y-2 pb-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Edit Blog Post
                </DialogTitle>
                <p className="text-lg text-gray-600">
                  Update your blog content and settings
                </p>
              </div>
            </DialogHeader>

            {selectedBlog && (
              <div className="space-y-6">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-title"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Title
                    </Label>
                    <Input
                      id="edit-title"
                      type="text"
                      placeholder="Enter an engaging blog title..."
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                      className="h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-meta-title"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Meta Title
                    </Label>
                    <Input
                      id="edit-meta-title"
                      type="text"
                      placeholder="Enter SEO meta title (optional)..."
                      value={editMetaTitle}
                      onChange={(e) => setEditMetaTitle(e.target.value)}
                      className="h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    />
                    <p className="text-sm text-gray-500">
                      A meta title is used for SEO purposes. If left empty, the blog title will be used.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-meta-description"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Meta Description
                    </Label>
                    <Textarea
                      id="edit-meta-description"
                      placeholder="Enter SEO meta description (optional)..."
                      value={editMetaDescription}
                      onChange={(e) => setEditMetaDescription(e.target.value)}
                      className="min-h-[100px] text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    />
                    <p className="text-sm text-gray-500">
                      A meta description is used for SEO purposes. It should be a brief summary of the blog post.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-content"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      Content
                    </Label>
                    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto">
                      <CustomQuillEditor
                        value={editContent}
                        onChange={setEditContent}
                        className="bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-200"
                        token={token}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-subcategory"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      Subcategory
                    </Label>
                    <Select
                      value={editSubCategoryId}
                      onValueChange={setEditSubCategoryId}
                      required
                    >
                      <SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select a subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-title-image"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Title Image
                    </Label>
                    <div className="space-y-3">
                      {selectedBlog.titleImage && !editTitleImagePreviewUrl && (
                        <div className="w-full max-w-xs">
                          <p className="text-sm text-gray-600 mb-2">
                            Current title image:
                          </p>
                          <img
                            src={getFullImageUrl(selectedBlog.titleImage)}
                            alt="Current title image"
                            className="w-full h-32 object-contain rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      {editTitleImagePreviewUrl && (
                        <div className="w-full max-w-xs">
                          <p className="text-sm text-gray-600 mb-2">
                            New title image preview:
                          </p>
                          <img
                            src={editTitleImagePreviewUrl}
                            alt="New title image preview"
                            className="w-full h-32 object-contain rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      <div className="relative">
                        <Input
                          id="edit-title-image"
                          type="file"
                          accept="image/*"
                          onChange={handleEditTitleImageChange}
                          className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Leave empty to keep current title image, or upload a new one to replace it. Supported formats: JPG, PNG, GIF
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-image"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Featured Media (Image or Video)
                    </Label>
                    <div className="space-y-3">
                      {selectedBlog.image && (
                        <div className="w-full max-w-xs">
                          <p className="text-sm text-gray-600 mb-2">
                            Current featured media:
                          </p>
                          {selectedBlog.mediaType === 'video' ? (
                            <video
                              src={getFullImageUrl(selectedBlog.image)}
                              controls
                              className="w-full h-32 object-contain rounded-lg border border-gray-200"
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <img
                              src={getFullImageUrl(selectedBlog.image)}
                              alt="Current featured media"
                              className="w-full h-32 object-contain rounded-lg border border-gray-200"
                            />
                          )}
                        </div>
                      )}
                      <div className="relative">
                        <Input
                          id="edit-image"
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) =>
                            setEditImage(e.target.files?.[0] || null)
                          }
                          className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Leave empty to keep current media, or upload a new image or video to replace it. Supported formats: Images (JPG, PNG, GIF) and Videos (MP4, WebM)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      className="flex-1 h-12 text-lg font-semibold border-gray-300 hover:bg-gray-50 transition-all duration-200"
                      disabled={editLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Update Blog
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <style jsx global>{`
        /* Quill editor styles */
        .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          font-size: 1rem;
        }
        .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: rgb(229 231 235);
          background-color: rgb(249 250 251);
        }
        .ql-editor {
          min-height: 200px;
          font-size: 1rem;
          line-height: 1.5;
        }
        .ql-editor p {
          margin-bottom: 1em;
        }
        .ql-editor:focus {
          outline: none;
        }
        /* Match the focus state with other form elements */
        .ql-container.ql-snow,
        .ql-toolbar.ql-snow {
          border-color: rgb(229 231 235);
        }
        .ql-container.ql-snow:focus-within,
        .ql-toolbar.ql-snow:focus-within {
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 1px rgb(59 130 246 / 0.2);
        }
        /* Quill alignment styles */
        .quill-content .ql-align-center {
          text-align: center;
        }
        .quill-content .ql-align-right {
          text-align: right;
        }
        .quill-content .ql-align-justify {
          text-align: justify;
        }
        .quill-content .ql-align-left {
          text-align: left;
        }
        
        /* Additional Quill content styles */
        .quill-content p {
          margin: 0 0 1em;
        }
        .quill-content p:last-child {
          margin-bottom: 0;
        }
        .quill-content img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
        .quill-content video {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
      `}</style>
    </div>
  );
}
