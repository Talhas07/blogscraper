"use client";
import { use, useEffect, useRef, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Save,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { AssessmentControl } from "@/components/assessment-control";
import { Control, Question } from "@/components/assessment-control";
import { toast } from "sonner";
import { assessmentApi } from "@/redux/api/assessment.api";

interface PageParams {
  id: string;
}

import axios from "axios";
import { CircularProgress } from "@/components/ui/circularProgress";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

interface SimpleStats {
  implemented: number;
  partial: number;
  notImplemented: number;
  progress: number;
}

type ControlStatus = "implemented" | "not-implemented" | "partial";

interface ExistingAnswer {
  status: ControlStatus;
  note: string;
  fileUrl?: string;
}

export default function AssessmentDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  //   const { id } = use(params);
  const { id } = useSelector((state: RootState) => state.user.user);
  const controlsRef = useRef<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all-controls");
  const [expandedLevels, setExpandedLevels] = useState<string[]>([]);
  const [allControlsExpandedLevels, setAllControlsExpandedLevels] = useState<
    string[]
  >([]);
  const { token } = useSelector((state: RootState) => state.user);
  // Replace statsRef with a state variable to trigger re-renders
  const [stats, setStats] = useState<SimpleStats>({
    implemented: 0,
    partial: 0,
    notImplemented: 0,
    progress: 0,
  });

  const questionObjectRef = useRef<
    Record<
      number,
      {
        userId: string;
        questionId: number;
        status: string | null;
        fileUrl: string | null;
        notes?: string;
        files?: File[];
      }
    >
  >({});

  const calculateStats = (questions: any[]) => {
    const implemented = questions.filter(
      (q) => q.status === "implemented"
    ).length;
    const partial = questions.filter((q) => q.status === "partial").length;
    const notImplemented = questions.filter(
      (q) => q.status === "not-implemented" || q.status === null
    ).length;
    const totalAnswered = implemented + partial + notImplemented;
    const progress =
      totalAnswered > 0
        ? Math.round(((implemented + partial * 0.5) / totalAnswered) * 100)
        : 0;
    console.log("Stats calculated:", {
      implemented,
      partial,
      notImplemented,
      progress,
    });
    return {
      implemented,
      partial,
      notImplemented,
      progress,
    };
  };

  const updateStatsDisplay = () => {
    const newStats = calculateStats(Object.values(questionObjectRef.current));
    setStats(newStats); // This will trigger a re-render
  };

  const handleQuestionUpdate = (
    questionId: number,
    updates: Partial<Question>
  ) => {
    if (questionObjectRef.current[questionId]) {
      // Only update the specific question's data
      questionObjectRef.current[questionId] = {
        ...questionObjectRef.current[questionId],
        ...updates,
        // Only update files if they are provided in the updates
        files: updates.files || questionObjectRef.current[questionId].files,
      };
    } else {
      // Initialize new question data
      questionObjectRef.current[questionId] = {
        userId: id,
        questionId: questionId,
        status: updates.status || null,
        fileUrl: updates.downloadUrl || null,
        files: updates.files || [],
        notes: updates.notes || "",
      };
    }

    // Update the controlsRef to reflect the changes for this specific question
    controlsRef.current = controlsRef.current.map((control) => ({
      ...control,
      questions: control.questions?.map((q) => {
        if (q.id === questionId) {
          return { ...q, ...updates };
        }
        return q;
      }),
    }));

    updateStatsDisplay();
    console.log(questionObjectRef.current);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      // Convert questionObjectRef data to the format expected by the API
      const answers = Object.values(questionObjectRef.current).map(
        (question) => ({
          questionId: question.questionId,
          status: question.status || "not-implemented",
          note: question.notes || "",
        })
      );

      // Create FormData to send files
      const formData = new FormData();
      formData.append("answers", JSON.stringify(answers));

      // Add all files from all questions
      const allFiles = Object.values(questionObjectRef.current)
        .flatMap((question) => question.files || [])
        .filter((file) => file instanceof File);

      allFiles.forEach((file) => {
        formData.append("files", file);
        // Append the user id to the form data
      });
      formData.append("userId", id);
      // Save user answers
      await assessmentApi.saveUserAnswers(formData);

      // Prepare assessment data
      const assessmentData = {
        controls: controlsRef.current.map((control) => ({
          id: control.id,
          name: control.name,
          description: control.description,
          questions: control.questions?.map((q) => ({
            id: q.id,
            ismControl: q.ismControl,
            maturityLevel: q.maturityLevel,
            question: q.question,
            status: q.status,
            notes: q.notes,
            fileUrl: q.downloadUrl,
          })),
        })),
        stats: stats, // Use the stats state instead of ref
      };

      // Save assessment with the data
      await assessmentApi.addAssessment(
        {
          name: "E8 Assessment",
          data: JSON.stringify(assessmentData),
        },
        id,
        token
      );

      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchControlsData = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Control[]>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/controls/`
        );

        if (response.data) {
          const controls = Array.isArray(response.data) ? response.data : [];
          controlsRef.current = controls;

          // Get all question IDs
          const questionIds = controls.flatMap(
            (control) => control.questions?.map((q) => q.id) || []
          );

          // Initialize questionObject with empty values for all questions
          questionIds.forEach((questionId) => {
            questionObjectRef.current[questionId] = {
              userId: id,
              questionId: questionId,
              status: null,
              fileUrl: null,
              files: [],
              notes: "",
            };
          });

          // Automatically expand all levels initially
          const allLevels = controls.flatMap(
            (control) =>
              control.questions?.map(
                (q) => q.maturityLevel || "Uncategorized"
              ) || []
          );
          setExpandedLevels([
            // ...new Set(allLevels)
          ]);
          setAllControlsExpandedLevels([
            // ...new Set(allLevels)
          ]);

          // Fetch existing answers if there are any questions
          if (questionIds.length > 0) {
            try {
              const answersResponse = await assessmentApi.getUserAnswers(
                id,
                questionIds
              );
              // Update questions directly in controls and questionObject
              const updatedControls = controls.map((control) => ({
                ...control,
                questions: control.questions?.map((q) => {
                  const existingAnswer = answersResponse.find(
                    (answer: {
                      questionId: number;
                      status: ControlStatus;
                      note: string;
                      fileUrl?: string;
                    }) => answer.questionId === q.id
                  );
                  if (existingAnswer) {
                    // Update questionObject with existing answer
                    questionObjectRef.current[q.id] = {
                      userId: id,
                      questionId: q.id,
                      status: existingAnswer.status,
                      fileUrl: existingAnswer.fileUrl,
                      files: existingAnswer.fileUrl
                        ? [new File([], existingAnswer.fileUrl)]
                        : [],
                      notes: existingAnswer.note,
                    };
                    return {
                      ...q,
                      status: existingAnswer.status,
                      notes: existingAnswer.note,
                      downloadUrl: existingAnswer.fileUrl,
                    };
                  }
                  return q;
                }),
              }));
              controlsRef.current = updatedControls;
            } catch (error) {
              console.error("Error fetching existing answers:", error);
              controlsRef.current = controls;
            }
          }
          updateStatsDisplay(); // This will now set the stats state
        }
      } catch (error) {
        console.error("Error fetching controls:", error);
        toast.error("Failed to load controls data.");
      } finally {
        setLoading(false);
      }
    };

    fetchControlsData();
  }, []);

  const getFilteredControls = (controls: Control[]) => {
    console.log("Active Filter:", activeFilter);

    if (activeFilter === "all-controls") return controls;

    const filtered = controls
      .map((control) => {
        // Filter questions within each control based on status
        const filteredQuestions = control.questions?.filter((question) => {
          const status = question.status || "not-implemented";
          console.log(`Question ${question.id} status:`, status);

          switch (activeFilter) {
            case "incomplete":
              return status === "not-implemented";
            case "partial":
              return status === "partial";
            case "implemented":
              return status === "implemented";
            default:
              return false;
          }
        });

        // Only include controls that have matching questions
        if (filteredQuestions && filteredQuestions.length > 0) {
          return {
            ...control,
            questions: filteredQuestions,
          };
        }
        return null;
      })
      .filter(Boolean) as Control[];

    console.log("Filtered controls:", filtered);
    return filtered;
  };

  const handleFilterChange = (value: string) => {
    // Save the expanded levels for "All Controls" before switching filters
    if (activeFilter === "all-controls") {
      setAllControlsExpandedLevels([...expandedLevels]);
    }

    setActiveFilter(value);

    if (value === "all-controls") {
      // Restore the previously expanded levels for "All Controls"
      setExpandedLevels([...allControlsExpandedLevels]);
    } else {
      // Automatically expand all levels for the filtered controls
      const filtered = getFilteredControls(controlsRef.current);
      const allLevels = filtered.flatMap(
        (control) =>
          control.questions?.map((q) => q.maturityLevel || "Uncategorized") ||
          []
      );
      setExpandedLevels([...new Set(allLevels)]);
    }
  };

  const filteredControls = useMemo(() => {
    return getFilteredControls(controlsRef.current);
  }, [activeFilter, controlsRef.current]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!controlsRef.current || controlsRef.current.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Controls Assessment</h1>
        <div>No controls found or failed to load controls.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/dashboard/assessments"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Assessments
          </Link>
          <h1 className="text-2xl font-bold">Controls Assessment</h1>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleSaveChanges}
            className="cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-6 ">
        <div className="border rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-1">Assessment Progress</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Track your progress through the controls
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
            <div className="flex flex-row items-center gap-4">
              Progress
              <div className="relative h-24 w-24 mb-4">
                <CircularProgress
                  value={stats.progress}
                  className="h-20 w-20 rounded-full"
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center ">
              <div className="text-3xl font-bold text-green-600 mb-2">
                <span id="implemented-value">{stats.implemented}</span>
              </div>
              <span className="text-sm text-muted-foreground">Implemented</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-amber-500 mb-2">
                <span id="partial-value">{stats.partial}</span>
              </div>
              <span className="text-sm text-muted-foreground">Partial </span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-red-500 mb-2">
                <span id="not-implemented-value">{stats.notImplemented}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Not Implemented
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <Tabs
            defaultValue="all-controls"
            onValueChange={(value) => {
              handleFilterChange(value);
            }}
          >
            <TabsList className="flex space-x-4 bg-white">
              <TabsTrigger value="all-controls" className="text-sm font-medium">
                All Controls
              </TabsTrigger>
              <TabsTrigger value="incomplete" className="text-sm font-medium">
                Incomplete
              </TabsTrigger>
              <TabsTrigger value="partial" className="text-sm font-medium">
                Partial
              </TabsTrigger>
              <TabsTrigger value="implemented" className="text-sm font-medium">
                Implemented
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-6">
          {filteredControls.length > 0 ? (
            filteredControls.map((control) => (
              <AssessmentControl
                key={control.id}
                control={control}
                onQuestionUpdate={handleQuestionUpdate}
                expandedLevels={expandedLevels}
              />
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No controls found matching the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
