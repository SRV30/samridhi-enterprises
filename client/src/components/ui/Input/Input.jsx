import React from 'react';

const Input = ({ 
  type = 'text', 
  placeholder, 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#0F172A]">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2562EB]/20 focus:border-[#2562EB] transition-all duration-200 ${
          error ? 'border-[#EF4444]' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[#EF4444] font-medium">{error}</span>}
    </div>
  );
};

export default Input;