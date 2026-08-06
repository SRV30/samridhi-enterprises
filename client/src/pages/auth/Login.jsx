import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getSingleDetail, loginUser } from "@/store/auth-slice/user";
import { toast } from "react-toastify";
import MetaData from "../../extras/MetaData";
import { Eye, EyeOff, LockIcon, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const { verifyEmail } = useSelector((state) => state.otp);

  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/my-profile";

  const loginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (isAuthenticated) {
      dispatch(getSingleDetail());
      toast.success("Welcome back!");
      const isEmailVerified = localStorage.getItem("verifyEmail") === "true";

      if (!verifyEmail && !isEmailVerified) {
        navigate("/verify-email");
      } else {
        navigate(redirect || "/");
      }
    }
  }, [isAuthenticated, error, navigate, redirect, verifyEmail, dispatch]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  };

  const inputVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    focus: {
      scale: 1.02,
      borderColor: "#3B82F6",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <MetaData
        title="Login | Samridhi Enterprises"
        description="Sign in to your Samridhi Enterprises account to track orders, manage your garage, and shop for premium bike parts."
        keywords="Samridhi Enterprises login, bike parts account, motorcycle parts sign in, auto parts login"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg p-8 sm:p-10 bg-white rounded-3xl shadow-2xl border border-blue-100 backdrop-blur-lg bg-opacity-90"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-serif font-semibold text-blue-600 mb-8 text-center tracking-tight"
        >
          Welcome Back
        </motion.h2>

        <motion.form variants={itemVariants} onSubmit={loginSubmit} className="space-y-6">
          <motion.div variants={inputVariants} className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-hover:text-blue-500 transition-colors duration-300" size={20} />
            <label htmlFor="login-email" className="sr-only">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-400 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 placeholder-blue-500/50 text-blue-800 transition-all duration-300 text-sm sm:text-base"
            />
          </motion.div>

          <motion.div variants={inputVariants} className="relative group">
            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-hover:text-blue-500 transition-colors duration-300" size={20} />
            <label htmlFor="login-password" className="sr-only">
              Password
            </label>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-14 py-3 rounded-xl border border-blue-400 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 placeholder-blue-500/50 text-blue-800 transition-all duration-300 text-sm sm:text-base"
            />
            <motion.button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-blue-400 hover:text-blue-500 transition-colors duration-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} aria-hidden="true" />
              ) : (
                <Eye size={20} aria-hidden="true" />
              )}
            </motion.button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm"
          >
            <label className="flex items-center text-blue-600 cursor-pointer select-none">
              <input type="checkbox" className="mr-2 accent-blue-500 focus:ring-blue-400" />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-blue-400 hover:text-blue-500 font-medium transition-colors duration-300 hover:underline"
            >
              Forgot Password?
            </Link>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-3 rounded-xl font-semibold tracking-wide shadow-lg hover:from-blue-500 hover:to-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </motion.form>

        <motion.p
          variants={itemVariants}
          className="mt-8 text-center text-blue-600 text-sm sm:text-base"
        >
          New to Samridhi Enterprises?
          <Link
            to="/signup"
            className="ml-2 text-blue-400 hover:text-blue-500 font-semibold transition-colors duration-300 hover:underline"
          >
            Create an Account
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;