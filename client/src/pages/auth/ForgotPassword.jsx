import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { clearAuthState, forgotPassword } from "@/store/auth-slice/user";
import MetaData from "../../extras/MetaData";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.auth);

  const handleForgotPassword = () => {
    if (!email) {
      toast.error("Please enter a valid email!");
      return;
    }
    dispatch(forgotPassword(email));
  };

  useEffect(() => {
    if (success) {
      toast.success("OTP sent! Please check your email.");
      setTimeout(() => {
        navigate("/verify-otp");
      }, 2000);
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthState());
    };
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.15 },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 20px rgba(59, 130, 246, 0.5)" },
    tap: { scale: 0.98 },
  };

  const iconVariants = {
    hover: { scale: 1.2, rotate: 10, transition: { duration: 0.3 } },
  };

  return (
    <>
      <MetaData title="Forgot Password | Samridhi Enterprises" description="Reset your Samridhi Enterprises account password securely. Enter your registered email to receive a password reset OTP." keywords="forgot password, reset password, bike parts account recovery, Samridhi Enterprises password" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-100 px-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-3xl shadow-xl border border-blue-200/50 backdrop-blur-sm p-6 sm:p-8 w-full max-w-md sm:max-w-lg"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-serif font-semibold text-blue-800 mb-6 sm:mb-8 text-center tracking-tight"
            >
              Forgot Password
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-blue-700 text-center mb-6 sm:mb-8"
            >
              Enter your email, and we'll send you an OTP to reset your password.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-6 relative">
              <motion.div
                variants={iconVariants}
                whileHover="hover"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
              >
                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>
              <label htmlFor="forgot-email" className="sr-only">
                Email
              </label>
              <motion.input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-4 border border-blue-400 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/50 text-blue-800 text-sm sm:text-base transition-all duration-300"
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full mt-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
            >
              {loading ? "Sending..." : "Send OTP"}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default ForgotPassword;