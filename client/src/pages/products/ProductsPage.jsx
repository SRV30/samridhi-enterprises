import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchParts, clearPartError } from "../../store/product/partsSlice";
import { addToCompare, removeFromCompare } from "../../store/product/compareSlice";
import { addToWishlist, removeFromWishlist } from "../../store/wishlist/wishlistSlice";
import { fetchBikeModels } from "../../store/product/bikeSlice";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../extras/Loader";
import { Link, useSearchParams } from "react-router-dom";
import { GitCompare, Check, Heart } from "lucide-react";
import SEO from "../../components/SEO";
import ProductSkeleton from "../../components/ProductSkeleton";

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

// A bike model with no year range is treated as compatible with any year, so
// models that predate the year fields (or universal-fit models) keep matching.
const modelMatchesYear = (model, year) => {
  if (!year) return true;
  const y = Number(year);
  const { yearStart: start, yearEnd: end } = model;
  return (start == null || start <= y) && (end == null || end >= y);
};

// An empty engine type means the model matches any engine.
const modelMatchesEngine = (model, engine) => {
  if (!engine) return true;
  const et = (model.engineType || "").trim();
  return et === "" || et.toLowerCase() === engine.toLowerCase();
};

const ProductsPage = () => {
  const dispatch = useDispatch();
  const {
    parts,
    loading: partsLoading,
    error: partsError,
  } = useSelector((state) => state.parts);
  const { items: compareItems, max: compareMax } = useSelector(
    (state) => state.compare
  );
  const { wishlist } = useSelector((state) => state.wishlist);
  const wishlistItems = wishlist?.items || [];
  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    bikeModels = [],
    loading: bikeLoading,
    error: bikeError,
  } = useSelector((state) => state.bike);

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("search") || ""
  );
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCompatibility, setFilterCompatibility] = useState([]);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterEngine, setFilterEngine] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const filterDropdownRef = useRef(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    dispatch(fetchParts());
    dispatch(fetchBikeModels());
  }, [dispatch]);

 // Keep the brand filter in sync with `?brand=` so links from the
  // homepage's Top Brands cards land on a pre-filtered products page.
  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (brandParam) setFilterBrand(brandParam);
  }, [searchParams]);

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

  // Whenever any filter or sort changes, jump back to page 1 so the user
  // never sees a now-empty page (e.g. they were on page 4, narrowed the
  // search, and the results now fit on 2 pages).
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterCompatibility, filterBrand, filterYear, filterEngine, filterStockStatus, sortBy, priceRange]);

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
    setFilterBrand("");
    setFilterYear("");
    setFilterEngine("");
    setFilterStockStatus("");
    setPriceRange([0, 10000]);
    setCurrentPage(1);
  };

  // Resolve a part's vehicleCompatibility entries (which only carry model id +
  // name) to full bike-model records so we can match on brand, year, engine.
  const bikeModelMap = useMemo(() => {
    const map = {};
    for (const model of bikeModels) {
      if (model && model._id) map[model._id] = model;
    }
    return map;
  }, [bikeModels]);

  // Vehicle filter options derived from real bike-model data.
  const brandOptions = useMemo(() => {
    const set = new Set();
    for (const model of bikeModels) {
      const brandName = model?.brand?.name;
      if (brandName && brandName !== "N/A") set.add(brandName);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [bikeModels]);

  const engineOptions = useMemo(() => {
    const set = new Set();
    for (const model of bikeModels) {
      const engine = (model?.engineType || "").trim();
      if (engine) set.add(engine);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [bikeModels]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= 1990; y--) years.push(y);
    return years;
  }, []);

  // Add or remove a product from the compare selection.
  const isInCompare = (id) => compareItems.some((p) => p._id === id);
  const toggleCompare = (e, part) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare(part._id)) {
      dispatch(removeFromCompare(part._id));
    } else {
      dispatch(addToCompare(part));
    }
  };

  // Add or remove a product from the user's (server-backed) wishlist.
  const isInWishlist = (id) =>
    wishlistItems.some((i) => (i.part?._id || i.part) === id);
  const toggleWishlist = (e, part) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Please log in to use your wishlist");
      return;
    }
    if (isInWishlist(part._id)) {
      dispatch(removeFromWishlist(part._id));
    } else {
      dispatch(addToWishlist(part._id));
    }
  };

  const sortedAndFilteredParts = parts
    .filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.category || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory
        ? part.category === filterCategory
        : true;
      const matchesCompatibility =
        filterCompatibility.length > 0
          ? part.vehicleCompatibility.some((v) =>
              filterCompatibility.includes(v._id || v)
            )
          : true;
      // Vehicle search: a part matches when it is compatible with at least one
      // bike model that satisfies all of the selected brand/year/engine
      // criteria together.
      const vehicleSelected = filterBrand || filterYear || filterEngine;
      const matchesVehicle = !vehicleSelected
        ? true
        : (part.vehicleCompatibility || []).some((v) => {
            const model = bikeModelMap[v._id || v];
            if (!model) return false;
            const okBrand = !filterBrand || model.brand?.name === filterBrand;
            const okYear = modelMatchesYear(model, filterYear);
            const okEngine = modelMatchesEngine(model, filterEngine);
            return okBrand && okYear && okEngine;
          });
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
        matchesVehicle &&
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

  // Reset to page 1 whenever any filter changes so the user never lands on a
  // now-empty page (e.g. was on page 3, adds a filter, results shrink to 1 page).
  // We derive this value rather than tracking in an effect to avoid double-render.
  const totalFiltered = sortedAndFilteredParts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  // Clamp currentPage in case filters just reduced the page count.
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const paginatedParts = sortedAndFilteredParts.slice(pageStart, pageStart + pageSize);

  const activeFiltersCount = [
    searchTerm,
    filterCategory,
    filterCompatibility.length > 0,
    filterBrand,
    filterYear,
    filterEngine,
    filterStockStatus,
    priceRange[0] > 0 || priceRange[1] < 10000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 mt-20 sm:mt-24 mb-16">
      <SEO title="Products" />
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Bike Spares Parts
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite" aria-atomic="true">
            {totalFiltered} of {parts.length} parts
          </span>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <label htmlFor="parts-search" className="sr-only">Search parts</label>
                  <input
                    id="parts-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search parts by name or Product ID..."
                    aria-label="Search parts by name or product ID"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
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
                <label htmlFor="parts-sort" className="sr-only">Sort products</label>
                <select
                  id="parts-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort products"
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Bike Models
                </label>
                <div
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto"
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
                              className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              {model.name}
                            </span>
                          </label>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                          No bike models available
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Vehicle Brand
                </label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">All Brands</option>
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Manufacturing Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Any Year</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Engine Type
                </label>
                <select
                  value={filterEngine}
                  onChange={(e) => setFilterEngine(e.target.value)}
                  disabled={engineOptions.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {engineOptions.length === 0 ? "No engine data" : "Any Engine"}
                  </option>
                  {engineOptions.map((eng) => (
                    <option key={eng} value={eng}>
                      {eng}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                    className="w-full sm:w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full sm:w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Stock Status
                </label>
                <select
                  value={filterStockStatus}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 px-4 gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {totalFiltered === 0
              ? "No parts found"
              : `Showing ${pageStart + 1}–${Math.min(pageStart + pageSize, totalFiltered)} of ${totalFiltered} part${totalFiltered !== 1 ? "s" : ""}${totalFiltered < parts.length ? ` (filtered from ${parts.length})` : ""}`}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 dark:text-gray-400">Per page:</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[6, 12, 24, 48].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {partsLoading ? (
          <ProductSkeleton count={pageSize} />
        ) : sortedAndFilteredParts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mx-4 p-8 sm:p-12 text-center"
          >
            <svg
              className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500"
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
            <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
              No parts found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
            <AnimatePresence>
              {paginatedParts.map((part) => (
                <motion.div
                  key={part._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                  className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <button
                    onClick={(e) => toggleWishlist(e, part)}
                    aria-label={
                      isInWishlist(part._id)
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                    title={
                      isInWishlist(part._id)
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 backdrop-blur shadow hover:bg-white transition"
                  >
                    <Heart
                      className={`w-5 h-5 transition ${
                        isInWishlist(part._id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-500"
                      }`}
                    />
                  </button>
                  <Link to={`/products/${part._id}`}>
                    <div className="w-full">
                      <motion.img
                        src={
                          part.images[0]?.url ||
                          "https://via.placeholder.com/150"
                        }
                        alt={part.name}
                        loading="lazy"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="object-cover w-full h-44 rounded-t-lg bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    <div className="p-3 sm:p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 capitalize">
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
                          <span className="text-gray-500 dark:text-gray-400">Product ID:</span>
                          <span className="font-mono text-gray-900 dark:text-gray-100">
                            {part.product_id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
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
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Category:</span>{" "}
                          {part.category}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
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
                  {/* Compare toggle — outside the Link so it doesn't navigate */}
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 mt-auto">
                    <button
                      onClick={(e) => toggleCompare(e, part)}
                      disabled={
                        !isInCompare(part._id) &&
                        compareItems.length >= compareMax
                      }
                      className={`w-full inline-flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        isInCompare(part._id)
                          ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:text-blue-600"
                      }`}
                      title={
                        !isInCompare(part._id) &&
                        compareItems.length >= compareMax
                          ? `You can compare up to ${compareMax} products`
                          : isInCompare(part._id)
                          ? "Remove from comparison"
                          : "Add to comparison"
                      }
                    >
                      {isInCompare(part._id) ? (
                        <>
                          <Check className="w-4 h-4" /> Added to Compare
                        </>
                      ) : (
                        <>
                          <GitCompare className="w-4 h-4" /> Compare
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 px-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={safePage === 1}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              «
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={safePage === 1}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              ‹
            </motion.button>

            {/* Page number buttons — show up to 5 around the current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => Math.abs(n - safePage) <= 2)
              .map((n) => (
                <motion.button
                  key={n}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setCurrentPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    n === safePage
                      ? "bg-blue-500 text-white border-blue-500 font-semibold"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-50"
                  }`}
                  aria-label={`Page ${n}`}
                  aria-current={n === safePage ? "page" : undefined}
                >
                  {n}
                </motion.button>
              ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={safePage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              ›
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={safePage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
            >
              »
            </motion.button>
          </div>
        )}

        {bikeLoading && <Loader />}
      </div>
    </div>
  );
};

export default ProductsPage;
