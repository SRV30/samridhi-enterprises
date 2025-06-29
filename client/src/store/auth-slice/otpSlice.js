import axiosInstance from "@/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const verifyEmailOtp = createAsyncThunk(
  "otp/verifyEmailOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("api/user/verify-email", {
        email,
        otp,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resendOtp = createAsyncThunk(
  "otp/resendOtp",
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/api/user/resend-otp", {
        email,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const otpSlice = createSlice({
  name: "otp",
  initialState: {
    email: "",
    otp: "",
    verifyEmail: false,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    clearMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyEmailOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.verifyEmail = true;
        state.successMessage = action.payload.message;
        localStorage.setItem("verifyEmail", action.payload.verifyEmail);
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })

      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { setEmail, clearMessages } = otpSlice.actions;
export default otpSlice.reducer;
