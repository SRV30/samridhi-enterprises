import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/user";
import otpSlice from "./auth-slice/otpSlice";
import brandSlice from "./product/brandSlice";
import bikeSlice from "./product/bikeSlice";
import partSlice from "./product/partsSlice";
import cartSlice from "./cart/cartSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    otp: otpSlice,
    brand: brandSlice,
    bike: bikeSlice,
    parts: partSlice,
    cart: cartSlice,
  },
});

export default store;
