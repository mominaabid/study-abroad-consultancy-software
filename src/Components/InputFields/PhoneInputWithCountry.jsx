import { useState, useEffect, useRef } from "react";
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
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [number, setNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCountry =
    PHONE_COUNTRIES.find((c) => c.value === countryCode) || PHONE_COUNTRIES[0];

  const filteredCountries = PHONE_COUNTRIES.filter(
    (c) =>
      c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.value.includes(searchTerm),
  );

  useEffect(() => {
    if (value) {
      const match = value.match(/^(\+\d[\d-]*)\s*(.*)$/);
      if (match) {
        setCountryCode(match[1]);
        setNumber(match[2].trim());
      } else {
        setNumber(value);
      }
    }
  }, [value]);

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

  const handleSelectCountry = (c) => {
    setCountryCode(c.value);
    setDropdownOpen(false);
    setSearchTerm("");
    onChange?.({ target: { name, value: `${c.value} ${number}`.trim() } });
  };

  const handleNumberChange = (e) => {
    let num = e.target.value.replace(/\D/g, "");

    // 1. Reject if first digit is '0' and there is at least one digit
    if (num.startsWith("0") && num.length > 0) {
      // Do not update the value; simply return (keeps previous number)
      return;
    }

    // 2. Limit to maximum 15 digits
    if (num.length > 15) {
      num = num.slice(0, 15);
    }

    setNumber(num);
    onChange?.({ target: { name, value: `${countryCode} ${num}`.trim() } });
  };

  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-xs font-semibold">{labelName}</label>

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
                  filteredCountries.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCountry(c)}
                      className={`
                        flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer
                        hover:bg-gray-50 transition-colors
                        ${
                          c.value === countryCode
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700"
                        }
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
          <Phone size={14} className="text-gray-400 shrink-0" />
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
            placeholder="1234567890" // updated placeholder
            maxLength={15}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
}
