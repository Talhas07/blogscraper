import axios, { AxiosError } from "axios";
import { api } from "@/utils/api";
// import { store } from "../store/store";

// export const InstagramLogin = async () => {
//   try {
//     // const state = store.getState(); // Get Redux state
//     const token = state.user.token;
//     const response = await axios.get(
//       `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/post/instagram/`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`, // Add token to request headers
//         },
//       }
//     );
//     return response.data; // Return user data & token
//   } catch (error) {
//     //throw error?.response?.data || 'Login failed';
//   }
// };

export const registerUser = async (userData: FormData) => {
  console.log(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/register`);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/register`,
      userData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Registration failed";
    }
    throw "Registration failed";
  }
};

export const registerFacility = async (userData: any) => {
  console.log(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/registerFacility`
  );
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/registerFacility`,
      userData
    );
    console.log(response);
    return response.data; // Return response data
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Registration failed";
    }
    throw "Registration failed";
  }
};

export const updateFacility = async (userData: any) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/updateFacility`,
      userData
    );
    console.log(response);
    return response.data; // Return response data
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Registration failed";
    }
    throw "Registration failed";
  }
};

export const registerShortFacility = async (userData: any) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/registerShortFacility`,
      userData
    );
    console.log(response);
    return response.data; // Return response data
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Registration failed";
    }
    throw "Registration failed";
  }
};
export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/login`,
      userData
    );

    // Get the token from the response
    const token = response.data.access_token || response.data.token;
    if (!token) {
      throw new Error("No token received from server");
    }

    // Store token in localStorage and cookie
    localStorage.setItem("token", token);
    document.cookie = `token=${token}; path=/`;

    return {
      user: response.data.user,
      token: token,
    };
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Login failed";
    }
    throw "Login failed";
  }
};
export const updatedUser = async (id: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${id}`
    );
    return response.data; // Return response data
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Login failed";
    }
    throw "Login failed";
  }
};
// In api.ts, use the deleteUser function
export const deleteUser = async (userId: string, token: string) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Failed to delete user";
    }
    throw "Failed to delete user";
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/forgot-password`,
      { email }
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data?.message || "User not found";
    }
    throw "User not found";
  }
};

export const verifyOtpAndResetPassword = async (data: {
  email: string;
  otp: number;
  newPassword: string;
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/verify-otp`,
      data
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data?.message || "Invalid OTP";
    }
    throw "Invalid OTP";
  }
};
export const updateUser = async (
  userId: string,
  userData: any,
  token: string
) => {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${userId}`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Failed to update user";
    }
    throw "Failed to update user";
  }
};

export const getUsersByRole = async (role: string, token: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/by-role?role=${role}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Failed to fetch users";
    }
    throw "Failed to fetch users";
  }
};

export const changePassword = async (data: {
  email: string;
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/change-password`,
      data
    );
    return response.data; // Return response data
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Failed to change password";
    }
    throw "Failed to change password";
  }
};

export const createUser = async (userData: any, token: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw error.response?.data || "Failed to create user";
    }
    throw "Failed to create user";
  }
};
