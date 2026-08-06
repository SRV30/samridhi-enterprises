import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addBrand,
  fetchBrands,
  updateBrand,
  deleteBrand,
} from "../../store/product/brandSlice";
import { toast } from "react-toastify";
import ConfirmationModal from "../../extras/ConfirmationModal";
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminSearchInput,
} from "@/components/admin/AdminUI";
import { Button, Input } from "@/components/ui";
import { Building2, Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";

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
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    if (success) toast.success("Operation successful!");
    if (error) toast.error(error);
  }, [success, error]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const fieldErrors = {};
    if (!name.trim()) fieldErrors.name = "Brand name is required";
    if (!editId && !image) fieldErrors.image = "Image is required";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const formData = new FormData();
    formData.append("name", name);

    if (editId) {
      if (image) formData.append("image", image);
      dispatch(updateBrand({ id: editId, updatedData: formData }));
    } else {
      formData.append("image", image);
      dispatch(addBrand(formData));
    }

    resetForm();
  };

  const resetForm = () => {
    setName("");
    setImage(null);
    setEditId(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleEdit = (brand) => {
    setEditId(brand._id);
    setName(brand.name);
    setImagePreview(brand.image?.url || null);
    setImage(null);
  };

  const confirmDelete = (id) => {
    setSelectedIdToDelete(id);
    setShowConfirm(true);
  };

  const handleDelete = () => {
    dispatch(deleteBrand(selectedIdToDelete));
    setShowConfirm(false);
    setSelectedIdToDelete(null);
  };

  const filteredBrands = Array.isArray(brands)
    ? brands.filter((b) => b.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Bike Brand Management"
        subtitle="Add, edit, update logo images, and remove motorcycle manufacturer brands."
        icon={<Building2 className="w-6 h-6" />}
        badge={`${filteredBrands.length} Brands`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <AdminCard
          title={editId ? "Edit Brand" : "Add New Brand"}
          subtitle="Manage manufacturer details and brand logo."
          className="lg:col-span-1 h-fit"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Brand Name"
              placeholder="e.g., Honda, Yamaha, Hero"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Brand Logo / Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImage(file);
                  if (file) setImagePreview(URL.createObjectURL(file));
                }}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300 hover:file:bg-blue-100 transition-all"
              />
              {errors.image && (
                <span className="text-xs text-rose-500 font-medium mt-1 block">
                  {errors.image}
                </span>
              )}
            </div>

            {imagePreview && (
              <div className="w-24 h-24 rounded-xl border border-gray-200 dark:border-gray-800 p-2 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={loading} className="w-full">
                {editId ? "Update Brand" : "Create Brand"}
              </Button>
              {editId && (
                <Button variant="outline" onClick={resetForm} type="button">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </AdminCard>

        {/* List Grid / Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <AdminSearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brands by name..."
              className="w-full max-w-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading && brands.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm text-gray-500">
                Loading brands...
              </div>
            ) : filteredBrands.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
                No brands match your search.
              </div>
            ) : (
              filteredBrands.map((brand) => (
                <div
                  key={brand._id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4 shadow-xs hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 p-1 flex items-center justify-center shrink-0">
                      {brand.image?.url ? (
                        <img
                          src={brand.image.url}
                          alt={brand.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">
                        {brand.name}
                      </h4>
                      <AdminBadge variant="neutral" className="mt-1">
                        Active Brand
                      </AdminBadge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                      title="Edit Brand"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(brand._id)}
                      className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? All associated models and parts will remain in database."
      />
    </div>
  );
}