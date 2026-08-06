// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IndianRupee,
  ShoppingCart,
  Users,
  AlertTriangle,
  Building2,
  Car,
  Wrench,
  ClipboardList,
  CreditCard,
  PackageSearch,
  UsersRound,
  Tag,
  LifeBuoy,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminGetDashboardAnalytics } from "@/store/order/orderSlice";
import AdminAnalytics from "./AdminAnalytics";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/AdminUI";
import { RecommendationAnalyticsWidget } from "@/components/admin/RecommendationAnalyticsWidget";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const quickLinks = [
  { to: "/admin/orders", label: "Manage Orders", icon: ClipboardList },
  { to: "/admin/brands", label: "Bike Brands", icon: Building2 },
  { to: "/admin/bikes", label: "Bike Models", icon: Car },
  { to: "/admin/parts", label: "Bike Parts", icon: Wrench },
  { to: "/admin/inventory", label: "Inventory", icon: PackageSearch },
  { to: "/admin/customers", label: "Customers", icon: UsersRound },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/support", label: "Support Tickets", icon: LifeBuoy },
  { to: "/admin/payment-settings", label: "Payment Settings", icon: CreditCard },
];

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(adminGetDashboardAnalytics());
  }, [dispatch]);

  const cards = [
    {
      title: "Total Revenue",
      value: formatINR(analytics?.totalRevenue),
      icon: <IndianRupee className="w-6 h-6 text-white" />,
      color: "bg-emerald-600",
    },
    {
      title: "Total Orders",
      value: analytics?.totalOrders ?? 0,
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      color: "bg-blue-600",
    },
    {
      title: "Total Customers",
      value: analytics?.totalCustomers ?? 0,
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-purple-600",
    },
    {
      title: "Low Stock Items",
      value: analytics?.lowStockCount ?? 0,
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
      color: "bg-amber-600",
    },
  ];

  const statusEntries = analytics?.ordersByStatus
    ? Object.entries(analytics.ordersByStatus)
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle="Overview of revenue, order activity, inventory status, and quick management links."
        icon={<LayoutDashboard className="w-6 h-6" />}
        badge="Live Metrics"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`p-5 rounded-xl shadow-sm text-white ${card.color} flex items-center justify-between`}
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                {card.title}
              </span>
              <div className="text-2xl font-black mt-1">
                {loading && !analytics ? "…" : card.value}
              </div>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl">{card.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* Order status breakdown */}
      {statusEntries.length > 0 && (
        <AdminCard title="Orders by Status" subtitle="Current count of orders across lifecycle states.">
          <div className="flex flex-wrap gap-2.5">
            {statusEntries.map(([status, count]) => (
              <AdminBadge key={status} variant="info" className="!text-sm !py-1 !px-3">
                {status}: <span className="font-bold ml-1">{count}</span>
              </AdminBadge>
            ))}
          </div>
        </AdminCard>
      )}

      {/* Out-of-stock alert */}
      {analytics?.outOfStockCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">
            {analytics.outOfStockCount} product
            {analytics.outOfStockCount === 1 ? " is" : "s are"} out of stock and require restocking.
          </span>
        </div>
      )}

      {/* Management Quick Links */}
      <AdminCard title="Quick Management" subtitle="Direct navigation to key admin modules.">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-4 text-center shadow-xs transition-all hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 group"
            >
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{label}</span>
            </Link>
          ))}
        </div>
      </AdminCard>

      <RecommendationAnalyticsWidget analyticsData={{ overall: { impressions: 1420, clicks: 385 }, topRecommended: [{ name: "Brake Disc Pad" }] }} />

      <AdminAnalytics />
    </div>
  );
};

export default AdminDashboard;
