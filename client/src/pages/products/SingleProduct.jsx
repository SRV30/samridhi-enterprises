import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPartById,
  createOrUpdateReview,
  deleteReview,
  clearPartError,
  clearPartSuccess,
} from "../../store/product/partsSlice";
import { addToCart } from "../../store/cart/cartSlice";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { part, loading, error, success } = useSelector((state) => state.parts);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    dispatch(fetchPartById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPartError());
    }
    if (success) {
      toast.success("Review submitted successfully!");
      dispatch(clearPartSuccess());
      dispatch(fetchPartById(id));
    }
  }, [error, success, dispatch, id]);

  useEffect(() => {
    if (part && isAuthenticated && user?._id) {
      const userReview = part.reviews.find(
        (review) => review.user?.toString() === user._id.toString()
      );
      if (userReview) {
        setRating(userReview.rating);
        setComment(userReview.comment);
      } else {
        setRating(0);
        setComment("");
      }
    }
  }, [part, user, isAuthenticated]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      navigate("/login");
      return;
    }
    dispatch(
      addToCart({
        partId: part._id,
        name: part.name,
        price: part.price,
        quantity,
      })
    );
    toast.success(`${part.name} added to cart!`);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to submit a review");
      navigate("/login");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }
    if (comment.length > 500) {
      toast.error("Review comment cannot exceed 500 characters");
      return;
    }
    dispatch(createOrUpdateReview({ partId: id, rating, comment }));
    window.location.reload();
  };

  const handleDeleteReview = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to delete a review");
      navigate("/login");
      return;
    }
    dispatch(deleteReview(id));
    window.location.reload();
  };

  const getStockStatus = () => {
    if (part.stock === 0)
      return { text: "Out of Stock", color: "text-red-500", bg: "bg-red-50" };
    if (part.stock <= 5)
      return {
        text: "Only few left!",
        color: "text-orange-500",
        bg: "bg-orange-50",
      };
    if (part.stock <= 15)
      return {
        text: "Limited Stock",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    return { text: "In Stock", color: "text-emerald-500", bg: "bg-emerald-50" };
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow empty input for manual typing
    if (value === "") {
      setQuantity("");
      return;
    }
    const num = Number(value);
    if (!isNaN(num) && num >= 1 && num <= Math.min(part.stock, 100)) {
      setQuantity(num);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => {
      const num = Number(prev) || 1;
      return Math.min(num + 1, part.stock, 10);
    });
  };

  const decrementQuantity = () => {
    setQuantity((prev) => {
      const num = Number(prev) || 1;
      return Math.max(num - 1, 1);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-500 font-medium">
            Loading product details...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-2xl shadow-xl"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-red-500">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!part) return null;

  const stockStatus = getStockStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 mt-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-white"
            >
              {part.bestseller && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  Bestseller
                </motion.div>
              )}

              <div className="flex justify-center mb-8">
                <motion.div
                  className="relative cursor-pointer group"
                  onClick={() => setIsZoomed(!isZoomed)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src={
                      part.images?.[selectedImage]?.url ||
                      "/images/placeholder.jpg"
                    }
                    alt={part.name || "Product Image"}
                    className={`w-96 h-96 object-fit rounded-2xl shadow-lg transition-all duration-500 ${
                      isZoomed ? "w-[30rem] h-[30rem]" : "w-96 h-96"
                    }`}
                  />
                  <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
                  <div className="absolute top-4 right-4 bg-white bg-opacity-80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </motion.div>
              </div>

              {part.images?.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center gap-3 overflow-x-auto pb-2"
                >
                  {part.images.map((img, index) => (
                    <motion.img
                      key={img.public_id || `img-${index}`}
                      src={img.url || "/images/placeholder.jpg"}
                      alt={`${part.name || "Product"}-${index}`}
                      className={`w-20 h-20 object-cover cursor-pointer rounded-xl border-3 transition-all duration-300 ${
                        selectedImage === index
                          ? "border-blue-500 shadow-lg shadow-blue-200"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => setSelectedImage(index)}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="p-8 lg:p-12 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight capitalize"
                  >
                    {part.name || "Unknown Product"}
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 mt-4"
                  >
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(part.ratings || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.465a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.465a1 1 0 00-1.175 0l-3.39 2.465c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.314 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                      {part.ratings?.toFixed(1) || "0.0"} (
                      {part.numOfReviews || 0} reviews)
                    </span>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-blue-600">
                      ₹{part.price?.toLocaleString() || "0"}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${stockStatus.color.replace(
                      "text-",
                      "bg-"
                    )}`}
                  ></div>
                  {stockStatus.text}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gray-50 rounded-2xl p-6 space-y-4"
                >
                  <h3 className="font-semibold text-gray-900">
                    Product Details
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {part.description || "No description available"}
                  </p>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Product Id:</span>{" "}
                    {part.product_id || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span>{" "}
                    {part.category || "N/A"}
                  </div>
                </motion.div>

                {part.vehicleCompatibility?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-3"
                  >
                    <h3 className="font-semibold text-gray-900">
                      Compatible Vehicles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {part.vehicleCompatibility.map((vehicle) => (
                        <span
                          key={vehicle._id}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium border border-blue-200 uppercase"
                        >
                          {vehicle.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {part.stock > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl"
                  >
                    <label className="font-medium text-blue-900">
                      Quantity:
                    </label>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={decrementQuantity}
                        disabled={quantity === 1}
                        className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 disabled:opacity-50 transition-colors"
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
                            d="M20 12H4"
                          />
                        </svg>
                      </motion.button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-20 text-center border-2 border-blue-200 rounded-xl px-4 py-2 font-medium focus:outline-none focus:border-blue-400 transition-colors"
                        min="1"
                        max={Math.min(part.stock, 10)}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={incrementQuantity}
                        disabled={quantity >= Math.min(part.stock, 10)}
                        className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 disabled:opacity-50 transition-colors"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-8 space-y-4"
              >
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={part.stock === 0}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    part.stock > 0
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {part.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Customer Reviews
            </h2>

            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 mb-8"
              >
                <h3 className="text-xl font-bold text-blue-900 mb-6">
                  {part.reviews.find(
                    (r) => r.user?.toString() === user?._id?.toString()
                  )
                    ? "Update Your Review"
                    : "Share Your Experience"}
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-blue-900">
                      Your Rating:
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.svg
                          key={i}
                          className={`w-8 h-8 cursor-pointer transition-colors ${
                            i < (hoveredStar || rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          onClick={() => setRating(i + 1)}
                          onMouseEnter={() => setHoveredStar(i + 1)}
                          onMouseLeave={() => setHoveredStar(0)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.465a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.465a1 1 0 00-1.175 0l-3.39 2.465c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.314 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
                        </motion.svg>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="w-full border-2 border-blue-200 rounded-2xl p-4 h-32 resize-none focus:outline-none focus:border-blue-400 transition-colors"
                      maxLength={500}
                    />
                    <span className="absolute bottom-4 right-4 text-blue-500 text-sm font-medium">
                      {comment.length}/500
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                      Submit Review
                    </motion.button>
                    {part.reviews.find(
                      (r) => r.user?.toString() === user?._id?.toString()
                    ) && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleDeleteReview}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all shadow-lg"
                      >
                        Delete Review
                      </motion.button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

            {part.reviews?.length > 0 ? (
              <div className="space-y-6">
                <AnimatePresence>
                  {part.reviews.map((review, index) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {(review.name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.name || "Anonymous"}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < (review.rating || 0)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.465a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.465a1 1 0 00-1.175 0l-3.39 2.465c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.314 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-gray-500 text-sm">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-600">
                  Be the first to share your experience with this product!
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SingleProduct;
