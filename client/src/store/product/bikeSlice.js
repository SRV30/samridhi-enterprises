import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";

const API_URL = "/api/bike-model";

export const addBikeModel = createAsyncThunk(
  "bikeModel/add",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/add`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchBikeModels = createAsyncThunk(
  "bikeModel/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/get`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateBikeModel = createAsyncThunk(
  "bikeModel/update",
  async ({ id, formData, updatedData }, { rejectWithValue }) => {
    try {
      const payload = formData || updatedData;
      if (!payload) return rejectWithValue("Bike model update data is required");
      const response = await axiosInstance.put(`${API_URL}/update/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteBikeModel = createAsyncThunk(
  "bikeModel/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/delete/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const normalizeModel = (model = {}) => ({
  ...model,
  images: Array.isArray(model.images) ? model.images : [],
  brand: model.brand || { _id: "", name: "N/A" },
});

const initialState = { bikeModels: [], loading: false, error: null, success: false };

const bikeModelSlice = createSlice({
  name: "bikeModel",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addBikeModel.pending, (state) => { state.loading = true; state.success = false; state.error = null; })
      .addCase(addBikeModel.fulfilled, (state, action) => { state.loading = false; state.bikeModels.push(normalizeModel(action.payload.model || action.payload)); state.success = true; })
      .addCase(addBikeModel.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchBikeModels.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBikeModels.fulfilled, (state, action) => { state.loading = false; state.bikeModels = Array.isArray(action.payload.bikeModels) ? action.payload.bikeModels.map(normalizeModel) : []; })
      .addCase(fetchBikeModels.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateBikeModel.pending, (state) => { state.loading = true; state.success = false; state.error = null; })
      .addCase(updateBikeModel.fulfilled, (state, action) => {
        state.loading = false;
        const model = normalizeModel(action.payload.model || action.payload);
        const index = state.bikeModels.findIndex((m) => m._id === model._id);
        if (index !== -1) state.bikeModels[index] = model;
        state.success = true;
      })
      .addCase(updateBikeModel.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteBikeModel.pending, (state) => { state.loading = true; state.success = false; state.error = null; })
      .addCase(deleteBikeModel.fulfilled, (state, action) => { state.loading = false; state.bikeModels = state.bikeModels.filter((m) => m._id !== action.payload.id); state.success = true; })
      .addCase(deleteBikeModel.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError, clearSuccess } = bikeModelSlice.actions;
export default bikeModelSlice.reducer;
