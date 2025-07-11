"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  Search,
  Funnel,
  Delete,
  DeleteIcon,
  Trash,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { Radial } from "./chart/radial";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import moment from "moment";
import { generateReportPDF } from "./[id]/pdf-generator";
import MaturityProgressChart from "./chart/progressChart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import MaturityRadialChart from "./chart/radial2";
import { toast } from "sonner";

interface Report {
  id: string;
  assessmentName: string;
  createdAt: Date;
  clientName: string;
  description?: string;
  framework?: string;
  status?: string;
}

interface ReportData {
  assessment: {
    id: number;
    name: string;
    description: string;
    normalizedScore: number;
    riskStatus: string;
    framework: string;
    status: string;
    createdAt: string;
    clientName?: string;
    userName?: string;
  };
  maturityLevels: {
    strategy: string;
    currentLevel: string;
    targetLevel: string;
    gaps: number;
    details: string;
    recommendations: string;
    priority: string;
  }[];
  controls?: any[];
  overallRisk: string;
  recommendations: any;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  const token = useSelector((state: RootState) => state.user.token);
  const userId = useSelector((state: any) => state.user.user.id);

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reports/client/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      setReports(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setLoading(false);
    }
  };
  const handleDeleteReport = async (id: any) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reports/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setLoading(false);
      fetchReports();
    } catch (error) {
      console.error("Error deleting reports:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${userId}`
      );
      setClients(response.data.clients || []);
    } catch (error) {
      console.error("Failed to fetch user/clients", error);
    }
  };

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  const fetchAssessmentData = async (id: any) => {
    try {
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reports/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const report = response.data;
      const transformedData: ReportData = {
        assessment: {
          id: report.id,
          name: report.assessmentName,
          normalizedScore: report.normalizedScore,
          riskStatus: report.riskStatus,
          description: "Essential Eight Maturity Assessment",
          framework: "Essential Eight",
          status: report.status,
          createdAt: moment(report.createdAt).format("MMMM Do YYYY, h:mm:ss a"),
          clientName: capitalizeFirstLetter(report.clientName),
          userName: capitalizeFirstLetter(report.userName),
        },
        maturityLevels: report.mitigationStrategies.map((strategy: any) => ({
          strategy: strategy.mitigationStrategy,
          currentLevel: strategy.currentMaturityLevel.toString(),
          targetLevel: strategy.targetMaturityLevel.toString(),
          gaps: strategy.gapsIdentified,
          details: strategy.details,
          recommendations: strategy.recommendations || "N/A",
          priority: strategy.priority,
        })),
        overallRisk: "Moderate",
        recommendations: report.recommendations,
      };

      setReportData(transformedData);
    } catch (error) {
      console.error("Error fetching assessment data:", error);
      setError("Failed to load assessment data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (id: string) => {
    setLoadingReportId(id); // Set the loading state for the specific report
    try {
      await fetchAssessmentData(id); // Wait for fetchAssessmentData to complete
      if (!chartRef.current || !chartRef2.current) return;

      if (reportData) {
        console.log("Generating report...");
        await generateReportPDF(
          reportData,
          chartRef as React.RefObject<HTMLDivElement>,
          chartRef2 as React.RefObject<HTMLDivElement>
        );
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoadingReportId(null); // Reset the loading state
    }
  };

  const handleViewReport = (id: string) => {
    router.push(`/dashboard/reports/${id}`);
  };

  // Sort reports by date
  const sortedReports = [...(reports || [])].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const filteredReports = sortedReports.filter((report) =>
    report.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Reports</h1>
          {/* <Button
            className="bg-blue-600 text-white"
            onClick={() => {
              setModalOpen(true);
              fetchClients();
            }}
          >
            + Generate New Report
          </Button> */}
        </div>

        <Card className="p-6 overflow-x-auto w-full">
          <div className="min-w-[768px]">
            <div className="p-4 mb-4 border rounded-md bg-white">
              <h2 className="text-xl font-semibold mb-1">Client's Reports</h2>
              <p className="text-sm text-gray-500 mb-4">
                Generate and download reports for your clients.
              </p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="relative w-1/3">
                <Input
                  placeholder="Search"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setSortDropdownOpen((open) => !open)}
                  className="flex items-center"
                >
                  <Funnel className="h-5 w-5 text-gray-700" />
                </Button>
                {sortDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        sortOrder === "desc" ? "font-semibold" : ""
                      }`}
                      onClick={() => {
                        setSortOrder("desc");
                        setSortDropdownOpen(false);
                      }}
                    >
                      Newest First
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        sortOrder === "asc" ? "font-semibold" : ""
                      }`}
                      onClick={() => {
                        setSortOrder("asc");
                        setSortDropdownOpen(false);
                      }}
                    >
                      Oldest First
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4 items-center font-semibold text-gray-600 mb-2 px-4">
              <span className="col-span-1">Assessment</span>
              <span>Framework</span>
              {/* <span>Description</span>
               */}
              <span>Client Name</span>
              <span>Date Created</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {filteredReports.map((assessment) => (
              <div
                key={assessment.id}
                className="grid grid-cols-6 gap-4 items-center px-4 border-t border-b text-sm"
              >
                <span
                  className="cursor-pointer border-r border-gray-100 h-24 hover:text-blue-600 flex items-center"
                  onClick={() => handleViewReport(assessment.id)}
                >
                  {assessment.assessmentName}
                </span>
                <span className="border-r border-gray-100 h-24 flex items-center">
                  Essential Eight
                </span>
                <span className="border-r border-gray-100 h-24 flex items-center">
                  {assessment.clientName}
                </span>
                <span className="border-r border-gray-100 h-24 flex items-center">
                  {moment(assessment.createdAt).format(
                    "MMMM Do YYYY, h:mm:ss a"
                  )}
                </span>
                <span className="border-r border-gray-100 h-24 flex items-center">
                  {assessment.status}
                </span>
                <span className="flex gap-2 px-2">
                  {/* <FileText
                    className="w-4 h-4 cursor-pointer hover:text-blue-600"
                    onClick={() => handleDownloadReport(assessment.id)}
                  /> */}
                  {loadingReportId === assessment.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download
                      className="w-4 h-4 cursor-pointer hover:text-blue-600"
                      onClick={() => handleDownloadReport(assessment.id)}
                    />
                  )}
                  <Trash
                    className="w-4 h-4 cursor-pointer hover:text-blue-600"
                    onClick={() => handleDeleteReport(assessment.id)}
                  />
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div
          ref={chartRef}
          className="fixed left-[-9999px] top-[-9999px] w-[1100px] h-[500px]"
        >
          {reportData && (
            // <Radial
            //   data={reportData.maturityLevels.map((level) => ({
            //     strategy: level.strategy,
            //     currentLevel: level.currentLevel,
            //   }))}
            // />
            <Radial data={reportData.maturityLevels} />
          )}
        </div>

        <div
          ref={chartRef2}
          className="fixed -left-[8000px] -top-[9999px] w-[1200px] h-[1200px]"
        >
          {reportData && (
            <MaturityProgressChart data={reportData.maturityLevels} />
          )}
        </div>

        {/* Generate Report Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Client to Generate Report</DialogTitle>
            </DialogHeader>
            <Select onValueChange={(value) => setSelectedClientId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button
                disabled={!selectedClientId}
                onClick={async () => {
                  try {
                    await axios.post(
                      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reports`,
                      { clientId: selectedClientId },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                      }
                    );
                    setModalOpen(false);
                    setSelectedClientId(null);
                    fetchReports();
                  } catch (error) {
                    console.error("Failed to generate report", error);
                    toast.error(
                      "No user data found. Please fill an assignment first"
                    );
                    setModalOpen(false);
                  }
                }}
              >
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
