import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";

const API_URL = "/api/coupon";

const authConfig = () => ({});

// ── User: validate a coupon against the current cart ──
export const validateCoupon = createAsyncThunk(
  "coupon/validate",
  async (code, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/validate`,
        { code },
        authConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Admin: list coupons ──
export const getAllCoupons = createAsyncThunk(
  "coupon/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/admin/get`, authConfig());
      return response.data.coupons;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Admin: create coupon ──
export const createCoupon = createAsyncThunk(
  "coupon/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/admin/create`,
        payload,
        authConfig()
      );
      return response.data.coupon;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Admin: update coupon ──
export const updateCoupon = createAsyncThunk(
  "coupon/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/admin/update/${id}`,
        payload,
        authConfig()
      );
      return response.data.coupon;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Admin: delete coupon ──
export const deleteCoupon = createAsyncThunk(
  "coupon/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_URL}/admin/delete/${id}`, authConfig());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const couponSlice = createSlice({
  name: "coupon",
  initialState: {
    coupons: [],
    // The coupon the customer has applied at checkout (display state).
    applied: null, // { code, discount, payable, subtotal }
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearCouponError: (state) => {
      state.error = null;
    },
    clearCouponSuccess: (state) => {
      state.success = false;
    },
    clearAppliedCoupon: (state) => {
      state.applied = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // validate
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.applied = {
          code: action.payload.coupon.code,
          discount: action.payload.discount,
          payable: action.payload.payable,
          subtotal: action.payload.subtotal,
        };
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.applied = null;
        state.error = action.payload;
      })

      // getAll
      .addCase(getAllCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(getAllCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // create
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.coupons.unshift(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.coupons = state.coupons.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // delete
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCouponError, clearCouponSuccess, clearAppliedCoupon } =
  couponSlice.actions;
export default couponSlice.reducer;
