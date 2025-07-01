import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchParts, clearPartError } from "../../store/product/partsSlice";
import { fetchBikeModels } from "../../store/product/bikeSlice";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../extras/Loader";
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

const ProductsPage = () => {
  const dispatch = useDispatch();
  const {
    parts,
    loading: partsLoading,
    error: partsError,
  } = useSelector((state) => state.parts);
  const {
    bikeModels = [],
    loading: bikeLoading,
    error: bikeError,
  } = useSelector((state) => state.bike);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCompatibility, setFilterCompatibility] = useState([]);
  const [filterStockStatus, setFilterStockStatus] = useState("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchParts());
    dispatch(fetchBikeModels());
  }, [dispatch]);

  useEffect(() => {
    if (partsError) {
      toast.error(partsError);
      dispatch(clearPartError());
    }
    if (bikeError) {
      toast.error(bikeError);
    }
  }, [partsError, bikeError, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterCompatibilityChange = (modelId) => {
    setFilterCompatibility((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterCompatibility([]);
    setFilterStockStatus("");
    setPriceRange([0, 10000]);
  };

  const sortedAndFilteredParts = parts
    .filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.product_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory
        ? part.category === filterCategory
        : true;
      const matchesCompatibility =
        filterCompatibility.length > 0
          ? part.vehicleCompatibility.some((v) =>
              filterCompatibility.includes(v._id || v)
            )
          : true;
      const matchesPrice =
        part.price >= priceRange[0] && part.price <= priceRange[1];
      const matchesStockStatus = filterStockStatus
        ? filterStockStatus === "inStock"
          ? part.stock > 15
          : filterStockStatus === "lowStock"
          ? part.stock >= 5 && part.stock <= 15
          : filterStockStatus === "outOfStock"
          ? part.stock < 5
          : true
        : true;
      return (
        matchesSearch &&
        matchesCategory &&
        matchesCompatibility &&
        matchesPrice &&
        matchesStockStatus
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "stock":
          return b.stock - a.stock;
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const activeFiltersCount = [
    searchTerm,
    filterCategory,
    filterCompatibility.length > 0,
    filterStockStatus,
    priceRange[0] > 0 || priceRange[1] < 10000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-100 mt-18">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Bike Spares Parts
          </h1>
          <span className="text-sm text-gray-500">
            {parts.length} total parts
          </span>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search parts by name or Product ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="stock">Stock Level</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative" ref={filterDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bike Models
                </label>
                <div
                  className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                >
                  {filterCompatibility.length > 0
                    ? `${filterCompatibility.length} model(s) selected`
                    : "All Models"}
                </div>
                <AnimatePresence>
                  {isFilterDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
                    >
                      {bikeModels.length > 0 ? (
                        bikeModels.map((model) => (
                          <label
                            key={model._id}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filterCompatibility.includes(model._id)}
                              onChange={() =>
                                handleFilterCompatibilityChange(model._id)
                              }
                              className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">
                              {model.name}
                            </span>
                          </label>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          No bike models available
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (₹{priceRange[0].toLocaleString()} - ₹
                  {priceRange[1].toLocaleString()})
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([
                        parseInt(e.target.value) || 0,
                        priceRange[1],
                      ])
                    }
                    className="w-full sm:w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max={priceRange[1]}
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([parseInt(e.target.value), priceRange[1]])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        parseInt(e.target.value) || 10000,
                      ])
                    }
                    className="w-full sm:w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={priceRange[0]}
                    max="10000"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Status
                </label>
                <select
                  value={filterStockStatus}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">All Stock Status</option>
                  <option value="inStock">In Stock ({">"} 15)</option>
                  <option value="lowStock">Low Stock (5–15)</option>
                  <option value="outOfStock">Out of Stock ({"<"} 5)</option>
                </select>
              </div>
              <div className="flex items-end">
                {activeFiltersCount > 0 && (
                  <motion.button
                    onClick={clearAllFilters}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors duration-200"
                  >
                    Clear Filters ({activeFiltersCount})
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-4">
          <p className="text-sm text-gray-600">
            Showing {sortedAndFilteredParts.length} of {parts.length} parts
          </p>
        </div>

        {sortedAndFilteredParts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 mx-4 p-8 sm:p-12 text-center"
          >
            <svg
              className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">
              No parts found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
            <AnimatePresence>
              {sortedAndFilteredParts.map((part) => (
                <motion.div
                  key={part._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <Link to={`/products/${part._id}`}>
                    <div className="w-full">
                      <motion.img
                        src={
                          part.images[0]?.url ||
                          "https://via.placeholder.com/150"
                        }
                        alt={part.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="object-fit w-full h-48 sm:h-40 rounded-t-lg"
                      />
                    </div>
                    <div className="p-3 sm:p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 capitalize">
                          {part.name}
                        </h3>
                        {part.bestseller && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            Bestseller
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 mb-3 sm:mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Product ID:</span>
                          <span className="font-mono text-gray-900">
                            {part.product_id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg sm:text-2xl font-bold text-gray-900">
                            ₹{part.price.toLocaleString()}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              part.stock > 15
                                ? "bg-green-100 text-green-800"
                                : part.stock >= 5
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {part.stock > 15
                              ? "In Stock"
                              : part.stock >= 5
                              ? "Low Stock"
                              : "Out of Stock"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Category:</span>{" "}
                          {part.category}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Compatible:</span>{" "}
                          <span className="uppercase">
                            {part.vehicleCompatibility.length > 0
                              ? part.vehicleCompatibility
                                  .slice(0, 2)
                                  .map((v) => v.name || v)
                                  .join(", ") +
                                (part.vehicleCompatibility.length > 2
                                  ? ` +${
                                      part.vehicleCompatibility.length - 2
                                    } more`
                                  : "")
                              : "None specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {(partsLoading || bikeLoading) && <Loader />}
      </div>
    </div>
  );
};

export default ProductsPage;
