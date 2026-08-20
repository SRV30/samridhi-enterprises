import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ChevronRight, Download, Package, RefreshCw, Search, Truck, X } from "lucide-react";
import { toast } from "react-toastify";
import { getMyOrders, cancelMyOrder, clearOrderError } from "../../store/order/orderSlice";
import Loader from "../../extras/Loader";
import ConfirmationModal from "../../extras/ConfirmationModal";
import { generateOrderInvoicePDF } from "../../utils/invoicePDFGenerator.js";

const stages = ["Confirmed", "Processing", "Shipped", "Delivered"];
const cancellable = ["Pending Verification", "Confirmed"];
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const date = (value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const statusClass = (status) => ({ Delivered: "bg-emerald-500/10 text-emerald-600", Confirmed: "bg-blue-500/10 text-blue-600", Processing: "bg-amber-500/10 text-amber-600", Shipped: "bg-violet-500/10 text-violet-600", "Pending Verification": "bg-amber-500/10 text-amber-600", Cancelled: "bg-red-500/10 text-red-600" }[status] || "bg-slate-500/10 text-[var(--text-muted)]");

function Tracker({ status }) {
  const current = stages.indexOf(status);
  if (current < 0) return null;
  return <div className="flex items-center w-full mt-5 mb-2">{stages.map((stage, index) => <div key={stage} className="flex items-center flex-1 last:flex-none"><div className="flex flex-col items-center min-w-16"><span className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold ${index <= current ? "bg-blue-600 text-white" : "bg-[var(--surface-2)] text-[var(--text-muted)]"}`}>{index <= current ? <Check className="w-4 h-4" /> : index + 1}</span><span className={`mt-1.5 text-[9px] sm:text-[10px] font-semibold ${index <= current ? "text-blue-600" : "text-[var(--text-muted)]"}`}>{stage}</span></div>{index < stages.length - 1 && <div className={`h-1 flex-1 rounded-full mx-1 ${index < current ? "bg-blue-600" : "bg-[var(--surface-2)]"}`} />}</div>)}</div>;
}

export default function PremiumOrderHistory() {
  const dispatch = useDispatch();
  const { myOrders = [], loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => { dispatch(getMyOrders()); }, [dispatch]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearOrderError()); } }, [error, dispatch]);

  const counts = useMemo(() => ({ All: myOrders.length, Confirmed: myOrders.filter((o) => o.orderStatus === "Confirmed").length, Processing: myOrders.filter((o) => o.orderStatus === "Processing").length, Shipped: myOrders.filter((o) => o.orderStatus === "Shipped").length, Delivered: myOrders.filter((o) => o.orderStatus === "Delivered").length, Cancelled: myOrders.filter((o) => o.orderStatus === "Cancelled").length }), [myOrders]);
  const filtered = useMemo(() => myOrders.filter((order) => { const q = query.toLowerCase().trim(); const matchesQuery = !q || String(order._id).toLowerCase().includes(q) || (order.items || []).some((item) => String(item.name || "").toLowerCase().includes(q)); const matchesStatus = filter === "All" || order.orderStatus === filter; return matchesQuery && matchesStatus; }), [myOrders, query, filter]);

  const cancel = () => { if (!cancelTarget) return; const id = cancelTarget._id; setCancelTarget(null); setCancelling(id); dispatch(cancelMyOrder(id)).unwrap().then(() => toast.success("Order cancelled successfully")).catch(() => {}).finally(() => setCancelling(null)); };
  const invoice = (order) => { try { generateOrderInvoicePDF(order, user); } catch { toast.error("Unable to generate invoice"); } };

  if (loading) return <div className="min-h-screen pt-32"><Loader /></div>;
  if (!myOrders.length) return <div className="min-h-screen bg-[var(--surface-1)] pt-28 pb-20 px-4"><div className="max-w-xl mx-auto premium-card p-10 text-center"><Package className="w-12 h-12 mx-auto text-blue-600 mb-4" /><h1 className="text-2xl font-black">No orders yet</h1><p className="text-sm text-[var(--text-muted)] mt-2">Your orders will appear here after you complete a purchase.</p><Link to="/products" className="inline-flex mt-6 rounded-xl bg-blue-600 text-white px-6 py-3 text-sm font-bold">Browse Products</Link></div></div>;

  return <div className="min-h-screen bg-[var(--surface-1)] pt-24 sm:pt-28 pb-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7"><div><p className="text-[10px] uppercase tracking-[.2em] text-blue-600 font-extrabold">Account</p><h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Orders</h1><p className="text-sm text-[var(--text-muted)] mt-2">Track, manage and download receipts for your purchases.</p></div><Link to="/products" className="text-sm font-bold text-blue-600">Continue shopping <ChevronRight className="inline w-4 h-4" /></Link></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">{[["Total",counts.All,"bg-blue-500/10 text-blue-600"],["Processing",counts.Processing,"bg-amber-500/10 text-amber-600"],["Shipped",counts.Shipped,"bg-violet-500/10 text-violet-600"],["Delivered",counts.Delivered,"bg-emerald-500/10 text-emerald-600"]].map(([label,value,style]) => <div key={label} className="premium-card p-4"><span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</span><strong className={`mt-2 inline-flex min-w-9 h-9 px-2 rounded-xl items-center justify-center text-lg ${style}`}>{value}</strong></div>)}</div>
      <div className="premium-card p-3 mb-5 flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order ID or product..." className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--line)] bg-[var(--surface-1)] text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div><div className="flex gap-1 overflow-x-auto">{["All","Confirmed","Processing","Shipped","Delivered","Cancelled"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 h-11 px-3 rounded-xl text-xs font-bold ${filter === item ? "bg-blue-600 text-white" : "bg-[var(--surface-2)] text-[var(--text-muted)]"}`}>{item} <span className="opacity-70">{counts[item]}</span></button>)}</div></div>
      <div className="space-y-4">{filtered.map((order) => { const canCancel = cancellable.includes(order.orderStatus); const address = order.shippingAddress || {}; return <motion.article key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card overflow-hidden"><div className="p-5 sm:p-6"><div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"><div><p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Order placed {date(order.createdAt)}</p><h2 className="font-mono text-xs sm:text-sm font-bold mt-1 break-all">#{order._id}</h2></div><div className="flex flex-wrap items-center gap-2"><span className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${statusClass(order.orderStatus)}`}>{order.orderStatus}</span><span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[var(--surface-2)] text-[var(--text-muted)]">{order.paymentMethod}</span><strong className="text-lg">{money(order.itemsTotal)}</strong></div></div>
          {order.orderStatus !== "Cancelled" && order.orderStatus !== "Pending Verification" && <Tracker status={order.orderStatus} />}
          {(order.carrier || order.trackingNumber) && <div className="mt-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">Shipment tracking</p><p className="text-sm font-semibold mt-1">{order.carrier || "Carrier"} · <span className="font-mono">{order.trackingNumber || "Pending"}</span></p></div>{order.trackingNumber && <a href={`https://www.google.com/search?q=${encodeURIComponent(`${order.carrier || "courier"} tracking ${order.trackingNumber}`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold"><Truck className="w-4 h-4" /> Track</a>}</div>}
          <div className="mt-5 grid sm:grid-cols-[1fr_auto] gap-4"><div className="flex gap-3 overflow-x-auto">{(order.items || []).slice(0, 4).map((item, index) => <Link key={item._id || index} to={item.part?._id ? `/products/${item.part._id}` : "/products"} className="w-20 shrink-0"><div className="w-20 h-20 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] overflow-hidden grid place-items-center"><img src={item.image || item.part?.images?.[0]?.url || "/images/placeholder.jpg"} alt={item.name} className="w-full h-full object-contain" /></div><span className="block text-[9px] font-semibold mt-1 line-clamp-2">{item.name}</span></Link>)}</div><div className="text-xs text-[var(--text-muted)] sm:text-right"><p>Deliver to <strong className="text-[var(--text-strong)]">{address.city || "—"}</strong></p><p className="mt-1">{(order.items || []).length} item{order.items?.length === 1 ? "" : "s"}</p></div></div>
          <div className="mt-5 pt-4 border-t border-[var(--line)] flex flex-wrap gap-2"><button onClick={() => invoice(order)} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[var(--line)] text-xs font-bold hover:border-blue-500"><Download className="w-4 h-4" /> Invoice</button>{canCancel && <button disabled={cancelling === order._id} onClick={() => setCancelTarget(order)} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-red-200 text-red-500 text-xs font-bold disabled:opacity-50"><X className="w-4 h-4" /> {cancelling === order._id ? "Cancelling..." : "Cancel Order"}</button>}<button onClick={() => dispatch(getMyOrders())} className="ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[var(--surface-2)] text-xs font-bold"><RefreshCw className="w-4 h-4" /> Refresh</button></div></div></motion.article>; })}</div>
      {!filtered.length && <div className="premium-card p-12 text-center"><Package className="w-10 h-10 mx-auto text-[var(--text-muted)]" /><h2 className="font-bold mt-3">No matching orders</h2><p className="text-sm text-[var(--text-muted)] mt-1">Try another status or search term.</p></div>}
    </div>
    {cancelTarget && <ConfirmationModal isOpen={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} onConfirm={cancel} title="Cancel order?" message={`Are you sure you want to cancel order #${cancelTarget._id}?`} />}
  </div>;
}
