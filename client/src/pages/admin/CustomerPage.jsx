import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { getAllUsers, updateUserRole } from "@/store/auth-slice/user";
import {
  AdminPageHeader,
  AdminCard,
  AdminTable,
  AdminBadge,
  AdminSearchInput,
} from "@/components/admin/AdminUI";

const getStatusVariant = (status) => {
  switch (status) {
    case "Active":
      return "success";
    case "Warning":
      return "warning";
    case "Suspended":
      return "danger";
    default:
      return "neutral";
  }
};

const getRoleVariant = (role) => {
  switch (role) {
    case "ADMIN":
      return "danger";
    case "MANAGER":
      return "info";
    default:
      return "neutral";
  }
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const PAGE_SIZES = [10, 25, 50];

const CustomerPage = () => {
  const dispatch = useDispatch();
  const { users, totalUsers, totalPages, loading, error, user: currentUser } =
    useSelector((state) => state.auth);

  const [savingRoleFor, setSavingRoleFor] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    dispatch(getAllUsers({ page, limit, search: debouncedSearch }));
  }, [dispatch, page, limit, debouncedSearch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const list = users || [];
  const canEditRoles = currentUser?.role === "ADMIN";
  const ROLE_OPTIONS = ["USER", "MANAGER", "ADMIN"];

  const handleRoleChange = async (targetUser, newRole) => {
    if (newRole === targetUser.role) return;

    if (
      currentUser &&
      targetUser._id === currentUser._id &&
      newRole !== "ADMIN"
    ) {
      toast.error("You cannot change your own admin role.");
      return;
    }

    setSavingRoleFor(targetUser._id);
    const res = await dispatch(
      updateUserRole({ email: targetUser.email, role: newRole })
    );
    setSavingRoleFor(null);

    if (updateUserRole.fulfilled.match(res)) {
      toast.success(`${targetUser.name}'s role updated to ${newRole}`);
    } else {
      toast.error(
        res.payload?.message || res.payload?.error || "Failed to update role"
      );
    }
  };

  const activeCount = list.filter((u) => u.status === "Active").length;
  const warningCount = list.filter((u) => u.status === "Warning").length;
  const suspendedCount = list.filter((u) => u.status === "Suspended").length;

  const cards = [
    {
      title: "Total Registered",
      value: totalUsers ?? 0,
      icon: <Users className="w-5 h-5 text-white" />,
      color: "bg-blue-600",
    },
    {
      title: "Active",
      value: activeCount,
      icon: <UserCheck className="w-5 h-5 text-white" />,
      color: "bg-emerald-600",
    },
    {
      title: "Warning",
      value: warningCount,
      icon: <ShieldAlert className="w-5 h-5 text-white" />,
      color: "bg-amber-600",
    },
    {
      title: "Suspended",
      value: suspendedCount,
      icon: <UserX className="w-5 h-5 text-white" />,
      color: "bg-rose-600",
    },
  ];

  const columns = [
    { header: "Customer" },
    { header: "Email" },
    { header: "Registered" },
    { header: "Last Login" },
    { header: "Role", className: "text-center" },
    { header: "Status", className: "text-center" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Customer Directory"
        subtitle="Manage customer accounts, roles, access permissions, and account status."
        icon={<Users className="w-6 h-6" />}
        badge={`${totalUsers || 0} Total`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`p-4 rounded-xl shadow-xs text-white ${card.color} flex items-center justify-between`}
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                {card.title}
              </span>
              <div className="text-2xl font-black mt-1">
                {loading && list.length === 0 ? "…" : card.value}
              </div>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Search Bar & Page Limit */}
      <AdminCard className="!p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <AdminSearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full sm:w-80"
          />
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Customer Table */}
      <AdminCard title="Registered Customers" subtitle="List of users with active accounts.">
        <AdminTable
          columns={columns}
          data={list}
          loading={loading}
          emptyMessage="No customer accounts match criteria."
          renderRow={(user) => (
            <tr key={user._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {(user.name || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {user.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                {user.email}
              </td>
              <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                {formatDate(user.lastLogin)}
              </td>
              <td className="px-4 py-3.5 text-center">
                {canEditRoles ? (
                  <select
                    value={user.role}
                    disabled={savingRoleFor === user._id}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <AdminBadge variant={getRoleVariant(user.role)}>
                    {user.role}
                  </AdminBadge>
                )}
              </td>
              <td className="px-4 py-3.5 text-center">
                <AdminBadge variant={getStatusVariant(user.status)}>
                  {user.status || "Active"}
                </AdminBadge>
              </td>
            </tr>
          )}
        />
      </AdminCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;
