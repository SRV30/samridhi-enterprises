import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchParts } from "../../store/product/partsSlice";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const categories = [
  "Abs",
  "Belt Drive",
  "Bearing Kit",
  "BSVI Products",
  "Brake Switch",
  "CDEI",
  "C.D.I",
  "Consumable Filters",
  "Drum / Drum Plate / Coupling Hub / Wheel Rim",
  "Electronic Relay",
  "Filters & Horn",
  "Footrest Bracket",
  "Other Products (Cylinder Kit / Fuse Blade)",
  "Flasher / Buzzer",
  "Floor Set / Speedo Gear",
  "Fuel Items",
  "Lever & Yoke",
  "Varroc Oil / Grease",
  "Handle Bar Switch / Handle Bar Weigth",
  "Ignition Coil",
  "Insulator For Carburetor",
  "Lighting Products",
  "Magneto Assembly & Spares",
  "Modular Switch",
  "Oring",
  "Other (Oil Pump Gear / Clutch Roller / Plug Cap)",
  "Oil Seal Kit",
  "Gaskets",
  "Rear View Mirror",
  "Regulator Rectifier (R.R.)",
  "Rubber Items",
  "Relay",
  "Switches / Locks",
  "Starter Moter & Spares",
  "Speedo Gear",
  "TPSR / Swing Arm Assly",
];

const CategoryRows = () => {
  const dispatch = useDispatch();
  const { parts, loading, error } = useSelector((state) => state.parts);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchParts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    const validCategories = categories.filter((category) => {
      const categoryParts = parts.filter((part) => part.category === category);
      return categoryParts.length > 1; // update in future
    });

    const shuffled = [...validCategories].sort(() => Math.random() - 0.5);
    setSelectedCategories(
      shuffled.slice(0, Math.min(5, validCategories.length))
    );
  }, [parts]);

  const getPartsByCategory = (category) => {
    return parts
      .filter((part) => part.category === category)
      .sort(() => Math.random() - 0.5)
      .slice(0, 15);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const stockConfig = {
    high: { bg: "bg-emerald-500", text: "text-white", label: "In Stock" },
    medium: { bg: "bg-amber-500", text: "text-white", label: "Low Stock" },
    low: { bg: "bg-red-500", text: "text-white", label: "Out of Stock" },
  };

  const getStockStatus = (stock) => {
    if (stock > 15) return stockConfig.high;
    if (stock >= 5) return stockConfig.medium;
    return stockConfig.low;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-blue-600 font-medium">
            Loading amazing products...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-400/5"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
        >
          {selectedCategories.length === 0 && !loading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8L9 5"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Categories Available
                </h3>
                <p className="text-gray-600">
                  No categories with more than 2 items available at the moment.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {selectedCategories.map((category, categoryIndex) => {
                const categoryParts = getPartsByCategory(category);
                return (
                  <motion.div
                    key={category}
                    variants={categoryVariants}
                    className="relative"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: categoryIndex * 0.1,
                        }}
                        className="flex items-center space-x-4"
                      >
                        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-400 rounded-full"></div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                          {category}
                        </h2>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: categoryIndex * 0.1 + 0.2,
                        }}
                        className="hidden sm:flex items-center space-x-2 text-blue-600"
                      >
                        <span className="text-sm font-medium">
                          {categoryParts.length} Products
                        </span>
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      </motion.div>
                    </div>

                    {categoryParts.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 bg-white rounded-2xl shadow-sm border border-blue-100"
                      >
                        <p className="text-gray-500 font-medium">
                          No parts available in this category
                        </p>
                      </motion.div>
                    ) : (
                      <div className="relative">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50 pb-4">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              duration: 0.8,
                              delay: categoryIndex * 0.1 + 0.3,
                            }}
                            className="flex gap-4 lg:gap-6 px-2"
                          >
                            <AnimatePresence>
                              {categoryParts.map((part, partIndex) => {
                                const stockStatus = getStockStatus(part.stock);
                                return (
                                  <motion.div
                                    key={part._id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover="hover"
                                    transition={{ delay: partIndex * 0.05 }}
                                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-64 sm:w-72 lg:w-80 flex-shrink-0 border border-blue-100"
                                  >
                                    <Link
                                      to={`/products/${part._id}`}
                                      className="block"
                                    >
                                      <div className="relative overflow-hidden">
                                        <motion.div
                                          variants={imageVariants}
                                          className="relative h-48 sm:h-52 lg:h-56 bg-gradient-to-br from-blue-50 to-blue-100"
                                        >
                                          <motion.img
                                            src={
                                              part.images[0]?.url ||
                                              "https://via.placeholder.com/300x200?text=Product+Image"
                                            }
                                            alt={part.name}
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                              duration: 0.6,
                                              delay: partIndex * 0.05 + 0.2,
                                            }}
                                            className="w-full h-full object-fit"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                              delay: partIndex * 0.05 + 0.4,
                                            }}
                                            className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold ${stockStatus.bg} ${stockStatus.text} shadow-lg`}
                                          >
                                            {stockStatus.label}
                                          </motion.div>
                                        </motion.div>

                                        <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{
                                            delay: partIndex * 0.05 + 0.3,
                                          }}
                                          className="absolute inset-0 bg-gradient-to-t from-blue-600/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6"
                                        >
                                          <span className="text-white font-semibold text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                                            View Details
                                          </span>
                                        </motion.div>
                                      </div>

                                      <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          delay: partIndex * 0.05 + 0.4,
                                        }}
                                        className="p-4 sm:p-5 lg:p-6"
                                      >
                                        <div className="flex items-start justify-between mb-3">
                                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 capitalize leading-tight group-hover:text-blue-600 transition-colors duration-200">
                                            {part.name}
                                          </h3>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                              ID:
                                            </span>
                                            <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                              {part.product_id}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex flex-col">
                                            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                                              ₹{part.price.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              Best Price
                                            </span>
                                          </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4">
                                          <div className="text-xs text-gray-600">
                                            <span className="font-semibold text-gray-700">
                                              Compatible Vehicles:
                                            </span>
                                            <div className="mt-1">
                                              <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                                                {part.vehicleCompatibility
                                                  .length > 0
                                                  ? part.vehicleCompatibility
                                                      .slice(0, 1)
                                                      .map((v) => v.name || v)
                                                      .join(", ") +
                                                    (part.vehicleCompatibility
                                                      .length > 1
                                                      ? ` +${
                                                          part
                                                            .vehicleCompatibility
                                                            .length - 1
                                                        } more`
                                                      : "")
                                                  : "Universal"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    </Link>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </motion.div>
                        </div>

                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-r from-blue-50 to-transparent pointer-events-none"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryRows;
