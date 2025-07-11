import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas-pro";
import { split } from "lodash";

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
const riskLevels = [
  {
    level: "Critical",
    range: "76–100",
    color: [128, 0, 0],
    description:
      "Immediate action required. Risks pose severe threats to organizational security, potentially leading to significant data breaches or system compromise. Full implementation of recommended Essential Eight controls is urgent to mitigate.",
  },
  {
    level: "High",
    range: "51–75",
    color: [255, 0, 0],
    description:
      "Prompt attention needed. Risks could result in substantial impact, such as unauthorized access or operational disruption. Prioritize strengthening relevant Essential Eight controls to reduce exposure.",
  },
  {
    level: "Moderate",
    range: "26–50",
    color: [191, 159, 64],
    description:
      "Manageable but not negligible. Risks may cause limited impact or partial compromise. Implement or enhance Essential Eight controls as part of regular security improvements to address vulnerabilities.",
  },
  {
    level: "Low",
    range: "0–25",
    color: [0, 128, 0],
    description:
      "Minimal immediate concern. Risks have low likelihood or impact but should be monitored. Ensure Essential Eight controls remain effective to prevent escalation over time.",
  },
];
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
`;

    const splitIntroduction = pdf.splitTextToSize(introduction, 180);
    pdf.text(splitIntroduction, 14, 100);

    const intro2 = `• Determine the organisation's current maturity level for each of the Essential Eight mitigation strategies.
• Identify any gaps between the current security posture and the desired maturity level.
• Provide recommendations for remediation and improvement.`;

    const splitIntro2 = pdf.splitTextToSize(intro2, 180);
    pdf.text(splitIntro2, 20, 109);

    // Scope
    const scopeText = `The scope of this assessment is outlined in the initial engagement agreement`;

    const splitScope = pdf.splitTextToSize(scopeText, 180);
    pdf.text(splitScope, 14, 124);

    // Methodology
    const methodologyText = `The assessment was conducted using the following methodology:
`;

    const splitMethodology = pdf.splitTextToSize(methodologyText, 180);
    pdf.text(splitMethodology, 14, 130);
    const method2 = `• Interviews with key personnel, review of system configurations, analysis of security policies and procedures,`;
    const method3 = `and technical testing.`;
    const method4 = `• MyCyberHelp Cybersecurity Assessment Tool`;
    pdf.text(method2, 20, 135);
    pdf.text(method3, 22, 139);
    pdf.text(method4, 20, 143);
    // Date of Assessment
    // const assessmentDateText = `The assessment was conducted on ${reportData.assessment.createdAt}.`;
    // const splitDate = pdf.splitTextToSize(assessmentDateText, 180);
    // pdf.text(splitDate, 14, 148);

    // Add the radar chart image
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102);
    pdf.text("3. Maturity Level Visualization", 14, 153);

    // Add the chart image
    pdf.addImage(chartImage, "PNG", 10, 161, 180, 90); // Adjust position and size as needed

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
    const security = `To enhance your security posture, we recommend addressing the following strategies in order of priority based on their risk levels:
