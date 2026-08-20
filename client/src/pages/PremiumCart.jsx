import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, ShieldCheck, Truck, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { fetchCart, updateCartItem, removeFromCart, clearError, clearWarnings } from "../store/cart/cartSlice";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function PremiumCart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading, error, warnings } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const items = cart?.items || [];

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || item.part?.price || 0) * Number(item.quantity || 0), 0), [items]);
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  const updateQuantity = (partId, quantity, stock) => {
    const max = Number(stock || 0);
    const next = Math.max(1, Math.min(Number(quantity), max || Number(quantity)));
    if (max <= 0) return toast.error("This item is out of stock");
    dispatch(updateCartItem({ partId, quantity: next })).then((result) => {
      if (updateCartItem.fulfilled.match(result)) dispatch(fetchCart());
      else toast.error(result.payload || "Failed to update quantity");
    });
  };

  const removeItem = (partId) => {
    dispatch(removeFromCart(partId)).then((result) => {
      if (removeFromCart.fulfilled.match(result)) {
        toast.success("Item removed from cart");
        dispatch(fetchCart());
      } else toast.error(result.payload || "Failed to remove item");
    });
  };

  const checkout = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=checkout");
      return;
    }
    navigate("/checkout");
  };

  if (loading && !cart) return <div className="min-h-screen pt-32 grid place-items-center"><div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!items.length) return (
    <div className="min-h-screen bg-[var(--surface-1)] pt-28 pb-20 px-4">
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 text-blue-600 grid place-items-center mb-6"><ShoppingBag className="w-9 h-9" /></div>
        <p className="text-[10px] uppercase tracking-[.2em] text-blue-600 font-bold">Your shopping bag</p>
        <h1 className="text-3xl font-black mt-2">Your cart is empty</h1>
        <p className="text-sm text-[var(--text-muted)] mt-3">Find the right spare part for your vehicle and add it here.</p>
        <Link to="/products" className="inline-flex items-center gap-2 mt-7 h-11 px-6 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">Browse parts <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--surface-1)] text-[var(--text-strong)] pt-24 sm:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-7"><p className="text-[10px] uppercase tracking-[.2em] text-blue-600 font-bold">Shopping cart</p><h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">Your selected parts</h1><p className="text-sm text-[var(--text-muted)] mt-2">{itemCount} item{itemCount === 1 ? "" : "s"} ready for checkout</p></div>

        {warnings?.length > 0 && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3"><AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /><div className="flex-1"><p className="font-bold text-sm text-amber-900">Stock updates</p><ul className="mt-1 text-xs text-amber-800 space-y-1">{warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></div><button onClick={() => dispatch(clearWarnings())} className="text-xs font-semibold text-amber-700">Dismiss</button></div>}

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
          <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface-0)] overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_120px_120px] gap-4 px-6 py-3 border-b border-[var(--line)] text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold"><span>Product</span><span>Quantity</span><span className="text-right">Total</span></div>
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((item, index) => {
                const product = item.part || {};
                const id = product._id || item.partId || item._id;
                const price = Number(item.price || product.price || 0);
                const stock = Number(product.stock ?? item.stock ?? 0);
                const quantity = Number(item.quantity || 1);
                return <motion.div key={id || index} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="p-5 sm:p-6 border-b border-[var(--line)] last:border-b-0">
                  <div className="grid sm:grid-cols-[1fr_120px_120px] gap-4 items-center">
                    <div className="flex gap-4 min-w-0"><Link to={id ? `/products/${id}` : "/products"} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-2 shrink-0 grid place-items-center"><img src={product.images?.[0]?.url || "/images/placeholder.jpg"} alt={item.name || product.name || "Product"} className="w-full h-full object-contain" /></Link><div className="min-w-0 py-1"><Link to={id ? `/products/${id}` : "/products"} className="font-bold text-sm sm:text-base line-clamp-2 hover:text-blue-600">{item.name || product.name || "Product"}</Link><p className="text-xs text-[var(--text-muted)] mt-1">SKU {product.product_id || "—"}</p><p className="font-bold mt-3">{money(price)}</p><button onClick={() => removeItem(id)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /> Remove</button></div></div>
                    <div className="flex items-center justify-between sm:justify-center"><div className="h-10 flex items-center rounded-xl border border-[var(--line)]"><button disabled={quantity <= 1} onClick={() => updateQuantity(id, quantity - 1, stock)} className="w-9 h-full grid place-items-center hover:text-blue-600 disabled:opacity-30"><Minus className="w-3.5 h-3.5" /></button><span className="w-8 text-center text-sm font-bold">{quantity}</span><button disabled={!stock || quantity >= stock} onClick={() => updateQuantity(id, quantity + 1, stock)} className="w-9 h-full grid place-items-center hover:text-blue-600 disabled:opacity-30"><Plus className="w-3.5 h-3.5" /></button></div><span className={`sm:hidden text-[10px] font-bold ${stock > 0 ? "text-emerald-600" : "text-red-500"}`}>{stock > 0 ? "In stock" : "Out of stock"}</span></div>
                    <div className="text-right font-black">{money(price * quantity)}</div>
                  </div>
                </motion.div>;
              })}
            </AnimatePresence>
          </section>

          <aside className="lg:sticky lg:top-28 space-y-4">
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-0)] p-6 shadow-sm"><h2 className="font-extrabold text-lg">Order summary</h2><div className="space-y-3 mt-5 text-sm"><div className="flex justify-between"><span className="text-[var(--text-muted)]">Subtotal</span><span className="font-semibold">{money(subtotal)}</span></div><div className="flex justify-between"><span className="text-[var(--text-muted)]">Shipping</span><span className="font-semibold">{shipping ? money(shipping) : "Free"}</span></div><div className="h-px bg-[var(--line)]" /><div className="flex justify-between text-base"><span className="font-bold">Total</span><span className="font-black text-blue-600">{money(total)}</span></div></div><button onClick={checkout} className="w-full mt-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2">Proceed to Checkout <ArrowRight className="w-4 h-4" /></button><Link to="/products" className="w-full mt-2 h-10 rounded-xl border border-[var(--line)] grid place-items-center text-xs font-semibold hover:border-blue-400">Continue shopping</Link></div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-0)] p-5 space-y-4">{[[Truck,"Fast delivery","Reliable doorstep delivery"],[ShieldCheck,"Secure payments","Protected checkout"],[RotateCcw,"Easy returns","Hassle-free return policy"]].map(([Icon,title,text]) => <div key={title} className="flex gap-3"><span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 grid place-items-center shrink-0"><Icon className="w-4 h-4" /></span><div><p className="text-xs font-bold">{title}</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">{text}</p></div></div>)}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
