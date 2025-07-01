import { useState, useRef, useEffect } from "react";
import { User, Camera, Mail, Phone } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  updateProfile,
  getSingleDetail,
  uploadAvatar,
  logoutUser,
} from "@/store/auth-slice/user";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MetaData from "../../extras/MetaData";

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(
    user?.avatar || "https://placehold.co/150x150"
  );
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });

  useEffect(() => {
    dispatch(getSingleDetail());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        avatar: user.avatar || null,
      });
      if (user.avatar) setProfileImage(user.avatar);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      dispatch(uploadAvatar(file))
        .unwrap()
        .then(() => {
          toast.success("Avatar updated successfully!");
          navigate("/my-profile");
        })
        .catch((error) => {
          toast.error(error || "Failed to update avatar");
        });
    }
  };

  const handleImageClick = () => fileInputRef.current.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    if (!formData.name || !formData.email || !formData.mobile) {
      toast.error("All fields are required");
      return;
    }
    if (formData.mobile.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    Object.keys(formData).forEach((key) =>
      formDataToSend.append(key, formData[key])
    );
    if (formData.avatar) formDataToSend.append("avatar", formData.avatar);

    dispatch(updateProfile(formDataToSend))
      .unwrap()
      .then(() => {
        toast.success("Profile updated successfully. Please re-login.");
        dispatch(logoutUser());
        navigate("/login");
      })
      .catch((error) =>
        toast.error(error.message || "Failed to update profile")
      );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <MetaData title="Update Profile | Samridhi Enterprises" />
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
          Update Profile
        </motion.h2>

        <div className="flex justify-center mb-8">
          <motion.div
            className="relative w-32 h-32"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              <motion.img
                src={profileImage}
                alt="Profile"
                className="w-32 h-32 object-fit rounded-full border-4 border-blue-400 shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>
            <motion.button
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-all"
              onClick={handleImageClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Camera size={18} />
            </motion.button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            {
              name: "name",
              placeholder: "Full Name",
              icon: <User size={20} />,
            },
            { name: "email", placeholder: "Email", icon: <Mail size={20} /> },
            {
              name: "mobile",
              placeholder: "Mobile",
              icon: <Phone size={20} />,
            },
          ].map(({ name, placeholder, icon }, idx) => (
            <motion.div
              key={name}
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
            >
              <input
                type={name === "email" ? "email" : "text"}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-5 py-3 pl-12 bg-blue-50/50 border border-blue-300 rounded-xl text-lg text-blue-500 placeholder:text-blue-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md"
              />
              <motion.span
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.2 }}
              >
                {icon}
              </motion.span>
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
              "Update Profile"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdateProfile;