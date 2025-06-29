import PropTypes from "prop-types";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="bg-white p-6 sm:p-8 rounded-2xl max-w-lg w-full shadow-2xl transform transition-all border border-blue-400/20"
            initial={{ scale: 0.7, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-blue-500">{title}</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">{message}</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 text-blue-500 border border-blue-400 rounded-lg hover:bg-blue-400/10 transition-all duration-300 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default ConfirmationModal;