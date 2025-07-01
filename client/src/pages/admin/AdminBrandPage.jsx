import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addBrand,
  fetchBrands,
  updateBrand,
  deleteBrand,
} from "../../store/product/brandSlice";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../extras/ConfirmationModel";

export default function AdminBrandPage() {
  const dispatch = useDispatch();
  const { brands, loading, error, success } = useSelector(
    (state) => state.brand
  );

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    if (success) toast.success("Added successfully!");
    if (error) toast.error(error);
  }, [success, error]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name) return toast.warn("Brand name is required!");

    const formData = new FormData();
    formData.append("name", name);

    if (editId) {
      if (image) formData.append("image", image);
      dispatch(updateBrand({ id: editId, formData }));
    } else {
      if (!image) return toast.warn("Image is required!");
      formData.append("image", image);
      dispatch(addBrand(formData));
    }

    setName("");
    setImage(null);
    setEditId(null);
    setImagePreview(null);
  };

  const handleEdit = (brand) => {
    setName(brand.name);
    setEditId(brand._id);
    setImage(null);
    setImagePreview(brand.images[0]?.url || null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const confirmDelete = (id) => {
    setSelectedIdToDelete(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteBrand(selectedIdToDelete));
    setShowConfirm(false);
    setSelectedIdToDelete(null);
  };

  const resetForm = () => {
    setName("");
    setImage(null);
    setEditId(null);
    setImagePreview(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent mb-4">
            Brand Management
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-blue-400 to-blue-500 mx-auto rounded-full"
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xl:grid-cols-5 gap-8"
        >
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <motion.div
              className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-blue-100"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold text-blue-600 mb-8 flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
                />
                {editId ? "Update Brand" : "Create Brand"}
              </motion.h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-semibold text-blue-600 mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter brand name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/70 backdrop-blur-sm text-blue-900 placeholder-blue-300"
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-blue-600 mb-2">
                    Brand Image
                  </label>
                  <div className="relative">
                    <input
                      key={editId || "new"}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-6 py-4 border-2 border-dashed border-blue-300 rounded-2xl focus:outline-none focus:border-blue-400 transition-all duration-300 bg-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-100 file:text-blue-600 file:font-semibold hover:file:bg-blue-200"
                    />
                  </div>
                  
                  <AnimatePresence>
                    {imagePreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mt-4 flex justify-center"
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 object-fit rounded-2xl border-4 border-blue-200 shadow-lg"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                      />
                    ) : (
                      `${editId ? "Update" : "Create"} Brand`
                    )}
                  </motion.button>

                  {editId && (
                    <motion.button
                      type="button"
                      onClick={resetForm}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1 sm:flex-none bg-white border-2 border-blue-400 text-blue-600 py-4 px-8 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Cancel
                    </motion.button>
                  )}
                </motion.div>
              </form>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="xl:col-span-3">
            <motion.div
              className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-blue-100"
              whileHover={{ scale: 1.005 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl sm:text-3xl font-bold text-blue-600 mb-8 flex items-center gap-3"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500"
                />
                All Brands ({brands.length})
              </motion.h3>

              <AnimatePresence>
                {brands.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      animate={{ y: [-10, 10, -10] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center"
                    >
                      <div className="text-4xl text-blue-400">📦</div>
                    </motion.div>
                    <p className="text-blue-400 text-xl font-semibold">No brands found</p>
                    <p className="text-blue-300 mt-2">Create your first brand to get started</p>
                  </motion.div>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {brands.map((brand, i) => (
                      <motion.div
                        key={brand._id}
                        variants={cardVariants}
                        whileHover="hover"
                        layout
                        className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl border border-blue-100 group relative overflow-hidden"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="relative"
                          >
                            {brand.images[0]?.url ? (
                              <img
                                src={brand.images[0].url}
                                alt={brand.name}
                                className="w-20 h-20 object-fit rounded-2xl border-4 border-blue-200 shadow-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl flex items-center justify-center text-2xl text-blue-600">
                                📷
                              </div>
                            )}
                            <motion.div
                              className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 + 0.5 }}
                            >
                              ✓
                            </motion.div>
                          </motion.div>
                          
                          <motion.h4
                            className="text-xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            {brand.name}
                          </motion.h4>
                          
                          <motion.div
                            className="flex gap-3 w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 + 0.3 }}
                          >
                            <motion.button
                              onClick={() => handleEdit(brand)}
                              variants={buttonVariants}
                              whileHover="hover"
                              whileTap="tap"
                              className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white py-2 px-4 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              onClick={() => confirmDelete(brand._id)}
                              variants={buttonVariants}
                              whileHover="hover"
                              whileTap="tap"
                              className="flex-1 bg-gradient-to-r from-red-400 to-red-500 text-white py-2 px-4 rounded-xl font-semibold hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              Delete
                            </motion.button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? This action cannot be undone."
      />
    </div>
  );
}