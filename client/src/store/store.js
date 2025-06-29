import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/user";
import otpSlice from "./auth-slice/otpSlice";
import brandSlice from "./product/brandSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    otp: otpSlice,
    brand: brandSlice,
  },
});

export default store;
