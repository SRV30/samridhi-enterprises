import React, { useState } from 'react';

// ==========================================
// 1. FORMS & INPUT PRIMITIVES
// ==========================================

export const Button = ({ children, variant = 'primary', type = 'button', disabled = false, onClick, className = '' }) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none px-5 py-2.5 text-sm';
  const variants = {
    primary: 'bg-[#2562EB] text-white hover:bg-[#1d4ed8] focus:ring-4 focus:ring-blue-200 disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-white text-[#2562EB] border border-[#2562EB] hover:bg-blue-50 focus:ring-4 focus:ring-blue-100',
    outline: 'border border-gray-300 text-[#0F172A] hover:bg-gray-50 focus:ring-4 focus:ring-gray-100',
    danger: 'bg-[#EF4444] text-white hover:bg-red-600 focus:ring-4 focus:ring-red-100'
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Input = ({ type = 'text', placeholder, label, error, className = '', ...props }) => (
  <div className="w-full flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-[#0F172A]">{label}</label>}
    <input type={type} placeholder={placeholder} className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2562EB]/20 focus:border-[#2562EB] transition-all duration-200 ${error ? 'border-[#EF4444]' : 'border-gray-300'} ${className}`} {...props} />
    {error && <span className="text-xs text-[#EF4444] font-medium">{error}</span>}
  </div>
);

export const Textarea = ({ placeholder, label, error, rows = 3, className = '', ...props }) => (
  <div className="w-full flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-[#0F172A]">{label}</label>}
    <textarea rows={rows} placeholder={placeholder} className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2562EB]/20 focus:border-[#2562EB] transition-all duration-200 ${error ? 'border-[#EF4444]' : 'border-gray-300'} ${className}`} {...props} />
    {error && <span className="text-xs text-[#EF4444] font-medium">{error}</span>}
  </div>
);

export const Select = ({ label, options = [], error, className = '', ...props }) => (
  <div className="w-full flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-[#0F172A]">{label}</label>}
    <select className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2562EB]/20 focus:border-[#2562EB] transition-all duration-200 ${error ? 'border-[#EF4444]' : 'border-gray-300'} ${className}`} {...props}>
      {options.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <span className="text-xs text-[#EF4444] font-medium">{error}</span>}
  </div>
);

export const Checkbox = ({ label, id, ...props }) => (
  <div className="flex items-center gap-2">
    <input type="checkbox" id={id} className="w-4 h-4 text-[#2562EB] border-gray-300 rounded focus:ring-[#2562EB]" {...props} />
    {label && <label htmlFor={id} className="text-sm text-gray-700 select-none">{label}</label>}
  </div>
);

export const Radio = ({ label, name, id, ...props }) => (
  <div className="flex items-center gap-2">
    <input type="radio" id={id} name={name} className="w-4 h-4 text-[#2562EB] border-gray-300 focus:ring-[#2562EB]" {...props} />
    {label && <label htmlFor={id} className="text-sm text-gray-700 select-none">{label}</label>}
  </div>
);

export const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-[#2562EB]' : 'bg-gray-300'}`}></div>
      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}></div>
    </div>
    {label && <span className="text-sm text-gray-700">{label}</span>}
  </label>
);

// ==========================================
// 2. DATA DISPLAY & FEEDBACK
// ==========================================

export const Badge = ({ children, status = 'success', className = '' }) => {
  const statuses = {
    success: 'bg-[#22C55E]/10 text-[#22C55E]',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    error: 'bg-[#EF4444]/10 text-[#EF4444]',
    info: 'bg-blue-50 text-[#2562EB]'
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statuses[status]} ${className}`}>{children}</span>;
};

export const Chip = ({ label, onDelete }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
    {label}
    {onDelete && <button onClick={onDelete} className="text-gray-400 hover:text-gray-600 font-bold">×</button>}
  </span>
);

export const Loader = () => (
  <div className="w-6 h-6 border-2 border-gray-200 border-t-[#2562EB] rounded-full animate-spin"></div>
);

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// ==========================================
// 3. ENTERPRISE CARDS
// ==========================================

export const ProductCard = ({ title, price, image, category, tag }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
    {tag && <Badge status="warning" className="absolute top-3 left-3">{tag}</Badge>}
    <div className="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
      {image ? <img src={image} alt={title} className="object-contain h-full w-full" /> : <div className="text-gray-300">No Image</div>}
    </div>
    <span className="text-xs text-gray-400 font-medium uppercase">{category}</span>
    <h4 className="font-semibold text-gray-800 text-sm mt-1 line-clamp-1">{title}</h4>
    <div className="flex items-center justify-between mt-3">
      <span className="font-bold text-[#2562EB]">₹{price}</span>
      <Button variant="primary" className="!px-3 !py-1.5 !text-xs">Add</Button>
    </div>
  </div>
);

export const CategoryCard = ({ name, count, icon }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-[#2562EB] cursor-pointer transition-colors">
    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-xl text-[#2562EB]">{icon || '⚙️'}</div>
    <div>
      <h5 className="font-semibold text-gray-800 text-sm">{name}</h5>
      <span className="text-xs text-gray-400">{count}+ Products</span>
    </div>
  </div>
);

export const DashboardCard = ({ title, value, icon, trend, status = 'info' }) => {
  const colors = { info: 'bg-blue-500', success: 'bg-green-500', warning: 'bg-amber-500', danger: 'bg-red-500' };
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        {trend && <span className="text-xs text-green-500 font-medium">{trend} ↑ <span className="text-gray-400">vs last month</span></span>}
      </div>
      <div className={`w-12 h-12 ${colors[status]} text-white rounded-xl flex items-center justify-center text-xl shadow-sm`}>{icon}</div>
    </div>
  );
};

// ==========================================
// 4. NAVIGATION & LAYOUT OVERLAYS
// ==========================================

export const Tabs = ({ tabs = [], activeTab, setActiveTab }) => (
  <div className="flex border-b border-gray-200 w-full gap-6">
    {tabs.map((tab) => (
      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#2562EB] text-[#2562EB]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
        {tab.label}
      </button>
    ))}
  </div>
);

export const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3 flex items-center justify-between font-semibold text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span>{title}</span>
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="p-4 border-t border-gray-200 text-sm text-gray-600 bg-white">{children}</div>}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">{title}</h3>
        <div className="text-sm text-gray-600">{children}</div>
      </div>
    </div>
  );
};