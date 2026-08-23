import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";
import { getGuestCart, removeGuestCartItem, resetGuestCart, syncGuestCart, updateGuestCartItem, upsertGuestCartItem } from "@/utils/guestCart";

const API_URL = "/api/cart";

const addCartItem = async ({ partId, quantity }) => {
  if (!localStorage.getItem("user")) return upsertGuestCartItem({ partId, quantity });
  const response = await axiosInstance.post(API_URL, { partId, quantity });
  return response.data.cart;
};

export const addToCart = createAsyncThunk("cart/addToCart", async ({ partId, quantity }, { rejectWithValue }) => {
  try { return await addCartItem({ partId, quantity }); }
  catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    let cart;
    let warnings = [];
    let failedItems = [];

    if (!localStorage.getItem("user")) {
      cart = getGuestCart();
    } else {
      const syncResult = await syncGuestCart();
      const response = await axiosInstance.get(API_URL);
      cart = response.data.cart;
      warnings = [...(response.data.warnings || []), ...(syncResult.warnings || [])];
      failedItems = syncResult.failedItems || [];
    }

    // Product details currently links Buy Now directly to /checkout. When that
    // checkout is opened from a product page with an empty cart, add that
    // product as a one-item purchase. Normal cart-to-checkout navigation is
    // unchanged because its referrer is /cart rather than /products/:id.
    if (typeof window !== "undefined" && window.location.pathname === "/checkout" && !(cart?.items || []).length) {
      const referrer = document.referrer || "";
      const match = referrer.match(/\/products\/([^/?#]+)/);
      const partId = match?.[1];

      if (partId) {
        const productResponse = await axiosInstance.get(`/api/parts/get/${partId}`);
        const product = productResponse.data?.part;
        if (product && Number(product.stock || 0) > 0) {
          cart = await addCartItem({ partId, quantity: 1 });
        }
      }
    }

    return { success: true, warnings, failedItems, cart };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateCartItem = createAsyncThunk("cart/updateCartItem", async ({ partId, quantity }, { rejectWithValue }) => {
  try {
    if (!localStorage.getItem("user")) return updateGuestCartItem({ partId, quantity });
    const response = await axiosInstance.put(`${API_URL}/${partId}`, { quantity });
    return response.data.cart;
  } catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});

export const removeFromCart = createAsyncThunk("cart/removeFromCart", async (partId, { rejectWithValue }) => {
  try {
    if (!localStorage.getItem("user")) return removeGuestCartItem(partId);
    const response = await axiosInstance.delete(`${API_URL}/${partId}`);
    return response.data.cart;
  } catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});

export const clearCart = createAsyncThunk("cart/clearCart", async (_, { rejectWithValue }) => {
  try {
    if (!localStorage.getItem("user")) return resetGuestCart();
    const response = await axiosInstance.delete(`${API_URL}/clear`);
    return response.data.cart;
  } catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { cart: { items: [], total: 0 }, warnings: [], loading: false, error: null, success: false },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = false; },
    clearWarnings: (state) => { state.warnings = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => { state.loading = true; state.success = false; state.error = null; })
      .addCase(addToCart.fulfilled, (state, action) => { state.loading = false; state.success = true; state.cart = action.payload; state.warnings = []; state.error = null; })
      .addCase(addToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload.cart; state.warnings = action.payload.warnings || []; state.error = null; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateCartItem.pending, (state) => { state.loading = true; state.success = false; state.error = null; })
      .addCase(updateCartItem.fulfilled, (state, action) => { state.loading = false; state.success = true; state.cart = action.payload; state.warnings = []; state.error = null; })
      .addCase(updateCartItem.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(removeFromCart.pending, (state) => { state.loading = true; state.success = false; state.error = null; })
      .addCase(removeFromCart.fulfilled, (state, action) => { state.loading = false; state.success = true; state.cart = action.payload; state.warnings = []; state.error = null; })
      .addCase(removeFromCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(clearCart.pending, (state) => { state.loading = true; state.success = false; state.error = null; })
      .addCase(clearCart.fulfilled, (state, action) => { state.loading = false; state.success = true; state.cart = action.payload; state.warnings = []; state.error = null; })
      .addCase(clearCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError, clearSuccess, clearWarnings } = cartSlice.actions;
export default cartSlice.reducer;
