"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useState } from "react";

type ControlStatus = "implemented" | "not-implemented" | "partial";

interface Control {
  id: string;
  description: string;
  details: string;
  status: string | null;
  notes?: string;
  files?: File[];
  file?: File;
  downloadUrl?: string;
}

const getStatusColor = (status: ControlStatus) => {
  switch (status) {
    case "implemented":
      return "bg-green-500";
    case "not-implemented":
      return "bg-red-500";
    case "partial":
      return "bg-amber-500";
    default:
      return "bg-gray-300";
  }
};

interface AssessmentControlProps {
  control: Control;
  onUpdate: (updates: Partial<Control>) => void;
  readonly?: boolean;
  downloadUrl?: string;
}

export function AssessmentControl({
  control,
  onUpdate,
  readonly = false,
}: AssessmentControlProps) {
  const [status, setStatus] = useState<ControlStatus | null>(
    control.status as ControlStatus | null
  );
  const [notes, setNotes] = useState(control.notes || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>(
    control.files || []
  );

  const handleStatusChange = (value: ControlStatus) => {
    if (!readonly) {
      setStatus(value);
      onUpdate({ status: value });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!readonly) {
      const newNotes = e.target.value;
      setNotes(newNotes);
      onUpdate({ notes: newNotes });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!readonly) {
      const files = event.target.files;
      if (files) {
        const newFiles = Array.from(files);
        setSelectedFiles((prev) => [...prev, ...newFiles]);
        onUpdate({ files: [...selectedFiles, ...newFiles] });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-t pt-4 ">
      <div>
        <p className="mb-1">{control.description}</p>
        <p className="text-sm text-muted-foreground">{control.details}</p>
        <div className="mt-2">
          <Textarea
            placeholder="Add notes..."
            value={notes}
            onChange={handleNotesChange}
            className="min-h-[60px] text-sm"
            disabled={readonly}
          />
        </div>
      </div>
      <div className="flex justify-center w-full">
        <div className="flex items-center  gap-2 w-5/10">
          <div
            className={`w-3 h-3 rounded-full ${
              status ? getStatusColor(status) : "bg-gray-300"
            }`}
          />
          <Select
            value={status || ""}
            onValueChange={handleStatusChange}
            disabled={readonly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="partial">Partially Implemented</SelectItem>
              <SelectItem value="not-implemented">Not Implemented</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {control.downloadUrl && (
        <div className="mt-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={control.downloadUrl}
              download // 👈 This tells the browser to download the file
              className="flex items-center gap-2"
            >
              View File
            </a>
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {!readonly && (
          <div className="relative">
            <input
              type="file"
              multiple
              className="hidden"
              id={`file-upload-${control.id}`}
              onChange={handleFileUpload}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                document.getElementById(`file-upload-${control.id}`)?.click()
              }
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload Files
            </Button>
          </div>
        )}
        {/* {selectedFiles.length > 0 && (
          <div className="text-sm text-muted-foreground mt-2">
            Files selected: {selectedFiles.map((file) => file.name).join(", ")}
          </div>
        )} */}
      </div>
    </div>
  );
}
