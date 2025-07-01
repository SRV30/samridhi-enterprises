import {
  CircleUser,
  Search,
  ShoppingCart,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/auth-slice/user";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const headerVariants = {
    initial: {
      y: -100,
      opacity: 0,
      backdropFilter: "blur(0px)",
    },
    animate: {
      y: 0,
      opacity: 1,
      backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const logoVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
    hover: {
      scale: 1.05,
      rotate: [0, -2, 2, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  const searchVariants = {
    initial: { width: "100%", opacity: 0.9 },
    focused: {
      width: "110%",
      opacity: 1,
      boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3)",
      transition: { duration: 0.3 },
    },
  };

  const navItemVariants = {
    initial: { y: -20, opacity: 0 },
    animate: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1 + 0.3,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
    hover: {
      y: -2,
      scale: 1.05,
      textShadow: "0 0 8px rgba(255,255,255,0.8)",
      transition: { duration: 0.3 },
    },
  };

  const mobileMenuVariants = {
    closed: {
      height: 0,
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    open: {
      height: "auto",
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const cartVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.4 },
    },
    tap: { scale: 0.9 },
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gradient-to-r from-blue-400/95 via-blue-500/95 to-blue-400/95 shadow-xl shadow-blue-500/25"
          : "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 shadow-lg"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <motion.div
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="hidden sm:block"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <Link
              to="/"
              className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text hover:from-blue-100 hover:to-white transition-all duration-300"
            >
              Samridhi Enterprises
            </Link>
          </motion.div>

          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <motion.div
              variants={searchVariants}
              initial="initial"
              animate={searchFocused ? "focused" : "initial"}
              className="relative w-full"
            >
              <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
                <input
                  type="text"
                  placeholder="Search for products..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="flex-grow outline-none bg-transparent text-sm text-gray-800 placeholder-gray-500 font-medium"
                />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer"
                >
                  <Search className="text-blue-500 w-5 h-5" />
                </motion.div>
              </div>
              {searchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-2"
                >
                  <div className="text-sm text-gray-600 p-3">
                    Recent searches will appear here...
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {isAuthenticated &&
              (user.role === "ADMIN" || user.role === "MANAGER") && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                >
                   <Link
                    to="/products"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-white text-base font-semibold hover:text-blue-100 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10"
                  >
                    Products
                  </Link>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-white text-base font-semibold hover:text-blue-100 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10"
                  >
                    Dashboard
                  </Link>
                </motion.div>
              )}

            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <motion.div
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="relative group"
                >
                  <Link
                    to="/my-profile"
                    className="text-white text-sm font-semibold hover:text-blue-100 transition-colors duration-300 flex items-center gap-2"
                  >
                    <CircleUser className="w-4 h-4" />
                    {user?.name || "Profile"}
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300"
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <motion.div
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="flex items-center gap-2"
              >
                <Link
                  to="/login"
                  className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-6 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 flex items-center gap-2"
                >
                  <CircleUser className="w-4 h-4" />
                  Login
                </Link>
              </motion.div>
            )}

            <motion.div
              variants={cartVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="relative"
            >
              <Link to="/cart" className="flex items-center">
                <ShoppingCart className="text-white w-6 h-6" />
                <motion.span
                  key={cart.items.length} 
                  initial={{ scale: 0.5, opacity: 0, y: -10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-white to-blue-100 text-blue-500 text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-white/20"
                >
                  {cart.items.length}
                </motion.span>
              </Link>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMenuOpen ? "close" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden bg-gradient-to-b from-blue-500/95 to-blue-400/95 backdrop-blur-lg border-t border-white/20"
          >
            <div className="px-4 py-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg border border-white/20">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="flex-grow outline-none bg-transparent text-sm text-gray-800 placeholder-gray-500 font-medium"
                  />
                  <Search className="text-blue-500 w-5 h-5" />
                </div>
              </motion.div>

              <div className="space-y-4">
                {isAuthenticated &&
                  (user.role === "ADMIN" || user.role === "MANAGER") && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ x: 10, scale: 1.02 }}
                    >
                      <Link
                        to="/products"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 text-white text-base font-semibold hover:text-blue-100 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10"
                      >
                        Products
                      </Link>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 text-white text-base font-semibold hover:text-blue-100 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10"
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                  )}

                {isAuthenticated ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ x: 10, scale: 1.02 }}
                    >
                      <Link
                        to="/my-profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 text-white text-base font-semibold hover:text-blue-100 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10"
                      >
                        <CircleUser className="w-5 h-5" />
                        {user?.name || "Profile"}
                      </Link>
                    </motion.div>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ x: 10, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left bg-white/20 hover:bg-white/30 text-white text-base font-semibold py-3 px-4 rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-300"
                    >
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ x: 10, scale: 1.02 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white text-base font-semibold py-3 px-4 rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-300"
                    >
                      <CircleUser className="w-5 h-5" />
                      Login
                    </Link>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="relative"
                >
                  <Link
                    to="/cart"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-white text-base font-semibold hover:text-blue-100 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10"
                  >
                    <div className="relative">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-white to-blue-100 text-blue-500 text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                        {cart?.items?.length || 0}
                      </span>
                    </div>
                    Cart
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;
