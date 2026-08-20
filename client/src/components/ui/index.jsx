import React, { useState } from 'react';

const focus = 'focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20';
const inputBase = `w-full px-3.5 py-2.5 border rounded-xl text-sm bg-[var(--surface-0)] text-[var(--text-strong)] placeholder:text-slate-400 border-[var(--line)] transition-all duration-200 ${focus}`;

export const Button = ({ children, variant = 'primary', type = 'button', disabled = false, onClick, className = '' }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20 disabled:bg-slate-300 dark:disabled:bg-slate-700',
    secondary: 'bg-[var(--surface-0)] text-blue-600 border border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40',
    outline: 'border border-[var(--line)] text-[var(--text-strong)] hover:bg-[var(--surface-2)]',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/20'
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 px-5 py-2.5 text-sm ${focus} ${variants[variant]} ${className}`}>{children}</button>;
};

export const Input = ({ type = 'text', placeholder, label, error, className = '', ...props }) => (
  <div className="w-full flex flex-col gap-1.5">
    {label && <label className="text-sm font-semibold text-[var(--text-strong)]">{label}</label>}
    <input type={type} placeholder={placeholder} className={`${inputBase} ${error ? 'border-red-500' : ''} ${className}`} {...props} />
    {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
  </div>
);

export const Textarea = ({ placeholder, label, error, rows = 3, className = '', ...props }) => (
  <div className="w-full flex flex-col gap-1.5">
    {label && <label className="text-sm font-semibold text-[var(--text-strong)]">{label}</label>}
    <textarea rows={rows} placeholder={placeholder} className={`${inputBase} resize-y ${error ? 'border-red-500' : ''} ${className}`} {...props} />
    {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
  </div>
);

export const Select = ({ label, options = [], error, className = '', ...props }) => (
  <div className="w-full flex flex-col gap-1.5">
    {label && <label className="text-sm font-semibold text-[var(--text-strong)]">{label}</label>}
    <select className={`${inputBase} ${error ? 'border-red-500' : ''} ${className}`} {...props}>{options.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}</select>
    {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
  </div>
);

export const Checkbox = ({ label, id, ...props }) => <label htmlFor={id} className="flex items-center gap-2 text-sm text-[var(--text-strong)] select-none cursor-pointer"><input type="checkbox" id={id} className="w-4 h-4 accent-blue-600" {...props} />{label}</label>;
export const Radio = ({ label, name, id, ...props }) => <label htmlFor={id} className="flex items-center gap-2 text-sm text-[var(--text-strong)] select-none cursor-pointer"><input type="radio" id={id} name={name} className="w-4 h-4 accent-blue-600" {...props} />{label}</label>;

export const Toggle = ({ checked, onChange, label }) => <label className="flex items-center gap-3 cursor-pointer select-none"><div className="relative"><input type="checkbox" checked={checked} onChange={onChange} className="sr-only" /><div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div><div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}></div></div>{label && <span className="text-sm text-[var(--text-strong)]">{label}</span>}</label>;

export const Badge = ({ children, status = 'success', className = '' }) => {
  const statuses = { success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', error: 'bg-red-500/10 text-red-600 dark:text-red-400', info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statuses[status]} ${className}`}>{children}</span>;
};
export const Chip = ({ label, onDelete }) => <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface-2)] text-[var(--text-strong)]">{label}{onDelete && <button onClick={onDelete} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">×</button>}</span>;
export const Loader = () => <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin" />;
export const Skeleton = ({ className = '' }) => <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />;

export const ProductCard = ({ title, price, image, category, tag }) => <div className="premium-card p-4 hover:-translate-y-0.5 transition-transform relative">{tag && <Badge status="warning" className="absolute top-3 left-3 z-10">{tag}</Badge>}<div className="w-full h-40 bg-[var(--surface-1)] rounded-xl flex items-center justify-center mb-4 overflow-hidden">{image ? <img src={image} alt={title} className="object-contain h-full w-full" /> : <div className="text-slate-400">No Image</div>}</div><span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">{category}</span><h4 className="font-semibold text-[var(--text-strong)] text-sm mt-1 line-clamp-1">{title}</h4><div className="flex items-center justify-between mt-3"><span className="font-bold text-blue-600 dark:text-blue-400">₹{price}</span><Button variant="primary" className="!px-3 !py-1.5 !text-xs">Add</Button></div></div>;

export const CategoryCard = ({ name, count, icon }) => <div className="premium-card p-4 flex items-center gap-4 hover:border-blue-500 cursor-pointer transition-colors"><div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-xl text-blue-600 dark:text-blue-400">{icon || '⚙️'}</div><div><h5 className="font-semibold text-[var(--text-strong)] text-sm">{name}</h5><span className="text-xs text-[var(--text-muted)]">{count}+ Products</span></div></div>;

export const DashboardCard = ({ title, value, icon, trend, status = 'info' }) => { const colors = { info: 'bg-blue-600', success: 'bg-emerald-600', warning: 'bg-amber-500', danger: 'bg-red-600' }; return <div className="premium-card p-5 flex items-center justify-between"><div className="flex flex-col gap-1"><span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{title}</span><span className="text-2xl font-bold text-[var(--text-strong)]">{value}</span>{trend && <span className="text-xs text-emerald-500 font-medium">{trend} ↑ <span className="text-[var(--text-muted)]">vs last month</span></span>}</div><div className={`w-12 h-12 ${colors[status]} text-white rounded-xl flex items-center justify-center text-xl`}>{icon}</div></div>; };

export const Tabs = ({ tabs = [], activeTab, setActiveTab }) => <div className="flex border-b border-[var(--line)] w-full gap-6">{tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)]'}`}>{tab.label}</button>)}</div>;

export const Accordion = ({ title, children }) => { const [isOpen, setIsOpen] = useState(false); return <div className="border border-[var(--line)] rounded-xl overflow-hidden bg-[var(--surface-0)]"><button onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3 flex items-center justify-between font-semibold text-sm text-[var(--text-strong)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors"><span>{title}</span><span>{isOpen ? '−' : '+'}</span></button>{isOpen && <div className="p-4 border-t border-[var(--line)] text-sm text-[var(--text-muted)] bg-[var(--surface-0)]">{children}</div>}</div>; };

export const Modal = ({ isOpen, onClose, title, children }) => { if (!isOpen) return null; return <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn"><div className="bg-[var(--surface-0)] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 relative border border-[var(--line)]"><button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-strong)] text-xl font-bold">×</button><h3 className="text-lg font-bold text-[var(--text-strong)] border-b border-[var(--line)] pb-3 mb-4">{title}</h3><div className="text-sm text-[var(--text-muted)]">{children}</div></div></div>; };