import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { updatePassword } from "@/store/auth-slice/user";
import { Eye, EyeOff } from "lucide-react";
import MetaData from "../../extras/MetaData";

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
            <motion.div
              key={field}
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