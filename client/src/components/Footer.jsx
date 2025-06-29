import {
  Car,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Star,
  Zap,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const yTransform = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-white text-gray-800 overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ y: yTransform }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.08),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.06),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.04),transparent_50%)]"></div>

      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        style={{ scaleX }}
      ></motion.div>

      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      ></motion.div>

      <motion.div
        className="absolute w-96 h-96 rounded-full bg-blue-500/3 blur-3xl"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      ></motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="relative z-10 py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center mb-16"
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-blue-500 bg-clip-text text-transparent mb-4"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              Stay Connected
            </motion.h2>
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-400 mx-auto rounded-full"
              animate={{ scaleX: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-8"
            >
              <motion.div whileHover={{ scale: 1.02 }} className="group">
                <div className="flex items-center space-x-4 mb-8">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.6 }}
                    className="relative w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/40"
                  >
                    <Car className="w-8 h-8 text-white" />
                    <motion.div
                      className="absolute inset-0 bg-white rounded-2xl"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.1 }}
                      transition={{ duration: 0.3 }}
                    ></motion.div>
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>
                  </motion.div>
                  <div>
                    <motion.span
                      className="font-bold text-2xl bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      Samridhi Enterprises
                    </motion.span>
                  </div>
                </div>
                <motion.p
                  className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-500 text-base"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  Delivering excellence in automotive solutions with
                  cutting-edge technology and unparalleled service quality.
                </motion.p>
                <div className="flex space-x-2 pt-6">
                  {[Star, Zap, Shield].map((Icon, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200 hover:bg-blue-200 hover:border-blue-300 transition-all duration-300"
                    >
                      <Icon className="w-4 h-4 text-blue-600" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              onMouseEnter={() => setHoveredSection("links")}
              onMouseLeave={() => setHoveredSection(null)}
              className="relative"
            >
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-blue-50 to-transparent rounded-2xl opacity-0"
                animate={{ opacity: hoveredSection === "links" ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
              <div className="relative z-10">
                <h3 className="font-semibold text-xl mb-8 relative">
                  <span className="bg-gradient-to-r from-blue-600 to-gray-700 bg-clip-text text-transparent">
                    Quick Links
                  </span>
                  <motion.div
                    animate={{
                      width: hoveredSection === "links" ? "100%" : "3rem",
                    }}
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    transition={{ duration: 0.4 }}
                  ></motion.div>
                </h3>
                <ul className="space-y-4">
                  {[
                    { name: "Home", href: "#", icon: "🏠" },
                    { name: "Products", href: "#products", icon: "🛍️" },
                    { name: "Order Now", href: "#order", icon: "🚀" },
                    { name: "Reviews", href: "#reviews", icon: "⭐" },
                  ].map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      whileHover={{ x: 8, scale: 1.05 }}
                    >
                      <a
                        href={link.href}
                        className="group flex items-center text-gray-600 hover:text-gray-800 transition-all duration-300 p-2 rounded-lg hover:bg-blue-50"
                      >
                        <motion.span
                          className="text-lg mr-3"
                          whileHover={{ scale: 1.3, rotate: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {link.icon}
                        </motion.span>
                        <span className="relative font-medium">
                          {link.name}
                          <motion.div
                            className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full"
                            transition={{ duration: 0.3 }}
                          ></motion.div>
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              onMouseEnter={() => setHoveredSection("support")}
              onMouseLeave={() => setHoveredSection(null)}
              className="relative"
            >
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-blue-50 to-transparent rounded-2xl opacity-0"
                animate={{ opacity: hoveredSection === "support" ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
              <div className="relative z-10">
                <h3 className="font-semibold text-xl mb-8 relative">
                  <span className="bg-gradient-to-r from-blue-600 to-gray-700 bg-clip-text text-transparent">
                    Support
                  </span>
                  <motion.div
                    animate={{
                      width: hoveredSection === "support" ? "100%" : "3rem",
                    }}
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    transition={{ duration: 0.4 }}
                  ></motion.div>
                </h3>
                <ul className="space-y-4">
                  {[
                    { name: "FAQ", href: "#faq", icon: "❓" },
                    { name: "Contact", href: "#contact", icon: "📞" },
                    { name: "Support", href: "#support", icon: "🛠️" },
                    { name: "Warranty", href: "#warranty", icon: "🔒" },
                  ].map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      whileHover={{ x: 8, scale: 1.05 }}
                    >
                      <a
                        href={link.href}
                        className="group flex items-center text-gray-600 hover:text-gray-800 transition-all duration-300 p-2 rounded-lg hover:bg-blue-50"
                      >
                        <motion.span
                          className="text-lg mr-3"
                          whileHover={{ scale: 1.3, rotate: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {link.icon}
                        </motion.span>
                        <span className="relative font-medium">
                          {link.name}
                          <motion.div
                            className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full"
                            transition={{ duration: 0.3 }}
                          ></motion.div>
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              onMouseEnter={() => setHoveredSection("contact")}
              onMouseLeave={() => setHoveredSection(null)}
              className="relative"
            >
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-blue-50 to-transparent rounded-2xl opacity-0"
                animate={{ opacity: hoveredSection === "contact" ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
              <div className="relative z-10">
                <h3 className="font-semibold text-xl mb-8 relative">
                  <span className="bg-gradient-to-r from-blue-600 to-gray-700 bg-clip-text text-transparent">
                    Contact Us
                  </span>
                  <motion.div
                    animate={{
                      width: hoveredSection === "contact" ? "100%" : "3rem",
                    }}
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    transition={{ duration: 0.4 }}
                  ></motion.div>
                </h3>
                <ul className="space-y-6">
                  <motion.li
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <a
                      href="tel:+917070186631"
                      className="group flex items-center text-gray-600 hover:text-gray-800 transition-all duration-300"
                    >
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-blue-300/40 border border-blue-200 group-hover:border-blue-300"
                      >
                        <Phone className="w-5 h-5 text-blue-600" />
                      </motion.div>
                      <div>
                        <span className="block text-sm font-semibold">
                          Phone
                        </span>
                        <span className="text-sm opacity-75">
                          +91 70701 86631
                        </span>
                      </div>
                    </a>
                  </motion.li>
                  <motion.li
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <a
                      href="mailto:ialam2943@gmail.com"
                      className="group flex items-center text-gray-600 hover:text-gray-800 transition-all duration-300"
                    >
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 group-hover:from-blue-500/40 group-hover:to-blue-600/40 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-blue-500/30 border border-blue-500/20 group-hover:border-blue-400/40"
                      >
                        <Mail className="w-5 h-5 text-blue-600" />
                      </motion.div>
                      <div>
                        <span className="block text-sm font-semibold">
                          Email
                        </span>
                        <span className="text-sm opacity-75">
                          ialam2943@gmail.com
                        </span>
                      </div>
                    </a>
                  </motion.li>
                  <motion.li
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="group flex items-center text-gray-600">
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 group-hover:from-blue-500/40 group-hover:to-blue-600/40 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-blue-500/30 border border-blue-500/20 group-hover:border-blue-400/40"
                      >
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </motion.div>
                      <div>
                        <span className="block text-sm font-semibold">
                          Location
                        </span>
                        <span className="text-sm opacity-75">India</span>
                      </div>
                    </div>
                  </motion.li>
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 pt-8 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
              <motion.p
                className="text-gray-500 text-sm text-center sm:text-left"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                © {new Date().getFullYear()} Samridhi Enterprises. All rights
                reserved.
              </motion.p>
              <motion.button
                onClick={scrollToTop}
                whileHover={{ scale: 1.1, rotate: 360 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-400/50 text-white"
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-blue-400 to-gray-200"
        animate={{
          background: [
            "linear-gradient(90deg, rgba(229,231,235,1) 0%, rgba(59,130,246,0.8) 50%, rgba(229,231,235,1) 100%)",
            "linear-gradient(90deg, rgba(59,130,246,0.8) 0%, rgba(229,231,235,1) 50%, rgba(59,130,246,0.8) 100%)",
            "linear-gradient(90deg, rgba(229,231,235,1) 0%, rgba(59,130,246,0.8) 50%, rgba(229,231,235,1) 100%)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      ></motion.div>

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400/60 rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </motion.footer>
  );
};

export default Footer;
