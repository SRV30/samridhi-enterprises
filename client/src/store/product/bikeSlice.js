import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";

const API_URL = "/api/bike-model";

// Add BikeModel
export const addBikeModel = createAsyncThunk(
  "bikeModel/add",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.post(
        `${API_URL}/add`,
        formData,
        config
      );
      console.log("addBikeModel response:", response.data); // Debug
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch All BikeModels
export const fetchBikeModels = createAsyncThunk(
  "bikeModel/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/get`);
      console.log("fetchBikeModels response:", response.data); // Debug
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update BikeModel
export const updateBikeModel = createAsyncThunk(
  "bikeModel/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.put(
        `${API_URL}/update/${id}`,
        formData,
        config
      );
      console.log("updateBikeModel response:", response.data); // Debug
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete BikeModel
export const deleteBikeModel = createAsyncThunk(
  "bikeModel/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.delete(
        `${API_URL}/delete/${id}`,
        config
      );
      console.log("deleteBikeModel response:", response.data); // Debug
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial State
const initialState = {
  bikeModels: [],
  loading: false,
  error: null,
  success: false,
};

const bikeModelSlice = createSlice({
  name: "bikeModel",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(addBikeModel.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addBikeModel.fulfilled, (state, action) => {
        state.loading = false;
        const model = action.payload.model || action.payload;
        state.bikeModels.push({
          ...model,
          images: Array.isArray(model.images) ? model.images : [],
          brand: model.brand || { _id: "", name: "N/A" },
        });
        state.success = true;
      })
      .addCase(addBikeModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch
      .addCase(fetchBikeModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBikeModels.fulfilled, (state, action) => {
        state.loading = false;
        state.bikeModels = Array.isArray(action.payload.bikeModels)
          ? action.payload.bikeModels.map((model) => ({
              ...model,
              images: Array.isArray(model.images) ? model.images : [],
              brand: model.brand || { _id: "", name: "N/A" },
            }))
          : [];
      })
      .addCase(fetchBikeModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateBikeModel.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateBikeModel.fulfilled, (state, action) => {
        state.loading = false;
        const model = action.payload.model || action.payload;
        const index = state.bikeModels.findIndex((m) => m._id === model._id);
        if (index !== -1) {
          state.bikeModels[index] = {
            ...model,
            images: Array.isArray(model.images) ? model.images : [],
            brand: model.brand || { _id: "", name: "N/A" },
          };
        }
        state.success = true;
      })
      .addCase(updateBikeModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteBikeModel.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteBikeModel.fulfilled, (state, action) => {
        state.loading = false;
        state.bikeModels = state.bikeModels.filter(
          (m) => m._id !== action.payload.id
        );
        state.success = true;
      })
      .addCase(deleteBikeModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = bikeModelSlice.actions;
export default bikeModelSlice.reducer;
