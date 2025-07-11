"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import moment from "moment";
import { Radial } from "../chart/radial"; // Import the Radial component
import { Loader2 } from "lucide-react";
import { generateReportPDF } from "./pdf-generator";
import MaturityProgressChart from "../chart/progressChart";
import MaturityRadialChart from "../chart/radial2";
interface PageParams {
  id: string;
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

export default function ReportPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const token = useSelector((state: RootState) => state.user.token);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  function capitalizeFirstLetter(str: string): string {
    if (!str) return ""; // Handle empty strings
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  const riskMessages: Record<string, string> = {
    Critical:
      "This strategy requires immediate attention to significantly uplift the security risk score. Prioritise implementation to mitigate critical vulnerabilities and enhance overall security posture.",
    High: "This strategy requires urgent attention and should be addressed as a high-priority remediation. Swift action is necessary to reduce high-risk vulnerabilities and strengthen security controls.",
    Moderate:
      "This strategy has not yet been fully remediated and should be given moderate priority. Implement remediation to address moderate risks and maintain system integrity.",
  };
  useEffect(() => {
    const fetchAssessmentData = async () => {
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
                pLevel1: strategy.pLevel1,
                pLevel2: strategy.pLevel2,
                pLevel3: strategy.pLevel3,
                pTotal: strategy.pTotal,
                currentLevel: strategy.currentMaturityLevel.toString(),
                targetLevel: strategy.targetMaturityLevel.toString(),
                gaps: strategy.gapsIdentified,
                details: strategy.details,
                recommendations: strategy.recommendations || "N/A",
                priority: strategy.priority,
              })
            ),
            overallRisk: "Moderate",
            recommendations: report.recommendations.map((rec: any) => ({
              ...rec,
              riskMessage: riskMessages[rec.priority] || "", // 👈 Add riskMessage per recommendation
            })), // Add recommendations if available in the response
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

    if (id) {
      fetchAssessmentData();
    }
  }, [id, router, token]);
  const handleDownloadReport = async () => {
    console.log("button is clicked");
    if (!reportRef.current || !reportData || !chartRef.current) return;

    try {
      setIsLoading(true);
      console.log("loading is true");
      if (chartRef.current) {
        await generateReportPDF(
          reportData,
          chartRef as React.RefObject<HTMLDivElement>,
          chartRef2 as React.RefObject<HTMLDivElement>
        );
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsLoading(false);
      console.log("loading is true");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
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
          className="bg-blue-600 hover:bg-blue-700 cursor:pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Download Report"
          )}
        </Button>
      </div>

      <Card className="mb-8 shadow-lg" ref={reportRef}>
        <CardContent className="pt-6">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                Essential Eight Gap Analysis Report
              </h2>
              <h2>Date:{reportData?.assessment.createdAt}</h2>
              <h2>Organization:{reportData?.assessment.clientName}</h2>
              <h2>Assessor:{reportData?.assessment.userName}</h2>
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
                  Essential Eight framework. The primary objectives of the
                  assessment were to:
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    Determine the organisation's current maturity level for each
                    of the Essential Eight mitigation strategies.
                  </li>
                  <li>
                    Identify any gaps between the current security posture and
                    the desired maturity level.
                  </li>
                  <li>
                    Provide recommendations for remediation and improvement.
                  </li>
                </ul>
                <p className="text-gray-700">
                  The scope of this assessment is outlined in the initial
                  engagement agreement
                </p>
                {/* <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    [List the systems, networks, or areas that were included in
                    the assessment. Be specific, e.g., "All workstations in the
                    Finance Department," "The organisation's email servers,"
                    "All internet-facing web applications."]
                  </li>
                </ul> */}
                <p className="text-gray-700">
                  The assessment was conducted using the following methodology:
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    Interviews with key personnel, review of system
                    configurations, analysis of security policies and
                    procedures, and technical testing.
                  </li>
                  <li>MyCyberHelp Cybersecurity Assessment Tool</li>
                </ul>
                <p className="text-gray-700">
                  The assessment was conducted on{" "}
                  {reportData?.assessment.createdAt}.
                </p>
              </div>
            </div>

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
            {/* Add the Radial chart component */}
            <div className="w-full  mx-auto ">
              {/* <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                3. Maturity Level Visualization
              </h2> */}
              {reportData && <Radial data={reportData.maturityLevels} />}
            </div>
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
                    {reportData?.assessment.riskStatus}(
                    {reportData?.assessment.normalizedScore})
                  </span>
                  . This assessment takes into account the current
                  implementation status of all Essential Eight mitigation
                  strategies and their respective maturity levels.
                </p>
              </div>
            </div>
            <div className="w-full  mx-auto ">
              {/* <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                3. Maturity Level Visualization
              </h2> */}
              {reportData && (
                <MaturityProgressChart data={reportData.maturityLevels} />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                5. Recommendation: Prioritized Remediation of Security
                Strategies
              </h2>
              <p className="text-gray-700 mt-4">
                To enhance our security posture, I recommend addressing the
                following strategies in order of priority based on their risk
                levels:
              </p>
              <div className="prose max-w-none">
                <ol className="list-decimal pl-6 space-y-2">
                  {reportData?.recommendations.map(
                    (recommendation: any, index: any) => (
                      <li key={index} className="text-gray-700">
                        {recommendation.mitigationStrategy}
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
                          ({recommendation.priority}, Risk Score:{" "}
                          {recommendation.priorityValue})
                        </span>
                        - {recommendation.riskMessage}
                      </li>
                    )
                  )}
                </ol>

                <p className="text-gray-700 mt-4">
                  By addressing these strategies in this order, we can
                  effectively prioritise resources to mitigate the most critical
                  and high-risk vulnerabilities first, followed by moderate
                  risks.
                </p>
              </div>
              <br></br>
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
          </div>
        </CardContent>
      </Card>
      <div
        ref={chartRef}
        className="fixed left-[-9999px] top-[-9999px]  w-[1100px] h-[500px] "
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
        className="
                 fixed -left-[8000px] -top-[9999px] w-[1200px] h-[1200px] 
                 "
      >
        {/* <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                              3. Maturity Level Visualization
                            </h2> */}
        {reportData && (
          <MaturityProgressChart data={reportData.maturityLevels} />
        )}
      </div>
    </div>
  );
}
