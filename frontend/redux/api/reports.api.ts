import { api } from "@/utils/api"; // Axios instance
import { RootState } from "../store/store";
// import { Report } from "../types"; // You should define this type

// Helper to get token from Redux or localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // Or use useSelector if in a component
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const reportApi = {
  // GET all reports
  fetchReports: async (): Promise<Report[]> => {
    const response = await api.get("/reports", getAuthHeaders());
    return response.data;
  },

  // POST create a new report
  addReport: async (report: Report): Promise<Report> => {
    const response = await api.post("/reports", report, getAuthHeaders());
    return response.data;
  },

  // PUT update an existing report
  updateReport: async (
    id: string,
    updatedReport: Partial<Report>
  ): Promise<Report> => {
    const response = await api.put(
      `/reports/${id}`,
      updatedReport,
      getAuthHeaders()
    );
    return response.data;
  },

  // DELETE a report
  deleteReport: async (id: string): Promise<string> => {
    await api.delete(`/reports/${id}`, getAuthHeaders());
    return id;
  },

  // GET single report by ID
  getReportById: async (id: string): Promise<Report> => {
    const response = await api.get(`/reports/${id}`, getAuthHeaders());
    return response.data;
  },
};
