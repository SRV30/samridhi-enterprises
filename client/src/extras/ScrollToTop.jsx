import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Motion.button
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{
        scale: 1.2,
        boxShadow: "0px 0px 20px rgba(255, 215, 0, 0.8)",
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-42 right-5 sm:right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full 
                 bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-xl
                 border border-yellow-300 backdrop-blur-lg bg-opacity-30"
      aria-label="Scroll to top"
    >
      <Motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowUp className="w-7 h-7 text-white" />
      </Motion.div>
    </Motion.button>
  );
};

export default ScrollToTop;
