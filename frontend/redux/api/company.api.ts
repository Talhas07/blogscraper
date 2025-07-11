// import axios from "axios";
// import type { Company } from "../store/slices/AssessmentSlice";

// const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// export const companyApi = {
//   fetchCompanies: async () => {
//     const response = await axios.get(`${API_URL}/company`);
//     return response.data;
//   },

//   addCompany: async (company: Company) => {
//     const response = await axios.post(`${API_URL}/company`, company);
//     return response.data;
//   },

//   updateCompany: async (company: Company) => {
//     const response = await axios.patch(
//       `${API_URL}/company/${company.id}`,
//       company
//     );
//     return response.data;
//   },

//   deleteCompany: async (id: string) => {
//     await axios.delete(`${API_URL}/company/${id}`);
//     return id;
//   },
// };
