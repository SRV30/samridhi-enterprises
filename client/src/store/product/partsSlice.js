import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";

const API_URL = "/api/parts";

export const addPart = createAsyncThunk(
  "part/add",
  async (formData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
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

export const fetchSimilarParts = createAsyncThunk(
  "part/fetchSimilar",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/get/${id}/similar`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchFrequentlyBoughtTogether = createAsyncThunk(
  "part/fetchFrequentlyBoughtTogether",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/get/${id}/frequently-bought-together`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRecommendedForYou = createAsyncThunk(
  "part/fetchRecommendedForYou",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/recommendations/for-you`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fire-and-forget: record that a set of recommended products was shown.
// Failures are swallowed — analytics tracking must never disrupt the UI.
export const trackRecommendationImpressions = createAsyncThunk(
  "part/trackRecommendationImpressions",
  async (productIds, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/recommendations/track-impressions`,
        { productIds }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fire-and-forget: record that a recommended product was clicked.
export const trackRecommendationClick = createAsyncThunk(
  "part/trackRecommendationClick",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/recommendations/track-click`,
        { productId }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin — fetch recommendation & engagement analytics (most viewed, most
// recommended, CTR).
export const adminGetRecommendationAnalytics = createAsyncThunk(
  "part/adminGetRecommendationAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/admin/recommendation-analytics`
      );
      return response.data.recommendationAnalytics;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updatePart = createAsyncThunk(
  "part/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
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
      const response = await axiosInstance.delete(`${API_URL}/delete/${id}`);
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
      const response = await axiosInstance.post(
        `${API_URL}/review/${partId}`,
        { rating, comment }
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
      const response = await axiosInstance.delete(`${API_URL}/review/${partId}`);
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
    similarParts: [],
    similarLoading: false,
    similarError: null,
    fbtParts: [],
    fbtLoading: false,
    fbtError: null,
    recommendedParts: [],
    recommendedLoading: false,
    recommendedError: null,
    recommendationAnalytics: null,
    recommendationAnalyticsLoading: false,
    recommendationAnalyticsError: null,
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
      .addCase(fetchSimilarParts.pending, (state) => {
        state.similarLoading = true;
        state.similarError = null;
        state.similarParts = [];
      })
      .addCase(fetchSimilarParts.fulfilled, (state, action) => {
        state.similarLoading = false;
        state.similarParts = action.payload.parts;
      })
      .addCase(fetchSimilarParts.rejected, (state, action) => {
        state.similarLoading = false;
        state.similarError = action.payload;
      })
      .addCase(fetchFrequentlyBoughtTogether.pending, (state) => {
        state.fbtLoading = true;
        state.fbtError = null;
        state.fbtParts = [];
      })
      .addCase(fetchFrequentlyBoughtTogether.fulfilled, (state, action) => {
        state.fbtLoading = false;
        state.fbtParts = action.payload.parts;
      })
      .addCase(fetchFrequentlyBoughtTogether.rejected, (state, action) => {
        state.fbtLoading = false;
        state.fbtError = action.payload;
      })
      .addCase(fetchRecommendedForYou.pending, (state) => {
        state.recommendedLoading = true;
        state.recommendedError = null;
      })
      .addCase(fetchRecommendedForYou.fulfilled, (state, action) => {
        state.recommendedLoading = false;
        state.recommendedParts = action.payload.parts;
      })
      .addCase(fetchRecommendedForYou.rejected, (state, action) => {
        state.recommendedLoading = false;
        state.recommendedError = action.payload;
      })
      .addCase(adminGetRecommendationAnalytics.pending, (state) => {
        state.recommendationAnalyticsLoading = true;
        state.recommendationAnalyticsError = null;
      })
      .addCase(adminGetRecommendationAnalytics.fulfilled, (state, action) => {
        state.recommendationAnalyticsLoading = false;
        state.recommendationAnalytics = action.payload;
      })
      .addCase(adminGetRecommendationAnalytics.rejected, (state, action) => {
        state.recommendationAnalyticsLoading = false;
        state.recommendationAnalyticsError = action.payload;
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
        if (state.part && state.part._id === action.meta.arg.partId && action.payload?.part) {
          state.part = {
            ...state.part,
            reviews: action.payload.part.reviews,
            ratings: action.payload.part.ratings,
            numOfReviews: action.payload.part.numOfReviews,
          };
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
        if (state.part && state.part._id === action.payload?.partId && action.payload?.part) {
          state.part = {
            ...state.part,
            reviews: action.payload.part.reviews,
            ratings: action.payload.part.ratings,
            numOfReviews: action.payload.part.numOfReviews,
          };
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