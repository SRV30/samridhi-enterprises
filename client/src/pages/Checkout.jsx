import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { fetchCart } from "../store/cart/cartSlice";
import {
  createOrder,
  clearOrderError,
  clearOrderSuccess,
} from "../store/order/orderSlice";
import { getPaymentSettings } from "../store/order/paymentSettingsSlice";
import { validateCoupon, clearAppliedCoupon, clearCouponError } from "../store/order/couponSlice";
import { getMyAddresses } from "../store/order/addressSlice";
import { Tag, X, MapPin } from "lucide-react";
import Loader from "../extras/Loader";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "../components/StripePaymentForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.paymentSettings);
  const { loading, error, success, lastCreatedOrder, clientSecret } = useSelector(
    (state) => state.order
  );
  const { applied: appliedCoupon, loading: couponLoading, error: couponError } = useSelector(
    (state) => state.coupon
  );
  const { addresses } = useSelector((state) => state.address);
  const [couponInput, setCouponInput] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(getPaymentSettings());
    dispatch(getMyAddresses());
  }, [dispatch]);

  const fillFromAddress = (addr) => {
    if (!addr) return;
    setForm({ fullName: addr.fullName || "", phone: addr.phone || "", addressLine: addr.addressLine || "", city: addr.city || "", state: addr.state || "", pincode: addr.pincode || "" });
  };

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def) { setSelectedAddressId(def._id); fillFromAddress(def); }
    }
  }, [addresses, selectedAddressId]);

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
    if (id === "") return;
    fillFromAddress(addresses.find((a) => a._id === id));
  };

  // Prefill name/phone from the logged-in user once available.
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        phone: prev.phone || user.mobile || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  // On a successful order, sync the (now empty) cart and go to order history.
  useEffect(() => {
    if (success && lastCreatedOrder) {
      if (paymentMethod === "COD") {
        toast.success("Order placed successfully!");
        dispatch(fetchCart());
        dispatch(clearOrderSuccess());
        navigate("/my-orders");
      } else if (clientSecret) {
        dispatch(fetchCart());
      }
    }
  }, [success, lastCreatedOrder, paymentMethod, clientSecret, dispatch, navigate]);

  const total = useMemo(() => cart?.total || 0, [cart]);
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.subtotal !== total) return 0;
    return appliedCoupon.discount || 0;
  }, [appliedCoupon, total]);
  const payable = Math.max(0, total - discount);

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.subtotal !== total) {
      dispatch(clearAppliedCoupon());
      setCouponInput("");
    }
  }, [appliedCoupon, total, dispatch]);

  useEffect(() => {
    if (couponError) {
      toast.error(couponError);
      dispatch(clearCouponError());
    }
  }, [couponError, dispatch]);

  const handleApplyCoupon = () => {
    const code = couponInput.trim();
    if (!code) { toast.error("Please enter a coupon code"); return; }
    dispatch(validateCoupon(code));
  };

  const handleRemoveCoupon = () => {
    dispatch(clearAppliedCoupon());
    setCouponInput("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = () => {
    // Required address fields
    const required = ["fullName", "phone", "addressLine", "city", "pincode"];
    const missing = required.filter((f) => !String(form[f]).trim());
    if (missing.length > 0) {
      toast.error("Please fill all required address fields");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    const fd = new FormData();
    fd.append("fullName", form.fullName);
    fd.append("phone", form.phone);
    fd.append("addressLine", form.addressLine);
    fd.append("city", form.city);
    fd.append("state", form.state);
    fd.append("pincode", form.pincode);
    fd.append("paymentMethod", paymentMethod);
    if (discount > 0 && appliedCoupon?.code) {
      fd.append("couponCode", appliedCoupon.code);
    }
    dispatch(createOrder(fd));
  };

  if (loading) return <Loader />;

  if (clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Complete Payment
          </h2>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm clientSecret={clientSecret} />
          </Elements>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Add some products before proceeding to checkout.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent mb-10">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: address + payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping address */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Shipping Address
              </h2>
              {addresses.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Deliver to a saved address</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {addresses.map((a) => (
                      <button type="button" key={a._id} onClick={() => handleSelectAddress(a._id)}
                        className={`text-left rounded-xl border px-4 py-3 transition ${selectedAddressId === a._id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{a.fullName}{a.label ? <span className="ml-2 text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{a.label}</span> : null}</span>
                          {a.isDefault && <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Default</span>}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.addressLine}, {a.city}{a.state ? `, ${a.state}` : ""} — {a.pincode} · {a.phone}</p>
                      </button>
                    ))}
                    <button type="button" onClick={() => handleSelectAddress("")}
                      className={`text-left rounded-xl border px-4 py-3 text-sm font-medium transition ${selectedAddressId === "" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 text-blue-700 dark:text-blue-300" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-200"}`}>
                      + Enter a new address
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Full Name *
                  </label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Full name"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Phone *
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Phone number"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Address *
                  </label>
                  <input
                    name="addressLine"
                    value={form.addressLine}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="House no, street, area"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    City *
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    State
                  </label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Pincode *
                  </label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod === "COD"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    Cash on Delivery
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Pay when your order arrives
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Online")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod === "Online"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    Online Payment (UPI)
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Pay via UPI and upload screenshot
                  </div>
                </button>
              </div>

              {paymentMethod === "Online" && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    You will be securely redirected to our payment gateway to complete your transaction after clicking Place Order.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 lg:p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Order Summary
              </h3>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map((item, idx) => (
                  <div
                    key={item.part?._id || item._id || idx}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-200 pr-2">
                      {item.name}{" "}
                      <span className="text-gray-400 dark:text-gray-500">x{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                {appliedCoupon && discount > 0 ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                      <Tag className="w-4 h-4" />{appliedCoupon.code} applied
                    </span>
                    <button onClick={handleRemoveCoupon} className="text-emerald-700 hover:text-emerald-900" title="Remove coupon">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <button onClick={handleApplyCoupon} disabled={couponLoading}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60">
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span><span>₹{total.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span><span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl font-bold pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-gray-100">Total</span>
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    ₹{payable.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;
