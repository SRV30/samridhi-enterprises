import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { ArrowRight, Heart, ShoppingCart, Trash2, ShieldCheck, Truck } from "lucide-react";
import { fetchWishlist, removeFromWishlist, clearWishlistError } from "../../store/wishlist/wishlistSlice";
import { addToCart } from "../../store/cart/cartSlice";
import Loader from "../../extras/Loader";
import SEO from "../../components/SEO";

const stockBadge = (stock) => {
  if (stock > 15) return { label: "In Stock", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
  if (stock > 0) return { label: "Low Stock", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" };
  return { label: "Out of Stock", cls: "bg-red-500/10 text-red-600 dark:text-red-400" };
};
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { wishlist, loading, error } = useSelector((state) => state.wishlist);
  const items = wishlist?.items || [];

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearWishlistError()); } }, [error, dispatch]);

  const handleRemove = (partId) => {
    dispatch(removeFromWishlist(partId)).unwrap().then(() => toast.success("Removed from wishlist")).catch(() => {});
  };
  const handleAddToCart = (part) => {
    if (!part || part.stock <= 0) return;
    dispatch(addToCart({ partId: part._id, quantity: 1 })).unwrap().then(() => toast.success("Added to cart")).catch((msg) => toast.error(msg || "Could not add to cart"));
  };

  if (loading && items.length === 0) return <Loader />;

  return (
    <div className="min-h-screen bg-[var(--surface-1)] pt-24 sm:pt-28 pb-20">
      <SEO title="My Wishlist | Samridhi Enterprises" description="Your saved automotive spare parts." />
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] font-extrabold text-blue-600">Saved for later</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-strong)] mt-1">My Wishlist</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">{items.length} {items.length === 1 ? "part" : "parts"} saved for your next ride.</p>
          </div>
          {items.length > 0 && <Link to="/products" className="text-xs font-bold text-blue-600 inline-flex items-center gap-1">Continue shopping <ArrowRight className="w-3.5 h-3.5" /></Link>}
        </div>

        {items.length === 0 ? (
          <div className="premium-card overflow-hidden">
            <div className="relative px-6 py-16 sm:py-20 text-center bg-[var(--surface-0)]">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 text-blue-600 grid place-items-center mb-5"><Heart className="w-8 h-8" /></div>
              <h2 className="text-2xl font-extrabold text-[var(--text-strong)]">Your wishlist is empty</h2>
              <p className="max-w-md mx-auto mt-2 text-sm leading-6 text-[var(--text-muted)]">Save genuine parts you want to compare, buy later, or keep ready for your next service.</p>
              <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm font-bold transition"><ShoppingCart className="w-4 h-4" /> Browse spare parts</Link>
            </div>
            <div className="grid sm:grid-cols-3 border-t border-[var(--line)]">
              {[[ShieldCheck,"Genuine parts","Quality-focused catalogue"],[Truck,"Reliable delivery","Track your order anytime"],[Heart,"Save favourites","Keep parts ready for later"]].map(([Icon,title,text]) => <div key={title} className="p-5 flex items-center gap-3 border-b sm:border-b-0 sm:border-r last:border-0 border-[var(--line)]"><span className="w-10 h-10 shrink-0 rounded-xl bg-[var(--surface-2)] text-blue-600 grid place-items-center"><Icon className="w-5 h-5" /></span><div><p className="text-xs font-bold">{title}</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">{text}</p></div></div>)}
            </div>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {items.map(({ part }) => part && (
              <motion.article key={part._id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="premium-card group overflow-hidden">
                <div className="relative aspect-square bg-[var(--surface-2)] p-4 flex items-center justify-center">
                  <Link to={`/products/${part._id}`} className="absolute inset-0 z-0" aria-label={`View ${part.name}`} />
                  <img src={part.images?.[0]?.url || "/images/placeholder.jpg"} alt={part.name} loading="lazy" className="relative z-[1] w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 pointer-events-none" />
                  <span className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-[9px] font-extrabold ${stockBadge(part.stock).cls}`}>{stockBadge(part.stock).label}</span>
                  <button onClick={() => handleRemove(part._id)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-[var(--surface-0)]/95 border border-[var(--line)] text-red-500 grid place-items-center hover:bg-red-50" aria-label="Remove from wishlist"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="p-4">
                  <Link to={`/products/${part._id}`}>
                    <span className="text-[9px] uppercase tracking-[.14em] font-extrabold text-blue-600">{part.category || "Spare Part"}</span>
                    <h3 className="mt-1 text-sm font-bold leading-5 text-[var(--text-strong)] line-clamp-2 min-h-10 group-hover:text-blue-600">{part.name}</h3>
                  </Link>
                  <div className="mt-3 flex items-center justify-between gap-2"><span className="text-lg font-black text-[var(--text-strong)]">{money(part.price)}</span><span className="text-[9px] text-[var(--text-muted)]">{part.product_id}</span></div>
                  <button onClick={() => handleAddToCart(part)} disabled={part.stock <= 0} className="mt-3 w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition"><ShoppingCart className="w-4 h-4" />{part.stock > 0 ? "Add to Cart" : "Out of Stock"}</button>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
