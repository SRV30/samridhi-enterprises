import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchParts } from "../../store/product/partsSlice";
import { Link } from "react-router-dom";
import { ArrowRight, PackageSearch } from "lucide-react";
import { motion } from "framer-motion";

const CategoryRows = () => {
  const dispatch = useDispatch();
  const { parts = [], loading } = useSelector((state) => state.parts);
  useEffect(() => { dispatch(fetchParts()); }, [dispatch]);

  const categories = useMemo(() => {
    const counts = parts.reduce((map, part) => { if (part.category) map[part.category] = (map[part.category] || 0) + 1; return map; }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [parts]);
  const featured = useMemo(() => [...parts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 8), [parts]);

  if (loading && !parts.length) return <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-7 py-10"><div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />)}</div></div>;

  return <section className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-7 pb-24">
    <div className="flex items-end justify-between mb-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-blue-600 mb-1">Vehicle-first discovery</p><h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-strong)]">Shop by Category</h2></div><Link to="/products" className="flex items-center gap-1 text-xs font-bold text-blue-600">View All <ArrowRight className="w-3.5 h-3.5" /></Link></div>
    {categories.length ? <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10">{categories.map(([category, count]) => <Link key={category} to={`/products?category=${encodeURIComponent(category)}`}><motion.div whileHover={{ y: -2 }} transition={{ duration: .18 }} className="premium-card h-24 p-3 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors"><div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center mb-1.5"><PackageSearch className="w-5 h-5" /></div><span className="text-[11px] font-bold text-[var(--text-strong)] line-clamp-1">{category}</span><span className="text-[9px] text-[var(--text-muted)] mt-0.5">{count} products</span></motion.div></Link>)}</div> : <div className="premium-card p-8 text-center text-sm text-[var(--text-muted)] mb-10">No categories available yet.</div>}
    {featured.length > 0 && <div><div className="flex items-end justify-between mb-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-blue-600 mb-1">Popular from the catalogue</p><h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-strong)]">Featured Products</h2></div><Link to="/products" className="flex items-center gap-1 text-xs font-bold text-blue-600">View All Products <ArrowRight className="w-3.5 h-3.5" /></Link></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">{featured.slice(0, 5).map((part) => <Link key={part._id} to={`/products/${part._id}`} className="group premium-card overflow-hidden hover:-translate-y-0.5 transition-transform"><div className="relative aspect-square bg-[var(--surface-1)] p-3 flex items-center justify-center overflow-hidden">{part.images?.[0]?.url ? <img src={part.images[0].url} alt={part.name} loading="lazy" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" /> : <span className="text-xs text-[var(--text-muted)]">No image available</span>}{part.stock > 0 && <span className="absolute left-2 top-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 text-[9px] font-bold">In Stock</span>}</div><div className="p-3"><span className="text-[9px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{part.category || "Spare Part"}</span><h3 className="mt-1 text-xs sm:text-sm font-bold text-[var(--text-strong)] line-clamp-2 min-h-9">{part.name}</h3><div className="mt-2 flex items-center justify-between"><span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">₹{Number(part.price || 0).toLocaleString("en-IN")}</span><span className="w-8 h-8 rounded-lg bg-blue-600 text-white grid place-items-center text-xs">+</span></div></div></Link>)}</div>
    </div>}
  </section>;
};
export default CategoryRows;
