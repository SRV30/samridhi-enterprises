import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { clearAuthState, resetPassword } from "@/store/auth-slice/user";
import { useNavigate } from "react-router-dom";
import MetaData from "../../extras/MetaData";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const passwordRequirements = [
  { id: "length", label: "8+ characters", test: (pw) => pw.length >= 8 },
  { id: "uppercase", label: "Uppercase letter (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { id: "lowercase", label: "Lowercase letter (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { id: "number", label: "Number (0-9)", test: (pw) => /\d/.test(pw) },
  { id: "special", label: "Special character", test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    const storedOtp = localStorage.getItem("resetOtp");
    if (storedEmail && storedOtp) {
      setEmail(storedEmail);
      setOtp(storedOtp);
    } else {
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOtp");
      toast.error("Invalid request! Please verify OTP first.");
      navigate("/verify-otp");
    }
  }, [navigate]);

  const handleResetPassword = () => {
    if (!email || !otp || !newPassword || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    }
    const isAllRequirementsMet = passwordRequirements.every((req) => req.test(newPassword));
    if (!isAllRequirementsMet) {
      toast.error("Password does not meet complexity requirements!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    dispatch(resetPassword({ email, otp, newPassword, confirmPassword }));
  };

  useEffect(() => {
    if (success) {
      toast.success("Password updated successfully! Redirecting to login...");
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOtp");
      setTimeout(() => {
        navigate("/login");
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
      <MetaData title="Reset Password | Samridhi Enterprises" description="Set a new password for your Samridhi Enterprises account. Choose a strong, unique password." keywords="reset password, new password, Samridhi Enterprises, bike parts account security" />
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
              Reset Password
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-blue-700 text-center mb-6 sm:mb-8"
            >
              Enter a new password for your account.
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
                <label htmlFor="reset-email" className="sr-only">
                  Email
                </label>
                <motion.input
                  id="reset-email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border border-blue-400/50 rounded-lg bg-blue-100/50 text-blue-600 cursor-not-allowed text-sm sm:text-base"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                >
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.div>
                <label htmlFor="reset-new-password" className="sr-only">
                  New Password
                </label>
                <motion.input
                  id="reset-new-password"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 sm:py-4 border border-blue-400 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/50 text-blue-800 text-sm sm:text-base transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-blue-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {newPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs sm:text-sm text-blue-800 space-y-2 overflow-hidden"
                  >
                    <p className="font-semibold text-blue-900 mb-1">Password requirements:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {passwordRequirements.map((req) => {
                        const isMet = req.test(newPassword);
                        return (
                          <div key={req.id} className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isMet ? "bg-green-500 text-white" : "bg-blue-200/50 text-blue-400"
                            }`}>
                              {isMet ? "✓" : "✗"}
                            </span>
                            <span className={isMet ? "text-green-600 line-through decoration-green-400/50" : "text-blue-600/70"}>
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants} className="relative">
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                >
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.div>
                <label htmlFor="reset-confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <motion.input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 sm:py-4 border border-blue-400 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/50 text-blue-800 text-sm sm:text-base transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-blue-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
                </motion.div>
              </motion.div>
            </div>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full mt-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
            >
              {loading ? "Updating..." : "Update Password"}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default ResetPassword;