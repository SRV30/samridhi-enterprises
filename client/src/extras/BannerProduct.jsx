import { useCallback, useEffect, useState } from "react";
import b1 from "../assets/1.png";
import b2 from "../assets/2.png";
import b3 from "../assets/3.png";
import b4 from "../assets/4.png";
import b5 from "../assets/5.png";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const BannerProduct = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovering, setIsHovering] = useState(false);

  const desktopImages = [b1, b2, b3, b4, b5];
  const mobileImages = [b1, b2, b3, b4, b5];

  const nextImage = useCallback(() => {
    setDirection(1);
    setCurrentImage((prev) => (prev + 1) % desktopImages.length);
  }, [desktopImages.length]);

  const prevImage = useCallback(() => {
    setDirection(-1);
    setCurrentImage(
      (prev) => (prev - 1 + desktopImages.length) % desktopImages.length
    );
  }, [desktopImages.length]);

  useEffect(() => {
    if (isHovering) return;

    const interval = setInterval(() => {
      nextImage();
    }, 8000);

    return () => clearInterval(interval);
  }, [nextImage, isHovering]);

  const slideVariants = {
    hiddenRight: {
      opacity: 0,
      x: 100,
      rotateY: 5,
      scale: 1.05,
    },
    hiddenLeft: {
      opacity: 0,
      x: -100,
      rotateY: -5,
      scale: 1.05,
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.19, 1.0, 0.22, 1.0],
        opacity: { duration: 0.6 },
      },
    },
    exitLeft: {
      opacity: 0,
      x: -100,
      rotateY: -5,
      transition: {
        duration: 0.6,
        ease: [0.19, 1.0, 0.22, 1.0],
      },
    },
    exitRight: {
      opacity: 0,
      x: 100,
      rotateY: 5,
      transition: {
        duration: 0.6,
        ease: [0.19, 1.0, 0.22, 1.0],
      },
    },
  };

  const buttonVariants = {
    initial: { opacity: 0.7, scale: 0.95 },
    hover: {
      scale: 1.15,
      opacity: 1,
      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300,
      },
    },
    tap: {
      scale: 0.9,
      rotate: 0,
      transition: {
        duration: 0.1,
      },
    },
  };

  const dotVariants = {
    inactive: { scale: 1, opacity: 0.7 },
    active: {
      scale: [1, 1.3, 1.2],
      opacity: 1,
      transition: {
        duration: 0.5,
        times: [0, 0.6, 1],
      },
    },
  };

  const containerVariants = {
    hover: {
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      borderColor: "rgba(217, 119, 6, 0.5)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="container mx-auto px-4 mt-5">
      <motion.div
        className="h-100 md:h-120 lg:h-[36rem] w-full relative rounded-xl overflow-hidden shadow-2xl border-2 border-blue-200/30 backdrop-blur-sm"
        variants={containerVariants}
        whileHover="hover"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        initial={{
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-[1] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-[1] pointer-events-none"></div>

        <div className="absolute z-10 h-full w-full flex items-center justify-between px-4 lg:px-6">
          <motion.button
            onClick={prevImage}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="bg-blue-600/90 backdrop-blur-md text-white p-3 lg:p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 border border-white/10"
            aria-label="Previous Image"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <motion.button
            onClick={nextImage}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="bg-blue-600/90 backdrop-blur-md text-white p-3 lg:p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 border border-white/10"
            aria-label="Next Image"
          >
            <ArrowRight size={20} />
          </motion.button>
        </div>

        <div className="hidden md:flex h-full w-full overflow-hidden perspective-1000">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={desktopImages[currentImage]}
              className="w-full h-full"
              variants={slideVariants}
              initial={direction > 0 ? "hiddenRight" : "hiddenLeft"}
              animate="visible"
              exit={direction > 0 ? "exitLeft" : "exitRight"}
              custom={direction}
            >
              <img
                src={desktopImages[currentImage]}
                className="w-full h-full object-fit rounded-xl transform transition-transform duration-1000 hover:scale-105"
                alt={`Samridhi Enterprises Banner ${currentImage + 1} - Premium Motor Parts`}
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex md:hidden h-full w-full overflow-hidden perspective-1000">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={mobileImages[currentImage]}
              className="w-full h-full"
              variants={slideVariants}
              initial={direction > 0 ? "hiddenRight" : "hiddenLeft"}
              animate="visible"
              exit={direction > 0 ? "exitLeft" : "exitRight"}
              custom={direction}
            >
              <img
                src={mobileImages[currentImage]}
                className="w-full h-full object-fit rounded-xl"
                alt={`Samridhi Enterprises Mobile Banner ${currentImage + 1} - Premium Motor Parts`}
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3 z-10">
          {desktopImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentImage ? 1 : -1);
                setCurrentImage(index);
              }}
              className="focus:outline-none"
            >
              <motion.div
                className={`w-2.5 h-2.5 rounded-full ${
                  currentImage === index
                    ? "bg-blue-300"
                    : "bg-gray-900/70"
                }`}
                variants={dotVariants}
                initial="inactive"
                animate={currentImage === index ? "active" : "inactive"}
                whileHover={{ scale: 1.2 }}
              />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default BannerProduct;