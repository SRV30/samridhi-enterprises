import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  adminGetAllOrders,
  adminVerifyPayment,
  adminUpdateOrderStatus,
  clearOrderError,
} from "../../store/order/orderSlice";
import {
  AdminPageHeader,
  AdminCard,
  AdminTable,
  AdminBadge,
  AdminSearchInput,
  AdminModal,
} from "@/components/admin/AdminUI";
import { Button } from "@/components/ui";
import { ClipboardList, Eye, CheckCircle2, XCircle } from "lucide-react";

const STATUS_OPTIONS = [
  "",
  "Pending Verification",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const FULFILLMENT_STATUSES = [
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const getBadgeVariant = (status) => {
  switch (status) {
    case "Success":
    case "Confirmed":
    case "Delivered":
      return "success";
    case "Pending":
    case "Pending Verification":
    case "Processing":
    case "Shipped":
      return "warning";
    case "Failed":
    case "Cancelled":
    case "Rejected":
      return "danger";
    default:
      return "info";
  }
};

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { adminOrders = [], loading, error } = useSelector((state) => state.order);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(adminGetAllOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  const filteredOrders = adminOrders.filter((order) => {
    const matchesStatus = !selectedStatus || order.orderStatus === selectedStatus;
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleVerify = (orderId, action) => {
    if (action === "reject" && !rejectReason.trim()) {
      toast.error("Please enter a reason for rejecting the payment screenshot.");
      return;
    }

    dispatch(
      adminVerifyPayment({
        id: orderId,
        action,
        rejectionReason: action === "reject" ? rejectReason : undefined,
      })
    ).then((res) => {
      if (!res.error) {
        toast.success(`Payment ${action}d successfully`);
        setSelectedOrder(null);
        setShowRejectInput(false);
        setRejectReason("");
      }
    });
  };

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(adminUpdateOrderStatus({ id: orderId, status: newStatus })).then(
      (res) => {
        if (!res.error) {
          toast.success("Order status updated");
          if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
          }
        }
      }
    );
  };

  const columns = [
    { header: "Order ID" },
    { header: "Customer" },
    { header: "Payment" },
    { header: "Order Status" },
    { header: "Total (₹)" },
    { header: "Actions", className: "text-right" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Orders Management"
        subtitle="Review order payments, verify screenshot approvals, and track order fulfillment."
        icon={<ClipboardList className="w-6 h-6" />}
        badge={`${filteredOrders.length} Orders`}
      />

      {/* Filters Bar */}
      <AdminCard className="!p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <AdminSearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID or Customer Name..."
            className="w-full sm:w-80"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </AdminCard>

      {/* Table */}
      <AdminCard title="Customer Orders" subtitle="Complete history of placed orders.">
        <AdminTable
          columns={columns}
          data={filteredOrders}
          loading={loading}
          emptyMessage="No customer orders match criteria."
          renderRow={(order) => (
            <tr key={order._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
              <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#2562EB] dark:text-blue-400">
                #{order._id.slice(-8).toUpperCase()}
              </td>
              <td className="px-4 py-3.5 text-sm">
                <div className="font-bold text-gray-900 dark:text-white">
                  {order.user?.name || order.shippingAddress?.fullName || "Guest Customer"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                </div>
              </td>
              <td className="px-4 py-3.5">
                <div className="space-y-1">
                  <AdminBadge variant={getBadgeVariant(order.paymentStatus)}>
                    {order.paymentStatus}
                  </AdminBadge>
                  <div className="text-xs text-gray-500 font-medium">
                    Method: {order.paymentMethod}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {FULFILLMENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3.5 text-sm font-extrabold text-gray-900 dark:text-white">
                ₹{order.itemsTotal || order.totalAmount}
              </td>
              <td className="px-4 py-3.5 text-right">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowRejectInput(false);
                    setRejectReason("");
                  }}
                  className="!py-1.5 !px-3 !text-xs !gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </Button>
              </td>
            </tr>
          )}
        />
      </AdminCard>

      {/* Details Modal */}
      <AdminModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details #${selectedOrder?._id.slice(-8).toUpperCase()}`}
        maxWidth="max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Address & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-sm">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Shipping Address</h4>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {selectedOrder.shippingAddress?.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedOrder.shippingAddress?.addressLine}, {selectedOrder.shippingAddress?.city}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  📞 {selectedOrder.shippingAddress?.phone}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Payment Info</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Method: <span className="font-semibold text-gray-700 dark:text-gray-200">{selectedOrder.paymentMethod}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status:{" "}
                  <AdminBadge variant={getBadgeVariant(selectedOrder.paymentStatus)}>
                    {selectedOrder.paymentStatus}
                  </AdminBadge>
                </p>
                {selectedOrder.paymentRejectionReason && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                    Rejection Reason: {selectedOrder.paymentRejectionReason}
                  </p>
                )}
              </div>
            </div>

            {/* Verification Screenshot if Online */}
            {selectedOrder.paymentScreenshot?.url && (
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                  Payment Verification Screenshot
                </h4>
                <div className="max-h-60 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <img
                    src={selectedOrder.paymentScreenshot.url}
                    alt="Payment Screenshot"
                    className="max-h-60 object-contain"
                  />
                </div>

                {selectedOrder.paymentStatus === "Pending Verification" && (
                  <div className="pt-2 space-y-2">
                    {!showRejectInput ? (
                      <div className="flex items-center gap-3">
                        <Button
                          variant="primary"
                          onClick={() => handleVerify(selectedOrder._id, "approve")}
                          className="!gap-1 !bg-emerald-600 hover:!bg-emerald-700"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve Payment
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setShowRejectInput(true)}
                          className="!gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject Payment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          className="w-full px-3 py-2 border border-rose-300 dark:border-rose-800 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            variant="danger"
                            onClick={() => handleVerify(selectedOrder._id, "reject")}
                          >
                            Confirm Rejection
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowRejectInput(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Line Items Table */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold uppercase">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-gray-900 dark:text-white">
                          {item.name || item.part?.name || "Product Item"}
                        </td>
                        <td className="p-3">₹{item.price}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3 text-right font-bold">
                          ₹{item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
