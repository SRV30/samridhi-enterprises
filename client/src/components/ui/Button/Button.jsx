import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  disabled = false, 
  onClick, 
  className = '' 
}) => {
  // Tailwind theme matching variants from Samridhi Design System Figma
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none px-5 py-2.5 text-sm';
  
  const variants = {
    primary: 'bg-[#2562EB] text-white hover:bg-[#1d4ed8] focus:ring-4 focus:ring-blue-200 disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-white text-[#2562EB] border border-[#2562EB] hover:bg-blue-50 focus:ring-4 focus:ring-blue-100',
    outline: 'border border-gray-300 text-[#0F172A] hover:bg-gray-50 focus:ring-4 focus:ring-gray-100',
    danger: 'bg-[#EF4444] text-white hover:bg-red-600 focus:ring-4 focus:ring-red-100'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;