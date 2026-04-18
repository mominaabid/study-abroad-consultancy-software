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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
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
    <thead className={`bg-gray-50 border-b border-gray-200 ${className}`}>
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
      className={`px-4 py-3 text-${align} font-semibold text-gray-600 text-xs uppercase tracking-wider
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
          <td colSpan={colSpan} className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-gray-500 text-sm">Loading...</span>
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
          <td colSpan={colSpan} className="text-center py-12">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                <line x1="9" y1="9" x2="15" y2="15" strokeWidth="1.5" />
                <line x1="15" y1="9" x2="9" y2="15" strokeWidth="1.5" />
              </svg>
              <p className="text-gray-400 text-sm">{emptyMessage}</p>
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
        ${hoverable ? 'hover:bg-gray-50 cursor-pointer' : ''}
        ${selected ? 'bg-blue-50' : ''}
        border-b border-gray-100
        transition-colors duration-150
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
      className={`px-4 py-3 text-${align} text-gray-700 ${className}`}
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
    <td className={`px-4 py-3 w-10 ${className}`} onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
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
  size = 34,
  className = "" 
}) {
  const bgColor = getAvatarColor(name);
  const initialChars = initials(name);

  return (
    <td className={`px-4 py-3 ${className}`}>
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name} 
            className="rounded-full object-cover flex-shrink-0"
            style={{ width: size, height: size }}
          />
        ) : (
          <div 
            className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            style={{ width: size, height: size, background: bgColor, fontSize: size * 0.36 }}
          >
            {initialChars}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900">{name}</div>
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
    new: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    contacted: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    counseling: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    evaluated: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    applied: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
    visa: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
    success: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    lost: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  };

  const s = styles[status] || styles.new;
  const displayText = status?.charAt(0).toUpperCase() + status?.slice(1);

  return (
    <td className={`px-4 py-3 ${className}`}>
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${s.bg} ${s.text} ${s.border}`}>
        {displayText}
      </span>
    </td>
  );
}

// ─── 12. Badge Cell (Generic) ───────────────────────────────────────────────────
export function BadgeCell({ value, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <td className={`px-4 py-3 ${className}`}>
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${variants[variant]}`}>
        {value}
      </span>
    </td>
  );
}

// ─── 13. Action Cell with Dropdown ──────────────────────────────────────────────
export function ActionCell({ onView, onEdit, onDelete, onCustomActions = [], className = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <td className={`px-4 py-3 ${className}`}>
      <div className="relative">
        <button
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        
        {menuOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
              {onView && (
                <button
                  onClick={() => { onView(); setMenuOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  View Details
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => { onEdit(); setMenuOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Delete
                </button>
              )}
              {onCustomActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => { action.onClick(); setMenuOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
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
    <td className={`px-4 py-3 ${className}`} onClick={(e) => e.stopPropagation()}>
      <select
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
    if (format === "long") {
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
    if (format === "relative") {
      const diff = Date.now() - d.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return dateStr;
  };

  return (
    <td className={`px-4 py-3 text-gray-600 whitespace-nowrap ${className}`}>
      {formatDate(date)}
    </td>
  );
}

// ─── 16. Link Cell ──────────────────────────────────────────────────────────────
export function LinkCell({ text, href, onClick, className = "" }) {
  return (
    <td className={`px-4 py-3 ${className}`}>
      {href ? (
        <a 
          href={href} 
          className="text-blue-600 hover:text-blue-800 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {text}
        </a>
      ) : onClick ? (
        <button
          className="text-blue-600 hover:text-blue-800 hover:underline"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          {text}
        </button>
      ) : (
        <span className="text-gray-700">{text}</span>
      )}
    </td>
  );
}

// ─── 17. Tags Cell ──────────────────────────────────────────────────────────────
export function TagsCell({ tags, maxDisplay = 3, className = "" }) {
  const displayTags = tags?.slice(0, maxDisplay) || [];
  const remaining = (tags?.length || 0) - maxDisplay;

  return (
    <td className={`px-4 py-3 ${className}`}>
      <div className="flex flex-wrap gap-1">
        {displayTags.map((tag, idx) => (
          <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
            {tag}
          </span>
        ))}
        {remaining > 0 && (
          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
            +{remaining}
          </span>
        )}
      </div>
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

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ← Previous
        </button>
        {getPageNumbers().map(page => (
          <button
            key={page}
            className={`px-3 py-1.5 text-sm border rounded-md transition-colors
              ${page === currentPage 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── 19. Table Search ───────────────────────────────────────────────────────────
export function TableSearch({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      />
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
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row[keyField])}
                      onChange={() => onSelectRow?.(row[keyField])}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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