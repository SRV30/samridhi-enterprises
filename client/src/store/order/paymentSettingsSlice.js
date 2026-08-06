import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";

const API_URL = "/api/payment-settings";

const authConfig = (multipart = false) => {
  return {
    headers: {
      ...(multipart ? { "Content-Type": "multipart/form-data" } : {}),
    },
  };
};

export const getPaymentSettings = createAsyncThunk(
  "paymentSettings/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}`, authConfig());
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin (multipart: optional qrImage)
export const adminUpdatePaymentSettings = createAsyncThunk(
  "paymentSettings/update",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/admin/update`,
        formData,
        authConfig(true)
      );
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const paymentSettingsSlice = createSlice({
  name: "paymentSettings",
  initialState: {
    settings: { upiId: "", qrImage: { public_id: "", url: "" }, notifyAdminsOnNewOrder: true },
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearPaymentSettingsError: (state) => {
      state.error = null;
    },
    clearPaymentSettingsSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(getPaymentSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(adminUpdatePaymentSettings.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(adminUpdatePaymentSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.settings = action.payload;
      })
      .addCase(adminUpdatePaymentSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentSettingsError, clearPaymentSettingsSuccess } =
  paymentSettingsSlice.actions;
export default paymentSettingsSlice.reducer;
