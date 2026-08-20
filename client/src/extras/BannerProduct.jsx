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

  return (
    <section className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-7 pt-3 lg:pt-5">
      <motion.div
        className="relative overflow-hidden rounded-2xl min-h-[300px] sm:min-h-[360px] lg:min-h-[430px] bg-slate-950 shadow-xl"
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
            alt="Samridhi Enterprises automotive spare parts"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.03, x: direction > 0 ? 24 : -24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.02, x: direction > 0 ? -24 : 24 }}
            transition={{ duration: 0.45 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-slate-950/10" />
        <div className="relative z-10 h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[430px] flex items-center px-5 sm:px-8 lg:px-12 py-8">
          <div className="max-w-xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider backdrop-blur">Premium automotive spare parts</span>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-6xl font-black leading-[.98] tracking-tight">BUILT FOR <span className="text-blue-400 italic">SPEED.</span><br />FIXED FOR <span className="text-blue-400 italic">LIFE.</span></h1>
            <p className="mt-4 text-sm sm:text-base text-slate-200 max-w-md">High-quality spare parts for every vehicle. Reliable, durable and delivered to you.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-bold transition-colors">Shop Spare Parts</Link>
              <Link to="/products" className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-5 py-3 text-sm font-bold backdrop-blur transition-colors">Browse Brands</Link>
            </div>
          </div>
        </div>

        <div className="absolute left-4 sm:left-8 lg:left-12 right-4 sm:right-8 lg:right-12 bottom-4 sm:bottom-6 z-20">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl max-w-3xl border border-white/70 text-slate-900">
            <div className="flex items-center gap-2 mb-2"><CarFront className="w-4 h-4 text-blue-600" /><span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wide">Find parts for your vehicle</span></div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
              <select value={vehicleId} onChange={(e) => { setVehicleId(e.target.value); setYear(""); }} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium outline-none focus:border-blue-500"><option value="">Select Vehicle / Model</option>{bikeModels.map((model) => <option key={model._id} value={model._id}>{model.brand?.name ? `${model.brand.name} · ` : ""}{model.name}</option>)}</select>
              <select value={year} onChange={(e) => setYear(e.target.value)} disabled={!selectedVehicle} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium outline-none focus:border-blue-500 disabled:opacity-50"><option value="">Select Year</option>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select>
              <button onClick={findParts} disabled={!selectedVehicle} className="h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Search className="w-4 h-4" />Search Parts</button>
            </div>
          </div>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-2">
          <button onClick={prevImage} className="w-9 h-9 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur" aria-label="Previous banner"><ArrowLeft className="w-4 h-4" /></button>
          <button onClick={nextImage} className="w-9 h-9 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur" aria-label="Next banner"><ArrowRight className="w-4 h-4" /></button>
        </div>
        <div className="absolute top-4 right-4 z-20 flex gap-1.5">{images.map((_, index) => <button key={index} onClick={() => { setDirection(index >= currentImage ? 1 : -1); setCurrentImage(index); }} className={`h-1.5 rounded-full transition-all ${currentImage === index ? "w-6 bg-white" : "w-2 bg-white/45"}`} aria-label={`Show banner ${index + 1}`} />)}</div>
      </motion.div>
    </section>
  );
};

export default BannerProduct;
