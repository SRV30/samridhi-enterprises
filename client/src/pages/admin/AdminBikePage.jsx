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
import ConfirmationModal from "../../extras/ConfirmationModal";
import {
  AdminPageHeader,
  AdminCard,
  AdminTable,
  AdminBadge,
  AdminSearchInput,
} from "@/components/admin/AdminUI";
import { Button, Input, Select } from "@/components/ui";
import { Car, Edit2, Trash2, Image as ImageIcon } from "lucide-react";

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
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [engineType, setEngineType] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  useEffect(() => {
    dispatch(fetchBikeModels());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Operation successful!");
      dispatch(clearSuccess());
      resetForm();
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const fieldErrors = {};
    if (!name.trim()) fieldErrors.name = "Model name is required";
    if (!brandId) fieldErrors.brandId = "Brand is required";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("brand", brandId);
    if (yearStart) formData.append("yearStart", yearStart);
    if (yearEnd) formData.append("yearEnd", yearEnd);
    if (engineType) formData.append("engineType", engineType);

    if (editId) {
      if (image) formData.append("image", image);
      dispatch(updateBikeModel({ id: editId, updatedData: formData }));
    } else {
      if (image) formData.append("image", image);
      dispatch(addBikeModel(formData));
    }
  };

  const resetForm = () => {
    setName("");
    setBrandId("");
    setYearStart("");
    setYearEnd("");
    setEngineType("");
    setImage(null);
    setEditId(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleEdit = (model) => {
    setEditId(model._id);
    setName(model.name);
    setBrandId(model.brand?._id || model.brand || "");
    setYearStart(model.yearStart || "");
    setYearEnd(model.yearEnd || "");
    setEngineType(model.engineType || "");
    setImagePreview(model.image?.url || null);
    setImage(null);
  };

  const confirmDelete = (id) => {
    setSelectedIdToDelete(id);
    setShowConfirm(true);
  };

  const handleDelete = () => {
    dispatch(deleteBikeModel(selectedIdToDelete));
    setShowConfirm(false);
    setSelectedIdToDelete(null);
  };

  const filteredModels = bikeModels.filter((m) => {
    const matchesSearch = m.name?.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = !brandFilter || (m.brand?._id || m.brand) === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const columns = [
    { header: "Model Details" },
    { header: "Brand" },
    { header: "Compatibility" },
    { header: "Actions", className: "text-right" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Bike Models Management"
        subtitle="Configure bike models, brand associations, production year ranges, and engine types."
        icon={<Car className="w-6 h-6" />}
        badge={`${filteredModels.length} Models`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <AdminCard
          title={editId ? "Edit Bike Model" : "Add New Bike Model"}
          subtitle="Define model attributes and compatible spec ranges."
          className="lg:col-span-1 h-fit"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Model Name"
              placeholder="e.g., Splendor Plus, CB Shine, Pulsar 150"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <Select
              label="Parent Brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              options={[
                { value: "", label: "-- Select Brand --" },
                ...brands.map((b) => ({ value: b._id, label: b.name })),
              ]}
              error={errors.brandId}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Year Start"
                type="number"
                placeholder="2015"
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value)}
              />
              <Input
                label="Year End"
                type="number"
                placeholder="2024"
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value)}
              />
            </div>

            <Input
              label="Engine Displacement"
              placeholder="e.g., 125cc, 150cc"
              value={engineType}
              onChange={(e) => setEngineType(e.target.value)}
            />

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Model Image
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
                {editId ? "Update Model" : "Create Model"}
              </Button>
              {editId && (
                <Button variant="outline" onClick={resetForm} type="button">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </AdminCard>

        {/* Table Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <AdminSearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bike models..."
              className="w-full sm:w-64"
            />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <AdminTable
            columns={columns}
            data={filteredModels}
            loading={loading}
            emptyMessage="No bike models match criteria."
            renderRow={(model) => (
              <tr
                key={model._id}
                className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 p-1 flex items-center justify-center shrink-0">
                      {model.image?.url ? (
                        <img
                          src={model.image.url}
                          alt={model.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      {model.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <AdminBadge variant="neutral">
                    {model.brand?.name || "Unassigned"}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-600 dark:text-gray-300">
                  {model.yearStart || model.yearEnd ? (
                    <div>
                      Years: {model.yearStart || "Any"} - {model.yearEnd || "Present"}
                    </div>
                  ) : (
                    <div>Years: All</div>
                  )}
                  {model.engineType && (
                    <div className="text-gray-400 font-medium">
                      Engine: {model.engineType}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(model)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                      title="Edit Model"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(model._id)}
                      className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      title="Delete Model"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Bike Model"
        message="Are you sure you want to delete this model? Associated parts compatibility records may be affected."
      />
    </div>
  );
}
