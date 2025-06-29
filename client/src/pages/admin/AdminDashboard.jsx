import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Users, Car, Building2, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

const cards = [
  {
    title: "Total Users",
    value: 1280,
    icon: <Users className="w-8 h-8 text-white" />,
    color: "bg-blue-500",
  },
  {
    title: "Total Brands",
    value: 45,
    icon: <Building2 className="w-8 h-8 text-white" />,
    color: "bg-purple-500",
  },
  {
    title: "Total Cars",
    value: 120,
    icon: <Car className="w-8 h-8 text-white" />,
    color: "bg-green-500",
  },
  {
    title: "Total Bookings",
    value: 3420,
    icon: <ClipboardList className="w-8 h-8 text-white" />,
    color: "bg-red-500",
  },
];

const AdminDashboard = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-blue-900 mb-8 text-center"
      >
        Admin Dashboard
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`p-5 rounded-2xl shadow-lg text-white ${card.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-medium">{card.title}</span>
              <div className="bg-white/20 p-2 rounded-full">{card.icon}</div>
            </div>
            <div className="text-3xl font-bold">{card.value}</div>
          </motion.div>
        ))}
      </div>

      <Link to="/admin/brands">
        <button className="bg-gray-400 p-5 cursor-pointer">
          Add Bike Brands
        </button>
      </Link>
       <Link to="/admin/bikes">
        <button className="bg-gray-400 p-5 cursor-pointer">
          Add Bike Models
        </button>
      </Link>
    </div>
  );
};

export default AdminDashboard;
