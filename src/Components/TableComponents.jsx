import { useState } from "react";

// ─── Helper Functions ───────────────────────────────────────────────────────────
function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name = "") {
  const colors = ["#0d9488","#7c3aed","#db2777","#ea580c","#2563eb","#16a34a","#dc2626","#9333ea"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

// ─── 1. Table Container ─────────────────────────────────────────────────────────
export function TableContainer({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// ─── 2. Table Wrapper with Scroll ───────────────────────────────────────────────
export function TableWrapper({ children, className = "" }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      {children}
    </div>
  );
}

// ─── 3. Main Table ──────────────────────────────────────────────────────────────
export function CustomTable({ children, className = "" }) {
  return (
    <table className={`w-full text-sm ${className}`}>
      {children}
    </table>
  );
}

// ─── 4. Table Header ────────────────────────────────────────────────────────────
export function TableHeader({ children, className = "" }) {
  return (
    <thead className={`bg-zinc-50 border-b border-gray-100 ${className}`}>
      {children}
    </thead>
  );
}

// ─── 5. Table Header Cell (with sorting) ────────────────────────────────────────
export function TableHeaderCell({ 
  children, 
  sortable = false, 
  sortKey, 
  sortConfig, 
  onSort,
  width,
  minWidth,
  align = "left",
  className = "" 
}) {
  const isSorted = sortConfig?.key === sortKey;
  const sortDirection = isSorted ? sortConfig.direction : null;

  const handleClick = () => {
    if (sortable && onSort && sortKey) {
      onSort(sortKey);
    }
  };

  return (
    <th
      className={`px-6 py-4 text-${align} font-semibold text-gray-600 text-xs uppercase tracking-widest
        ${sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}
        ${className}`}
      onClick={handleClick}
      style={{ width, minWidth }}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
        {children}
        {sortable && (
          <span className="text-gray-400 text-xs">
            {isSorted ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
          </span>
        )}
      </div>
    </th>
  );
}

// ─── 6. Table Body ──────────────────────────────────────────────────────────────
export function TableBody({ children, loading = false, emptyMessage = "No data found", colSpan = 10 }) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="text-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-[#009E99] rounded-full animate-spin" />
              <span className="text-gray-500 text-sm">Loading leads...</span>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (!children || (Array.isArray(children) && children.length === 0)) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="text-center py-16">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-14 h-14 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
              <p className="text-gray-400 text-sm mt-2">{emptyMessage}</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

// ─── 7. Table Row ───────────────────────────────────────────────────────────────
export function TableRow({ 
  children, 
  onClick, 
  className = "", 
  selected = false, 
  hoverable = true 
}) {
  return (
    <tr
      className={`
        ${hoverable ? 'hover:bg-teal-50/70 cursor-pointer transition-all' : ''}
        ${selected ? 'bg-teal-50' : ''}
        border-b border-gray-100
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// ─── 8. Table Cell ──────────────────────────────────────────────────────────────
export function TableCell({ 
  children, 
  className = "", 
  align = "left",
  colSpan,
  onClick 
}) {
  return (
    <td
      className={`px-6 py-4 text-${align} text-gray-700 ${className}`}
      colSpan={colSpan}
      onClick={onClick}
    >
      {children}
    </td>
  );
}

// ─── 9. Checkbox Cell ───────────────────────────────────────────────────────────
export function CheckboxCell({ checked, onChange, className = "" }) {
  return (
    <td className={`px-6 py-4 w-10 ${className}`} onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-[#009E99] rounded border-gray-300 focus:ring-[#009E99] cursor-pointer"
      />
    </td>
  );
}

// ─── 10. Avatar Cell ────────────────────────────────────────────────────────────
export function AvatarCell({ 
  name, 
  email, 
  subtitle, 
  avatarUrl, 
  size = 38,
  className = "" 
}) {
  const bgColor = getAvatarColor(name);
  const initialChars = initials(name);

  return (
    <td className={`px-6 py-4 ${className}`}>
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name} 
            className="rounded-2xl object-cover flex-shrink-0"
            style={{ width: size, height: size }}
          />
        ) : (
          <div 
            className="rounded-2xl flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm"
            style={{ width: size, height: size, background: bgColor, fontSize: size * 0.38 }}
          >
            {initialChars}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900">{name}</div>
          {email && <div className="text-xs text-gray-500 truncate">{email}</div>}
          {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        </div>
      </div>
    </td>
  );
}

// ─── 11. Status Badge Cell ──────────────────────────────────────────────────────
export function StatusCell({ status, className = "" }) {
  const styles = {
    new:        { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
    contacted:  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
    counseling: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    evaluated:  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    applied:    { bg: "bg-cyan-50",   text: "text-cyan-700",   border: "border-cyan-200" },
    visa:       { bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-200" },
    success:    { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200" },
    lost:       { bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-200" },
  };

  const s = styles[status?.toLowerCase()] || styles.new;
  const displayText = status ? status.charAt(0).toUpperCase() + status.slice(1) : "New";

  return (
    <td className={`px-6 py-4 ${className}`}>
      <span className={`inline-flex px-3.5 py-1 text-xs font-semibold rounded-2xl border ${s.bg} ${s.text} ${s.border}`}>
        {displayText}
      </span>
    </td>
  );
}

// ─── 12. Badge Cell (Generic) ───────────────────────────────────────────────────
export function BadgeCell({ value, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    error:   "bg-red-100 text-red-700",
    info:    "bg-blue-100 text-blue-700",
  };

  return (
    <td className={`px-6 py-4 ${className}`}>
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-2xl ${variants[variant]}`}>
        {value}
      </span>
    </td>
  );
}

// ─── 13. Action Cell with Dropdown ──────────────────────────────────────────────
export function ActionCell({ onView, onEdit, onDelete, onCustomActions = [], className = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <td className={`px-6 py-4 ${className}`}>
      <div className="relative">
        <button
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 py-2 text-sm">
              {onView && (
                <button onClick={() => { onView(); setMenuOpen(false); }} className="w-full px-5 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                  View Details
                </button>
              )}
              {onEdit && (
                <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full px-5 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                  Edit Lead
                </button>
              )}
              {onDelete && (
                <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full px-5 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-gray-100">
                  Delete Lead
                </button>
              )}
              {onCustomActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => { action.onClick(); setMenuOpen(false); }}
                  className="w-full px-5 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </td>
  );
}

// ─── 14. Select Cell (Dropdown) ─────────────────────────────────────────────────
export function SelectCell({ value, options, onChange, placeholder = "Select...", className = "" }) {
  return (
    <td className={`px-6 py-4 ${className}`} onClick={(e) => e.stopPropagation()}>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#009E99] focus:border-transparent bg-white"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </td>
  );
}

// ─── 15. Date Cell ──────────────────────────────────────────────────────────────
export function DateCell({ date, format = "short", className = "" }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    
    if (format === "short") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    if (format === "relative") {
      const diff = Date.now() - d.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <td className={`px-6 py-4 text-gray-600 whitespace-nowrap ${className}`}>
      {formatDate(date)}
    </td>
  );
}

// ─── 16. Link Cell ──────────────────────────────────────────────────────────────
export function LinkCell({ text, href, onClick, className = "" }) {
  return (
    <td className={`px-6 py-4 ${className}`}>
      {href ? (
        <a href={href} className="text-[#009E99] hover:underline" onClick={(e) => e.stopPropagation()}>
          {text}
        </a>
      ) : onClick ? (
        <button className="text-[#009E99] hover:underline" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          {text}
        </button>
      ) : (
        <span className="text-gray-700">{text}</span>
      )}
    </td>
  );
}

// ─── 18. Table Pagination ───────────────────────────────────────────────────────
export function TablePagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  onPageChange, 
  itemsPerPage = 20,
  className = "" 
}) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 px-8 py-5 border-t border-gray-100 bg-gray-50 ${className}`}>
      <div className="text-sm text-gray-500">
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
      </div>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 text-sm border border-gray-200 rounded-2xl hover:bg-white disabled:opacity-50 transition"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        {getPageNumbers().map(page => (
          <button
            key={page}
            className={`px-4 py-2 text-sm border rounded-2xl transition-all ${page === currentPage 
              ? 'bg-[#009E99] text-white border-[#009E99]' 
              : 'border-gray-200 hover:bg-white text-gray-700'}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="px-4 py-2 text-sm border border-gray-200 rounded-2xl hover:bg-white disabled:opacity-50 transition"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ─── 20. Complete Table Component (Wrapper) ─────────────────────────────────────
export function DataTable({
  columns,
  data,
  keyField = "id",
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  sortConfig,
  onSort,
  onRowClick,
  emptyMessage = "No data found",
  className = ""
}) {
  const isAllSelected = selectable && data.length > 0 && selectedRows.length === data.length;

  return (
    <TableContainer className={className}>
      <TableWrapper>
        <CustomTable>
          <TableHeader>
            <tr>
              {selectable && (
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="w-4 h-4 text-[#009E99] rounded border-gray-300 focus:ring-[#009E99]"
                  />
                </th>
              )}
              {columns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  sortable={column.sortable}
                  sortKey={column.key}
                  sortConfig={sortConfig}
                  onSort={onSort}
                  width={column.width}
                  minWidth={column.minWidth}
                  align={column.align}
                >
                  {column.label}
                </TableHeaderCell>
              ))}
            </tr>
          </TableHeader>
          <TableBody loading={loading} emptyMessage={emptyMessage} colSpan={columns.length + (selectable ? 1 : 0)}>
            {data.map((row) => (
              <TableRow
                key={row[keyField]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                selected={selectable && selectedRows.includes(row[keyField])}
              >
                {selectable && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row[keyField])}
                      onChange={() => onSelectRow?.(row[keyField])}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-[#009E99] rounded border-gray-300 focus:ring-[#009E99]"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </CustomTable>
      </TableWrapper>
    </TableContainer>
  );
}