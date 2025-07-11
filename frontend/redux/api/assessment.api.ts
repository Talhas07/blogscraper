import { useSelector } from "react-redux";
import type { Assessment } from "../store/slices/AssessmentSlice";
import { api } from "@/utils/api";
import { RootState } from "../store/store";

export const assessmentApi = {
  fetchAssessment: async () => {
    const response = await api.get("/assessments/latest");
    return response.data;
  },

  // addAssessment: async (assessment: Assessment, clientid: string) => {
  //   const response = await api.post("/assessments", assessment);
  //   return response.data;
  // },

  addAssessment: async (
    assessment: Assessment,
    clientId: string,
    token: string
  ) => {
    const response = await api.post(
      "/assessments",
      {
        ...assessment,
        clientId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  updateAssessment: async (assessment: Assessment) => {
    const response = await api.patch(
      `/assessments/${assessment.id}`,
      assessment
    );
    return response.data;
  },

  deleteAssessment: async (id: string) => {
    await api.delete(`/assessments/${id}`);
    return id;
  },

  // getUserAnswers: async (id: number, questionIds: number[]) => {
  //   const response = await api.get("/user-answers", {
  //     params: { questionIds: questionIds.join(",") },
  //   });
  //   return response.data;
  // },
  getUserAnswers: async (userId: string, questionIds: number[]) => {
    const response = await api.get("/user-answers", {
      params: {
        userId,
        questionIds: questionIds.join(","),
      },
    });
    return response.data;
  },

  saveUserAnswers: async (formData: FormData) => {
    const response = await api.post("/user-answers", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
