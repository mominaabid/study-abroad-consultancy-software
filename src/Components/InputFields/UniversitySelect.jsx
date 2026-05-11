import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";

export default function UniversitySelect({
  value = "",
  onChange,
  name = "target_university",
  labelName = "Target University ",
  placeholder = "Select or type university name...",
  required = true,
  universities = [], // array of strings
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUniversities = useMemo(() => {
    if (!searchTerm.trim()) return universities;
    return universities.filter((uni) =>
      uni.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [universities, searchTerm]);

  const handleSelect = (uniName) => {
    onChange({ target: { name, value: uniName } });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange({ target: { name, value: newValue } }); // Allow free typing
  };

  return (
    <div className="space-y-1" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {labelName} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {/* Main Input - Click to open dropdown, can also type */}
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 focus:ring-1 focus:ring-teal-200 outline-none pr-10"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown size={20} className={`${isOpen ? "rotate-180" : ""} transition-transform`} />
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-[320px] flex flex-col">
            
            {/* Search inside dropdown */}
            <div className="p-3 border-b sticky top-0 bg-white">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search from list..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-teal-400"
                />
              </div>
            </div>

            {/* University List */}
            <div className="overflow-y-auto flex-1">
              {filteredUniversities.length > 0 ? (
                filteredUniversities.map((uni, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelect(uni)}
                    className={`px-4 py-3 text-sm cursor-pointer hover:bg-teal-50 border-b border-gray-50 last:border-none
                      ${value === uni ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700"}`}
                  >
                    {uni}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No matching university found<br />
                  <span className="text-xs">You can type custom name above</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}