import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ChevronDown, Filter, GitCompare, Heart, PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "react-toastify";
import SEO from "../../components/SEO";
import ProductSkeleton from "../../components/ProductSkeleton";
import { fetchParts, clearPartError } from "../../store/product/partsSlice";
import { addToCompare, removeFromCompare } from "../../store/product/compareSlice";
import { addToWishlist, removeFromWishlist } from "../../store/wishlist/wishlistSlice";
import { fetchBikeModels } from "../../store/product/bikeSlice";

const stockLabel = (stock) => stock > 15 ? "In Stock" : stock > 0 ? "Low Stock" : "Out of Stock";
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const PremiumProductCard = ({ part, compareItems, wishlistItems, isAuthenticated, onCompare, onWishlist }) => {
  const compared = compareItems.some((item) => item._id === part._id);
  const wished = wishlistItems.some((item) => String(item.part?._id || item.part) === String(part._id));
  return (
    <motion.article layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group premium-card overflow-hidden">
      <div className="relative aspect-[1.08/1] bg-[var(--surface-2)] flex items-center justify-center p-4 overflow-hidden">
        <Link to={`/products/${part._id}`} className="absolute inset-0 z-0" aria-label={`View ${part.name}`} />
        <img src={part.images?.[0]?.url || "/images/placeholder.jpg"} alt={part.name} loading="lazy" className="relative z-[1] w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 pointer-events-none" />
        <span className={`absolute left-3 top-3 z-10 rounded-full px-2 py-1 text-[9px] font-extrabold ${part.stock > 15 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : part.stock > 0 ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-red-500/10 text-red-600"}`}>{stockLabel(part.stock)}</span>
        <div className="absolute right-3 top-3 z-10 flex gap-1.5">
          <button type="button" onClick={(e) => onWishlist(e, part)} aria-label="Toggle wishlist" className={`w-8 h-8 rounded-lg border grid place-items-center backdrop-blur-sm ${wished ? "bg-red-50 border-red-200 text-red-500" : "bg-[var(--surface-0)]/90 border-[var(--line)] text-[var(--text-muted)] hover:text-red-500"}`}><Heart className="w-4 h-4" fill={wished ? "currentColor" : "none"} /></button>
          <button type="button" onClick={(e) => onCompare(e, part)} aria-label="Compare product" className={`w-8 h-8 rounded-lg border grid place-items-center backdrop-blur-sm ${compared ? "bg-blue-600 border-blue-600 text-white" : "bg-[var(--surface-0)]/90 border-[var(--line)] text-[var(--text-muted)] hover:text-blue-600"}`}><GitCompare className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="p-4">
        <Link to={`/products/${part._id}`}>
          <span className="text-[9px] font-extrabold uppercase tracking-[.14em] text-blue-600">{part.category || "Spare Part"}</span>
          <h3 className="mt-1 text-sm font-bold leading-5 text-[var(--text-strong)] line-clamp-2 min-h-10 group-hover:text-blue-600 transition-colors">{part.name}</h3>
        </Link>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div><p className="text-lg font-black text-[var(--text-strong)]">{money(part.price)}</p><p className="text-[9px] text-[var(--text-muted)]">ID: {part.product_id}</p></div>
          {part.bestseller && <span className="rounded-full bg-orange-500/10 text-orange-600 px-2 py-1 text-[9px] font-bold">Bestseller</span>}
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--line)] flex items-center justify-between text-[10px] text-[var(--text-muted)]"><span>{part.vehicleCompatibility?.length ? `${part.vehicleCompatibility.length} compatible models` : "Universal fit"}</span><Link to={`/products/${part._id}`} className="font-bold text-blue-600">View details</Link></div>
      </div>
    </motion.article>
  );
};

