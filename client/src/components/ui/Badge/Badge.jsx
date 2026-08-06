import React from 'react';

const Badge = ({ children, status = 'success', className = '' }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  
  // Dynamic color tagging from image_c4225c.jpg
  const statuses = {
    success: 'bg-[#22C55E]/10 text-[#22C55E]', // In Stock
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B]', // Low Stock
    error: 'bg-[#EF4444]/10 text-[#EF4444]',   // Out of Stock
    info: 'bg-blue-50 text-[#2562EB]'
  };

  return (
    <span className={`${baseStyles} ${statuses[status]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;