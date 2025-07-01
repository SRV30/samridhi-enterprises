import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearError,
} from "../store/cart/cartSlice";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../extras/Loader";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading, error } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your cart");
      navigate("/login");
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleUpdateQuantity = (partId, quantity, stock) => {
    if (quantity < 1 || quantity > stock) {
      toast.error("Invalid quantity selected");
      return;
    }
    dispatch(updateCartItem({ partId, quantity })).then((result) => {
      if (updateCartItem.fulfilled.match(result)) {
        dispatch(fetchCart());
      } else if (updateCartItem.rejected.match(result)) {
        toast.error(result.payload || "Failed to update quantity");
      }
    });
  };

  const handleRemoveItem = (partId) => {
    if (!partId) {
      toast.error("Cannot remove item: Invalid product ID");
      return;
    }
    dispatch(removeFromCart(partId)).then((result) => {
      if (removeFromCart.fulfilled.match(result)) {
        toast.success("Item removed from cart!");
        dispatch(fetchCart());
      } else if (removeFromCart.rejected.match(result)) {
        toast.error(result.payload || "Failed to remove item");
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
    exit: {
      opacity: 0,
      x: 100,
      scale: 0.9,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  if (loading) {
    return <Loader />;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 mt-18">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex flex-col items-center justify-center text-center"
        >
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-8 shadow-2xl"
          >
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4-2H3m4 14a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent mb-6"
          >
            Your Cart is Empty
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl text-gray-600 mb-10 max-w-md"
          >
            Discover amazing products and start your shopping journey
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 text-lg group"
            >
              <span>Explore Products</span>
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 mt-18">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
      >
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center lg:text-left mb-10"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent mb-4">
            Shopping Cart
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            {cart.items.length} {cart.items.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 lg:p-8">
              <AnimatePresence mode="popLayout">
                {cart.items.map((item, index) => (
                  <motion.div
                    key={item.part?._id || item._id || `missing-part-${index}`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="group relative"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl border border-gray-100 mb-6 last:mb-0 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                      <div className="relative flex-shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 2 }}
                          className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-100 to-gray-200"
                        >
                          <img
                            src={
                              item.part?.images?.[0]?.url ||
                              "/images/placeholder.jpg"
                            }
                            alt={item.name || "Product Image"}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        {!item.part?.stock && (
                          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.part?._id}`}
                          className="block group-hover:text-blue-600 transition-colors duration-200"
                        >
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {item.name || "Unknown Product"}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            ₹{item.price?.toLocaleString() || "0"}
                          </span>

                          {item.part?._id && (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                item.part.stock > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.part.stock > 0
                                ? "In Stock"
                                : "Out of Stock"}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {item.part && item.part._id && (
                            <div className="flex items-center bg-gray-50 rounded-2xl p-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.part._id,
                                    item.quantity - 1,
                                    item.part.stock
                                  )
                                }
                                disabled={
                                  item.quantity <= 1 || item.part.stock === 0
                                }
                                className="w-10 h-10 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 transition-all duration-200 flex items-center justify-center font-bold"
                              >
                                −
                              </motion.button>

                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(
                                    item.part._id,
                                    Number(e.target.value),
                                    item.part.stock
                                  )
                                }
                                className="w-16 h-10 text-center border-0 bg-transparent font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg mx-2"
                                disabled={item.part.stock === 0}
                              />

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.part._id,
                                    item.quantity + 1,
                                    item.part.stock
                                  )
                                }
                                disabled={item.quantity >= item.part.stock}
                                className="w-10 h-10 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 transition-all duration-200 flex items-center justify-center font-bold"
                              >
                                +
                              </motion.button>
                            </div>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleRemoveItem(item.part?._id || item._id)
                            }
                            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="xl:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 lg:p-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600">
                      Subtotal ({cart.items.length}{" "}
                      {cart.items.length === 1 ? "item" : "items"})
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{cart.total.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-xl sm:text-2xl font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        ₹{cart.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
                  disabled={cart.items.length === 0}
                  onClick={() => navigate("/checkout")}
                >
                  <span>Proceed to Checkout</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Cart;
