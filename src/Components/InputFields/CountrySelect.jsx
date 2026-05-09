import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Globe } from "lucide-react";
import { COUNTRIES } from "../../constants/countries";   // Adjust path if needed
import { ChevronDown } from "lucide-react";
export default function CountrySelect({
  value = "",
  onChange,
  name = "target_country",
  labelName = "Target Country",
  placeholder = "Select country",
  error,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return COUNTRIES;
    const term = searchTerm.toLowerCase();
    return COUNTRIES.filter((c) =>
      c.country.toLowerCase().includes(term) || 
      c.iso.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const selectedCountry = COUNTRIES.find(c => c.country === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (countryName) => {
    onChange({ target: { name, value: countryName } });
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="space-y-1" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {labelName} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {/* Display Selected Country */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full border ${error ? "border-red-400" : "border-gray-200"} 
                     rounded-xl px-4 py-2.5 cursor-pointer flex items-center justify-between hover:border-teal-400 transition-all`}
        >
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-gray-400" />
            <span className={value ? "text-gray-800" : "text-gray-400"}>
              {value ? value : placeholder}
            </span>
          </div>
          <ChevronDown size={18} className="text-gray-400" />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b sticky top-0 bg-white">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search country..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400 text-sm"
                />
              </div>
            </div>

            {/* Country List */}
            <div className="max-h-64 overflow-auto py-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <div
                    key={c.iso}
                    onClick={() => handleSelect(c.country)}
                    className={`px-4 py-3 hover:bg-teal-50 cursor-pointer flex items-center gap-3 text-sm border-b last:border-none ${
                      value === c.country ? "bg-teal-50 font-medium" : ""
                    }`}
                  >
                    <span>{c.country}</span>
                    <span className="text-gray-400 text-xs">({c.iso})</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">No country found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}