import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { clearAuthState, verifyOtp } from "@/store/auth-slice/user";
import { useNavigate } from "react-router-dom";
import MetaData from "../../extras/MetaData";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Key } from "lucide-react";

const VerifyOtp = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.auth);

  const handleVerifyOtp = () => {
    if (!email || !otp) {
      toast.error("Please enter both email and OTP!");
      return;
    }
    dispatch(verifyOtp({ email, otp }));
  };

  useEffect(() => {
    if (success && otp) {
      toast.success("OTP Verified! Redirecting to Reset Password.");
      localStorage.setItem("resetEmail", email);
      setTimeout(() => {
        navigate("/reset-password");
        dispatch(clearAuthState());
      }, 2000);
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, navigate, otp, dispatch, email]);

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
      <MetaData title="Verify OTP - Samridhi Enterprises" />
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
              Verify OTP
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-blue-700 text-center mb-6 sm:mb-8"
            >
              Enter the OTP sent to your email to reset your password.
            </motion.p>

            <div className="space-y-5 sm:space-y-6">
              <motion.div variants={itemVariants} className="relative">
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                >
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.div>
                <motion.input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border border-blue-400 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/50 text-blue-800 text-sm sm:text-base transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                >
                  <Key className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.div>
                <motion.input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border border-blue-400 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/50 text-blue-800 text-sm sm:text-base transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.div>
            </div>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full mt-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default VerifyOtp;