export default function PremiumProductsPage() {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const { parts = [], loading, error } = useSelector((state) => state.parts);
  const { items: compareItems = [], max: compareMax = 4 } = useSelector((state) => state.compare);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { bikeModels = [] } = useSelector((state) => state.bike);
  const wishlistItems = wishlist?.items || [];

  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [brand, setBrand] = useState(params.get("brand") || "");
  const [year, setYear] = useState("");
  const [engine, setEngine] = useState("");
  const [stock, setStock] = useState("");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { dispatch(fetchParts()); dispatch(fetchBikeModels()); }, [dispatch]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearPartError()); } }, [error, dispatch]);
  useEffect(() => { setSearch(params.get("search") || ""); setCategory(params.get("category") || ""); setBrand(params.get("brand") || ""); }, [params]);
  useEffect(() => { setPage(1); }, [search, category, brand, year, engine, stock, sort, pageSize]);

  const brandOptions = useMemo(() => [...new Set(bikeModels.map((m) => m?.brand?.name).filter((v) => v && v !== "N/A"))].sort(), [bikeModels]);
  const engineOptions = useMemo(() => [...new Set(bikeModels.map((m) => (m?.engineType || "").trim()).filter(Boolean))].sort(), [bikeModels]);
  const yearOptions = useMemo(() => Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i), []);
  const categoryOptions = useMemo(() => [...new Set(parts.map((p) => p.category).filter(Boolean))].sort(), [parts]);

  const modelMap = useMemo(() => Object.fromEntries(bikeModels.filter((m) => m?._id).map((m) => [m._id, m])), [bikeModels]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...parts].filter((part) => {
      const matchesSearch = !q || [part.name, part.product_id, part.category].some((v) => String(v || "").toLowerCase().includes(q));
      const matchesCategory = !category || part.category === category;
      const matchesBrand = !brand && !year && !engine ? true : (part.vehicleCompatibility || []).some((v) => {
        const model = modelMap[v._id || v]; if (!model) return false;
        const okBrand = !brand || model.brand?.name === brand;
        const y = Number(year); const okYear = !year || ((model.yearStart == null || model.yearStart <= y) && (model.yearEnd == null || model.yearEnd >= y));
        const et = String(model.engineType || "").toLowerCase(); const okEngine = !engine || !et || et === engine.toLowerCase();
        return okBrand && okYear && okEngine;
      });
      const matchesStock = !stock || (stock === "in" ? part.stock > 15 : stock === "low" ? part.stock > 0 && part.stock <= 15 : part.stock <= 0);
      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    }).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "newest" ? new Date(b.createdAt) - new Date(a.createdAt) : sort === "stock" ? b.stock - a.stock : (Number(b.viewCount || 0) - Number(a.viewCount || 0)));
  }, [parts, search, category, brand, year, engine, stock, sort, modelMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = [category, brand, year, engine, stock].filter(Boolean).length;

  const toggleCompare = (event, part) => { event.preventDefault(); event.stopPropagation(); if (compareItems.some((p) => p._id === part._id)) dispatch(removeFromCompare(part._id)); else if (compareItems.length >= compareMax) toast.info(`You can compare up to ${compareMax} products`); else dispatch(addToCompare(part)); };
  const toggleWishlist = (event, part) => { event.preventDefault(); event.stopPropagation(); if (!isAuthenticated) return toast.info("Please log in to use your wishlist"); if (wishlistItems.some((i) => String(i.part?._id || i.part) === String(part._id))) dispatch(removeFromWishlist(part._id)); else dispatch(addToWishlist(part._id)); };
  const clearFilters = () => { setSearch(""); setCategory(""); setBrand(""); setYear(""); setEngine(""); setStock(""); setPage(1); };

  return (
    <div className="min-h-screen bg-[var(--surface-1)] pt-24 sm:pt-28 pb-20">
      <SEO title="Products | Samridhi Enterprises" description="Browse genuine motorcycle spare parts by category, vehicle, brand and stock." />
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-7">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
          <div><p className="text-[10px] uppercase tracking-[.2em] font-extrabold text-blue-600 mb-1">Samridhi Enterprises</p><h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-strong)]">Genuine Spare Parts</h1><p className="text-sm text-[var(--text-muted)] mt-2">Find the right part for your vehicle.</p></div>
          <div className="text-xs text-[var(--text-muted)]"><strong className="text-[var(--text-strong)]">{filtered.length}</strong> products available</div>
        </div>

        <div className="premium-card p-3 sm:p-4 mb-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by part name, brand, category or product ID..." className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--line)] bg-[var(--surface-1)] text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface-1)] text-sm font-semibold outline-none"><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="stock">Stock Level</option></select>
            <button onClick={() => setFiltersOpen((v) => !v)} className="h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface-1)] text-sm font-bold inline-flex items-center justify-center gap-2 lg:hidden"><SlidersHorizontal className="w-4 h-4" /> Filters {active > 0 && <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] grid place-items-center">{active}</span>}</button>
          </div>
          <div className={`${filtersOpen ? "grid" : "hidden"} lg:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-3`}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface-1)] text-xs"><option value="">All Categories</option>{categoryOptions.map((v) => <option key={v}>{v}</option>)}</select>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="h-10 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface-1)] text-xs"><option value="">All Brands</option>{brandOptions.map((v) => <option key={v}>{v}</option>)}</select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="h-10 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface-1)] text-xs"><option value="">Vehicle Year</option>{yearOptions.map((v) => <option key={v}>{v}</option>)}</select>
            <select value={engine} onChange={(e) => setEngine(e.target.value)} className="h-10 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface-1)] text-xs"><option value="">Engine Type</option>{engineOptions.map((v) => <option key={v}>{v}</option>)}</select>
            <select value={stock} onChange={(e) => setStock(e.target.value)} className="h-10 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface-1)] text-xs"><option value="">Any Stock</option><option value="in">In Stock</option><option value="low">Low Stock</option><option value="out">Out of Stock</option></select>
          </div>
          {active > 0 && <button onClick={clearFilters} className="mt-3 text-xs font-bold text-blue-600 inline-flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear filters</button>}
        </div>

        {compareItems.length > 0 && <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 px-4 py-3 flex items-center justify-between gap-3"><span className="text-xs font-bold text-blue-700 dark:text-blue-300">{compareItems.length}/{compareMax} products selected for comparison</span><Link to="/compare" className="text-xs font-extrabold text-blue-600">Open Compare</Link></div>}

        {loading && !parts.length ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"><ProductSkeleton count={10} /></div> : visible.length ? <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">{visible.map((part) => <PremiumProductCard key={part._id} part={part} compareItems={compareItems} wishlistItems={wishlistItems} isAuthenticated={isAuthenticated} onCompare={toggleCompare} onWishlist={toggleWishlist} />)}</motion.div> : <div className="premium-card py-20 text-center"><PackageSearch className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" /><h2 className="text-xl font-bold">No products found</h2><p className="text-sm text-[var(--text-muted)] mt-2">Try changing your search or filters.</p><button onClick={clearFilters} className="mt-5 rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-bold">Reset catalogue</button></div>}

        {totalPages > 1 && <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3"><div className="text-xs text-[var(--text-muted)]">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</div><div className="flex items-center gap-1">{Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map((n) => <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-lg text-xs font-bold ${page === n ? "bg-blue-600 text-white" : "border border-[var(--line)] bg-[var(--surface-0)] text-[var(--text-muted)]"}`}>{n}</button>)}</div><select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-9 rounded-lg border border-[var(--line)] bg-[var(--surface-0)] px-2 text-xs"><option value={12}>12 / page</option><option value={24}>24 / page</option><option value={48}>48 / page</option></select></div>}
      </div>
    </div>
  );
}
