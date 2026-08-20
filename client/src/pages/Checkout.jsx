import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MapPin, Tag, X } from "lucide-react";
import { fetchCart } from "../store/cart/cartSlice";
import { createOrder, clearOrderError, clearOrderSuccess } from "../store/order/orderSlice";
import { getPaymentSettings } from "../store/order/paymentSettingsSlice";
import { validateCoupon, clearAppliedCoupon, clearCouponError } from "../store/order/couponSlice";
import { getMyAddresses } from "../store/order/addressSlice";
import Loader from "../extras/Loader";
import MetaData from "../extras/MetaData";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.paymentSettings);
  const { loading, error, success, lastCreatedOrder } = useSelector((state) => state.order);
  const { applied: appliedCoupon, loading: couponLoading, error: couponError } = useSelector((state) => state.coupon);
  const { addresses } = useSelector((state) => state.address);

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

  const total = useMemo(() => cart?.total || 0, [cart]);
  const discount = useMemo(() => {
    if (!appliedCoupon || appliedCoupon.subtotal !== total) return 0;
    return appliedCoupon.discount || 0;
  }, [appliedCoupon, total]);
  const payable = Math.max(0, total - discount);
  const onlineEnabled = Boolean(settings?.upiId || settings?.qrImage?.url);

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.subtotal !== total) {
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

  const handleApplyCoupon = () => {
    const code = couponInput.trim();
    if (!code) return toast.error("Please enter a coupon code");
    dispatch(validateCoupon(code));
  };

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const handlePlaceOrder = () => {
    const required = ["fullName", "phone", "addressLine", "city", "pincode"];
    if (required.some((field) => !String(form[field]).trim())) return toast.error("Please fill all required address fields");
    if (!/^\d{10}$/.test(form.phone)) return toast.error("Please enter a valid 10-digit phone number");
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
      <div className="min-h-screen flex items-center justify-center px-4 pt-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Add some products before proceeding to checkout.</p>
          <Link to="/products" className="inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white">Browse Products</Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800";

  return (
    <>
      <MetaData title="Checkout | Samridhi Enterprises" description="Complete your Samridhi Enterprises order securely." />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-10">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-xl p-6 lg:p-8">
                <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                {addresses.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> Saved addresses</label>
                    {addresses.map((address) => (
                      <button type="button" key={address._id} onClick={() => handleSelectAddress(address._id)} className={`w-full text-left rounded-xl border p-4 ${selectedAddressId === address._id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                        <div className="font-semibold">{address.fullName}{address.isDefault ? " · Default" : ""}</div>
                        <div className="text-sm text-gray-500">{address.addressLine}, {address.city}{address.state ? `, ${address.state}` : ""} — {address.pincode} · {address.phone}</div>
                      </button>
                    ))}
                    <button type="button" onClick={() => setSelectedAddressId("")} className="text-sm font-medium text-blue-600">+ Enter a new address</button>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input name="fullName" value={form.fullName} onChange={handleChange} className={inputClass} placeholder="Full name *" />
                  <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="Phone *" inputMode="numeric" />
                  <input name="addressLine" value={form.addressLine} onChange={handleChange} className={`${inputClass} sm:col-span-2`} placeholder="House no, street, area *" />
                  <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="City *" />
                  <input name="state" value={form.state} onChange={handleChange} className={inputClass} placeholder="State" />
                  <input name="pincode" value={form.pincode} onChange={handleChange} className={inputClass} placeholder="Pincode *" inputMode="numeric" />
                </div>
              </section>

              <section className="bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-xl p-6 lg:p-8">
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                <div className={`grid grid-cols-1 ${onlineEnabled ? "sm:grid-cols-2" : "sm:grid-cols-1"} gap-4`}>
                  <button type="button" onClick={() => setPaymentMethod("COD")} className={`rounded-2xl border-2 p-5 text-left ${paymentMethod === "COD" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                    <div className="font-semibold">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay when your order arrives.</div>
                  </button>
                  {onlineEnabled && (
                    <button type="button" onClick={() => setPaymentMethod("Online")} className={`rounded-2xl border-2 p-5 text-left ${paymentMethod === "Online" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                      <div className="font-semibold">UPI / Online Payment</div>
                      <div className="text-sm text-gray-500">Pay using the store UPI details and upload proof.</div>
                    </button>
                  )}
                </div>

                {paymentMethod === "Online" && (
                  <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-4">
                    {settings?.upiId && <p>UPI ID: <strong>{settings.upiId}</strong></p>}
                    {settings?.qrImage?.url && <img src={settings.qrImage.url} alt="Store UPI QR code" className="w-48 h-48 object-contain bg-white rounded-xl" />}
                    <input value={upiReference} onChange={(event) => setUpiReference(event.target.value)} className={inputClass} placeholder="UPI transaction reference (optional)" />
                    <div>
                      <label className="block text-sm font-medium mb-2">Payment screenshot *</label>
                      <input type="file" accept="image/*" onChange={(event) => setPaymentScreenshot(event.target.files?.[0] || null)} className="w-full text-sm" />
                    </div>
                  </div>
                )}
              </section>
            </div>

            <aside className="h-fit bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-xl p-6 lg:p-8 lg:sticky lg:top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.part?._id || item._id} className="flex justify-between gap-4 text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{Number(item.price || 0).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} className={`${inputClass} flex-1`} placeholder="Coupon code" />
                <button type="button" disabled={couponLoading} onClick={handleApplyCoupon} className="rounded-xl bg-gray-900 px-4 text-white"><Tag className="w-4 h-4" /></button>
              </div>
              {appliedCoupon && <div className="flex items-center justify-between text-sm text-green-600 mb-4"><span>{appliedCoupon.code} applied</span><button type="button" onClick={() => { dispatch(clearAppliedCoupon()); setCouponInput(""); }}><X className="w-4 h-4" /></button></div>}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{Number(total).toLocaleString("en-IN")}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{Number(discount).toLocaleString("en-IN")}</span></div>}
                <div className="flex justify-between text-xl font-bold pt-2"><span>Total</span><span>₹{Number(payable).toLocaleString("en-IN")}</span></div>
              </div>
              <button type="button" onClick={handlePlaceOrder} disabled={loading} className="w-full mt-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 disabled:opacity-60">
                {paymentMethod === "Online" ? "Submit Order for Payment Verification" : "Place Order"}
              </button>
            </aside>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Checkout;
