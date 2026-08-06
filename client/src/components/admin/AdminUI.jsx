import React from "react";

// ==========================================
// 1. ADMIN PAGE HEADER
// ==========================================
export const AdminPageHeader = ({ title, subtitle, icon, actions, badge }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2562EB] dark:text-blue-400 flex items-center justify-center text-xl font-bold shadow-sm">
          {icon}
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#2562EB] dark:text-blue-300">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

// ==========================================
// 2. ADMIN CARD CONTAINER
// ==========================================
export const AdminCard = ({ title, subtitle, actions, children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}
  >
    {(title || actions) && (
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900/50">
        <div>
          {title && (
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// ==========================================
// 3. ADMIN TABLE WRAPPER
// ==========================================
export const AdminTable = ({
  columns = [],
  data = [],
  keyField = "_id",
  renderRow,
  emptyMessage = "No records found.",
  loading = false,
}) => (
  <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
    <table className="w-full text-left text-sm border-collapse">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
          {columns.map((col, idx) => (
            <th key={idx} className={`px-4 py-3.5 ${col.className || ""}`}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
        {loading ? (
          <tr>
            <td colSpan={columns.length} className="py-12 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading data...
              </div>
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((item, idx) =>
            renderRow ? (
              renderRow(item, idx)
            ) : (
              <tr
                key={item[keyField] || idx}
                className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-4 py-3.5 ${col.className || ""}`}>
                    {col.accessor ? item[col.accessor] : null}
                  </td>
                ))}
              </tr>
            )
          )
        )}
      </tbody>
    </table>
  </div>
);

// ==========================================
// 4. ADMIN STATUS BADGE
// ==========================================
export const AdminBadge = ({ children, variant = "info", className = "" }) => {
  const variants = {
    success: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    danger: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    info: "bg-blue-100 dark:bg-blue-950/60 text-[#2562EB] dark:text-blue-300 border-blue-200 dark:border-blue-800",
    neutral: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        variants[variant] || variants.info
      } ${className}`}
    >
      {children}
    </span>
  );
};

// ==========================================
// 5. ADMIN MODAL
// ==========================================
export const AdminModal = ({ isOpen, onClose, title, children, footer, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div
        className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full shadow-2xl overflow-hidden ${maxWidth} transform transition-all`}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 6. ADMIN SEARCH INPUT
// ==========================================
export const AdminSearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => (
  <div className={`relative ${className}`}>
    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
      🔍
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2562EB]/30 focus:border-[#2562EB] transition-all"
    />
  </div>
);
