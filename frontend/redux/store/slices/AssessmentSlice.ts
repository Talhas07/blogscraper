import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { assessmentApi } from "../../api/assessment.api";

export interface Assessment {
  id?: string;
  name: string;
  description?: string;
  data?: string;
  status?: string;
  industry?: string;
}

interface AssessmentState {
  Assessments: Assessment[];
  loading: boolean;
  error: string | null;
}

const initialState: AssessmentState = {
  Assessments: [],
  loading: false,
  error: null,
};

export const fetchassessments = createAsyncThunk(
  "assessment/fetchassessments",
  async (_, { rejectWithValue }) => {
    try {
      return await assessmentApi.fetchAssessment();
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// export const addassessment = createAsyncThunk(
//   "assessment/addassessment",
//   async (assessment: Assessment, { rejectWithValue }) => {
//     try {
//       const response = await assessmentApi.addAssessment(assessment);
//       return response; // Return the API response
//     } catch (error: any) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

export const updateassessment = createAsyncThunk(
  "assessment/updateassessment",
  async (assessment: Assessment, { rejectWithValue }) => {
    try {
      return await assessmentApi.updateAssessment(assessment);
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteassessment = createAsyncThunk(
  "assessment/deleteassessment",
  async (id: string, { rejectWithValue }) => {
    try {
      return await assessmentApi.deleteAssessment(id);
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const assessmentSlice = createSlice({
  name: "assessment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchassessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchassessments.fulfilled, (state, action) => {
        state.loading = false;
        state.Assessments = action.payload.data;
      })
      .addCase(fetchassessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // .addCase(addassessment.fulfilled, (state, action) => {
      //   state.Assessments.push(action.payload);
      // })
      .addCase(updateassessment.fulfilled, (state, action) => {
        const index = state.Assessments.findIndex(
          (Assessment) => Assessment.id === action.payload.id
        );
        if (index !== -1) {
          state.Assessments[index] = action.payload;
        }
      })
      .addCase(deleteassessment.fulfilled, (state, action) => {
        state.Assessments = state.Assessments.filter(
          (Assessment) => Assessment.id !== action.payload
        );
      });
  },
});

export default assessmentSlice.reducer;
