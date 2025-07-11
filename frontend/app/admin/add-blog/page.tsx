"use client";

import type React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store/store";
import CustomQuillEditor from "@/components/QuillEditor";
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
import { PenTool, FileText, Tag, ImageIcon, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function AddBlogPage() {
  const [title, setTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [content, setContent] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [image, setImage] = useState<File | null>(null);
  const [titleImage, setTitleImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [titleImagePreviewUrl, setTitleImagePreviewUrl] = useState<
    string | null
  >(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const { user, token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategories`
        );
        setSubCategories(response.data);
      } catch (err) {
        toast.error("Failed to load subcategories");
      }
    };
    fetchSubCategories();
  }, []);

  // Handle title image selection with preview
  const handleTitleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setTitleImage(file);

    // Clear previous preview
    if (titleImagePreviewUrl) {
      URL.revokeObjectURL(titleImagePreviewUrl);
      setTitleImagePreviewUrl(null);
    }

    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setTitleImagePreviewUrl(url);
    }
  };

  // Handle featured media file selection with preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    // Clear previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Set media type based on file type
      setMediaType(file.type.startsWith("video/") ? "video" : "image");
    } else {
      setMediaType(null);
    }
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (titleImagePreviewUrl) {
        URL.revokeObjectURL(titleImagePreviewUrl);
      }
    };
  }, [previewUrl, titleImagePreviewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select a featured image.");
      return;
    }

    if (!titleImage) {
      toast.error("Please select a title image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("content", content);
    formData.append("subCategoryId", subCategoryId);
    formData.append("userId", user?.id);
    formData.append("image", image);
    formData.append("titleImage", titleImage);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blogs`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Blog created successfully!");
      setTitle("");
      setMetaTitle("");
      setMetaDescription("");
      setContent("");
      setSubCategoryId("");
      setImage(null);
      setTitleImage(null);
      setPreviewUrl(null);
      setTitleImagePreviewUrl(null);
      setMediaType(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create blog");
    }
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "ordered",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 to-slate-100 bg-[url('/image.png')] bg-cover bg-center bg-no-repeat p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-2">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Create a New Blog
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Share your thoughts and ideas with the world
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-8"
          >
            <div className="space-y-3">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter an engaging blog title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="metaTitle"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Meta Title
              </Label>
              <Input
                id="metaTitle"
                type="text"
                placeholder="Enter SEO meta title (optional)..."
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
              <p className="text-sm text-gray-500">
                A meta title is used for SEO purposes. If left empty, the blog title will be used.
              </p>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="metaDescription"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Meta Description
              </Label>
              <Textarea
                id="metaDescription"
                placeholder="Enter SEO meta description (optional)..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="min-h-[100px] text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
              <p className="text-sm text-gray-500">
                A meta description is used for SEO purposes. It should be a brief summary of the blog post.
              </p>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="content"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                Content
              </Label>
              <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto">
                <CustomQuillEditor
                  value={content}
                  onChange={setContent}
                  formats={formats}
                  className=" bg-white  focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-200"
                  token={token}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="subcategory"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Subcategory
              </Label>
              <Select
                value={subCategoryId}
                onValueChange={setSubCategoryId}
                required
              >
                <SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="titleImage"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Title Image
              </Label>
              <div className="relative">
                <Input
                  id="titleImage"
                  type="file"
                  accept="image/*"
                  onChange={handleTitleImageChange}
                  required
                  className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                />
              </div>
              <p className="text-sm text-gray-500">
                Upload a title image for your blog post. Supported formats: JPG,
                PNG, GIF
              </p>

              {/* Title Image Preview */}
              {titleImagePreviewUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Title Image Preview:
                  </p>
                  <div className="w-full max-w-2xl mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={titleImagePreviewUrl}
                      alt="Title Image Preview"
                      className="w-full max-h-96 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="image"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Featured Media (Image or Video)
              </Label>
              <div className="relative">
                <Input
                  id="image"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  required
                  className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                />
              </div>
              <p className="text-sm text-gray-500">
                Upload a featured image or video for your blog post. Supported
                formats: Images (JPG, PNG, GIF) and Videos (MP4, WebM)
              </p>

              {/* Featured Media Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Featured Media Preview:
                  </p>
                  <div className="w-full max-w-2xl mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    {mediaType === "video" ? (
                      <video
                        src={previewUrl}
                        controls
                        className="w-full max-h-96 object-contain bg-black"
                        controlsList="nodownload"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Featured Media Preview"
                        className="w-full max-h-96 object-contain"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Send className="w-5 h-5 mr-2" />
                Publish Blog Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
      `}</style>
    </div>
  );
}
