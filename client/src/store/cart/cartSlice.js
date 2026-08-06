import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";
import {
  getGuestCart,
  removeGuestCartItem,
  resetGuestCart,
  syncGuestCart,
  updateGuestCartItem,
  upsertGuestCartItem,
} from "@/utils/guestCart";

const API_URL = "/api/cart";

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ partId, quantity }, { rejectWithValue }) => {
    try {
      if (!localStorage.getItem("user")) {
        return await upsertGuestCartItem({ partId, quantity });
      }

      const response = await axiosInstance.post(
        `${API_URL}`,
        { partId, quantity }
      );
      console.log("addToCart response:", response.data);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      if (!localStorage.getItem("user")) {
        return { success: true, warnings: [], cart: getGuestCart() };
      }

      const syncResult = await syncGuestCart();
      const response = await axiosInstance.get(`${API_URL}`);
      console.log("fetchCart response:", response.data);
      return {
        ...response.data,
        warnings: [...(response.data.warnings || []), ...(syncResult.warnings || [])],
        failedItems: syncResult.failedItems || [],
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ partId, quantity }, { rejectWithValue }) => {
    try {
      if (!localStorage.getItem("user")) {
        return updateGuestCartItem({ partId, quantity });
      }

      const response = await axiosInstance.put(
        `${API_URL}/${partId}`,
        { quantity }
      );
      console.log("updateCartItem response:", response.data);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (partId, { rejectWithValue }) => {
    try {
      if (!localStorage.getItem("user")) {
        return removeGuestCartItem(partId);
      }

      const response = await axiosInstance.delete(
        `${API_URL}/${partId}`
      );
      console.log("removeFromCart response:", response.data);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      if (!localStorage.getItem("user")) {
        return resetGuestCart();
      }

      const response = await axiosInstance.delete(`${API_URL}/clear`);
      console.log("clearCart response:", response.data);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: { items: [], total: 0 },
    warnings: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearWarnings: (state) => {
      state.warnings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.cart = action.payload;
        state.warnings = [];
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.warnings = action.payload.warnings || [];
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.cart = action.payload;
        state.warnings = [];
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.cart = action.payload;
        state.warnings = [];
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.cart = action.payload;
        state.warnings = [];
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearWarnings } = cartSlice.actions;
export default cartSlice.reducer;
