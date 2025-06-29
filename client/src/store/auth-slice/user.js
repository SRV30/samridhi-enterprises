import axiosInstance from "@/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/user/login", credentials);

      const { token, user, verifyEmail } = response.data;

      localStorage.setItem("verifyEmail", verifyEmail);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      return { user, token, verifyEmail };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/user/logout");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Logout failed!" }
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/user/register",
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Go to login!" }
      );
    }
  }
);

export const getSingleDetail = createAsyncThunk(
  "auth/getSingleDetail",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("API Response:", response.data);

      return response.data;
    } catch (error) {
      console.error(error);
      return rejectWithValue(
        error.response?.data ||
          error.message || { message: "Get user details failed!" }
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("User is not authenticated");
      }
      const response = await axiosInstance.put(
        "/api/user/update-user",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { token: newToken, user } = response.data || {};

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (newToken) {
        localStorage.setItem("token", newToken);
      }

      return { token: newToken, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Profile update failed!" }
      );
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (avatarFile, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await axiosInstance.put(
        "/api/user/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",

            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (
    { oldPassword, newPassword, confirmPassword },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.put(
        "/api/user/update/password",
        {
          oldPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      return response.data.message || "Password updated successfully!";
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password update failed!"
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/user/forgot-password`, {
        email,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP."
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/user/verify-otp`, {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Invalid OTP.");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/api/user/reset-password", {
        email,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed."
      );
    }
  }
);

// Admin
export const getAllUsers = createAsyncThunk(
  "auth/fetchusers",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axiosInstance.get(
        `/api/user/admin/get?page=${page}&limit=${limit}&search=${search}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// Admin
export const getSingleUser = createAsyncThunk(
  "auth/getSingle",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axiosInstance.get(`/api/user/admin/get/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

// Admin
export const updateUserStatus = createAsyncThunk(
  "auth/updateUserStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.patch(
        `/api/user/admin/${userId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Admin
export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ email, role }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.put(
        "/api/user/admin/update",
        { email, role },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Admin
export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/user/admin/delete/${userId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return userId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token") || null;

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,
  token: storedToken,
  loading: false,
  error: null,
  users: [],
  singleUser: null,
  totalUsers: 0,
  totalPages: 0,
  success: false,
  message: null,
  verifyEmail: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearAuthState: (state) => {
      state.loading = false;
      state.message = null;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.verifyEmail = action.payload.verifyEmail;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed!";
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.verifyEmail = false;
        localStorage.removeItem("verifyEmail");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Logout failed!";
      })

      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(getSingleDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(getSingleDetail.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Fetching user details failed!";
      })

      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;

        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Profile update failed!";
      })

      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, avatar: action.payload.avatar };

        const updatedUser = { ...state.user, avatar: action.payload.avatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single User
      .addCase(getSingleUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleUser.fulfilled, (state, action) => {
        state.loading = false;
        state.singleUser = action.payload.data;
      })
      .addCase(getSingleUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User Status
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((user) =>
          user._id === action.payload.user._id ? action.payload.user : user
        );
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      })

      // Update User Role
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((user) =>
          user._id === action.payload.user._id ? action.payload.user : user
        );
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      });
  },
});

export const { clearError, clearState, clearAuthState } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectLoading = (state) => state.auth.loading;
export const selectUser = (state) => state.auth.user;
export default authSlice.reducer;
