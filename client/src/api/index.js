import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  withCredentials: true, 
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.message === "Token expired, please login again") {
      localStorage.removeItem("token");
      window.location.href = "/"; 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;