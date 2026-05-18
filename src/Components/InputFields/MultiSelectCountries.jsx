import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { COUNTRIES } from "../../constants/countries";

export default function MultiSelectCountries({
  value = "",
  onChange,
  name = "preferred_country",
  labelName = "Preferred Countries *",
  error,
  maxSelections = 5,
  filteredCountries = [],           
  onSearchChange,                   
  searchTerm = "",
}) {
  const [selected, setSelected] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const countryOptions = filteredCountries.length > 0 
    ? filteredCountries 
    : COUNTRIES.map((c) => ({
        value: c.country,
        display: `${c.country} (${c.iso})`,
      }));

  useEffect(() => {
    if (value) {
      const initial = value.split(",").map(s => s.trim()).filter(Boolean);
      setSelected(initial);
    } else {
      setSelected([]);
    }
  }, [value]);

  const handleSelect = (countryName) => {
    if (selected.includes(countryName) || selected.length >= maxSelections) return;

    const newSelected = [...selected, countryName];
    setSelected(newSelected);
    onChange?.({ target: { name, value: newSelected.join(", ") } });
  };

  const removeCountry = (countryToRemove) => {
    const newSelected = selected.filter(c => c !== countryToRemove);
    setSelected(newSelected);
    onChange?.({ target: { name, value: newSelected.join(", ") } });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {labelName}
      </label>

      <div className="relative">
        {/* Selected Tags */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[46px] border border-slate-300 rounded-xl px-4 py-2 cursor-pointer flex flex-wrap gap-2 items-center bg-white hover:border-blue-500"
        >
          {selected.length === 0 ? (
            <span className="text-slate-400 text-sm">Select preferred countries...</span>
          ) : (
            selected.map(country => (
              <div key={country} className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-lg flex items-center gap-1">
                {country}
                <X size={14} className="cursor-pointer hover:text-red-600" 
                   onClick={(e) => { e.stopPropagation(); removeCountry(country); }} />
              </div>
            ))
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto py-1">
            {countryOptions.map((c) => (
              <div
                key={c.value}
                onClick={() => handleSelect(c.value)}
                className={`px-4 py-2.5 hover:bg-slate-100 cursor-pointer text-sm ${
                  selected.includes(c.value) ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {c.display}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-[10px] ml-1">{error}</p>}
    </div>
  );
}