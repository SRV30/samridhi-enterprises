import React, { Suspense, lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./extras/ProtectedRoute";
import { useDispatch } from "react-redux";
import { fetchCart } from "./store/cart/cartSlice";
import { fetchWishlist } from "./store/wishlist/wishlistSlice";
import { getSingleDetail } from "./store/auth-slice/user";
import Loader from "./extras/Loader";
import SessionTimeoutHandler from "./components/SessionTimeoutHandler";
import ScrollToTop from "./extras/ScrollToTop";
import ScrollRestoration from "./extras/ScrollRestoration";
import WhatsAppButton from "./extras/Whatsapp";
import Header from "./components/Header";

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
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminBikeModelPage = lazy(() => import("./pages/admin/AdminBikePage"));
const AdminPartPage = lazy(() => import("./pages/admin/AdminPartPage"));
const SingleProductPage = lazy(() => import("./pages/products/SingleProduct"));
const Cart = lazy(() => import("./pages/Cart"));
const ProductsPage = lazy(() => import("./pages/products/ProductsPage"));
const ComparePage = lazy(() => import("./pages/products/ComparePage"));
const WishlistPage = lazy(() => import("./pages/wishlist/WishlistPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderHistory = lazy(() => import("./pages/my-profile/OrderHistory"));
const SupportTickets = lazy(() => import("./pages/my-profile/SupportTickets"));
const AdminSupportTickets = lazy(() => import("./pages/admin/AdminSupportTickets"));
const MyAddresses = lazy(() => import("./pages/my-profile/MyAddresses"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminPaymentSettings = lazy(() => import("./pages/admin/AdminPaymentSettings"));
const InventoryPage = lazy(() => import("./pages/admin/InventoryPage"));
const CustomerPage = lazy(() => import("./pages/admin/CustomerPage"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const DesignSystemPreview = lazy(() => import("./pages/DesignSystemPreview"));
const NotFoundPage = lazy(() => import("./extras/NotFoundPage"));

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart());
    if (localStorage.getItem("user")) {
      dispatch(getSingleDetail());
      dispatch(fetchWishlist());
    }
  }, [dispatch]);
  return (
    <div className="">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader /></div>}>
      <Header />
      <ScrollRestoration />
      <ScrollToTop />
      <WhatsAppButton />

      <main id="main-content" tabIndex={-1}>
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader fullScreen={false} /></div>}>
        <Routes>
          {/* Main Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<SingleProductPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-password"
              element={
                <ProtectedRoute>
                  <UpdatePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-profile"
              element={
                <ProtectedRoute>
                  <UpdateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <SupportTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-addresses"
              element={
                <ProtectedRoute>
                  <MyAddresses />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth Layout Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Admin Layout Routes */}
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute isAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/brands"
              element={
                <ProtectedRoute isAdmin={true}>
                  <AdminBrandPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bikes"
              element={
                <ProtectedRoute isAdmin={true}>
                  <AdminBikeModelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/parts"
              element={
                <ProtectedRoute isAdmin={true}>
                  <AdminPartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute isAdmin={true}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payment-settings"
              element={
                <ProtectedRoute isAdmin={true}>
                  <AdminPaymentSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <ProtectedRoute isAdmin={true}>
                  <InventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute isAdmin={true}>
                  <CustomerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <ProtectedRoute isAdmin={true}>
                  <AdminCoupons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/support"
              element={
                <ProtectedRoute isAdmin={true}>
                  <AdminSupportTickets />
                </ProtectedRoute>
              }
            />
          </Route>

        <Route
          path="/design-system"
          element={
            <DesignSystemPreview />
          }
          />

        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Site-wide session inactivity timeout handler */}
      <SessionTimeoutHandler />
      </main>
      </Suspense>
    </div>
  );
}

export default App;
