import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FiArrowLeft, FiCoffee } from "react-icons/fi";
import { useEffect, useState } from "react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    // Set up the countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Set up the redirect
    const redirect = setTimeout(() => {
      navigate('/');
    }, 10000);

    // Clean up timers on unmount
    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 dark:from-slate-950 dark:via-amber-950 dark:to-amber-950 text-amber-800 dark:text-amber-300">
      <Motion.div
        className="text-center max-w-2xl px-6 py-16 rounded-2xl backdrop-blur-sm bg-white/30 dark:bg-black/20 shadow-xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Motion.div
          className="flex justify-center mb-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <FiCoffee className="text-6xl text-amber-600 dark:text-amber-400" />
        </Motion.div>

        <Motion.h1
          className="text-8xl font-extrabold bg-gradient-to-r from-amber-700 to-amber-500 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          404
        </Motion.h1>

        <Motion.div
          className="h-1 w-24 mx-auto bg-gradient-to-r from-amber-500 to-amber-300 dark:from-amber-500 dark:to-amber-700 rounded-full my-6"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 96, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        />

        <Motion.p
          className="text-xl font-light text-amber-800 dark:text-amber-300 mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.7 }}
        >
          The page you&apos;re looking for has wandered off.
        </Motion.p>

        <Motion.p
          className="text-sm font-medium text-amber-700/70 dark:text-amber-400/70 mt-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7 }}
        >
          Perhaps it&apos;s brewing the perfect cup somewhere else?
        </Motion.p>

        <Motion.div
          className="mt-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.7 }}
        >
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 dark:from-amber-700 dark:to-amber-800 dark:hover:from-amber-600 dark:hover:to-amber-700 text-white font-medium text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <FiArrowLeft className="text-xl transition-transform group-hover:-translate-x-1" />
            Return Home
          </Link>
          
          <Motion.div
            className="mt-6 text-sm font-medium text-amber-600 dark:text-amber-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            Redirecting to home page in {timeLeft} seconds...
          </Motion.div>
          
          {/* Progress bar */}
          <Motion.div className="w-full h-1 bg-amber-200 dark:bg-amber-900/30 rounded-full mt-3 overflow-hidden">
            <Motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-500 dark:from-amber-500 dark:to-amber-700"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 10, ease: "linear" }}
            />
          </Motion.div>
        </Motion.div>
      </Motion.div>

      <Motion.p
        className="text-xs text-amber-700/60 dark:text-amber-400/60 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.7 }}
      >
        © {new Date().getFullYear()} • Samridhi Enterprises
      </Motion.p>
    </div>
  );
};

export default NotFoundPage;