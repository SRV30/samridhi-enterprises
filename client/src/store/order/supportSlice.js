import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";

const API_URL = "/api/support";

const authConfig = () => ({});

// ── User: create ticket ──
export const createTicket = createAsyncThunk(
  "support/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`${API_URL}/create`, payload, authConfig());
      return res.data.ticket;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── User: my tickets ──
export const getMyTickets = createAsyncThunk(
  "support/getMy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${API_URL}/my`, authConfig());
      return res.data.tickets;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── User: single ticket ──
export const getMyTicket = createAsyncThunk(
  "support/getMyOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${API_URL}/my/${id}`, authConfig());
      return res.data.ticket;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── User: reply ──
export const addMessage = createAsyncThunk(
  "support/addMessage",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${API_URL}/my/${id}/message`,
        { body },
        authConfig()
      );
      return res.data.ticket;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Admin: all tickets (optional filters) ──
export const adminGetTickets = createAsyncThunk(
  "support/adminGet",
  async (params, { rejectWithValue }) => {
    try {
      const search = new URLSearchParams();
      if (params?.status) search.set("status", params.status);
      if (params?.category) search.set("category", params.category);
      const qs = search.toString();
      const res = await axiosInstance.get(
        `${API_URL}/admin/get${qs ? `?${qs}` : ""}`,
        authConfig()
      );
      return res.data.tickets;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Admin: single ticket ──
export const adminGetTicket = createAsyncThunk(
  "support/adminGetOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${API_URL}/admin/${id}`, authConfig());
      return res.data.ticket;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Admin: update status ──
export const adminUpdateStatus = createAsyncThunk(
  "support/adminStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `${API_URL}/admin/${id}/status`,
        { status },
        authConfig()
      );
      return res.data.ticket;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Admin: reply ──
export const adminReply = createAsyncThunk(
  "support/adminReply",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${API_URL}/admin/${id}/reply`,
        { body },
        authConfig()
      );
      return res.data.ticket;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const supportSlice = createSlice({
  name: "support",
  initialState: {
    tickets: [],
    current: null,
    loading: false,
    actionLoading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearSupportError: (state) => {
      state.error = null;
    },
    clearSupportSuccess: (state) => {
      state.success = false;
    },
    clearCurrentTicket: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    // Helper-less explicit cases for clarity.
    builder
      // create
      .addCase(createTicket.pending, (state) => {
        state.actionLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.tickets.unshift(action.payload);
        state.current = action.payload;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // my list
      .addCase(getMyTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(getMyTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // my single
      .addCase(getMyTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(getMyTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // admin list
      .addCase(adminGetTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(adminGetTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // admin single
      .addCase(adminGetTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(adminGetTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Shared handler for the four "mutate current + sync list" thunks.
    const syncCurrent = (state, action) => {
      state.actionLoading = false;
      state.current = action.payload;
      state.tickets = state.tickets.map((t) =>
        t._id === action.payload._id ? action.payload : t
      );
    };
    [addMessage, adminUpdateStatus, adminReply].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.actionLoading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, syncCurrent)
        .addCase(thunk.rejected, (state, action) => {
          state.actionLoading = false;
          state.error = action.payload;
        });
    });
  },
});

export const { clearSupportError, clearSupportSuccess, clearCurrentTicket } =
  supportSlice.actions;
export default supportSlice.reducer;
