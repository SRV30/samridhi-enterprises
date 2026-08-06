import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Percent,
  IndianRupee,
} from "lucide-react";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  clearCouponError,
  clearCouponSuccess,
} from "@/store/order/couponSlice";
import {
  AdminPageHeader,
  AdminCard,
  AdminTable,
  AdminBadge,
  AdminModal,
} from "@/components/admin/AdminUI";
import { Button, Input, Select, Checkbox } from "@/components/ui";

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  expiresAt: "",
  usageLimit: "",
  isActive: true,
};

const statusOf = (c) => {
  if (!c.isActive) return { label: "Inactive", variant: "neutral" };
  if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()) {
    return { label: "Expired", variant: "danger" };
  }
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) {
    return { label: "Used up", variant: "warning" };
  }
  return { label: "Active", variant: "success" };
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "No expiry";

const AdminCoupons = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error, success } = useSelector((s) => s.coupon);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(getAllCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setConfirmDelete(null);
      dispatch(clearCouponSuccess());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearCouponError()), 4000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const stats = useMemo(() => {
    const active = coupons.filter((c) => statusOf(c).label === "Active").length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    return { total: coupons.length, active, totalRedemptions };
  }, [coupons]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({
      code: c.code || "",
      description: c.description || "",
      discountType: c.discountType || "PERCENTAGE",
      discountValue: c.discountValue ?? "",
      minOrderAmount: c.minOrderAmount ?? "",
      maxDiscount: c.maxDiscount ?? "",
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : "",
      usageLimit: c.usageLimit ?? "",
      isActive: c.isActive ?? true,
    });
    setFieldErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = () => {
    setFieldErrors({});
    const code = form.code.trim().toUpperCase();
    const fe = {};
    if (!code) fe.code = "Coupon code is required";

    const discountValue = Number(form.discountValue);
    if (Number.isNaN(discountValue) || discountValue < 0) {
      fe.discountValue = "Discount value must be a non-negative number";
    }
    if (form.discountType === "PERCENTAGE" && discountValue > 100) {
      fe.discountValue = "Percentage discount cannot exceed 100";
    }
    if (Object.keys(fe).length > 0) {
      setFieldErrors(fe);
      return;
    }

    const payload = {
      code,
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue,
      minOrderAmount: form.minOrderAmount === "" ? 0 : Number(form.minOrderAmount),
      maxDiscount: form.maxDiscount === "" ? 0 : Number(form.maxDiscount),
      expiresAt: form.expiresAt || null,
      usageLimit: form.usageLimit === "" ? 0 : Number(form.usageLimit),
      isActive: form.isActive,
    };

    if (editingId) {
      dispatch(updateCoupon({ id: editingId, payload }));
    } else {
      dispatch(createCoupon(payload));
    }
  };

  const columns = [
    { header: "Code" },
    { header: "Discount" },
    { header: "Min Order" },
    { header: "Validity" },
    { header: "Usage" },
    { header: "Status" },
    { header: "Actions", className: "text-right" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Promotions & Coupons"
        subtitle="Manage checkout promotional discount codes, validity dates, and redemption caps."
        icon={<Tag className="w-6 h-6" />}
        badge={`${stats.total} Coupons`}
        actions={
          <Button onClick={openCreate} className="!gap-2">
            <Plus className="w-4 h-4" /> New Coupon
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <AdminCard title="Total Coupons" className="!p-4">
          <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</span>
        </AdminCard>
        <AdminCard title="Active Campaigns" className="!p-4">
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</span>
        </AdminCard>
        <AdminCard title="Total Redemptions" className="!p-4">
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.totalRedemptions}</span>
        </AdminCard>
      </div>

      {/* Table Card */}
      <AdminCard title="All Coupons" subtitle="List of all promotional codes.">
        <AdminTable
          columns={columns}
          data={coupons}
          loading={loading}
          emptyMessage="No promotional coupons found."
          renderRow={(c) => {
            const st = statusOf(c);
            return (
              <tr key={c._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3.5">
                  <span className="font-mono font-bold text-gray-900 dark:text-white text-base">
                    {c.code}
                  </span>
                  {c.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.description}</p>
                  )}
                </td>
                <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  {c.discountType === "PERCENTAGE" && c.maxDiscount > 0 && (
                    <span className="text-xs text-gray-400 font-normal"> (cap ₹{c.maxDiscount})</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                  {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : "—"}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(c.expiresAt)}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {c.usedCount} {c.usageLimit > 0 ? `/ ${c.usageLimit}` : "/ ∞"}
                </td>
                <td className="px-4 py-3.5">
                  <AdminBadge variant={st.variant}>{st.label}</AdminBadge>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                      title="Edit Coupon"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(c)}
                      className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </AdminCard>

      {/* Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Coupon" : "Create Coupon"}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {editingId ? "Save Changes" : "Create Coupon"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Coupon Code"
            name="code"
            value={form.code}
            onChange={(e) => {
              handleChange(e);
              setFieldErrors((prev) => ({ ...prev, code: "" }));
            }}
            placeholder="e.g. SAVE20"
            error={fieldErrors.code}
          />

          <Input
            label="Description (Optional)"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="e.g. 20% off for festival season"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Discount Type"
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              options={[
                { value: "PERCENTAGE", label: "Percentage (%)" },
                { value: "FIXED", label: "Fixed Rupee Amount (₹)" },
              ]}
            />
            <Input
              label={form.discountType === "PERCENTAGE" ? "Value (%)" : "Value (₹)"}
              name="discountValue"
              type="number"
              min="0"
              value={form.discountValue}
              onChange={(e) => {
                handleChange(e);
                setFieldErrors((prev) => ({ ...prev, discountValue: "" }));
              }}
              error={fieldErrors.discountValue}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Order Subtotal (₹)"
              name="minOrderAmount"
              type="number"
              min="0"
              value={form.minOrderAmount}
              onChange={handleChange}
              placeholder="0"
            />
            {form.discountType === "PERCENTAGE" && (
              <Input
                label="Max Discount Cap (₹)"
                name="maxDiscount"
                type="number"
                min="0"
                value={form.maxDiscount}
                onChange={handleChange}
                placeholder="0 = no cap"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry Date"
              name="expiresAt"
              type="date"
              value={form.expiresAt}
              onChange={handleChange}
            />
            <Input
              label="Usage Limit"
              name="usageLimit"
              type="number"
              min="0"
              value={form.usageLimit}
              onChange={handleChange}
              placeholder="0 = unlimited"
            />
          </div>

          <Checkbox
            id="isActive"
            name="isActive"
            label="Active (Available for checkout)"
            checked={form.isActive}
            onChange={handleChange}
          />
        </div>
      </AdminModal>

      {/* Confirm Delete */}
      <AdminModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Coupon"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => dispatch(deleteCoupon(confirmDelete._id))}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete coupon{" "}
          <span className="font-mono font-bold text-gray-900 dark:text-white">
            {confirmDelete?.code}
          </span>
          ? This action cannot be undone.
        </p>
      </AdminModal>
    </div>
  );
};

export default AdminCoupons;
