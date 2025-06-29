import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "../store/product/brandSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function BrandList() {
  const dispatch = useDispatch();
  const { brands, loading, error } = useSelector((state) => state.brand);

  const scrollRef = useRef(null);
  const [showScroll, setShowScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowScroll(scrollWidth > clientWidth);
    setAtStart(scrollLeft <= 0);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      }
    };
  }, [brands]);

  if (loading) return <div className="text-center py-8 text-blue-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  const sortedBrands = [...brands].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const scrollBy = 240;

  const handleScroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -scrollBy : scrollBy,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="relative px-4 py-6 group w-full max-w-7xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold mb-6 text-blue-500 text-center"
      >
        Top Brands
      </motion.h2>

      {showScroll && !atStart && isHovered && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-blue-500 shadow-lg p-2 rounded-full z-10"
          onClick={() => handleScroll("left")}
        >
          <ChevronLeft size={22} />
        </motion.button>
      )}

      {showScroll && !atEnd && isHovered && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-blue-500 shadow-lg p-2 rounded-full z-10"
          onClick={() => handleScroll("right")}
        >
          <ChevronRight size={22} />
        </motion.button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
      >
        {sortedBrands.map((brand) => (
          <motion.div
            key={brand._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="min-w-[120px] md:min-w-[140px] lg:min-w-[160px] flex-shrink-0 bg-white rounded-xl shadow-md p-4 flex flex-col items-center hover:scale-105 transition-transform duration-300"
          >
            <img
              src={brand.images[0]?.url}
              alt={brand.name}
              className="w-16 h-16 md:w-20 md:h-20 object-contain mb-3"
            />
            <span className="text-sm md:text-base font-semibold text-blue-500 text-center uppercase">
              {brand.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
