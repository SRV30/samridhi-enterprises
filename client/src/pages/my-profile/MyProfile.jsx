import { useEffect } from "react";
import { User, ShoppingBag, Lock, MapPin, Pencil, ShieldCheck } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleDetail } from "@/store/auth-slice/user";
import MetaData from "../../extras/MetaData";
import Loader from "../../extras/Loader";

const MyProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  useEffect(() => { dispatch(getSingleDetail()); }, [dispatch]);

  if (loading && !user) return <Loader />;
  const fields = [["Full name", user?.name], ["Email", user?.email], ["Mobile", user?.mobile]];
  const nav = [["Profile Info", "/my-profile", User], ["My Orders", "/my-orders", ShoppingBag], ["Saved Addresses", "/my-addresses", MapPin], ["Update Password", "/update-password", Lock], ["Update Profile", "/update-profile", Pencil]];

  return <div className="min-h-screen bg-[var(--surface-1)] pt-24 sm:pt-28 pb-20"><MetaData title="My Profile | Samridhi Enterprises" /><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    {user?.hasWeakPassword && <div className="mb-5 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-sm font-bold text-amber-800 dark:text-amber-300">Security recommendation</p><p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">Update your password to keep your account secure.</p></div><Link to="/update-password" className="rounded-xl bg-amber-600 text-white px-4 py-2 text-xs font-bold text-center">Update password</Link></div>}
    <div className="mb-7"><p className="text-[10px] uppercase tracking-[.2em] font-extrabold text-blue-600">Customer account</p><h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">My Account</h1><p className="text-sm text-[var(--text-muted)] mt-2">Manage your profile, orders and delivery preferences.</p></div>
    <div className="grid lg:grid-cols-[280px_1fr] gap-5">
      <aside className="premium-card p-5 h-fit"><div className="flex items-center gap-3 pb-5 border-b border-[var(--line)]"><div className="w-14 h-14 rounded-2xl overflow-hidden bg-blue-600/10 border border-[var(--line)] grid place-items-center"><img src={user?.avatar || "https://placehold.co/150x150"} alt="Profile" className="w-full h-full object-cover" /></div><div className="min-w-0"><p className="font-extrabold truncate">{user?.name || "Customer"}</p><p className="text-xs text-[var(--text-muted)] truncate">{user?.email || ""}</p></div></div><nav className="mt-4 space-y-1">{nav.map(([label,to,Icon]) => <NavLink key={to} to={to} className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive ? "bg-blue-600 text-white" : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-strong)]"}`}><Icon className="w-4 h-4" />{label}</NavLink>)}</nav></aside>
      <section className="space-y-5"><div className="premium-card p-5 sm:p-7"><div className="flex items-center justify-between mb-5"><div><h2 className="text-xl font-extrabold">Profile information</h2><p className="text-xs text-[var(--text-muted)] mt-1">Your account details</p></div><Link to="/update-profile" className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-bold hover:bg-[var(--surface-2)]"><Pencil className="w-3.5 h-3.5" /> Edit</Link></div><div className="grid sm:grid-cols-2 gap-3">{fields.map(([label,value]) => <div key={label} className="rounded-xl bg-[var(--surface-2)] p-4"><p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">{label}</p><p className="mt-1.5 text-sm font-semibold break-words">{value || "Not provided"}</p></div>)}</div></div>
      <div className="grid sm:grid-cols-3 gap-3"><Link to="/my-orders" className="premium-card p-4 hover:border-blue-500 transition"><ShoppingBag className="w-5 h-5 text-blue-600 mb-3" /><p className="text-sm font-bold">My Orders</p><p className="text-[10px] text-[var(--text-muted)] mt-1">Track purchases</p></Link><Link to="/my-addresses" className="premium-card p-4 hover:border-blue-500 transition"><MapPin className="w-5 h-5 text-blue-600 mb-3" /><p className="text-sm font-bold">Saved Addresses</p><p className="text-[10px] text-[var(--text-muted)] mt-1">Manage delivery</p></Link><Link to="/update-password" className="premium-card p-4 hover:border-blue-500 transition"><ShieldCheck className="w-5 h-5 text-blue-600 mb-3" /><p className="text-sm font-bold">Account Security</p><p className="text-[10px] text-[var(--text-muted)] mt-1">Protect your account</p></Link></div></section>
    </div>
  </div></div>;
};
export default MyProfile;
