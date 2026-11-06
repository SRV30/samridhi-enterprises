import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBikeModels } from "../store/product/bikeSlice";
import b1 from "../assets/1.png";
import b2 from "../assets/2.png";
import b3 from "../assets/3.png";
import b4 from "../assets/4.png";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, CarFront } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const BannerProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bikeModels = [] } = useSelector((state) => state.bike);
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [year, setYear] = useState("");

  const images = useMemo(() => [b1, b2, b3, b4], []);
  const selectedVehicle = bikeModels.find((model) => model._id === vehicleId);
  const years = useMemo(() => {
    if (!selectedVehicle) return [];
    const start = selectedVehicle.yearStart || new Date().getFullYear();
    const end = selectedVehicle.yearEnd || new Date().getFullYear();
    return Array.from({ length: Math.max(1, end - start + 1) }, (_, i) => end - i);
  }, [selectedVehicle]);

  useEffect(() => {
    if (!bikeModels.length) dispatch(fetchBikeModels());
  }, [bikeModels.length, dispatch]);

  const nextImage = useCallback(() => {
    setDirection(1);
    setCurrentImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setDirection(-1);
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(nextImage, 8000);
    return () => clearInterval(interval);
  }, [nextImage, isHovering]);

  const findParts = () => {
    const params = new URLSearchParams();
    if (selectedVehicle?.brand?.name) params.set("brand", selectedVehicle.brand.name);
    if (selectedVehicle?._id) params.set("vehicle", selectedVehicle._id);
    if (year) params.set("year", year);
    navigate(`/products?${params.toString()}`);
  };

  const vehicleFinder = (
    <div className="bg-white rounded-2xl p-4 sm:p-4 shadow-[0_12px_35px_rgba(15,23,42,.16)] border border-slate-200 text-slate-900 w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-lg bg-blue-50 grid place-items-center shrink-0"><CarFront className="w-4 h-4 text-blue-700" /></span>
        <div>
          <p className="text-sm font-bold leading-tight">Find the right parts</p>
          <p className="text-xs text-slate-500 mt-0.5">Choose your vehicle to get started</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
        <label className="sr-only" htmlFor="banner-vehicle">Select vehicle or model</label>
        <select id="banner-vehicle" value={vehicleId} onChange={(e) => { setVehicleId(e.target.value); setYear(""); }} className="h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
          <option value="">Select Vehicle / Model</option>
          {bikeModels.map((model) => <option key={model._id} value={model._id}>{model.brand?.name ? `${model.brand.name} · ` : ""}{model.name}</option>)}
        </select>
        <label className="sr-only" htmlFor="banner-year">Select vehicle year</label>
        <select id="banner-year" value={year} onChange={(e) => setYear(e.target.value)} disabled={!selectedVehicle} className="h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50">
          <option value="">Select Year</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={findParts} disabled={!selectedVehicle} className="h-11 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Search className="w-4 h-4" />Search Parts
        </button>
      </div>
    </div>
  );

  return (
    <section className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-7 pt-2 sm:pt-3 lg:pt-5">
      <motion.div
        className="relative isolate overflow-hidden rounded-2xl sm:rounded-3xl min-h-[350px] sm:min-h-[400px] lg:min-h-[460px] bg-slate-950 shadow-xl shadow-slate-900/10"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.img
            key={images[currentImage]}
            src={images[currentImage]}
            alt="Automotive spare parts available at Samridhi Enterprises"
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0, scale: 1.03, x: direction > 0 ? 24 : -24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.02, x: direction > 0 ? -24 : 24 }}
            transition={{ duration: 0.45 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/35 sm:to-slate-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/10 sm:hidden" />

        <div className="relative z-10 min-h-[350px] sm:min-h-[400px] lg:min-h-[460px] flex items-center px-5 py-10 sm:px-8 lg:px-12 sm:py-12">
          <div className="max-w-xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[.14em] backdrop-blur">
              Premium automotive spare parts
            </span>
            <h1 className="mt-5 text-[2.35rem] leading-[1.02] sm:text-5xl lg:text-6xl font-black tracking-[-.04em]">
              BUILT FOR <span className="text-blue-400">SPEED.</span>
              <br />FIXED FOR <span className="text-blue-400">LIFE.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-200 max-w-md">
              Quality spare parts for your ride. Find the right fit, shop with confidence and get reliable delivery support.
            </p>
            <div className="mt-6 flex flex-col min-[420px]:flex-row gap-2.5">
              <Link to="/products" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-bold transition-colors shadow-lg shadow-blue-950/20">
                Shop Spare Parts
              </Link>
              <Link to="/products" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 px-5 py-3 text-sm font-bold backdrop-blur transition-colors">
                Browse Brands
              </Link>
            </div>
          </div>
        </div>

        {/* Keep the vehicle finder in normal document flow on phones. On larger
            screens it overlays the banner as before. */}
        <div className="hidden sm:block absolute left-8 lg:left-12 right-8 lg:right-12 bottom-6 z-20">
          <div className="max-w-3xl">{vehicleFinder}</div>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-2">
          <button onClick={prevImage} className="w-10 h-10 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur" aria-label="Previous banner"><ArrowLeft className="w-4 h-4" /></button>
          <button onClick={nextImage} className="w-10 h-10 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur" aria-label="Next banner"><ArrowRight className="w-4 h-4" /></button>
        </div>
        <div className="absolute top-4 right-4 z-20 flex gap-1.5">
          {images.map((_, index) => <button key={index} onClick={() => { setDirection(index >= currentImage ? 1 : -1); setCurrentImage(index); }} className={`h-1.5 rounded-full transition-all ${currentImage === index ? "w-6 bg-white" : "w-2 bg-white/55"}`} aria-label={`Show banner ${index + 1}`} />)}
        </div>
      </motion.div>

      <div className="sm:hidden mt-3">
        {vehicleFinder}
      </div>
    </section>
  );
};

export default BannerProduct;
