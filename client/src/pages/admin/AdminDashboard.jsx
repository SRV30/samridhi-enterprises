import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IndianRupee, ShoppingCart, Users, AlertTriangle, Building2, Car, Wrench, ClipboardList, CreditCard, PackageSearch, UsersRound, Tag, LifeBuoy, LayoutDashboard, ArrowUpRight, Boxes, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { adminGetDashboardAnalytics } from "@/store/order/orderSlice";
import AdminAnalytics from "./AdminAnalytics";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/AdminUI";

const formatINR = (n) => new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(n || 0);
const quickLinks = [
 ["/admin/orders","Orders",ClipboardList], ["/admin/brands","Bike Brands",Building2], ["/admin/bikes","Bike Models",Car], ["/admin/parts","Parts",Wrench], ["/admin/inventory","Inventory",PackageSearch], ["/admin/customers","Customers",UsersRound], ["/admin/coupons","Coupons",Tag], ["/admin/support","Support",LifeBuoy], ["/admin/payment-settings","Payments",CreditCard]
];
const statMeta = [["Total Revenue", "totalRevenue", IndianRupee, "emerald"],["Total Orders","totalOrders",ShoppingCart,"blue"],["Total Customers","totalCustomers",Users,"violet"],["Low Stock Items","lowStockCount",AlertTriangle,"amber"]];
const tone = { emerald:"text-emerald-600 bg-emerald-500/10", blue:"text-blue-600 bg-blue-500/10", violet:"text-violet-600 bg-violet-500/10", amber:"text-amber-600 bg-amber-500/10" };

export default function AdminDashboard(){
 const dispatch=useDispatch(); const {analytics,loading}=useSelector(s=>s.order);
 useEffect(()=>{dispatch(adminGetDashboardAnalytics())},[dispatch]);
 const statuses=analytics?.ordersByStatus?Object.entries(analytics.ordersByStatus):[];
 const totalStatus=statuses.reduce((n,[,v])=>n+Number(v||0),0);
 return <div className="min-h-screen bg-[var(--surface-1)] p-3 sm:p-5 lg:p-7"><div className="max-w-[1500px] mx-auto space-y-5">
  <AdminPageHeader title="Operations Dashboard" subtitle="A real-time command center for Samridhi Enterprises." icon={<LayoutDashboard className="w-6 h-6"/>} badge="Live"/>
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">{statMeta.map(([title,key,Icon,t],i)=><motion.div key={key} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*.06}} className="premium-card p-4 sm:p-5"><div className="flex items-start justify-between gap-2"><div><p className="text-[9px] uppercase tracking-[.16em] font-extrabold text-[var(--text-muted)]">{title}</p><p className="text-xl sm:text-2xl font-black mt-2">{loading&&!analytics?"…":key==="totalRevenue"?formatINR(analytics?.[key]):analytics?.[key]??0}</p></div><span className={`w-9 h-9 rounded-xl grid place-items-center ${tone[t]}`}><Icon className="w-4 h-4"/></span></div></motion.div>)}</div>
  <div className="grid xl:grid-cols-[1.5fr_1fr] gap-5">
   <AdminCard title="Order pipeline" subtitle="Current orders by lifecycle status."><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{statuses.map(([status,count])=>{const pct=totalStatus?Math.round(Number(count)/totalStatus*100):0;return <div key={status} className="rounded-xl bg-[var(--surface-2)] p-4"><div className="flex justify-between items-center gap-2"><span className="text-xs font-bold capitalize truncate">{status.replace(/_/g," ")}</span><Clock3 className="w-3.5 h-3.5 text-[var(--text-muted)]"/></div><p className="text-xl font-black mt-2">{count}</p><div className="mt-3 h-1.5 rounded-full bg-[var(--line)] overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{width:`${pct}%`}}/></div><p className="text-[9px] text-[var(--text-muted)] mt-1">{pct}% of orders</p></div>})}</div></AdminCard>
   <AdminCard title="Inventory health" subtitle="Restocking signals that need attention."><div className="space-y-3"><div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 flex justify-between items-center"><div><p className="text-xs font-bold">Low stock</p><p className="text-[10px] text-[var(--text-muted)] mt-1">Items below threshold</p></div><strong className="text-xl text-amber-600">{analytics?.lowStockCount??0}</strong></div><div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex justify-between items-center"><div><p className="text-xs font-bold">Out of stock</p><p className="text-[10px] text-[var(--text-muted)] mt-1">Products unavailable</p></div><strong className="text-xl text-red-600">{analytics?.outOfStockCount??0}</strong></div><Link to="/admin/inventory" className="w-full h-10 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2">Open inventory <ArrowUpRight className="w-3.5 h-3.5"/></Link></div></AdminCard>
  </div>
  <AdminCard title="Quick management" subtitle="Jump directly into the operational modules."><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">{quickLinks.map(([to,label,Icon])=><Link key={to} to={to} className="group rounded-xl border border-[var(--line)] bg-[var(--surface-0)] p-3 hover:border-blue-500 hover:-translate-y-0.5 transition"><Icon className="w-4 h-4 text-blue-600"/><p className="text-[10px] font-bold mt-3 leading-4">{label}</p><span className="text-[9px] text-[var(--text-muted)] group-hover:text-blue-600">Open</span></Link>)}</div></AdminCard>
  {analytics?.outOfStockCount>0&&<div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-center gap-3 text-red-600"><AlertTriangle className="w-5 h-5 shrink-0"/><p className="text-xs font-semibold">{analytics.outOfStockCount} product{analytics.outOfStockCount===1?" is":"s are"} currently out of stock.</p></div>}
  <AdminAnalytics/>
 </div></div>
}
