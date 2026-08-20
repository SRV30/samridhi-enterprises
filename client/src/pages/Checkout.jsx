import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ChevronRight, CreditCard, MapPin, Package, ShieldCheck, Tag, Truck, Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import { fetchCart } from "../store/cart/cartSlice";
import { createOrder, clearOrderError, clearOrderSuccess } from "../store/order/orderSlice";
import { getPaymentSettings } from "../store/order/paymentSettingsSlice";
import { validateCoupon, clearAppliedCoupon, clearCouponError } from "../store/order/couponSlice";
import { getMyAddresses } from "../store/order/addressSlice";
import Loader from "../extras/Loader";
import MetaData from "../extras/MetaData";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.paymentSettings);
  const { loading, error, success, lastCreatedOrder } = useSelector((state) => state.order);
  const { applied: appliedCoupon, loading: couponLoading, error: couponError } = useSelector((state) => state.coupon);
  const { addresses = [] } = useSelector((state) => state.address);

  const [couponInput, setCouponInput] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [upiReference, setUpiReference] = useState("");
  const [form, setForm] = useState({ fullName: "", phone: "", addressLine: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(getPaymentSettings());
    dispatch(getMyAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, fullName: prev.fullName || user.name || "", phone: prev.phone || user.mobile || "" }));
    }
  }, [user]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const address = addresses.find((item) => item.isDefault) || addresses[0];
      setSelectedAddressId(address._id);
      setForm({ fullName: address.fullName || "", phone: address.phone || "", addressLine: address.addressLine || "", city: address.city || "", state: address.state || "", pincode: address.pincode || "" });
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (couponError) {
      toast.error(couponError);
      dispatch(clearCouponError());
    }
  }, [couponError, dispatch]);

  useEffect(() => {
    if (success && lastCreatedOrder) {
      toast.success("Order placed successfully!");
      dispatch(fetchCart());
      dispatch(clearOrderSuccess());
      navigate("/my-orders");
    }
  }, [success, lastCreatedOrder, dispatch, navigate]);

  const total = useMemo(() => Number(cart?.total || 0), [cart]);
  const discount = useMemo(() => {
    if (!appliedCoupon || Number(appliedCoupon.subtotal) !== total) return 0;
    return Number(appliedCoupon.discount || 0);
  }, [appliedCoupon, total]);
  const payable = Math.max(0, total - discount);
  const itemCount = useMemo(() => (cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0), [cart]);
  const onlineEnabled = Boolean(settings?.upiId || settings?.qrImage?.url);

  useEffect(() => {
    if (appliedCoupon && Number(appliedCoupon.subtotal) !== total) {
      dispatch(clearAppliedCoupon());
      setCouponInput("");
    }
  }, [appliedCoupon, total, dispatch]);

  const fillAddress = (address) => {
    if (!address) return;
    setForm({ fullName: address.fullName || "", phone: address.phone || "", addressLine: address.addressLine || "", city: address.city || "", state: address.state || "", pincode: address.pincode || "" });
  };

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
    if (id) fillAddress(addresses.find((address) => address._id === id));
  };

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const handleApplyCoupon = () => {
    const code = couponInput.trim();
    if (!code) return toast.error("Please enter a coupon code");
    dispatch(validateCoupon(code));
  };

  const handlePlaceOrder = () => {
    const required = ["fullName", "phone", "addressLine", "city", "pincode"];
    if (required.some((field) => !String(form[field] || "").trim())) return toast.error("Please fill all required address fields");
    if (!/^\d{10}$/.test(form.phone)) return toast.error("Please enter a valid 10-digit phone number");
    if (!/^\d{6}$/.test(form.pincode)) return toast.error("Please enter a valid 6-digit pincode");
    if (paymentMethod === "Online" && !paymentScreenshot) return toast.error("Please upload your UPI payment screenshot");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append("paymentMethod", paymentMethod);
    if (appliedCoupon?.code && discount > 0) formData.append("couponCode", appliedCoupon.code);
    if (paymentMethod === "Online") {
      formData.append("paymentScreenshot", paymentScreenshot);
      if (upiReference.trim()) formData.append("upiReference", upiReference.trim());
    }
    dispatch(createOrder(formData));
  };

  if (loading) return <Loader />;

  if (!cart?.items?.length) {
    return (
      <>
        <MetaData title="Checkout | Samridhi Enterprises" description="Complete your Samridhi Enterprises order securely." />
        <div className="min-h-screen bg-[var(--surface-1)] pt-28 pb-20 px-4 flex items-center justify-center">
          <div className="premium-card max-w-lg w-full p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 text-blue-600 grid place-items-center mb-5"><Package className="w-8 h-8" /></div>
            <h1 className="text-2xl font-black text-[var(--text-strong)]">Your cart is empty</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Add genuine spare parts to your cart before proceeding to checkout.</p>
            <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">Browse products <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </>
    );
  }

  const inputClass = "w-full h-11 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-1)] text-sm text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition";
  const sectionClass = "premium-card p-4 sm:p-6";

  return (
    <>
      <MetaData title="Checkout | Samridhi Enterprises" description="Complete your Samridhi Enterprises order securely." />
      <div className="min-h-screen bg-[var(--surface-1)] pt-24 sm:pt-28 pb-28 lg:pb-20">
        <div className="max-w-[1240px] mx-auto px-3 sm:px-5 lg:px-7">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.16em] font-extrabold text-[var(--text-muted)] mb-4">
            <Link to="/cart" className="hover:text-blue-600">Cart</Link><ChevronRight className="w-3 h-3" /><span className="text-blue-600">Checkout</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
            <div><p className="text-[10px] uppercase tracking-[.2em] font-extrabold text-blue-600">Samridhi Enterprises</p><h1 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-strong)]">Secure Checkout</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Review your order, confirm delivery details and choose your payment method.</p></div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure order processing</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5 lg:gap-7 items-start">
            <div className="space-y-5">
              <section className={sectionClass}>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div><div className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black grid place-items-center">1</span><h2 className="text-lg font-black text-[var(--text-strong)]">Delivery address</h2></div><p className="mt-1 ml-9 text-xs text-[var(--text-muted)]">Where should we deliver your order?</p></div>
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>

                {addresses.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[var(--text-muted)] mb-2">Saved addresses</p>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {addresses.map((address) => (
                        <button type="button" key={address._id} onClick={() => handleSelectAddress(address._id)} className={`text-left rounded-xl border p-3.5 transition ${selectedAddressId === address._id ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20" : "border-[var(--line)] hover:border-blue-300 bg-[var(--surface-1)]"}`}>
                          <div className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-[var(--text-strong)]">{address.fullName}</span>{selectedAddressId === address._id ? <Check className="w-4 h-4 text-blue-600" /> : address.isDefault ? <span className="text-[9px] font-bold text-blue-600">DEFAULT</span> : null}</div>
                          <p className="mt-1.5 text-xs leading-5 text-[var(--text-muted)]">{address.addressLine}, {address.city}{address.state ? `, ${address.state}` : ""} — {address.pincode}</p>
                          <p className="mt-1 text-[10px] text-[var(--text-muted)]">{address.phone}</p>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setSelectedAddressId("")} className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700">+ Enter a new address</button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input name="fullName" value={form.fullName} onChange={handleChange} className={inputClass} placeholder="Full name *" autoComplete="name" />
                  <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="10-digit phone *" inputMode="numeric" autoComplete="tel" maxLength={10} />
                  <input name="addressLine" value={form.addressLine} onChange={handleChange} className={`${inputClass} sm:col-span-2`} placeholder="House no, street, area *" autoComplete="street-address" />
                  <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="City *" autoComplete="address-level2" />
                  <input name="state" value={form.state} onChange={handleChange} className={inputClass} placeholder="State" autoComplete="address-level1" />
                  <input name="pincode" value={form.pincode} onChange={handleChange} className={inputClass} placeholder="6-digit pincode *" inputMode="numeric" autoComplete="postal-code" maxLength={6} />
                </div>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start justify-between gap-4 mb-5"><div><div className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black grid place-items-center">2</span><h2 className="text-lg font-black text-[var(--text-strong)]">Payment method</h2></div><p className="mt-1 ml-9 text-xs text-[var(--text-muted)]">Choose how you want to pay.</p></div><CreditCard className="w-5 h-5 text-blue-600" /></div>
                <div className={`grid grid-cols-1 ${onlineEnabled ? "sm:grid-cols-2" : ""} gap-3`}>
                  <button type="button" onClick={() => setPaymentMethod("COD")} className={`relative text-left rounded-2xl border-2 p-4 transition ${paymentMethod === "COD" ? "border-blue-600 bg-blue-600/5" : "border-[var(--line)] hover:border-blue-300"}`}>
                    {paymentMethod === "COD" && <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white grid place-items-center"><Check className="w-3 h-3" /></span>}
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center mb-3"><Truck className="w-4 h-4" /></div><h3 className="text-sm font-black text-[var(--text-strong)]">Cash on Delivery</h3><p className="mt-1 text-xs text-[var(--text-muted)]">Pay when your order arrives.</p>
                  </button>
                  {onlineEnabled && <button type="button" onClick={() => setPaymentMethod("Online")} className={`relative text-left rounded-2xl border-2 p-4 transition ${paymentMethod === "Online" ? "border-blue-600 bg-blue-600/5" : "border-[var(--line)] hover:border-blue-300"}`}>
                    {paymentMethod === "Online" && <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white grid place-items-center"><Check className="w-3 h-3" /></span>}
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 grid place-items-center mb-3"><CreditCard className="w-4 h-4" /></div><h3 className="text-sm font-black text-[var(--text-strong)]">UPI / Online Payment</h3><p className="mt-1 text-xs text-[var(--text-muted)]">Pay using store UPI details and upload proof.</p>
                  </button>}
                </div>

                {paymentMethod === "Online" && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-500/5 p-4 sm:p-5">
                  <div className="grid sm:grid-cols-[190px_1fr] gap-5 items-start">
                    <div className="rounded-xl bg-white p-3 border border-[var(--line)] min-h-[190px] grid place-items-center">{settings?.qrImage?.url ? <img src={settings.qrImage.url} alt="Store UPI QR code" className="w-40 h-40 object-contain" /> : <CreditCard className="w-10 h-10 text-[var(--text-muted)]" />}</div>
                    <div className="space-y-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-blue-600">Payment instructions</p>{settings?.upiId && <p className="mt-1.5 text-sm text-[var(--text-strong)]">UPI ID: <strong>{settings.upiId}</strong></p>}<p className="mt-1 text-xs text-[var(--text-muted)]">Complete payment and upload a screenshot so the order can be verified.</p></div>
                      <input value={upiReference} onChange={(event) => setUpiReference(event.target.value)} className={inputClass} placeholder="UPI transaction reference (optional)" />
                      <label className="block rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface-1)] p-3 cursor-pointer hover:border-blue-400 transition"><span className="flex items-center gap-2 text-xs font-bold text-[var(--text-strong)]"><Upload className="w-4 h-4 text-blue-600" /> {paymentScreenshot ? paymentScreenshot.name : "Upload payment screenshot *"}</span><span className="block mt-1 text-[10px] text-[var(--text-muted)]">Image files only</span><input type="file" accept="image/*" onChange={(event) => setPaymentScreenshot(event.target.files?.[0] || null)} className="sr-only" /></label>
                    </div>
                  </div>
                </motion.div>}
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 space-y-4">
              <section className="premium-card overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[var(--line)]"><div className="flex items-center justify-between"><div><h2 className="text-lg font-black text-[var(--text-strong)]">Order summary</h2><p className="mt-1 text-xs text-[var(--text-muted)]">{itemCount} {itemCount === 1 ? "item" : "items"}</p></div><Package className="w-5 h-5 text-blue-600" /></div></div>
                <div className="p-4 sm:p-5 max-h-[310px] overflow-y-auto space-y-3">
                  {cart.items.map((item) => { const image = item.part?.images?.[0]?.url || item.images?.[0]?.url; return <div key={item.part?._id || item._id} className="flex gap-3"><div className="w-14 h-14 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] overflow-hidden shrink-0 grid place-items-center">{image ? <img src={image} alt="" className="w-full h-full object-contain" /> : <Package className="w-5 h-5 text-[var(--text-muted)]" />}</div><div className="min-w-0 flex-1"><p className="text-xs font-bold leading-4 text-[var(--text-strong)] line-clamp-2">{item.name}</p><p className="mt-1 text-[10px] text-[var(--text-muted)]">Qty {item.quantity}</p></div><span className="text-xs font-bold text-[var(--text-strong)] whitespace-nowrap">{money(Number(item.price || 0) * Number(item.quantity || 1))}</span></div>; })}
                </div>
                <div className="p-4 sm:p-5 border-t border-[var(--line)]">
                  <div className="flex gap-2"><input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") handleApplyCoupon(); }} className={`${inputClass} flex-1`} placeholder="Coupon code" /><button type="button" disabled={couponLoading} onClick={handleApplyCoupon} className="h-11 px-4 rounded-xl bg-[var(--text-strong)] text-[var(--surface-0)] text-xs font-bold disabled:opacity-50"><Tag className="w-4 h-4" /></button></div>
                  {appliedCoupon && <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-600"><span>{appliedCoupon.code} applied</span><button type="button" onClick={() => { dispatch(clearAppliedCoupon()); setCouponInput(""); }} aria-label="Remove coupon"><X className="w-3.5 h-3.5" /></button></div>}
                  <div className="mt-5 pt-4 border-t border-[var(--line)] space-y-2.5 text-sm"><div className="flex justify-between text-[var(--text-muted)]"><span>Subtotal</span><span>{money(total)}</span></div>{discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{money(discount)}</span></div>}<div className="flex justify-between text-[var(--text-muted)]"><span>Delivery</span><span className="font-semibold text-emerald-600">Calculated by store</span></div><div className="flex justify-between items-end pt-2"><span className="font-black text-[var(--text-strong)]">Total</span><span className="text-2xl font-black text-[var(--text-strong)]">{money(payable)}</span></div></div>
                  <button type="button" onClick={handlePlaceOrder} disabled={loading} className="w-full mt-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition disabled:opacity-60 disabled:cursor-not-allowed">{paymentMethod === "Online" ? "Submit for verification" : "Place order"}</button>
                  <p className="mt-3 text-center text-[9px] leading-4 text-[var(--text-muted)]">By placing this order, you confirm that your delivery details are correct.</p>
                </div>
              </section>

              <div className="grid grid-cols-3 gap-2">
                {[{ icon: ShieldCheck, label: "Secure" }, { icon: Truck, label: "Delivery" }, { icon: Check, label: "Verified" }].map(({ icon: Icon, label }) => <div key={label} className="premium-card p-3 text-center"><Icon className="w-4 h-4 mx-auto text-blue-600" /><p className="mt-1.5 text-[9px] font-bold text-[var(--text-muted)]">{label}</p></div>)}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
