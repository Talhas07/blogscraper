import { api } from "@/utils/api";
import { saveToken, removeToken } from "@/utils/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login", credentials);
    const { token } = response.data;
    saveToken(token);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      removeToken();
    }
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },
}; 