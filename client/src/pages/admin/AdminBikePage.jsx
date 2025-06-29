import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBikeModels,
  addBikeModel,
  updateBikeModel,
  deleteBikeModel,
  clearError,
  clearSuccess,
} from "../../store/product/bikeSlice";
import { fetchBrands } from "../../store/product/brandSlice";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../extras/ConfirmationModel";
import Loader from "../../extras/Loader";
import { MoveDownIcon } from "lucide-react";

export default function AdminBikeModelPage() {
  const dispatch = useDispatch();
  const {
    bikeModels = [],
    loading,
    error,
    success,
  } = useSelector((state) => state.bike);
  const { brands = [] } = useSelector((state) => state.brand);

  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchBikeModels());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Operation successful");
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return toast.warn("Model name is required!");
    if (!brandId) return toast.warn("Please select a brand!");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("brand", brandId);

    if (editId) {
      if (image) formData.append("image", image);
      dispatch(updateBikeModel({ id: editId, formData }));
    } else {
      if (!image) return toast.warn("Image is required!");
      formData.append("image", image);
      dispatch(addBikeModel(formData));
    }

    resetForm();
  };

  const handleEdit = (model) => {
    if (!model || !model._id) {
      toast.error("Invalid model data");
      return;
    }
    setName(model.name || "");
    setBrandId(model.brand?._id || "");
    setEditId(model._id);
    setImagePreview(
      Array.isArray(model.images) &&
        model.images.length > 0 &&
        model.images[0]?.url
        ? model.images[0].url
        : null
    );
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const confirmDelete = (id) => {
    if (!id) return;
    setSelectedIdToDelete(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteBikeModel(selectedIdToDelete));
    setShowConfirm(false);
    setSelectedIdToDelete(null);
  };

  const resetForm = () => {
    setName("");
    setBrandId("");
    setImage(null);
    setEditId(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const sortedBrands = brands
    .map((brand) => ({ ...brand, name: brand.name.toUpperCase() }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredModels = bikeModels
    .filter(
      (model) =>
        model &&
        model._id &&
        typeof model === "object" &&
        (model.name.toLowerCase().includes(search.toLowerCase()) ||
          model.brand?.name.toLowerCase().includes(search.toLowerCase())) &&
        (!brandFilter || model.brand?._id === brandFilter)
    )
    .map((model) => ({
      ...model,
      name: model.name.toUpperCase(),
      brand: model.brand
        ? { ...model.brand, name: model.brand.name.toUpperCase() }
        : { _id: "", name: "N/A" },
    }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, height: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      height: "auto",
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-4">
            Bike Model Studio
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Manage your bike models with style and precision
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-8"
          >
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search models or brands..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-blue-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 text-slate-700 placeholder-slate-400 shadow-lg"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400"
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
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-4 py-3 bg-white/90 backdrop-blur-sm border border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-800/30 focus:border-blue-800 transition-all duration-300 appearance-none cursor-pointer text-slate-700"
              >
                <option value="">All Brands</option>
                {sortedBrands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Model
              </motion.button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="mb-8 overflow-hidden"
                >
                  <div className="bg-white/90 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-xl border border-blue-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Model Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter model name"
                            className="w-full px-4 py-3 bg-slate-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Brand
                          </label>
                          <select
                            value={brandId}
                            onChange={(e) => setBrandId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 appearance-none cursor-pointer"
                          >
                            <option value="">Select brand</option>
                            {sortedBrands.map((b) => (
                              <option key={b._id} value={b._id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Image
                        </label>
                        <input
                          key={editId || "I"}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-200"
                        />
                      </div>

                      {imagePreview && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex justify-center"
                        >
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="w-32 h-32 object-cover rounded-2xl shadow-lg border-4 border-blue-100"
                          />
                        </motion.div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading
                            ? "Processing..."
                            : editId
                            ? "Update Model"
                            : "Create Model"}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={resetForm}
                          className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-300 border border-slate-200"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
        >
          <AnimatePresence>
            {loading ? (
              <Loader />
            ) : filteredModels.length > 0 ? (
              filteredModels.map((model, index) => (
                <motion.div
                  key={model._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  whileHover="hover"
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg hover:shadow-2xl border border-blue-100 cursor-pointer transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="relative mb-4 mx-auto w-20 h-20 sm:w-24 sm:h-24">
                      {Array.isArray(model.images) &&
                      model.images.length > 0 &&
                      model.images[0]?.url ? (
                        <img
                          src={model.images[0].url}
                          alt={model.name}
                          className="w-full h-full object-cover rounded-2xl shadow-lg border-2 border-blue-100 group-hover:border-blue-300 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-3xl border-2 border-blue-100 group-hover:border-blue-300 transition-all duration-300">
                          🏍️
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>

                    <h2 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors duration-300">
                      {model.name}
                    </h2>
                    <p className="text-sm text-slate-500 mb-4 font-medium">
                      {model.brand?.name}
                    </p>

                    <div className="flex justify-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(model)}
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-300 font-medium shadow-md"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => confirmDelete(model._id)}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-300 font-medium shadow-md"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  No models found
                </h3>
                <p className="text-slate-400">
                  Try adjusting your search criteria
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Bike Model"
        message="Are you sure you want to delete this model? This action cannot be undone."
      />
    </div>
  );
}
