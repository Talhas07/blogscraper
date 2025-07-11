"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import moment from "moment";
import { Radial } from "../chart/radial";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

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
  controls?: {
    name: string;
    currentLevel: string;
    targetLevel: string;
    gaps: number;
    details: string;
    recommendations: string;
    priority: string;
  }[];
  overallRisk: string;
  recommendations: any;
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.user.token);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  function capitalizeFirstLetter(str: string): string {
    if (!str) return ""; // Handle empty strings
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        if (!token) {
          router.push("/login");
          return;
        }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reports/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Response data:", response.data);
        if (response.data) {
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
              createdAt: moment(report.createdAt).format(
                "MMMM Do YYYY, h:mm:ss a"
              ),
              clientName: capitalizeFirstLetter(report.clientName),
              userName: capitalizeFirstLetter(report.userName),
            },
            maturityLevels: report.mitigationStrategies.map(
              (strategy: any) => ({
                strategy: strategy.mitigationStrategy,
                currentLevel: strategy.currentMaturityLevel.toString(),
                targetLevel: strategy.targetMaturityLevel.toString(),
                gaps: strategy.gapsIdentified,
                details: strategy.details,
                recommendations: strategy.recommendations || "N/A",
                priority: strategy.priority,
              })
            ),
            overallRisk: "Moderate",
            recommendations: report.recommendations,
          };

          setReportData(transformedData);
        }
      } catch (error) {
        console.error("Error fetching assessment data:", error);
        setError("Failed to load assessment data");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAssessmentData();
    }
  }, [params.id, router, token]);
  const handleDownloadReport = async () => {
    if (!reportRef.current) return;

    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const headerHeight = 30;

      const addHeader = (pdf: jsPDF) => {
        // Define the logo position (right side)
        const logoWidth = 20; // Adjust logo width
        const logoHeight = 20; // Adjust logo height
        const logoX = pdf.internal.pageSize.getWidth() - logoWidth - 10; // 10mm margin from the right side
        const logoY = 5; // 10mm margin from the top

        // Set the gray text color
        pdf.setTextColor(169, 169, 169); // Gray color

        // Add "RISK ASSESSMENT" text (left side)
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Essential Eight: Gap Analysis and Risk Report", 10, 16);

        // Add the logo (right side)
        const logoImg = new Image();
        logoImg.src = "/cyber.png"; // Replace with your actual logo path

        // Wait for the logo image to load and add it to the PDF
        logoImg.onload = () => {
          pdf.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight); // Add logo to the right side
        };

        // Add separator line below the header
        pdf.setDrawColor(0, 0, 0);
        pdf.line(
          10,
          headerHeight,
          pdf.internal.pageSize.getWidth() - 10,
          headerHeight
        );
      };

      const reportSections = reportRef.current.querySelectorAll(".pdf-section");

      // Helper to render multiple sections into one image
      const renderCombinedSections = async (sections: Element[]) => {
        const container = document.createElement("div");
        container.style.background = "#fff";
        container.style.padding = "20px";
        container.style.width = sections[0].clientWidth + "px";

        for (const section of sections) {
          const cloned = section.cloneNode(true) as HTMLElement;
          cloned.style.marginBottom = "20px";
          container.appendChild(cloned);
        }

        document.body.appendChild(container);
        const canvas = await html2canvas(container, {
          scale: 1.5,
          logging: false,
          useCORS: true,
        });
        document.body.removeChild(container);
        return canvas;
      };

      // PAGE 1: Section 1 + 3
      const canvasPage1 = await renderCombinedSections([
        reportSections[0], // Section 1
        reportSections[2], // Section 3
      ]);
      const imgData1 = canvasPage1.toDataURL("image/png");
      const imgWidth1 = pdfWidth - 20;
      const imgHeight1 = (canvasPage1.height * imgWidth1) / canvasPage1.width;
      addHeader(pdf);
      pdf.addImage(
        imgData1,
        "PNG",
        10,
        headerHeight + 5,
        imgWidth1,
        imgHeight1
      );

      // PAGE 2: Section 2
      const canvasPage2 = await html2canvas(reportSections[1] as HTMLElement, {
        scale: 1.5,
        logging: false,
        useCORS: true,
      });
      const imgData2 = canvasPage2.toDataURL("image/png");
      const imgWidth2 = pdfWidth - 20;
      const imgHeight2 = (canvasPage2.height * imgWidth2) / canvasPage2.width;
      pdf.addPage();
      addHeader(pdf);
      pdf.addImage(
        imgData2,
        "PNG",
        10,
        headerHeight + 5,
        imgWidth2,
        imgHeight2
      );

      // PAGE 3: Section 4 + 5
      const canvasPage3 = await renderCombinedSections([
        reportSections[3], // Section 4
        reportSections[4], // Section 5
      ]);
      const imgData3 = canvasPage3.toDataURL("image/png");
      const imgWidth3 = pdfWidth - 20;
      const imgHeight3 = (canvasPage3.height * imgWidth3) / canvasPage3.width;
      pdf.addPage();
      addHeader(pdf);
      pdf.addImage(
        imgData3,
        "PNG",
        10,
        headerHeight + 5,
        imgWidth3,
        imgHeight3
      );

      const clientName = reportData?.assessment.clientName || "Client";
      const dateStr = moment().format("YYYYMMDD");
      pdf.save(`${clientName}_Essential_Eight_Report_${dateStr}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading assessment data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 flex justify-center items-center h-screen">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Essential Eight Gap Analysis Report
          </h1>
          <p className="text-gray-600 mt-2">
            Assessment: {reportData?.assessment.name}
          </p>
        </div>
        <Button
          onClick={handleDownloadReport}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? "Generating PDF..." : "Download Report"}
        </Button>
      </div>

      <div ref={reportRef}>
        <Card className="mb-8 shadow-lg pdf-section">
          <CardContent className="pt-6">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                  Essential Eight Gap Analysis Report
                </h2>
                <h2>Date: {reportData?.assessment.createdAt}</h2>
                <h2>Organization: {reportData?.assessment.clientName}</h2>
                <h2>Assessor: {reportData?.assessment.userName}</h2>
                <h2 className="text-2xl font-semibold mb-4 text-blue-800 mt-4">
                  1. Executive Summary
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    This report presents the findings of an Essential Eight gap
                    analysis conducted for {reportData?.assessment.clientName}.
                    The Essential Eight framework, developed by the Australian
                    Cyber Security Centre (ACSC), comprises eight mitigation
                    strategies designed to protect organisations against common
                    cyber threats.
                  </p>
                  <p className="text-gray-700 mt-4">
                    The overall risk level is assessed as{" "}
                    <span className="font-semibold">
                      {reportData?.overallRisk}
                    </span>
                    . Priority should be given to addressing the identified gaps
                    in the Essential Eight mitigation strategies table found in
                    Section 3 of this report.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                  2. Introduction
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    This gap analysis was commissioned by{" "}
                    {reportData?.assessment.clientName} to evaluate the
                    effectiveness of its cyber security controls against the
                    Essential Eight framework. The assessment was conducted on{" "}
                    {reportData?.assessment.createdAt}.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg pdf-section">
          <CardContent className="pt-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                3. Essential Eight Gap Analysis Findings
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left font-semibold text-gray-700">
                        Mitigation Strategy
                      </th>
                      <th className="border p-3 text-left font-semibold text-gray-700">
                        Current Level
                      </th>
                      <th className="border p-3 text-left font-semibold text-gray-700">
                        Target Level
                      </th>
                      <th className="border p-3 text-left font-semibold text-gray-700">
                        Gaps
                      </th>
                      <th className="border p-3 text-left font-semibold text-gray-700">
                        Details
                      </th>
                      <th className="border p-3 text-left font-semibold text-gray-700">
                        Recommendations
                      </th>
                      <th className="border p-3 text-left font-semibold text-gray-700">
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.maturityLevels.map((level, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border p-3 text-gray-700">
                          {level.strategy}
                        </td>
                        <td className="border p-3 text-gray-700">
                          {level.currentLevel}
                        </td>
                        <td className="border p-3 text-gray-700">
                          {level.targetLevel}
                        </td>
                        <td className="border p-3 text-gray-700">
                          {level.gaps}
                        </td>
                        <td className="border p-3 text-gray-700">
                          {level.details}
                        </td>
                        <td className="border p-3 text-gray-700">
                          {level.recommendations}
                        </td>
                        <td className="border p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              level.priority === "Critical"
                                ? "bg-red-100 text-red-800"
                                : level.priority === "High"
                                ? "bg-orange-100 text-orange-800"
                                : level.priority === "Moderate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {level.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg pdf-section">
          <CardContent className="pt-6">
            <Radial data={reportData?.maturityLevels} />
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg pdf-section">
          <CardContent className="pt-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                4. Overall Risk Assessment
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700">
                  Based on the findings of this gap analysis, the overall risk
                  to {reportData?.assessment.clientName}'s information systems
                  is assessed as{" "}
                  <span className="font-semibold">
                    {reportData?.assessment.riskStatus} (
                    {reportData?.assessment.normalizedScore})
                  </span>
                  . This assessment takes into account the current
                  implementation status of all Essential Eight mitigation
                  strategies and their respective maturity levels.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg pdf-section">
          <CardContent className="pt-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                5. Recommendations and Conclusion
              </h2>
              <div className="prose max-w-none">
                <ul className="list-disc pl-6 space-y-2">
                  {reportData?.recommendations.map(
                    (recommendation: any, index: any) => (
                      <li key={index} className="text-gray-700">
                        {recommendation.mitigationStrategy} is of risk{" "}
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            recommendation.priority === "Critical"
                              ? "bg-red-100 text-red-800"
                              : recommendation.priority === "High"
                              ? "bg-orange-100 text-orange-800"
                              : recommendation.priority === "Moderate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {recommendation.priority} (
                          {recommendation.priorityValue})
                        </span>
                        and is not remediated as yet
                      </li>
                    )
                  )}
                </ul>
                <p className="text-gray-700 mt-4">
                  It is crucial that {reportData?.assessment.clientName} review
                  and approve a proposed remediation plan to address these gaps
                  in a timely manner. The remediation plan will be developed in
                  consultation with {reportData?.assessment.clientName}'s to
                  address all concerns and achieve an optimal outcome: Regular
                  monitoring and review of the implemented controls are
                  essential to ensure their ongoing effectiveness and to adapt
                  to the evolving threat landscape.
                </p>
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                Conclusion:
              </h2>
              <p className="text-gray-700 mt-4">
                This gap analysis has provided{" "}
                {reportData?.assessment.clientName} with a clear understanding
                of its current security posture in relation to the Essential
                Eight framework. By addressing the identified gaps and
                implementing the recommendations outlined in this report, the
                organisation can significantly improve its resilience to cyber
                threats and protect its valuable information assets.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
