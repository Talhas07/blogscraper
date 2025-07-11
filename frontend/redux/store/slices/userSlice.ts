import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { AuthState } from "@/utils/types";
import {
  loginUser,
  registerUser as registerUserApi,
  getUsersByRole,
  deleteUser,
  updateUser,
  registerFacility,
  registerShortFacility,
  updateFacility,
  updatedUser,
  changePassword,
  createUser,
} from "@/redux/api/api";
import axios from "axios";

interface RegisterPayload {
  role?: string;
  firstName: string;
  lastName?: string;
  email: string;
  birth?: string;
  address?: string;
  description?: string;
  job?: string;
  id?: string;
  password: string;
}

interface UserState {
  user: any;
  token: any;
  loading: boolean;
  error: any;
  usersByRole: any[];
  updatedUser: any;
}

// Async Thunk to Process Token and Set User
export const loginWithToken = createAsyncThunk(
  "auth/loginWithToken",
  async (token: string, { rejectWithValue }) => {
    try {
      const decodedToken = JSON.parse(decodeURIComponent(token));
      return decodedToken; // This will be handled in `fulfilled`
    } catch (error: any) {
      return rejectWithValue(error.message); // This will be handled in `rejected`
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (userData: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await loginUser(userData);
      console.log("response is", response);
      return {
        user: response.user,
        token: response.token,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const updatedUserThunk = createAsyncThunk(
  "user/updateduser",
  async (id: string, thunkAPI) => {
    try {
      const response = await updatedUser(id);
      console.log(response);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (formData: FormData, thunkAPI) => {
    try {
      const response = await registerUserApi(formData); // now accepts FormData
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const registerFacilityThunk = createAsyncThunk(
  "user/registerFacility",
  async (userData: RegisterPayload, thunkAPI) => {
    try {
      const response = await registerFacility(userData);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const updateFacilityThunk = createAsyncThunk(
  "user/updateFacility",
  async (userData: RegisterPayload, thunkAPI) => {
    try {
      const response = await updateFacility(userData);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const registerShortFacilityThunk = createAsyncThunk(
  "user/registerShortFacility",
  async (userData: any, thunkAPI) => {
    try {
      const response = await registerShortFacility(userData);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const fetchUsersByRole = createAsyncThunk(
  "user/getUsersByRole",
  async (role: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.user.token;
      const response = await getUsersByRole(role, token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
export const updateUserById = createAsyncThunk(
  "user/updateUser",
  async (
    { userId, userData }: { userId: string; userData: any },
    { getState, rejectWithValue }
  ) => {
    try {
      console.log("user data is", userData);
      const state: any = getState();
      const token = state.user.token;
      const response = await updateUser(userId, userData, token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// In userSlice.ts, add the deleteUserById thunk
export const deleteUserById = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.user.token;
      const response = await deleteUser(userId, token);
      console.log("deleted user", response);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  "user/changePassword",
  async (
    {
      email,
      oldPassword,
      newPassword,
    }: { email: string; oldPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await changePassword({
        email,
        oldPassword,
        newPassword,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const createUserThunk = createAsyncThunk(
  "user/createUser",
  async (userData: any, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.user.token;
      const response = await createUser(userData, token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

const initialState: UserState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  usersByRole: [],
  updatedUser: null,
};

// Create slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginWithToken.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.loading = false;
        }
      )
      .addCase(loginWithToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.usersByRole = action.payload;
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.loading = false;
        console.log("deleted user", action.payload);
        state.usersByRole = state.usersByRole.filter(
          (user) => user.id !== action.payload.id
        );
      })
      .addCase(deleteUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.loading = false;

        state.usersByRole = state.usersByRole.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerFacilityThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerFacilityThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(registerFacilityThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerShortFacilityThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerShortFacilityThunk.fulfilled, (state, action) => {
        state.loading = false;
        // state.user = action.payload.user;
        // state.token = action.payload.accessToken;
      })
      .addCase(registerShortFacilityThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateFacilityThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFacilityThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(updateFacilityThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatedUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatedUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.updatedUser = action.payload;
        console.log(state.updatedUser);
        console.log(action.payload);
        // state.token = action.payload.accessToken;
      })
      .addCase(updatedUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.usersByRole = [...state.usersByRole, action.payload];
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;
