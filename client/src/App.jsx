import './styles/globals.css';
import React, { Suspense, lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchCart } from "./store/cart/cartSlice";
import { fetchWishlist } from "./store/wishlist/wishlistSlice";
import { getSingleDetail } from "./store/auth-slice/user";
import Loader from "./extras/Loader";
import ScrollToTop from "./extras/ScrollToTop";
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import RootLayout from "./components/RootLayout";
import ProtectedRoute from "./extras/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/Signup"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const VerifyOtp = lazy(() => import("./pages/auth/ResetVerifyOtp"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const MyProfile = lazy(() => import("./pages/my-profile/MyProfile"));
const UpdatePassword = lazy(() => import("./pages/my-profile/UpdatePassword"));
const UpdateProfile = lazy(() => import("./pages/my-profile/UpdateProfile"));
const AdminBrandPage = lazy(() => import("./pages/admin/AdminBrandPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBikeModelPage = lazy(() => import("./pages/admin/AdminBikePage"));
const AdminPartPage = lazy(() => import("./pages/admin/AdminPartPage"));
const SingleProductPage = lazy(() => import("./pages/products/PremiumProductDetails"));
const Cart = lazy(() => import("./pages/PremiumCart"));
const ProductsPage = lazy(() => import("./pages/products/ProductsPage"));
const ComparePage = lazy(() => import("./pages/products/ComparePage"));
const WishlistPage = lazy(() => import("./pages/wishlist/WishlistPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderHistory = lazy(() => import("./pages/my-profile/PremiumOrderHistory"));
const SupportTickets = lazy(() => import("./pages/my-profile/SupportTickets"));
const AdminSupportTickets = lazy(() => import("./pages/admin/AdminSupportTickets"));
const MyAddresses = lazy(() => import("./pages/my-profile/MyAddresses"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminPaymentSettings = lazy(() => import("./pages/admin/AdminPaymentSettings"));
const InventoryPage = lazy(() => import("./pages/admin/InventoryPage"));
const CustomerPage = lazy(() => import("./pages/admin/CustomerPage"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const NotFoundPage = lazy(() => import("./extras/NotFoundPage"));

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    if (localStorage.getItem("user")) {
      dispatch(fetchCart());
      dispatch(getSingleDetail());
      dispatch(fetchWishlist());
    }
  }, [dispatch]);
  return <ThemeProvider><RootLayout><ToastContainer position="top-center" autoClose={5000} /><div className="fixed bottom-6 right-6 z-50"><ThemeToggle /></div><ScrollToTop /><main id="main-content" tabIndex={-1}><Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader fullScreen={false} /></div>}><Routes>
    <Route path="/" element={<Home />} /><Route path="/verify-email" element={<VerifyEmail />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<SignUp />} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/verify-otp" element={<VerifyOtp />} /><Route path="/reset-password" element={<ResetPassword />} /><Route path="/products" element={<ProductsPage />} /><Route path="/products/:id" element={<SingleProductPage />} /><Route path="/compare" element={<ComparePage />} /><Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} /><Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} /><Route path="/update-profile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} /><Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} /><Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} /><Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} /><Route path="/my-orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} /><Route path="/support" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} /><Route path="/my-addresses" element={<ProtectedRoute><MyAddresses /></ProtectedRoute>} /><Route path="/admin/dashboard" element={<ProtectedRoute isAdmin><AdminDashboard /></ProtectedRoute>} /><Route path="/admin/brands" element={<ProtectedRoute isAdmin><AdminBrandPage /></ProtectedRoute>} /><Route path="/admin/bikes" element={<ProtectedRoute isAdmin><AdminBikeModelPage /></ProtectedRoute>} /><Route path="/admin/parts" element={<ProtectedRoute isAdmin><AdminPartPage /></ProtectedRoute>} /><Route path="/admin/orders" element={<ProtectedRoute isAdmin><AdminOrders /></ProtectedRoute>} /><Route path="/admin/payment-settings" element={<ProtectedRoute isAdmin><AdminPaymentSettings /></ProtectedRoute>} /><Route path="/admin/inventory" element={<ProtectedRoute isAdmin><InventoryPage /></ProtectedRoute>} /><Route path="/admin/customers" element={<ProtectedRoute isAdmin><CustomerPage /></ProtectedRoute>} /><Route path="/admin/coupons" element={<ProtectedRoute isAdmin><AdminCoupons /></ProtectedRoute>} /><Route path="/admin/support" element={<ProtectedRoute isAdmin><AdminSupportTickets /></ProtectedRoute>} /><Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense></main></RootLayout></ThemeProvider>;
}
export default App;
