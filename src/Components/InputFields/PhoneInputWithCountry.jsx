// PhoneInputWithCountry.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Phone, ChevronDown, Search } from "lucide-react";
import { PHONE_COUNTRIES } from "../../constants/countries";
import CountryFlag from "react-country-flag";

export default function PhoneInputWithCountry({
  value = "",
  onChange,
  name = "phone",
  labelName = "Phone Number *",
  error,
  defaultCountryCode = "+92",
  disabled = false,
}) {
  // Store the full selected country object instead of only the code
  const defaultCountry =
    PHONE_COUNTRIES.find((c) => c.value === defaultCountryCode) ||
    PHONE_COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [number, setNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // for keyboard navigation
  const dropdownRef = useRef(null);

  const filteredCountries = PHONE_COUNTRIES.filter(
    (c) =>
      c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.value.includes(searchTerm),
  );

  // Check if label contains an asterisk
  const hasStar = labelName?.includes("*");
  const cleanLabel = hasStar ? labelName.replace(/\s*\*$/, "") : labelName;

  // Sync internal state when external `value` prop changes
  useEffect(() => {
    if (!value) {
      setNumber("");
      return;
    }

    const trimmedValue = value.trim();

    // Format: +92 3001234567  or  +1 1234567890
    const match = trimmedValue.match(/^(\+\d+)\s*(\d*)$/);

    if (match) {
      const code = match[1];
      const extractedNumber = match[2];

      // Find a country that matches this code
      const matchedCountry = PHONE_COUNTRIES.find((c) => c.value === code);
      if (matchedCountry) {
        // Update selected country (preserve user's exact pick if code is same)
        setSelectedCountry(matchedCountry);
      }
      setNumber(extractedNumber);
      return;
    }

    // Existing DB values like 923001234567 (assumes +92)
    if (/^92\d+$/.test(trimmedValue)) {
      const pkCountry = PHONE_COUNTRIES.find((c) => c.value === "+92");
      if (pkCountry) setSelectedCountry(pkCountry);
      setNumber(trimmedValue.slice(2));
      return;
    }

    setNumber(trimmedValue);
  }, [value]);

  // Click outside closes dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation for dropdown
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleKeyDown = (e) => {
      // Only handle these keys when dropdown is open
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (filteredCountries.length === 0) return -1;
          if (prev < filteredCountries.length - 1) return prev + 1;
          return 0; // wrap to first
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (filteredCountries.length === 0) return -1;
          if (prev > 0) return prev - 1;
          return filteredCountries.length - 1; // wrap to last
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
          handleSelectCountry(filteredCountries[highlightedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dropdownOpen, filteredCountries, highlightedIndex]);

  // Reset highlighted index when search term changes or dropdown opens/closes
  useEffect(() => {
    if (dropdownOpen) {
      setHighlightedIndex(-1);
    }
  }, [searchTerm, dropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (dropdownOpen && highlightedIndex >= 0) {
      const highlightedElement = document.querySelector(
        `[data-index="${highlightedIndex}"]`,
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, dropdownOpen]);

  const handleSelectCountry = useCallback(
    (countryObj) => {
      setSelectedCountry(countryObj);
      setDropdownOpen(false);
      setSearchTerm("");
      // Notify parent with full phone number: code + number
      onChange?.({
        target: { name, value: `${countryObj.value} ${number}`.trim() },
      });
    },
    [onChange, name, number],
  );

  const handleNumberChange = (e) => {
    let inputValue = e.target.value;

    // Prevent leading spaces
    if (inputValue.startsWith(" ")) {
      inputValue = inputValue.trimStart();
    }

    let num = inputValue.replace(/\D/g, "");

    // Prevent starting with 0
    if (num.startsWith("0")) {
      return;
    }

    if (num.length > 15) {
      num = num.slice(0, 15);
    }

    setNumber(num);

    onChange?.({
      target: {
        name,
        value: `${selectedCountry.value} ${num}`.trim(),
      },
    });
  };

  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-xs font-semibold">
        {cleanLabel}
        {hasStar && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div
        className={`
          flex items-center w-full
          border border-gray-200 rounded-lg shadow
          bg-white transition-all
          focus-within:ring-1 focus-within:ring-[#009E99] focus-within:border-gray-200
          ${error ? "border-red-400" : ""}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
        `}
      >
        {/* Country code selector */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              if (disabled) return;
              setDropdownOpen((prev) => !prev);
              setSearchTerm("");
              setHighlightedIndex(-1);
            }}
            disabled={disabled}
            className={`
              flex items-center gap-1.5 px-3 py-3
              border-r border-gray-200 rounded-l-lg
              transition-colors h-full
              ${
                disabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }
            `}
          >
            <CountryFlag
              countryCode={selectedCountry.iso}
              svg
              style={{
                width: "1.4em",
                height: "1.1em",
                borderRadius: "2px",
                objectFit: "cover",
              }}
              title={selectedCountry.name}
            />
            <span className="text-sm font-medium text-gray-700">
              {selectedCountry.value}
            </span>
            <ChevronDown
              size={13}
              className={`text-gray-400 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50">
                  <Search size={13} className="text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search country or code..."
                    className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    No results found
                  </div>
                ) : (
                  filteredCountries.map((c, idx) => (
                    <div
                      key={c.id}
                      data-index={idx}
                      onClick={() => handleSelectCountry(c)}
                      className={`
                        flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer
                        hover:bg-gray-50 transition-colors
                        ${
                          c.value === selectedCountry.value &&
                          c.iso === selectedCountry.iso
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700"
                        }
                        ${idx === highlightedIndex ? "bg-gray-100" : ""}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <CountryFlag
                          countryCode={c.iso}
                          svg
                          style={{
                            width: "1.4em",
                            height: "1.1em",
                            borderRadius: "2px",
                          }}
                          title={c.name}
                        />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">
                        {c.value}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone number input */}
        <div className="flex items-center flex-1 px-3 gap-2">
          <input
            type="tel"
            value={number}
            onChange={handleNumberChange}
            disabled={disabled}
            className={`
              flex-1 py-2.5 text-sm bg-transparent
              focus:outline-none placeholder:text-gray-400
              text-gray-500
              ${disabled ? "cursor-not-allowed" : ""}
            `}
            maxLength={15}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
}