`;

    const splitSecurity = pdf.splitTextToSize(security, 180);
    pdf.text(splitSecurity, 14, 36);
    // Add recommendations as bullet points
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    // let yPosition = 45;

    // reportData.recommendations.forEach((recommendation: any, index: number) => {
    //   const itemNumber = `${index + 1}. `;
    //   const prefix = `${itemNumber}${recommendation.mitigationStrategy} is of risk `;
    //   const priority = `${recommendation.priority}`;
    //   const score = ` (${recommendation.priorityValue})`;
    //   const riskMessage = ` - ${recommendation.riskMessage}`;

    //   // Combine everything to wrap correctly
    //   const fullText = prefix + priority + score + riskMessage;
    //   const wrappedLines = pdf.splitTextToSize(fullText, 175);

    //   // Print each line, but color the priority word on the first line
    //   wrappedLines.forEach((line: string, i: number) => {
    //     if (i === 0) {
    //       // Find where the priority word starts
    //       const prefixWidth =
    //         (pdf.getStringUnitWidth(prefix) * pdf.getFontSize()) /
    //         pdf.internal.scaleFactor;
    //       const priorityWidth =
    //         (pdf.getStringUnitWidth(priority) * pdf.getFontSize()) /
    //         pdf.internal.scaleFactor;
    //       const scoreWidth =
    //         (pdf.getStringUnitWidth(score) * pdf.getFontSize()) /
    //         pdf.internal.scaleFactor;

    //       // Draw the prefix
    //       pdf.setTextColor(0, 0, 0);
    //       pdf.text(prefix, 14, yPosition);

    //       // Set priority color
    //       if (recommendation.priority === "Low") {
    //         pdf.setTextColor(0, 255, 0);
    //       } else if (recommendation.priority === "Moderate") {
    //         pdf.setTextColor(191, 159, 64);
    //       } else if (recommendation.priority === "High") {
    //         pdf.setTextColor(255, 165, 0);
    //       } else if (recommendation.priority === "Critical") {
    //         pdf.setTextColor(255, 0, 0);
    //       }

    //       pdf.text(priority, 14 + prefixWidth, yPosition);

    //       // Score in same color
    //       pdf.text(score, 14 + prefixWidth + priorityWidth, yPosition);

    //       // Back to black for the rest
    //       pdf.setTextColor(0, 0, 0);
    //       const restOfLine = line.slice((prefix + priority + score).length);
    //       pdf.text(
    //         restOfLine,
    //         14 + prefixWidth + priorityWidth + scoreWidth,
    //         yPosition
    //       );
    //     } else {
    //       // Remaining lines (wrapped lines)
    //       pdf.setTextColor(0, 0, 0);
    //       pdf.text(line, 18, yPosition);
    //     }

    //     yPosition += 6;
    //   });
    // });
    let yPosition = 45;
    const lineHeight = 6;

    // ----- Draw Table Header -----
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80); // Dark gray text
    pdf.setFillColor(240, 240, 240); // Light gray background
    pdf.setDrawColor(200); // Light gray border

    // Header height same as one line row
    pdf.rect(14, yPosition, 86, lineHeight, "FD"); // Strategy column
    pdf.rect(100, yPosition, 40, lineHeight, "FD"); // Risk column
    pdf.rect(140, yPosition, 40, lineHeight, "FD"); // Score column

    pdf.text("Strategy", 16, yPosition + 4);
    pdf.text("Risk", 102, yPosition + 4);
    pdf.text("Score", 142, yPosition + 4);

    yPosition += lineHeight;

    // ----- Render Data Rows -----
    reportData.recommendations.forEach((recommendation: any) => {
      let color: [number, number, number] = [0, 128, 0];
      if (recommendation.priority === "Moderate") color = [191, 159, 64];
      else if (recommendation.priority === "High") color = [255, 0, 0];
      else if (recommendation.priority === "Critical") color = [128, 0, 0];

      pdf.setTextColor(...color);
      pdf.setFontSize(11);

      // Wrap long strategy text to fit cell
      const strategyLines = pdf.splitTextToSize(
        recommendation.mitigationStrategy,
        80
      );
      const rowHeight = strategyLines.length * lineHeight;

      // Draw borders for the row
      pdf.setDrawColor(200); // Light gray border
      pdf.rect(14, yPosition, 86, rowHeight, "D");
      pdf.rect(100, yPosition, 40, rowHeight, "D");
      pdf.rect(140, yPosition, 40, rowHeight, "D");

      // Print strategy text
      strategyLines.forEach((line: string, i: number) => {
        pdf.text(line, 16, yPosition + (i + 1) * lineHeight - 2);
      });

      // Risk and Score only on first line
      pdf.text(recommendation.priority, 102, yPosition + lineHeight - 2);
      pdf.text(
        String(recommendation.priorityValue),
        142,
        yPosition + lineHeight - 2
      );

      // Move to next row
      yPosition += rowHeight;
    });
    console.log("yposition", yPosition);
    const col1Width = 30; // Width for level + score
    const col2Width = 140; // Width for description (total 190 - col1Width)
    const lineHeight2 = 6;
    yPosition = 104;

    riskLevels.forEach((item) => {
      // Print Risk Level + Score in col1 with color
      pdf.setTextColor(...item.color);
      pdf.setFontSize(9);
      pdf.text(
        `${item.level} (${item.range})`,
        14,
        yPosition + lineHeight2 - 2
      );

      // Wrap description text in col2 width
      pdf.setTextColor(0, 0, 0);

      const wrappedDesc = pdf.splitTextToSize(item.description, col2Width);

      // Print description lines starting at col2 x-position
      wrappedDesc.forEach((line, i) => {
        pdf.text(
          line,
          14 + col1Width + 10,
          yPosition + (i + 1) * lineHeight2 - 2
        );
      });

      // Increase yPosition by the max height of col1 or description lines
      const descHeight = wrappedDesc.length * lineHeight2;
      yPosition += Math.max(lineHeight2, descHeight) + 2; // +10 for spacing between rows
    });
    ////////////////////////////
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

    const conclusion2 = `The comprehensive gap analysis conducted for ${reportData.assessment.clientName} has delivered a detailed and actionable assessment of the organisation's current cybersecurity posture, benchmarked against the Australian Cyber Security Centre’s Essential Eight maturity model. This rigorous evaluation has illuminated critical areas where ${reportData.assessment.clientName} existing security measures align with best practices, as well as key deficiencies that require strategic attention to achieve compliance and bolster overall resilience.`;

    const splitConclusion2 = pdf.splitTextToSize(conclusion2, 180);
    pdf.text(splitConclusion2, 14, yPosition + 20);
    const conclusion3 = `By systematically addressing the identified gaps—ranging from incomplete implementation of mitigation strategies to areas requiring enhanced controls—the organisation can significantly strengthen its defences against evolving cyber threats. The recommendations outlined in this report are tailored to ${reportData.assessment.clientName} unique operational context and risk profile, ensuring that proposed measures are both practical and effective.`;

    const splitConclusion3 = pdf.splitTextToSize(conclusion3, 180);
    pdf.text(splitConclusion3, 14, yPosition + 43);
    const conclusion4 = `Implementing these recommendations will enable ${reportData.assessment.clientName}  to elevate its security posture to meet or exceed the Essential Eight maturity level appropriate for its risk environment. This proactive approach will not only mitigate vulnerabilities but also safeguard the organisation’s critical information assets, intellectual property, and sensitive data. Furthermore, achieving a higher level of cybersecurity maturity will enhance stakeholder confidence, support regulatory compliance, and position as a leader in cybersecurity resilience within its sector.`;

    const splitConclusion4 = pdf.splitTextToSize(conclusion4, 180);
    pdf.text(splitConclusion4, 14, yPosition + 62);
    const conclusion5 = `To maximise the impact of these efforts, we recommend that ${reportData.assessment.clientName} prioritise the remediation actions based on risk severity and resource availability, while establishing a robust monitoring and review process to ensure sustained progress. By committing to these strategic improvements, ${reportData.assessment.clientName} will be well-equipped to navigate the complex threat landscape and protect its operational integrity for the long term.`;

    const splitConclusion5 = pdf.splitTextToSize(conclusion5, 180);
    pdf.text(splitConclusion5, 14, yPosition + 85);

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
