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
import { AssessmentData } from "@/utils/types";
import { Upload, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import React from "react";

type ControlStatus = "implemented" | "not-implemented" | "partial";

export interface Question {
  id: number;
  ismControl: string;
  maturityLevel: string;
  question: string;
  controlId?: number;
  status: ControlStatus | null;
  notes?: string;
  files?: File[];
  downloadUrl?: string;
}

export interface Control {
  id: string;
  name: string;
  description?: string;
  details?: string;
  questions?: Question[];
}

const getStatusColor = (status: ControlStatus | null) => {
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
  onQuestionUpdate: (questionId: number, updates: Partial<Question>) => void;
  readonly?: boolean;
  expandedLevels?: string[];
}

interface QuestionDisplayProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  readonly?: boolean;
}

const QuestionDisplay = React.memo(function QuestionDisplay({
  question,
  onUpdate,
  readonly,
}: QuestionDisplayProps) {
  const [notes, setNotes] = useState(question.notes || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>(
    question.files || []
  );
  const [localStatus, setLocalStatus] = useState<ControlStatus | null>(
    question.status
  );

  useEffect(() => {
    setLocalStatus(question.status);
  }, [question.status]);

  const debouncedUpdate = useMemo(() => debounce(onUpdate, 500), [onUpdate]);

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!readonly) {
      const newNotes = e.target.value;
      setNotes(newNotes);
      debouncedUpdate({ notes: newNotes });
    }
  };

  const handleStatusChange = (value: ControlStatus) => {
    if (!readonly) {
      setLocalStatus(value);
      debouncedUpdate({ status: value });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!readonly) {
      const files = event.target.files;
      if (files) {
        const newFiles = Array.from(files).map((file) => {
          const newFileName = `q${question.id}_${file.name}`;
          return new File([file], newFileName, { type: file.type });
        });
        setSelectedFiles(newFiles);
        onUpdate({ files: newFiles });
      }
    }
  };

  return (
    <div className="mt-2 mb-4 hidden md:grid md:grid-cols-5 gap-x-4 px-3 text-xs font-medium text-muted-foreground ">
      <div className="md:col-span-1 self-start pl-4">
        <p className="text-sm text-gray-700">{question.question}</p>
      </div>
      <div className="md:col-span-1 self-start flex justify-center">
        <p className="text-sm text-gray-700">{question.ismControl}</p>
      </div>
      <div className="md:col-span-1 self-start flex justify-center">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${getStatusColor(
              localStatus
            )}`}
          />
          <Select
            value={localStatus || ""}
            onValueChange={handleStatusChange}
            disabled={readonly}
          >
            <SelectTrigger className="w-[150px] text-xs h-8">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="not-implemented">Not Implemented</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="md:col-span-1 self-start">
        <Textarea
          placeholder="Add notes..."
          value={notes}
          onChange={handleNotesChange}
          className="min-h-[40px] text-xs"
          disabled={readonly}
        />
      </div>
      <div className="flex flex-col md:col-span-1 self-start items-start md:items-center md:justify-center ">
        {/* {question.downloadUrl && (
          <div className="mb-1 w-full text-center md:text-left">
            <a
              href={question.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Download Evidence
            </a>
          </div>
        )} */}
        {!readonly && (
          <div className="relative mb-1">
            <input
              type="file"
              multiple
              className="hidden"
              id={`file-upload-q-${question.id}`}
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() =>
                document.getElementById(`file-upload-q-${question.id}`)?.click()
              }
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Button>
          </div>
        )}
        {selectedFiles.length > 0 && (
          <div className="text-xs text-muted-foreground w-full text-center md:text-left">
            Files: {selectedFiles.map((file) => file.name).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
});

export function AssessmentControl({
  control,
  onQuestionUpdate,
  readonly = false,
  expandedLevels = [],
}: AssessmentControlProps) {
  const groupedQuestions = useMemo(() => {
    const groups: { [key: string]: Question[] } = {};
    if (control.questions) {
      for (const question of control.questions) {
        const level = question.maturityLevel || "Uncategorized";
        if (!groups[level]) {
          groups[level] = [];
        }
        groups[level].push(question);
      }
    }
    return Object.entries(groups).sort(([levelA], [levelB]) => {
      const numA = parseInt(levelA);
      const numB = parseInt(levelB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return levelA.localeCompare(levelB);
    });
  }, [control.questions]);

  const [localExpandedLevels, setLocalExpandedLevels] =
    useState<string[]>(expandedLevels);

  useEffect(() => {
    setLocalExpandedLevels(expandedLevels || []);
  }, [expandedLevels]);

  const toggleLevel = (level: string) => {
    setLocalExpandedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleUpdate = useCallback(
    (id: number, updates: Partial<Question>) => {
      onQuestionUpdate(id, updates);
    },
    [onQuestionUpdate]
  );

  return (
    <div className="border rounded-lg overflow-hidden mb-4 bg-white">
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">{control.name}</h3>
        {control.description && (
          <p className="text-sm text-muted-foreground mr-4">
            {control.description}
          </p>
        )}
      </div>

      {groupedQuestions.length > 0 ? (
        <div className="border-t bg-white">
          {groupedQuestions.map(([level, questionsInLevel]) => {
            const isExpanded = localExpandedLevels.includes(level);
            return (
              <div key={level} className="mb-2">
                <div
                  className="p-3 sticky top-0 bg-white z-10 border-b flex justify-between items-center cursor-pointer"
                  onClick={() => toggleLevel(level)}
                >
                  <p className="font-semibold text-md">
                    Maturity Level {level}
                  </p>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </div>
                {isExpanded && (
                  <>
                    <div className="px-4 mt-2 hidden md:grid md:grid-cols-5 gap-x-4 px-3 text-xs font-medium text-muted-foreground ">
                      <div className="md:col-span-1 flex justify-center">
                        Question
                      </div>
                      <div className="md:col-span-1 flex justify-center">
                        Control
                      </div>
                      <div className="md:col-span-1 flex justify-center">
                        Status
                      </div>
                      <div className="md:col-span-1 flex justify-center">
                        Notes
                      </div>
                      <div className="md:col-span-1 flex justify-center">
                        Upload
                      </div>
                    </div>
                    <div className="pt-2">
                      {questionsInLevel.map((q) => (
                        <QuestionDisplay
                          key={q.id}
                          question={q}
                          readonly={readonly}
                          onUpdate={(updates) => handleUpdate(q.id, updates)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 border-t bg-white">
          <p className="text-sm text-muted-foreground italic">
            No questions associated with this control.
          </p>
        </div>
      )}
    </div>
  );
}
