import { useState, useRef, useEffect } from "react";
import { User, ShoppingBag, Lock, MapPin } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { getSingleDetail } from "@/store/auth-slice/user";
import MediData from "../../extras/MetaData";
import Loader from "../../extras/Loader";

const MyProfile = () => {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [profileImage, setProfileImage] = useState(
    user?.avatar || "https://placehold.co/150x150"
  );

  useEffect(() => {
    dispatch(getSingleDetail());
  }, [dispatch]);

  useEffect(() => {
    if (user?.avatar) {
      setProfileImage(user.avatar);
    }
  }, [user]);

  const displayFields = ["name", "email", "mobile"];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  };

  const navLinkVariants = {
    hover: { scale: 1.1, x: 10, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4 sm:px-8 lg:px-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <MediData title="My Profile | Samridhi Enterprises" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl sm:text-5xl font-serif font-bold text-blue-500 tracking-tight"
            variants={itemVariants}
          >
            My Account
          </motion.h1>
          <motion.p
            className="text-blue-400 mt-3 text-base sm:text-lg font-medium"
            variants={itemVariants}
          >
            Manage your profile and preferences
          </motion.p>
        </div>

        <div className="sm:hidden flex flex-col items-center text-center space-y-10">
          <motion.div
            className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-blue-400 cursor-pointer shadow-xl ring-2 ring-blue-200"
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <AnimatePresence>
              {loading ? (
                <Loader />
              ) : (
                <motion.img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-fit cursor-none "
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
          <motion.h2
            className="text-2xl font-serif font-bold text-blue-500 capitalize"
            variants={itemVariants}
          >
            {loading ? "Loading..." : user?.name || "Guest"}
          </motion.h2>
          <motion.p
            className="text-blue-400 text-sm font-medium"
            variants={itemVariants}
          >
            {loading ? "Loading..." : user?.role || "N/A"}
          </motion.p>

          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-blue-100"
            variants={containerVariants}
          >
            <motion.h3
              className="text-xl font-serif font-bold text-blue-500 mb-6"
              variants={itemVariants}
            >
              Profile Information
            </motion.h3>
            <div className="grid gap-6">
              {displayFields.map((field) => (
                <motion.div
                  key={field}
                  className="p-5 rounded-xl bg-blue-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <span className="text-sm text-blue-400 font-semibold block mb-2">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </span>
                  <p className="font-medium text-blue-500 text-base">
                    {loading ? "Loading..." : user?.[field] || "Not provided"}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 lg:col-span-1"
            variants={containerVariants}
          >
            <div className="text-center">
              <motion.div
                className="relative inline-block group"
                variants={itemVariants}
              >
                <div
                  className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-blue-100 cursor-pointer border-4 border-blue-400 shadow-lg ring-2 ring-blue-200"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AnimatePresence>
                    {loading ? (
                      <motion.p
                        className="flex items-center justify-center h-full text-blue-400 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Loading...
                      </motion.p>
                    ) : (
                      <motion.img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-fit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.h2
                className="mt-6 text-3xl font-serif font-bold text-blue-500 capitalize"
                variants={itemVariants}
              >
                {loading ? "Loading..." : user?.name || "Guest"}
              </motion.h2>
              <motion.p
                className="text-blue-400 text-sm font-medium mt-2"
                variants={itemVariants}
              >
                {loading ? "Loading..." : user?.role || "N/A"}
              </motion.p>
            </div>

            <nav className="mt-8 flex flex-col space-y-4">
              {[
                {
                  to: "/my-profile",
                  icon: User,
                  label: "Profile Info",
                  active: true,
                },
                { to: "/my-orders", icon: ShoppingBag, label: "My Orders" },
                {
                  to: "/update-password",
                  icon: Lock,
                  label: "Update Password",
                },
                { to: "/saved-address", icon: MapPin, label: "Saved Address" },
                {
                  to: "/update-profile",
                  icon: User,
                  label: "Update Profile",
                },
              ].map((link) => (
                <motion.div key={link.to} variants={itemVariants}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `block px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-center ${
                        isActive || link.active
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                          : "text-blue-500 hover:bg-blue-50"
                      }`
                    }
                  >
                    <motion.div
                      variants={navLinkVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex items-center justify-center gap-3"
                    >
                      <link.icon size={18} />
                      <span className="text-base">{link.label}</span>
                    </motion.div>
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 lg:col-span-2"
            variants={containerVariants}
          >
            <motion.h3
              className="text-2xl font-serif font-bold text-blue-500 mb-6"
              variants={itemVariants}
            >
              Profile Information
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayFields.map((field) => (
                <motion.div
                  key={field}
                  className="p-6 rounded-xl bg-blue-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <span className="text-sm text-blue-400 font-semibold block mb-2">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </span>
                  <p className="font-medium text-blue-500 text-base">
                    {loading ? "Loading..." : user?.[field] || "Not provided"}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl py-6 flex justify-around border-t border-blue-200 z-50">
          {[
            { to: "/my-profile", icon: User, label: "Profile" },
            { to: "/my-orders", icon: ShoppingBag, label: "Orders" },
            { to: "/update-password", icon: Lock, label: "Password" },
            { to: "/saved-address", icon: MapPin, label: "Address" },
            { to: "/update-profile", icon: User, label: "Edit" },
          ].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center text-xs transition-all duration-300 ${
                  isActive ? "text-blue-500" : "text-gray-500"
                }`
              }
            >
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <link.icon size={24} />
              </motion.div>
              <span className="mt-1 font-medium">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MyProfile;
