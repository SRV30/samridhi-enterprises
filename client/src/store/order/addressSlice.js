import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";

const API_URL = "/api/address";

const authConfig = () => ({});

export const getMyAddresses = createAsyncThunk(
  "address/getMy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${API_URL}/my`, authConfig());
      return res.data.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addAddress = createAsyncThunk(
  "address/add",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`${API_URL}/add`, payload, authConfig());
      return res.data.address;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `${API_URL}/update/${id}`,
        payload,
        authConfig()
      );
      return res.data.address;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_URL}/delete/${id}`, authConfig());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "address/setDefault",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `${API_URL}/default/${id}`,
        {},
        authConfig()
      );
      return res.data.address;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    addresses: [],
    loading: false,
    actionLoading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearAddressError: (state) => {
      state.error = null;
    },
    clearAddressSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(getMyAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(getMyAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // add
      .addCase(addAddress.pending, (state) => {
        state.actionLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        // A newly-added default demotes the others locally too.
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map((a) => ({
            ...a,
            isDefault: false,
          }));
        }
        state.addresses.unshift(action.payload);
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // update
      .addCase(updateAddress.pending, (state) => {
        state.actionLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.addresses = state.addresses.map((a) => {
          if (a._id === action.payload._id) return action.payload;
          // If the updated one became default, clear the flag on the rest.
          if (action.payload.isDefault) return { ...a, isDefault: false };
          return a;
        });
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // delete
      .addCase(deleteAddress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.addresses = state.addresses.filter((a) => a._id !== action.payload);
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // set default
      .addCase(setDefaultAddress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.addresses = state.addresses.map((a) => ({
          ...a,
          isDefault: a._id === action.payload._id,
        }));
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAddressError, clearAddressSuccess } = addressSlice.actions;
export default addressSlice.reducer;
