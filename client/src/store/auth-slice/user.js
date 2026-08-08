import axiosInstance from "@/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/user/login", credentials);

      const { user, verifyEmail } = response.data;

      localStorage.setItem("verifyEmail", verifyEmail);
      localStorage.setItem("user", JSON.stringify(user));

      return { user, verifyEmail };
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

      if (!response.data || !response.data.success) {
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
      const response = await axiosInstance.get("/api/user/me");
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
      const response = await axiosInstance.put(
        "/api/user/update-user",
        formData
      );

      // The update endpoint returns the user under `user` (and `data` for
      // backward compatibility) and intentionally issues no new token — the
      // existing JWT is keyed on the user id, which is unchanged, so it stays
      // valid. Read the user from whichever key is present and keep the
      // current token in place.
      const updatedUser = response.data?.user ?? response.data?.data ?? null;

      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return { user: updatedUser };
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
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await axiosInstance.put(
        "/api/user/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
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
  async ({ email, otp, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/api/user/reset-password", {
        email,
        otp,
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
      const { data } = await axiosInstance.get(
        `/api/user/admin/get?page=${page}&limit=${limit}&search=${search}`,
        {
          withCredentials: true,
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
      const { data } = await axiosInstance.get(`/api/user/admin/get/${id}`, {
        withCredentials: true,
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
      const response = await axiosInstance.patch(
        `/api/user/admin/${userId}/status`,
        { status }
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
      const response = await axiosInstance.put(
        "/api/user/admin/update",
        { email, role },
        {
          withCredentials: true,
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
      await axiosInstance.delete(`/api/user/admin/delete/${userId}`, {
        withCredentials: true,
      });
      return userId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Safely parse the persisted user. A prior bug could store the literal string
// "undefined" here, which makes JSON.parse throw and crashes store init (the
// user appears logged out on every reload). Fall back to null on any failure.
const safeParseUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw || raw === "undefined" || raw === "null") return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const storedUser = safeParseUser();
const storedVerifyEmail = localStorage.getItem("verifyEmail") === "true";

const initialState = {
  user: storedUser,
  isAuthenticated: !!storedUser,
  loading: false,
  error: null,
  users: [],
  singleUser: null,
  totalUsers: 0,
  totalPages: 0,
  success: false,
  message: null,
  verifyEmail: storedVerifyEmail,
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
        state.user = action.payload.data;
        localStorage.setItem("user", JSON.stringify(action.payload.data));
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
        state.isAuthenticated = true;
        state.verifyEmail = action.payload?.user?.verifyEmail ?? action.payload?.verifyEmail ?? state.verifyEmail;
        if (typeof action.payload?.user?.verifyEmail === "boolean") {
          localStorage.setItem("verifyEmail", String(action.payload.user.verifyEmail));
        }
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
        // Merge the returned fields into the existing user rather than
        // replacing it wholesale. Guards against a missing payload wiping the
        // user (which previously stored the string "undefined" in localStorage
        // and crashed JSON.parse on the next app load).
        if (action.payload.user) {
          state.user = { ...state.user, ...action.payload.user };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
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
        // Backend returns the updated user under `data`. Patch the matching row
        // in the list so the new role is reflected without a refetch.
        const updated = action.payload?.data;
        if (updated?._id) {
          state.users = state.users.map((user) =>
            user._id === updated._id ? updated : user
          );
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.payload?.error || "Failed to update role";
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
