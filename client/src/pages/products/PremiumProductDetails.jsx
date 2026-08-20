import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  ZoomIn,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import SEO from "../../components/SEO";
import {
  fetchPartById,
  fetchSimilarParts,
  fetchFrequentlyBoughtTogether,
  fetchRecommendedForYou,
  trackRecommendationImpressions,
  trackRecommendationClick,
  createOrUpdateReview,
  deleteReview,
  clearPartError,
  clearPartSuccess,
} from "../../store/product/partsSlice";
import { addToCart } from "../../store/cart/cartSlice";
import { addToWishlist, removeFromWishlist } from "../../store/wishlist/wishlistSlice";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function ProductCard({ product, onClick }) {
  if (!product?._id) return null;
  return (
    <Link
      to={`/products/${product._id}`}
      onClick={() => onClick?.(product._id)}
      className="group block min-w-[190px] sm:min-w-[220px]"
    >
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-0)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200">
        <div className="h-40 sm:h-44 bg-[var(--surface-2)] p-4 flex items-center justify-center">
          <img
            src={product.images?.[0]?.url || "/images/placeholder.jpg"}
            alt={product.name || "Product"}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{product.category || "Spare Part"}</p>
          <h3 className="font-semibold text-sm text-[var(--text-strong)] line-clamp-2 min-h-10 group-hover:text-blue-600">{product.name}</h3>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="font-bold text-[var(--text-strong)]">{money(product.price)}</span>
            <span className={`text-[10px] font-semibold ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PremiumProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { part, loading, error, parts, similarParts, fbtParts, recommendedParts } = useSelector((state) => state.parts);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.wishlist);
  const wishlistItems = wishlist?.items || [];
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    dispatch(fetchPartById(id));
    dispatch(fetchSimilarParts(id));
    dispatch(fetchFrequentlyBoughtTogether(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchRecommendedForYou());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPartError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (!part || !isAuthenticated || !user?._id) return;
    const existing = (part.reviews || []).find((review) => String(review.user?._id || review.user) === String(user._id));
    setRating(existing?.rating || 0);
    setComment(existing?.comment || "");
  }, [part, isAuthenticated, user]);

  const frequentlyBought = fbtParts?.length ? fbtParts : (parts || []).filter((p) => p._id !== part?._id && p.category === part?.category).slice(0, 6);
  const recommended = recommendedParts?.length ? recommendedParts : (parts || []).filter((p) => p._id !== part?._id && p.category !== part?.category).slice(0, 6);
  const similar = similarParts?.length ? similarParts : [];

  useEffect(() => {
    const ids = [...new Set([...similar, ...frequentlyBought, ...recommended].map((p) => p?._id).filter(Boolean))];
    if (part?._id && ids.length) dispatch(trackRecommendationImpressions(ids));
  }, [dispatch, part?._id, similarParts, fbtParts, recommendedParts]);

  const images = useMemo(() => {
    const urls = (part?.images || []).map((image) => image?.url).filter(Boolean);
    return urls.length ? urls : ["/images/placeholder.jpg"];
  }, [part]);

  const inWishlist = part?._id && wishlistItems.some((item) => String(item.part?._id || item.part) === String(part._id));
  const maxQuantity = Math.max(0, Math.min(Number(part?.stock || 0), 10));
  const stockLabel = !part?.stock ? "Out of Stock" : part.stock <= 5 ? "Only few left" : part.stock <= 15 ? "Limited Stock" : "In Stock";

  const changeQuantity = (delta) => {
    setQuantity((current) => Math.max(1, Math.min(maxQuantity || 1, Number(current || 1) + delta)));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to cart");
      navigate(`/login?redirect=products/${id}`);
      return;
    }
    if (!part?.stock) return toast.error("This product is out of stock");
    dispatch(addToCart({ partId: part._id, name: part.name, price: part.price, quantity })).then((result) => {
      if (!result?.error) toast.success(`${part.name} added to cart`);
    });
  };

  const toggleWishlist = () => {
    if (!isAuthenticated) return toast.info("Please log in to use your wishlist");
    dispatch(inWishlist ? removeFromWishlist(part._id) : addToWishlist(part._id));
  };

  const submitReview = (event) => {
    event.preventDefault();
    if (!isAuthenticated) return navigate(`/login?redirect=products/${id}`);
    if (!rating) return toast.error("Please select a rating");
    if (!comment.trim()) return toast.error("Please enter a review");
    if (comment.trim().length > 500) return toast.error("Review cannot exceed 500 characters");
    dispatch(createOrUpdateReview({ partId: id, rating, comment: comment.trim() })).then((result) => {
      if (createOrUpdateReview.fulfilled.match(result)) {
        toast.success("Review saved");
        dispatch(fetchPartById(id));
        dispatch(clearPartSuccess());
      } else toast.error(result.payload || "Unable to save review");
    });
  };

  const removeReview = () => {
    dispatch(deleteReview(id)).then((result) => {
      if (deleteReview.fulfilled.match(result)) {
        toast.success("Review removed");
        setRating(0);
        setComment("");
        dispatch(fetchPartById(id));
      } else toast.error(result.payload || "Unable to remove review");
    });
  };

  if (loading || !part) {
    return (
      <div className="min-h-screen bg-[var(--surface-1)] pt-28 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 animate-pulse">
          <div className="h-[560px] rounded-3xl bg-[var(--surface-2)]" />
          <div className="space-y-5 pt-8"><div className="h-4 w-28 rounded bg-[var(--surface-2)]" /><div className="h-12 w-4/5 rounded bg-[var(--surface-2)]" /><div className="h-24 rounded bg-[var(--surface-2)]" /><div className="h-14 w-1/3 rounded bg-[var(--surface-2)]" /><div className="h-14 rounded bg-[var(--surface-2)]" /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen pt-32 text-center text-red-500">Unable to load this product.</div>;
  }

  const averageRating = part.reviews?.length ? part.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / part.reviews.length : 0;
  const schema = { "@context": "https://schema.org", "@type": "Product", name: part.name, image: images, description: part.description, sku: part.product_id, offers: { "@type": "Offer", priceCurrency: "INR", price: part.price, availability: part.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } };

  return (
    <div className="min-h-screen bg-[var(--surface-1)] text-[var(--text-strong)] pt-24 sm:pt-28 pb-20">
      <SEO title={part.name} description={part.description} image={images[0]} schema={schema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-5"><Link to="/products" className="hover:text-blue-600">Products</Link><ChevronRight className="w-3.5 h-3.5" />{part.category || "Spare Parts"}<ChevronRight className="w-3.5 h-3.5" /><span className="text-[var(--text-strong)] truncate">{part.name}</span></div>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-0)] shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-5 sm:p-8 lg:p-10 bg-[var(--surface-2)]/50 border-b lg:border-b-0 lg:border-r border-[var(--line)]">
              <div className="flex items-center justify-between mb-5"><button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-blue-600"><ArrowLeft className="w-4 h-4" /> Back</button><button onClick={toggleWishlist} className={`w-10 h-10 rounded-xl border grid place-items-center transition ${inWishlist ? "border-red-200 bg-red-50 text-red-500" : "border-[var(--line)] bg-[var(--surface-0)] hover:text-red-500"}`} aria-label="Toggle wishlist"><Heart className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} /></button></div>
              <div className="relative aspect-square max-w-[560px] mx-auto rounded-3xl bg-[var(--surface-0)] border border-[var(--line)] overflow-hidden flex items-center justify-center cursor-zoom-in" onClick={() => setZoomed(true)}>
                {part.bestseller && <span className="absolute top-4 left-4 z-10 rounded-full bg-orange-500 text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">Bestseller</span>}
                <img src={images[selectedImage]} alt={part.name} className="w-full h-full object-contain p-8 sm:p-12 transition-transform duration-500 hover:scale-105" />
                <span className="absolute right-4 bottom-4 w-9 h-9 rounded-full bg-white/90 border border-gray-200 grid place-items-center shadow-sm"><ZoomIn className="w-4 h-4" /></span>
              </div>
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((src, index) => <button key={`${src}-${index}`} onClick={() => setSelectedImage(index)} className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl border bg-[var(--surface-0)] p-1.5 ${selectedImage === index ? "border-blue-600 ring-2 ring-blue-100" : "border-[var(--line)]"}`}><img src={src} alt={`${part.name} view ${index + 1}`} className="w-full h-full object-contain rounded-lg" /></button>)}
              </div>
            </div>

            <div className="p-5 sm:p-8 lg:p-10 flex flex-col">
              <div className="flex items-center gap-2 mb-3"><span className="text-[10px] uppercase tracking-[.16em] font-bold text-blue-600">{part.category || "Automotive Spare Part"}</span><span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" /><span className="text-[10px] text-[var(--text-muted)]">SKU {part.product_id}</span></div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">{part.name}</h1>
              <div className="flex items-center gap-3 mt-4"><div className="flex items-center gap-1 text-amber-500">{[1,2,3,4,5].map((star) => <Star key={star} className="w-4 h-4" fill={star <= Math.round(averageRating) ? "currentColor" : "none"} />)}</div><span className="text-xs font-semibold">{averageRating ? averageRating.toFixed(1) : "No rating"}</span><span className="text-xs text-[var(--text-muted)]">({part.reviews?.length || 0} reviews)</span></div>
              <div className="h-px bg-[var(--line)] my-6" />
              <div className="flex items-end gap-3"><span className="text-3xl sm:text-4xl font-black">{money(part.price)}</span>{part.mrp && Number(part.mrp) > Number(part.price) && <span className="text-sm text-[var(--text-muted)] line-through">{money(part.mrp)}</span>}</div>
              <p className="mt-5 text-sm leading-6 text-[var(--text-muted)] max-w-xl">{part.description || "Genuine automotive spare part designed for reliable fit, everyday durability and dependable performance."}</p>

              <div className={`mt-5 inline-flex self-start items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${part.stock > 15 ? "bg-emerald-50 text-emerald-700" : part.stock > 0 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{stockLabel}{part.stock > 0 && ` · ${part.stock} available`}</div>

              <div className="grid grid-cols-3 gap-2 mt-6 py-5 border-y border-[var(--line)]"><div className="flex flex-col items-center text-center gap-1"><Truck className="w-5 h-5 text-blue-600" /><span className="text-[10px] font-semibold">Fast Delivery</span></div><div className="flex flex-col items-center text-center gap-1 border-x border-[var(--line)]"><ShieldCheck className="w-5 h-5 text-blue-600" /><span className="text-[10px] font-semibold">Secure Payment</span></div><div className="flex flex-col items-center text-center gap-1"><RotateCcw className="w-5 h-5 text-blue-600" /><span className="text-[10px] font-semibold">Easy Returns</span></div></div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3"><div className="h-12 flex items-center rounded-xl border border-[var(--line)] bg-[var(--surface-0)]"><button disabled={!part.stock} onClick={() => changeQuantity(-1)} className="w-12 h-full grid place-items-center hover:text-blue-600 disabled:opacity-40"><Minus className="w-4 h-4" /></button><span className="w-10 text-center font-bold">{quantity}</span><button disabled={!part.stock || quantity >= maxQuantity} onClick={() => changeQuantity(1)} className="w-12 h-full grid place-items-center hover:text-blue-600 disabled:opacity-40"><Plus className="w-4 h-4" /></button></div><button disabled={!part.stock} onClick={handleAddToCart} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold inline-flex items-center justify-center gap-2 transition"><ShoppingCart className="w-5 h-5" /> Add to Cart</button></div>
              <Link to="/checkout" className="mt-3 h-11 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold grid place-items-center text-sm">Buy Now</Link>
            </div>
          </div>
        </motion.section>

        <section className="mt-8 grid lg:grid-cols-[1.2fr_.8fr] gap-6">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-0)] p-6 sm:p-8"><h2 className="text-xl font-bold mb-5">Compatibility & product details</h2><div className="grid sm:grid-cols-2 gap-3">{[["Product ID",part.product_id], ["Category",part.category], ["Stock",part.stock > 0 ? `${part.stock} units` : "Out of stock"], ["Vehicle compatibility",part.vehicleCompatibility?.length ? part.vehicleCompatibility.map((v) => v.name || v).join(", ") : "Universal fit"]].map(([label,value]) => <div key={label} className="rounded-xl bg-[var(--surface-2)] px-4 py-3"><p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p><p className="text-sm font-semibold mt-1">{value || "—"}</p></div>)}</div></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-0)] p-6 sm:p-8"><h2 className="text-xl font-bold mb-5">Why buy from Samridhi?</h2><div className="space-y-4">{[[Check,"Genuine spare parts"],[Truck,"Fast & reliable delivery"],[ShieldCheck,"Secure checkout"],[RotateCcw,"Hassle-free returns"]].map(([Icon,text]) => <div key={text} className="flex items-center gap-3 text-sm font-semibold"><span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 grid place-items-center"><Icon className="w-4 h-4" /></span>{text}</div>)}</div></div>
        </section>

        {[['Similar products', similar], ['Frequently bought together', frequentlyBought], ['Recommended for you', recommended]].map(([title, list]) => list?.length > 0 && <section key={title} className="mt-10"><div className="flex items-end justify-between mb-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-blue-600 font-bold">Discover more</p><h2 className="text-xl sm:text-2xl font-extrabold">{title}</h2></div><Link to="/products" className="text-xs font-bold text-blue-600 inline-flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link></div><div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">{list.map((product) => <ProductCard key={product._id} product={product} onClick={trackRecommendationClick && ((productId) => dispatch(trackRecommendationClick(productId)))} />)}</div></section>)}

        <section className="mt-10 rounded-3xl border border-[var(--line)] bg-[var(--surface-0)] p-6 sm:p-8"><div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6"><div><p className="text-[10px] uppercase tracking-[.18em] text-blue-600 font-bold">Customer feedback</p><h2 className="text-xl sm:text-2xl font-extrabold">Reviews</h2></div><div className="text-sm text-[var(--text-muted)]">{part.reviews?.length || 0} verified review{part.reviews?.length === 1 ? "" : "s"}</div></div><div className="grid lg:grid-cols-[.8fr_1.2fr] gap-8"><div className="rounded-2xl bg-[var(--surface-2)] p-6"><div className="text-4xl font-black">{averageRating ? averageRating.toFixed(1) : "—"}</div><div className="flex gap-1 text-amber-500 mt-2">{[1,2,3,4,5].map((star) => <Star key={star} className="w-5 h-5" fill={star <= Math.round(averageRating) ? "currentColor" : "none"} />)}</div><p className="text-xs text-[var(--text-muted)] mt-2">Based on {part.reviews?.length || 0} reviews</p></div><form onSubmit={submitReview} className="space-y-4"><div className="flex items-center gap-1">{[1,2,3,4,5].map((star) => <button type="button" key={star} onClick={() => setRating(star)} className="p-1 text-amber-500" aria-label={`${star} star`}><Star className="w-5 h-5" fill={star <= rating ? "currentColor" : "none"} /></button>)}</div><textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={4} placeholder={isAuthenticated ? "Share your experience with this part..." : "Log in to leave a review"} className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-0)] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" /><div className="flex justify-between items-center"><span className="text-[10px] text-[var(--text-muted)]">{comment.length}/500</span><div className="flex gap-2"><button type="submit" className="px-5 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">{rating ? "Save Review" : "Write Review"}</button>{isAuthenticated && part.reviews?.some((review) => String(review.user?._id || review.user) === String(user?._id)) && <button type="button" onClick={removeReview} className="px-4 h-10 rounded-xl border border-red-200 text-red-500 text-sm font-semibold">Delete</button>}</div></div></form></div></section>
      </div>

      {zoomed && <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm p-4 grid place-items-center" role="dialog" aria-modal="true" onClick={() => setZoomed(false)}><div className="relative max-w-4xl max-h-[90vh]" onClick={(event) => event.stopPropagation()}><button onClick={() => setZoomed(false)} className="absolute -top-12 right-0 text-white text-sm">Close</button><img src={images[selectedImage]} alt={part.name} className="max-w-full max-h-[85vh] object-contain rounded-2xl" /></div></div>}
    </div>
  );
}
