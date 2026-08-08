import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearError, signupUser } from "@/store/auth-slice/user";

const passwordRequirements = [
  { id: "length", label: "8+ characters", test: (pw) => pw.length >= 8 },
  { id: "uppercase", label: "Uppercase letter (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { id: "lowercase", label: "Lowercase letter (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { id: "number", label: "Number (0-9)", test: (pw) => /\d/.test(pw) },
  { id: "special", label: "Special character", test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, loading, user } = useSelector((state) => state.auth);
  useEffect(() => {}, [user, loading, navigate, dispatch]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    const isAllRequirementsMet = passwordRequirements.every((req) => req.test(password));
    if (!isAllRequirementsMet) {
      toast.error("Password does not meet complexity requirements!");
      return;
    }
    try {
      await dispatch(signupUser({ name, email, password })).unwrap();
      toast.success("Welcome to Samridhi Enterprises!");
      navigate("/login");
    } catch (err) { // eslint-disable-line no-unused-vars
      // Error is handled by the useEffect listening to state.auth.error
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [dispatch, error, navigate]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-100 px-4 sm:px-6 lg:px-8">
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-blue-200/50 backdrop-blur-sm sm:max-w-lg"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-serif font-semibold text-blue-800 mb-6 sm:mb-8 text-center tracking-tight"
          >
            Join Samridhi Enterprises
          </motion.h2>

          <div className="mb-5 sm:mb-6 relative">
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
            <label htmlFor="signup-name" className="sr-only">
              Full Name
            </label>
            <motion.input
              id="signup-name"
              variants={itemVariants}
              type="text"
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-lg border border-blue-400 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/70 text-blue-800 transition-all duration-300 text-sm sm:text-base"
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          <div className="mb-5 sm:mb-6 relative">
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
            >
              <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
            <label htmlFor="signup-email" className="sr-only">
              Email
            </label>
            <motion.input
              id="signup-email"
              variants={itemVariants}
              type="email"
              autoComplete="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-lg border border-blue-400 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/70 text-blue-800 transition-all duration-300 text-sm sm:text-base"
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          <div className="mb-5 sm:mb-6 relative">
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
            >
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
            <label htmlFor="signup-password" className="sr-only">
              Password
            </label>
            <motion.input
              id="signup-password"
              variants={itemVariants}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-lg border border-blue-400 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/70 text-blue-800 transition-all duration-300 text-sm sm:text-base"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-blue-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </motion.div>
          </div>

          <AnimatePresence>
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs sm:text-sm text-blue-800 space-y-2 overflow-hidden"
              >
                <p className="font-semibold text-blue-900 mb-1">Password requirements:</p>
                <div className="grid grid-cols-2 gap-2">
                  {passwordRequirements.map((req) => {
                    const isMet = req.test(password);
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

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={loading}
            onClick={handleSubmit}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 sm:py-4 rounded-lg font-medium tracking-wide shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 sm:h-6 sm:w-6"
                  viewBox="0 0 24 24"
                >
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
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </motion.button>

          <motion.p
            variants={itemVariants}
            className="mt-6 sm:mt-8 text-center text-blue-700 text-sm sm:text-base"
          >
            Already a member?
            <Link
              to="/login"
              className="ml-1 text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Sign In
            </Link>
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SignUp;
