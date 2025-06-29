import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { resendOtp, verifyEmailOtp } from "@/store/auth-slice/otpSlice";
import { toast } from "react-toastify";
import MetaData from "../../extras/MetaData";

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, successMessage, verifyEmail } = useSelector(
    (state) => state.otp
  );
  const { user } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState("");

  const redirect = location.search ? location.search.split("=")[1] : "/";

  useEffect(() => {
    if (verifyEmail) {
      navigate(redirect);
      toast.success(successMessage);
    }
  }, [verifyEmail, navigate, redirect, successMessage]);

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length !== 6)
      return toast.error("OTP must be 6 digits");
    dispatch(verifyEmailOtp({ email: user?.email, otp }));
  };

  const handleResendOtp = () => {
    if (user?.email) {
      dispatch(resendOtp(user.email));
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-100 px-4 sm:px-6 lg:px-8">
      <MetaData title="Verify OTP | Samridhi Enterprises" />
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-3xl shadow-xl border border-blue-200/50 backdrop-blur-sm p-6 sm:p-8 max-w-md w-full text-center sm:max-w-lg"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-serif font-semibold text-blue-800 mb-6 sm:mb-8 text-center tracking-tight"
          >
            Verify Your Email
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-blue-700 mb-6 sm:mb-8 text-sm sm:text-base"
          >
            Enter the 6-digit OTP sent to{" "}
            <strong>{user?.email || "your email"}</strong>
          </motion.p>

          <form onSubmit={handleVerify}>
            <motion.div variants={itemVariants} className="mb-5 sm:mb-6">
              <motion.input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                placeholder="Enter OTP"
                className="w-full p-3 sm:p-4 rounded-lg border border-blue-400 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/50 text-center text-lg sm:text-xl font-semibold tracking-wider transition-all duration-300"
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 sm:py-4 rounded-lg font-medium tracking-wide shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 sm:h-6 sm:w-6" viewBox="0 0 24 24">
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
                  Verifying...
                </span>
              ) : (
                "Verify OTP"
              )}
            </motion.button>
          </form>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleResendOtp}
            className="mt-6 sm:mt-8 text-blue-500 font-medium hover:text-blue-600 transition-colors duration-200 text-sm sm:text-base"
            disabled={loading}
          >
            Resend OTP
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default VerifyEmail;