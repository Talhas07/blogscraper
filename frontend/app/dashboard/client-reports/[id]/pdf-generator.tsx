import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas-pro";

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

export const generateReportPDF = async (
  reportData: ReportData,
  chartRef: React.RefObject<HTMLDivElement>,
  chartRef2: React.RefObject<HTMLDivElement>
): Promise<void> => {
  if (!reportData || !chartRef.current) return;

  try {
    // Capture the radar chart as an image
    const chartCanvas = await html2canvas(chartRef.current, {
      scale: 2, // Higher scale for better quality
      width: 1000, // Set the width of the canvas
      height: 500, // Set the height of the canvas
      logging: false,
      useCORS: true,
    });
    const chartImage = chartCanvas.toDataURL("image/png");
    const chartCanvas2 = await html2canvas(chartRef2.current, {
      scale: 1, // Higher scale for better quality
      width: 800, // Set the width of the canvas
      height: 1400, // Set the height of the canvas
      logging: false,
      useCORS: true,
    });
    const chartImage2 = chartCanvas2.toDataURL("image/png");

    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Define header function to be used on each page
    const addHeader = () => {
      // Add gray "Risk Assessment" text on the left
      pdf.setTextColor(128, 128, 128); // Gray color
      pdf.setFontSize(14);
      pdf.text("Essential Eight: Gap Analysis and Risk Report", 14, 18);

      // Add logo on the right
      const logoPath = "/cyber.png"; // Replace with your logo path relative to the public folder
      pdf.addImage(logoPath, "PNG", 170, 6, 15, 15); // Adjust the size (25x8) as per your logo dimensions

      // Add a row at the bottom of the header (horizontal line)
      pdf.setLineWidth(0.5);
      pdf.line(14, 22, 195, 22); // Draw a line from x=14, y=15 to x=195, y=15 (adjust position as needed)
    };

    // Add header to the first page
    addHeader();

    // Add title
    pdf.setFontSize(18);
    pdf.setTextColor(0, 51, 102); // Dark blue color
    pdf.text("Essential Eight Gap Analysis Report", 14, 30);

    // Add assessment info
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Date: ${reportData.assessment.createdAt}`, 14, 40);
    pdf.text(`Organization: ${reportData.assessment.clientName}`, 14, 46);
    pdf.text(`Assessor: ${reportData.assessment.userName}`, 14, 52);

    // Executive Summary
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102);
    pdf.text("1. Executive Summary", 14, 62);

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const executiveSummary = `This report presents the findings of an Essential Eight gap analysis conducted for ${reportData.assessment.clientName}. The Essential Eight framework, developed by the Australian Cyber Security Centre (ACSC), comprises eight mitigation strategies designed to protect organisations against common cyber threats.`;
    const executiveSummary2 = `The overall risk level is assessed as ${reportData.overallRisk}. Priority should be given to addressing the identified gaps in the Essential Eight mitigation strategies table found in Section 3 of this report.`;

    const splitExecutiveSummary = pdf.splitTextToSize(executiveSummary, 180);
    const splitExecutiveSummary2 = pdf.splitTextToSize(executiveSummary2, 180);

    pdf.text(splitExecutiveSummary, 14, 68);
    pdf.text(splitExecutiveSummary2, 14, 80);

    // Introduction
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102);
    pdf.text("2. Introduction", 14, 95);

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const introduction = `This gap analysis was commissioned by ${reportData.assessment.clientName} to evaluate the effectiveness of its cyber security controls against the Essential Eight framework. The primary objectives of the assessment were to:
• Determine the organisation's current maturity level for each of the Essential Eight mitigation strategies.
• Identify any gaps between the current security posture and the desired maturity level.
• Provide recommendations for remediation and improvement.`;

    const splitIntroduction = pdf.splitTextToSize(introduction, 180);
    pdf.text(splitIntroduction, 14, 100);

    // Scope
    const scopeText = ` The scope of this assessment is outlined in the initial engagement agreement`;

    const splitScope = pdf.splitTextToSize(scopeText, 180);
    pdf.text(splitScope, 14, 121);

    // Methodology
    const methodologyText = `The assessment was conducted using the following methodology:
• Interviews with key personnel, review of system configurations, analysis of security policies and procedures, and technical testing.
• MyCyberHelp Cybersecurity Assessment Tool`;

    const splitMethodology = pdf.splitTextToSize(methodologyText, 180);
    pdf.text(splitMethodology, 14, 126);

    // Date of Assessment
    const assessmentDateText = `The assessment was conducted on ${reportData.assessment.createdAt}.`;
    const splitDate = pdf.splitTextToSize(assessmentDateText, 180);
    pdf.text(splitDate, 14, 148);

    // Add the radar chart image
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102);
    pdf.text("3. Maturity Level Visualization", 14, 158);

    // Add the chart image
    pdf.addImage(chartImage, "PNG", 10, 166, 180, 90); // Adjust position and size as needed

    // Add a new page for the findings table
    pdf.addPage();

    // Add header to the new page
    addHeader();

    // Essential Eight Gap Analysis Findings
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102);
    pdf.text("4. Essential Eight Gap Analysis Findings", 14, 30);

    // Create table for maturity levels
    const tableData = reportData.maturityLevels.map((level) => [
      level.strategy,
      level.currentLevel,
      level.targetLevel,
      level.gaps.toString(),
      level.details,
      level.recommendations,
      level.priority,
    ]);

    autoTable(pdf, {
      startY: 35,
      head: [
        [
          "Mitigation Strategy",
          "Current Level",
          "Target Level",
          "Gaps",
          "Details",
          "Recommendations",
          "Priority",
        ],
      ],
      body: tableData,
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 15 },
        2: { cellWidth: 15 },
        3: { cellWidth: 15 },
        4: { cellWidth: 45 },
        5: { cellWidth: 45 },
        6: { cellWidth: 20 },
      },
      didDrawPage: function (data) {
        // Add header to each new page created by autoTable
        addHeader();
      },
    });

    // Add a new page for the rest of the content
    pdf.addPage();

    // Add header to the new page
    addHeader();

    // Overall Risk Assessment
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102);
    pdf.text("5. Overall Risk Assessment", 14, 30);

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const riskAssessment = `Based on the findings of this gap analysis, the overall risk to ${reportData.assessment.clientName}'s information systems is assessed as ${reportData.assessment.riskStatus} (${reportData.assessment.normalizedScore}). This assessment takes into account the current implementation status of all Essential Eight mitigation strategies and their respective maturity levels.`;

    const splitRiskAssessment = pdf.splitTextToSize(riskAssessment, 180);
    pdf.text(splitRiskAssessment, 14, 36);
    pdf.addImage(chartImage2, "PNG", 20, 55, 160, 210);

    pdf.addPage();

    // Add header to the new page
    addHeader();
    // Recommendations and Conclusion
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102);
    pdf.text("6. Recommendations and Conclusion", 14, 30);
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const security = `To enhance our security posture, I recommend addressing the following strategies in order of priority based on their risk levels:`;

    const splitSecurity = pdf.splitTextToSize(security, 180);
    pdf.text(splitSecurity, 14, 36);
    // Add recommendations as bullet points
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    let yPosition = 45;

    reportData.recommendations.forEach((recommendation: any, index: number) => {
      const itemNumber = `${index + 1}. `;
      const prefix = `${itemNumber}${recommendation.mitigationStrategy} is of risk `;
      const priority = `${recommendation.priority}`;
      const score = ` (${recommendation.priorityValue})`;
      const riskMessage = ` - ${recommendation.riskMessage}`;

      // Combine everything to wrap correctly
      const fullText = prefix + priority + score + riskMessage;
      const wrappedLines = pdf.splitTextToSize(fullText, 175);

      // Print each line, but color the priority word on the first line
      wrappedLines.forEach((line: string, i: number) => {
        if (i === 0) {
          // Find where the priority word starts
          const prefixWidth =
            (pdf.getStringUnitWidth(prefix) * pdf.getFontSize()) /
            pdf.internal.scaleFactor;
          const priorityWidth =
            (pdf.getStringUnitWidth(priority) * pdf.getFontSize()) /
            pdf.internal.scaleFactor;
          const scoreWidth =
            (pdf.getStringUnitWidth(score) * pdf.getFontSize()) /
            pdf.internal.scaleFactor;

          // Draw the prefix
          pdf.setTextColor(0, 0, 0);
          pdf.text(prefix, 14, yPosition);

          // Set priority color
          if (recommendation.priority === "Low") {
            pdf.setTextColor(0, 255, 0);
          } else if (recommendation.priority === "Moderate") {
            pdf.setTextColor(191, 159, 64);
          } else if (recommendation.priority === "High") {
            pdf.setTextColor(255, 165, 0);
          } else if (recommendation.priority === "Critical") {
            pdf.setTextColor(255, 0, 0);
          }

          pdf.text(priority, 14 + prefixWidth, yPosition);

          // Score in same color
          pdf.text(score, 14 + prefixWidth + priorityWidth, yPosition);

          // Back to black for the rest
          pdf.setTextColor(0, 0, 0);
          const restOfLine = line.slice((prefix + priority + score).length);
          pdf.text(
            restOfLine,
            14 + prefixWidth + priorityWidth + scoreWidth,
            yPosition
          );
        } else {
          // Remaining lines (wrapped lines)
          pdf.setTextColor(0, 0, 0);
          pdf.text(line, 18, yPosition);
        }

        yPosition += 6;
      });
    });
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const address = `By addressing these strategies in this order, we can effectively prioritise resources to mitigate the most critical and high-risk vulnerabilities first, followed by moderate risks.`;

    const splitAddress = pdf.splitTextToSize(address, 180);
    pdf.text(splitAddress, 14, yPosition + 2);
    // Add conclusion
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102);
    pdf.text("Conclusion:", 14, yPosition + 14);

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const conclusion = `This gap analysis has provided ${reportData.assessment.clientName} with a clear understanding of its current security posture in relation to the Essential Eight framework. By addressing the identified gaps and implementing the recommendations outlined in this report, the organisation can significantly improve its resilience to cyber threats and protect its valuable information assets.`;

    const splitConclusion = pdf.splitTextToSize(conclusion, 180);
    pdf.text(splitConclusion, 14, yPosition + 18);

    // Save the PDF
    pdf.save(
      `Essential_Eight_Report_${reportData.assessment.clientName}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
