import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";

/**
 * Reusable Searchable Select Component
 *
 * @param {Object} props
 * @param {Array} props.options - Array of options { value, label, icon? }
 * @param {string|number} props.value - Currently selected value
 * @param {Function} props.onChange - Change handler (returns { target: { name, value } })
 * @param {string} props.name - Input name attribute
 * @param {string} props.label - Label text
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {ReactNode} props.icon - Icon to show in input
 * @param {boolean} props.required - Show required asterisk
 * @param {boolean} props.disabled - Disable the component
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onSearch - Optional callback when searching (for async)
 * @param {number} props.maxHeight - Max height of dropdown (default: 52)
 */
export default function SearchableSelect({
  options = [],
  value = "",
  onChange,
  name,
  label,
  placeholder = "Search...",
  error,
  icon,
  required = false,
  disabled = false,
  className = "",
  onSearch,
  maxHeight = 120,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Find selected option
  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.label?.toLowerCase().includes(query.toLowerCase()),
  );

  // Block space key when input is empty
  const preventLeadingSpace = (e) => {
    if (e.key === " " && e.target.value.length === 0) {
      e.preventDefault();
    }
  };

  // Block pasting a string that starts with space
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.startsWith(" ")) {
      e.preventDefault();
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery(""); // Reset query when closing
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Call onSearch when query changes (for async search)
  useEffect(() => {
    if (onSearch && query) {
      const debounceTimer = setTimeout(() => {
        onSearch(query);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [query, onSearch]);

  const handleSelect = (opt) => {
    // Trim the value just to be safe (though options should not have leading spaces)
    const trimmedValue = String(opt.value).trim();
    onChange({ target: { name, value: trimmedValue } });
    setQuery("");
    setOpen(false);
  };

  const handleClear = () => {
    onChange({ target: { name, value: "" } });
    setQuery("");
  };

  const handleInputChange = (e) => {
    let newValue = e.target.value;
    // Block leading space
    if (newValue.startsWith(" ")) return;
    setQuery(newValue);
    setOpen(true);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div
        className={`flex items-center gap-2 w-full px-4 py-2.5 border rounded-xl bg-white text-sm cursor-text transition-all
          ${disabled ? "bg-slate-100 cursor-not-allowed opacity-60" : "bg-white"}
          ${error ? "border-red-400 ring-1 ring-red-200" : open ? "border-blue-500 ring-1 ring-blue-100" : "border-slate-300 hover:border-slate-400"}
        `}
        onClick={() => !disabled && setOpen(true)}
      >
        {/* Left Icon */}
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}

        {/* Search Icon */}
        <Search size={15} className="text-slate-400 shrink-0" />

        {/* Input */}
        <input
          type="text"
          className="flex-1 outline-none bg-transparent text-slate-700 placeholder:text-slate-400 min-w-0"
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={open ? query : selectedOption ? selectedOption.label : ""}
          onChange={handleInputChange}
          onFocus={() => !disabled && setOpen(true)}
          onKeyDown={preventLeadingSpace}
          onPaste={handlePaste}
          disabled={disabled}
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 p-0.5 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={14} className="text-slate-400" />
          </button>
        )}

        {/* Chevron Icon */}
        <ChevronDown
          size={15}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div
            className={`overflow-y-auto py-1`}
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(value) === String(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors
                      ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-700"}
                    `}
                  >
                    {opt.icon && (
                      <span className="text-base shrink-0">{opt.icon}</span>
                    )}
                    <span className="flex-1">{opt.label}</span>
                    {isSelected && (
                      <span className="text-blue-500 text-xs font-semibold shrink-0">
                        ✓ Selected
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
}
