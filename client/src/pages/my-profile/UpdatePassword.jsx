import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { updatePassword } from "@/store/auth-slice/user";
import { Eye, EyeOff } from "lucide-react";
import MetaData from "../../extras/MetaData";
import { PASSWORD_REQUIREMENTS } from "../../utils/passwordRequirements";


const UpdatePassword = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("All fields are required!");
      return;
    }
    const isAllRequirementsMet = PASSWORD_REQUIREMENTS.every((req) => req.test(form.newPassword));
    if (!isAllRequirementsMet) {
      toast.error("Password does not meet complexity requirements!");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    dispatch(updatePassword(form))
      .unwrap()
      .then((message) => toast.success(message))
      .catch((error) => toast.error(error));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <MetaData title="Update Password | Samridhi Enterprises" />
      <motion.div
        className="w-full max-w-md sm:max-w-lg p-8 sm:p-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-200"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-serif font-bold text-center mb-8 text-blue-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Update Password
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {["oldPassword", "newPassword", "confirmPassword"].map((field, idx) => (
            <div key={field} className="space-y-4">
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
              >
                <input
                  type={showPassword[field] ? "text" : "password"}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  placeholder={field.replace(/([A-Z])/g, " $1")}
                  className="w-full px-5 py-3 bg-blue-50/50 border border-blue-300 rounded-xl text-lg text-blue-500 placeholder:text-blue-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 pr-12 shadow-sm hover:shadow-md"
                />
                <motion.button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-500"
                  onClick={() => togglePasswordVisibility(field)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {showPassword[field] ? (
                      <motion.div
                        key="eye-off"
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 180 }}
                      >
                        <EyeOff size={20} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye"
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 180 }}
                      >
                        <Eye size={20} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>

              {field === "newPassword" && (
                <AnimatePresence>
                  {form.newPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs sm:text-sm text-blue-800 space-y-2 overflow-hidden"
                    >
                      <p className="font-semibold text-blue-900 mb-1">Password requirements:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {PASSWORD_REQUIREMENTS.map((req) => {
                          const isMet = req.test(form.newPassword);
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
              )}
            </div>
          ))}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                Updating...
              </motion.span>
            ) : (
              "Update Password"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdatePassword;