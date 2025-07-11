"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExcelUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel"
      ) {
        setFile(selectedFile);
      } else {
        toast.error("Please upload a valid Excel file (.xlsx or .xls)");
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async (
    uploadType: "questions" | "industries" | "mappings"
  ) => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const endpoint =
        uploadType === "questions"
          ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/excel/upload`
          : uploadType === "industries"
          ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/excel/industries/upload`
          : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/excel/mapping/upload`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      toast.success(`File uploaded successfully: ${data.message}`);
      setFile(null);
      // Reset the file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast.error("Failed to upload file");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload Excel files containing questions, industry data, or mappings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="questions">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">Questions Upload</TabsTrigger>
              <TabsTrigger value="industries">Industries Upload</TabsTrigger>
              <TabsTrigger value="mappings">Mappings Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="questions">
              <div className="space-y-4 mt-4">
                <div>
                  <Input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls"
                    className="mb-4"
                  />
                </div>
                <Button
                  onClick={() => handleSubmit("questions")}
                  disabled={isUploading || !file}
                >
                  {isUploading ? "Uploading..." : "Upload Questions"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="industries">
              <div className="space-y-4 mt-4">
                <div>
                  <Input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls"
                    className="mb-4"
                  />
                </div>
                <Button
                  onClick={() => handleSubmit("industries")}
                  disabled={isUploading || !file}
                >
                  {isUploading ? "Uploading..." : "Upload Industries"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="mappings">
              <div className="space-y-4 mt-4">
                <div>
                  <Input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls"
                    className="mb-4"
                  />
                </div>
                <Button
                  onClick={() => handleSubmit("mappings")}
                  disabled={isUploading || !file}
                >
                  {isUploading ? "Uploading..." : "Upload Mappings"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
