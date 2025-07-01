import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addPart,
  fetchParts,
  updatePart,
  deletePart,
  clearPartError,
  clearPartSuccess,
} from "../../store/product/partsSlice";
import { fetchBikeModels } from "../../store/product/bikeSlice";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../extras/ConfirmationModel";
import Loader from "../../extras/Loader";
import { Images } from "lucide-react";
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

const AdminPartPage = () => {
  const dispatch = useDispatch();
  const {
    parts,
    loading: partsLoading,
    error: partsError,
    success: partsSuccess,
  } = useSelector((state) => state.parts);
  const {
    bikeModels = [],
    loading: bikeLoading,
    error: bikeError,
  } = useSelector((state) => state.bike);

  const [formData, setFormData] = useState({
    product_id: "",
    name: "",
    description: "",
    price: "",
    stock: 1,
    vehicleCompatibility: [],
    category: "",
    bestseller: false,
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCompatibility, setFilterCompatibility] = useState([]);
  const [filterStockStatus, setFilterStockStatus] = useState("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const dropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchParts());
    dispatch(fetchBikeModels());
  }, [dispatch]);

  useEffect(() => {
    if (partsSuccess) {
      toast.success("Operation successful!");
      dispatch(clearPartSuccess());
      setShowAddForm(false);
    }
    if (partsError) {
      toast.error(partsError);
      dispatch(clearPartError());
    }
    if (bikeError) {
      toast.error(bikeError);
    }
  }, [partsSuccess, partsError, bikeError, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVehicleCompatibilityChange = (modelId) => {
    setFormData((prev) => {
      const vehicleCompatibility = prev.vehicleCompatibility.includes(modelId)
        ? prev.vehicleCompatibility.filter((id) => id !== modelId)
        : [...prev.vehicleCompatibility, modelId];
      return { ...prev, vehicleCompatibility };
    });
  };

  const handleFilterCompatibilityChange = (modelId) => {
    setFilterCompatibility((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.warn("Maximum 5 images allowed!");
      return;
    }
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { product_id, name, price, category } = formData;

    if (!product_id || !name || !price || !category) {
      return toast.warn("Product ID, Name, Price, and Category are required!");
    }
    if (!editId && images.length === 0) {
      return toast.warn("At least one image is required!");
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((item) => data.append(`${key}[]`, item));
      } else {
        data.append(key, formData[key]);
      }
    });
    images.forEach((img) => data.append("images", img));

    if (editId) {
      dispatch(updatePart({ id: editId, formData: data }));
    } else {
      dispatch(addPart(data));
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      product_id: "",
      name: "",
      description: "",
      price: "",
      stock: 1,
      vehicleCompatibility: [],
      category: "",
      bestseller: false,
    });
    setImages([]);
    setImagePreviews([]);
    setEditId(null);
    setIsDropdownOpen(false);
    setShowAddForm(false);
  };

  const handleEdit = (part) => {
    setFormData({
      product_id: part.product_id,
      name: part.name,
      description: part.description || "",
      price: part.price,
      stock: part.stock,
      vehicleCompatibility: part.vehicleCompatibility.map((v) => v._id || v),
      category: part.category,
      bestseller: part.bestseller,
    });
    setEditId(part._id);
    setImagePreviews(part.images.map((img) => img.url));
    setImages([]);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    setSelectedIdToDelete(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deletePart(selectedIdToDelete));
    setShowConfirm(false);
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
            Bike Parts Management
          </h1>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span className="text-sm text-gray-500">
              {parts.length} total parts
            </span>
            <motion.button
              onClick={() => setShowAddForm(!showAddForm)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm text-sm sm:text-base"
            >
              {showAddForm ? "Cancel" : "+ Add New Part"}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6 overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editId ? "Edit Part" : "Add New Part"}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product ID *
                    </label>
                    <input
                      type="text"
                      name="product_id"
                      value={formData.product_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter product ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Part Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter part name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Compatibility
                    </label>
                    <div
                      className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      {formData.vehicleCompatibility.length > 0
                        ? `${formData.vehicleCompatibility.length} model(s) selected`
                        : "Select compatible models"}
                    </div>
                    <AnimatePresence>
                      {isDropdownOpen && (
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
                                  checked={formData.vehicleCompatibility.includes(
                                    model._id
                                  )}
                                  onChange={() =>
                                    handleVehicleCompatibilityChange(model._id)
                                  }
                                  className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700 capitalize">
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter detailed description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images (Max 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <AnimatePresence>
                        {imagePreviews.map((src, i) => (
                          <motion.img
                            key={i}
                            src={src}
                            alt={`Preview ${i + 1}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-16 sm:h-20 object-fit rounded-md border border-gray-200"
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="bestseller"
                    id="bestseller"
                    checked={formData.bestseller}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="bestseller"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Mark as bestseller
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={resetForm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={partsLoading || bikeLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                  >
                    {editId ? "Update Part" : "Add Part"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

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
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden ${
                    viewMode === "list" ? "flex flex-col" : ""
                  }`}
                >
                  <Link to={`/products/${part._id}`}>
                    <div
                      className={`${
                        viewMode === "list"
                          ? "w-full sm:w-32 sm:flex-shrink-0"
                          : "w-full"
                      }`}
                    >
                      <motion.img
                        src={
                          part.images[0]?.url ||
                          "https://via.placeholder.com/150"
                        }
                        alt={part.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className={`object-fit w-full ${
                          viewMode === "list"
                            ? "h-48 sm:h-full"
                            : "h-48 sm:h-40"
                        } rounded-t-lg sm:rounded-t-none sm:rounded-l-lg`}
                      />
                    </div>
                  </Link>
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
                        <span className=" uppercase">
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

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <motion.button
                          onClick={() => handleEdit(part)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(part._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
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
                          Delete
                        </motion.button>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Images className="" />
                        <span>{part.images?.length || 0} images</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {(partsLoading || bikeLoading) && <Loader />}

        <ConfirmationModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Part"
          message="Are you sure you want to delete this part? This action cannot be undone and will permanently remove the part from your inventory."
        />
      </div>
    </div>
  );
};

export default AdminPartPage;
