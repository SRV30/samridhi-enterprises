import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";

const API_URL = "/api/parts";

export const addPart = createAsyncThunk(
  "part/add",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.post(`${API_URL}/add`, formData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchParts = createAsyncThunk(
  "part/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/get`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchPartById = createAsyncThunk(
  "part/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/get/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updatePart = createAsyncThunk(
  "part/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.put(`${API_URL}/update/${id}`, formData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deletePart = createAsyncThunk(
  "part/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.delete(`${API_URL}/delete/${id}`, config);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createOrUpdateReview = createAsyncThunk(
  "part/createOrUpdateReview",
  async ({ partId, rating, comment }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.post(
        `${API_URL}/review/${partId}`,
        { rating, comment },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  "part/deleteReview",
  async (partId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.delete(`${API_URL}/review/${partId}`, config);
      return { partId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const partSlice = createSlice({
  name: "part",
  initialState: {
    parts: [],
    part: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearPartError: (state) => {
      state.error = null;
    },
    clearPartSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addPart.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addPart.fulfilled, (state, action) => {
        state.loading = false;
        state.parts.push(action.payload.part);
        state.success = true;
      })
      .addCase(addPart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchParts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParts.fulfilled, (state, action) => {
        state.loading = false;
        state.parts = action.payload.parts;
      })
      .addCase(fetchParts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPartById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartById.fulfilled, (state, action) => {
        state.loading = false;
        state.part = action.payload.part;
      })
      .addCase(fetchPartById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePart.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updatePart.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.parts.findIndex((p) => p._id === action.payload.part._id);
        if (index !== -1) {
          state.parts[index] = action.payload.part;
        }
        state.success = true;
      })
      .addCase(updatePart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deletePart.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deletePart.fulfilled, (state, action) => {
        state.loading = false;
        state.parts = state.parts.filter((p) => p._id !== action.payload.id);
        state.success = true;
      })
      .addCase(deletePart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrUpdateReview.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createOrUpdateReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (state.part && state.part._id === action.meta.arg.partId) {
          state.part = { ...state.part, reviews: action.payload.part.reviews, ratings: action.payload.part.ratings, numOfReviews: action.payload.part.numOfReviews };
        }
      })
      .addCase(createOrUpdateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (state.part && state.part._id === action.payload.partId) {
          state.part = { ...state.part, reviews: action.payload.part.reviews, ratings: action.payload.part.ratings, numOfReviews: action.payload.part.numOfReviews };
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPartError, clearPartSuccess } = partSlice.actions;
export default partSlice.reducer;