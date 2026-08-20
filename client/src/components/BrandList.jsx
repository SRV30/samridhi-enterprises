import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "../store/product/brandSlice";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function BrandList() {
  const dispatch = useDispatch();
  const { brands, loading, error } = useSelector((state) => state.brand);
  const scrollRef = useRef(null);
  const [showScroll, setShowScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => { dispatch(fetchBrands()); }, [dispatch]);
  useEffect(() => {
    const update = () => {
      const el = scrollRef.current;
      if (!el) return;
      setShowScroll(el.scrollWidth > el.clientWidth);
      setAtStart(el.scrollLeft <= 0);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5);
    };
    update();
    const el = scrollRef.current;
    el?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => { el?.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [brands]);

  if (loading) return <section className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-7 py-8"><div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></section>;
  if (error) return <section className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-7 py-6 text-sm text-red-500">{error}</section>;

  const sortedBrands = [...brands].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  const scrollBy = (amount) => scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });

  return (
    <section id="top-brands" className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-7 py-8 sm:py-10">
      <div className="flex items-end justify-between mb-4">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-blue-600 mb-1">Trusted compatibility</p><h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-strong)]">Top Brands</h2></div>
        <Link to="/products" className="hidden sm:flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">View All Brands <ArrowRight className="w-3.5 h-3.5" /></Link>
      </div>
      <div className="relative group">
        {showScroll && !atStart && <button onClick={() => scrollBy(-280)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[var(--surface-0)] border border-[var(--line)] shadow-lg grid place-items-center text-[var(--text-strong)]" aria-label="Previous brands"><ChevronLeft className="w-4 h-4" /></button>}
        {showScroll && !atEnd && <button onClick={() => scrollBy(280)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[var(--surface-0)] border border-[var(--line)] shadow-lg grid place-items-center text-[var(--text-strong)]" aria-label="Next brands"><ChevronRight className="w-4 h-4" /></button>}
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar snap-x">
          {sortedBrands.map((brand) => <Link key={brand._id} to={`/products?brand=${encodeURIComponent(brand.name)}`} className="snap-start shrink-0 w-[140px] sm:w-[160px]"><motion.div whileHover={{ y: -2 }} className="premium-card h-24 sm:h-28 px-4 flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors"><div className="h-12 w-24 flex items-center justify-center"><img src={brand.images?.[0]?.url} alt={brand.name} className="max-h-12 max-w-full object-contain" loading="lazy" /></div><span className="text-[11px] font-bold text-[var(--text-strong)] uppercase tracking-wide">{brand.name}</span></motion.div></Link>)}
        </div>
      </div>
    </section>
  );
}
