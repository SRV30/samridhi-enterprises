// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-blue-500/30 backdrop-blur-md flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
            borderRadius: ["50%", "45%", "50%"],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-transparent border-t-blue-400 border-r-blue-500 border-b-blue-500 rounded-full shadow-xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-l-blue-300 border-t-blue-300 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 sm:w-28 sm:h-28 bg-blue-400/20 rounded-full"
        />
      </motion.div>
    </motion.div>
  );
};

export default Loader;