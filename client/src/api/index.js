import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  withCredentials: true,
});

// Routes that require authentication. A token-expiry 401 only forces a redirect
// to /login when the user is actually on one of these pages. On public pages
// (home, products, compare, auth pages, etc.) the same 401 may come from a
// background request and must NOT interrupt anonymous browsing.
const PROTECTED_PREFIXES = [
  "/my-profile",
  "/update-password",
  "/update-profile",
  "/cart",
  "/checkout",
  "/my-orders",
  "/support",
  "/my-addresses",
  "/admin",
];

const isOnProtectedPage = () => {
  const path = window.location.pathname;
  return PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    const tokenExpired =
      status === 401 && message === "Token expired, please login again";
    const accountSuspended =
      status === 403 && message && message.toLowerCase().includes("suspended");

    if (tokenExpired || accountSuspended) {
      // Clear the stale session in either case.
      localStorage.removeItem("user");

      // A suspended account always returns to /login. An expired token only
      // redirects when the user is on a protected page; on a public page the
      // request fails quietly and the page keeps rendering, so background 401s
      // no longer yank an anonymous visitor to the login screen.
      if (accountSuspended || isOnProtectedPage()) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
