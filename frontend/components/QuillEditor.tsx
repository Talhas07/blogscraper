"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import axios from "axios";
import { toast } from "sonner";

// First, dynamically import ReactQuill without the image resize module
const ReactQuillComponent = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  modules?: any;
  formats?: string[];
  className?: string;
  token?: string;
}

// Keep track of whether the module has been registered
let isImageResizeRegistered = false;

export default function CustomQuillEditor({
  value,
  onChange,
  modules: propModules,
  formats,
  className,
  token,
}: QuillEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initImageResize = async () => {
      if (typeof window === "undefined" || isImageResizeRegistered) return;

      try {
        // Wait for Quill to be fully loaded
        const Quill = (await import("quill")).default;
        const { default: imageResize } = await import(
          "quill-image-resize-module"
        );

        // Register the module
        Quill.register("modules/imageResize", imageResize);
        isImageResizeRegistered = true;
      } catch (error) {
        console.error("Failed to initialize image resize module:", error);
      }
    };

    initImageResize();
  }, []);

  // Function to create alt text dialog
  const createAltTextDialog = (): Promise<string | null> => {
    return new Promise((resolve) => {
      // Create modal backdrop
      const backdrop = document.createElement("div");
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `;

      // Create modal content
      const modal = document.createElement("div");
      modal.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        width: 90%;
      `;

      // Create modal HTML
      modal.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Add Alt Text</h3>
        <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
          Describe this image for accessibility and SEO purposes.
        </p>
        <input 
          type="text" 
          id="altTextInput" 
          placeholder="Enter alt text for the image..."
          style="
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            margin-bottom: 16px;
            box-sizing: border-box;
          "
        />
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button 
            id="cancelBtn"
            style="
              padding: 8px 16px;
              border: 1px solid #ddd;
              background: white;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            "
          >
            Cancel
          </button>
          <button 
            id="confirmBtn"
            style="
              padding: 8px 16px;
              border: none;
              background: #007bff;
              color: white;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            "
          >
            Add Image
          </button>
        </div>
      `;

      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);

      const input = modal.querySelector("#altTextInput") as HTMLInputElement;
      const cancelBtn = modal.querySelector("#cancelBtn") as HTMLButtonElement;
      const confirmBtn = modal.querySelector(
        "#confirmBtn"
      ) as HTMLButtonElement;

      // Focus on input
      input.focus();

      // Handle cancel
      const handleCancel = () => {
        document.body.removeChild(backdrop);
        resolve(null);
      };

      // Handle confirm
      const handleConfirm = () => {
        const altText = input.value.trim();
        document.body.removeChild(backdrop);
        resolve(altText);
      };

      // Event listeners
      cancelBtn.addEventListener("click", handleCancel);
      confirmBtn.addEventListener("click", handleConfirm);

      // Handle Enter key
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          handleConfirm();
        } else if (e.key === "Escape") {
          handleCancel();
        }
      });

      // Handle backdrop click
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          handleCancel();
        }
      });
    });
  };

  const defaultModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
      handlers: {
        image: function (this: any) {
          if (!token) {
            toast.error("Please login to upload media");
            return;
          }

          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*,video/*");
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
              // Only ask for alt text if it's an image
              let altText = "";
              if (file.type.startsWith("image/")) {
                const result = await createAltTextDialog();
                // If user cancelled, don't proceed
                if (result === null) return;
                altText = result;
              }

              const formData = new FormData();
              formData.append("file", file);

              try {
                const response = await axios.post(
                  `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blogs/upload-media`,
                  formData,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );

                // Get the full URL for the uploaded image
                const imageUrl = response.data.url.startsWith("http")
                  ? response.data.url
                  : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${response.data.url}`;

                const range = this.quill.getSelection(true);

                if (file.type.startsWith("image/")) {
                  // For images, insert with alt text by directly manipulating the HTML
                  const imgHtml = altText
                    ? `<img src="${imageUrl}" alt="${altText}" title="${altText}">`
                    : `<img src="${imageUrl}">`;

                  // Insert the HTML directly
                  this.quill.clipboard.dangerouslyPasteHTML(
                    range.index,
                    imgHtml
                  );
                } else {
                  // For videos
                  this.quill.insertEmbed(range.index, "video", imageUrl);
                }

                // Move cursor after the media
                this.quill.setSelection(range.index + 1, 0);
              } catch (error) {
                console.error("Upload failed:", error);
                toast.error("Failed to upload media");
              }
            }
          };
        },
      },
    },
    imageResize: {
      modules: ["Resize", "DisplaySize", "Toolbar"],
      displayStyles: {
        backgroundColor: "black",
        border: "none",
        color: "white",
      },
      toolbarStyles: {
        backgroundColor: "black",
        border: "none",
        color: "white",
      },
      toolbarButtonStyles: {
        backgroundColor: "black",
        border: "none",
        color: "white",
      },
      toolbarButtonSvgStyles: {
        fill: "white",
      },
    },
  };

  // Define allowed formats
  const allowedFormats = [
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
    <div ref={wrapperRef} className={className}>
      <ReactQuillComponent
        theme="snow"
        value={value}
        onChange={onChange}
        modules={propModules || defaultModules}
        formats={formats || allowedFormats}
      />
    </div>
  );
}
