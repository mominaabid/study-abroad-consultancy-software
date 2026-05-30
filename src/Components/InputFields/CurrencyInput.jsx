// CurrencyInput.jsx (updated with searchable currency dropdown)
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

const CURRENCIES = {
  USD: { symbol: "$", label: "US Dollar (USD)" },
  EUR: { symbol: "€", label: "Euro (EUR)" },
  GBP: { symbol: "£", label: "British Pound (GBP)" },
  JPY: { symbol: "¥", label: "Japanese Yen (JPY)" },
  CAD: { symbol: "C$", label: "Canadian Dollar (CAD)" },
  AUD: { symbol: "A$", label: "Australian Dollar (AUD)" },
  CHF: { symbol: "Fr", label: "Swiss Franc (CHF)" },
  CNY: { symbol: "¥", label: "Chinese Yuan (CNY)" },
  INR: { symbol: "₹", label: "Indian Rupee (INR)" },
  BRL: { symbol: "R$", label: "Brazilian Real (BRL)" },
  RUB: { symbol: "₽", label: "Russian Ruble (RUB)" },
  ZAR: { symbol: "R", label: "South African Rand (ZAR)" },
  MXN: { symbol: "$", label: "Mexican Peso (MXN)" },
  SGD: { symbol: "S$", label: "Singapore Dollar (SGD)" },
  HKD: { symbol: "HK$", label: "Hong Kong Dollar (HKD)" },
  NOK: { symbol: "kr", label: "Norwegian Krone (NOK)" },
  SEK: { symbol: "kr", label: "Swedish Krona (SEK)" },
  DKK: { symbol: "kr", label: "Danish Krone (DKK)" },
  PLN: { symbol: "zł", label: "Polish Zloty (PLN)" },
  TRY: { symbol: "₺", label: "Turkish Lira (TRY)" },
  KRW: { symbol: "₩", label: "South Korean Won (KRW)" },
  ILS: { symbol: "₪", label: "Israeli Shekel (ILS)" },
  IDR: { symbol: "Rp", label: "Indonesian Rupiah (IDR)" },
  THB: { symbol: "฿", label: "Thai Baht (THB)" },
  MYR: { symbol: "RM", label: "Malaysian Ringgit (MYR)" },
  PHP: { symbol: "₱", label: "Philippine Peso (PHP)" },
  VND: { symbol: "₫", label: "Vietnamese Dong (VND)" },
  PKR: { symbol: "₨", label: "Pakistani Rupee (PKR)" },
  BDT: { symbol: "৳", label: "Bangladeshi Taka (BDT)" },
  NGN: { symbol: "₦", label: "Nigerian Naira (NGN)" },
  EGP: { symbol: "E£", label: "Egyptian Pound (EGP)" },
  SAR: { symbol: "﷼", label: "Saudi Riyal (SAR)" },
  AED: { symbol: "د.إ", label: "UAE Dirham (AED)" },
  QAR: { symbol: "﷼", label: "Qatari Riyal (QAR)" },
  KWD: { symbol: "د.ك", label: "Kuwaiti Dinar (KWD)" },
  BHD: { symbol: ".د.ب", label: "Bahraini Dinar (BHD)" },
  OMR: { symbol: "﷼", label: "Omani Rial (OMR)" },
  JOD: { symbol: "د.ا", label: "Jordanian Dinar (JOD)" },
  LBP: { symbol: "ل.ل", label: "Lebanese Pound (LBP)" },
  IQD: { symbol: "ع.د", label: "Iraqi Dinar (IQD)" },
  IRR: { symbol: "﷼", label: "Iranian Rial (IRR)" },
  AFN: { symbol: "؋", label: "Afghan Afghani (AFN)" },
  KZT: { symbol: "₸", label: "Kazakhstani Tenge (KZT)" },
  UZS: { symbol: "soʻm", label: "Uzbekistani Som (UZS)" },
  TMT: { symbol: "m", label: "Turkmenistani Manat (TMT)" },
  GEL: { symbol: "₾", label: "Georgian Lari (GEL)" },
  AMD: { symbol: "֏", label: "Armenian Dram (AMD)" },
  AZN: { symbol: "₼", label: "Azerbaijani Manat (AZN)" },
  BGN: { symbol: "лв", label: "Bulgarian Lev (BGN)" },
  RON: { symbol: "lei", label: "Romanian Leu (RON)" },
  MDL: { symbol: "L", label: "Moldovan Leu (MDL)" },
  UAH: { symbol: "₴", label: "Ukrainian Hryvnia (UAH)" },
  BYN: { symbol: "Br", label: "Belarusian Ruble (BYN)" },
  CZK: { symbol: "Kč", label: "Czech Koruna (CZK)" },
  HUF: { symbol: "Ft", label: "Hungarian Forint (HUF)" },
  HRK: { symbol: "kn", label: "Croatian Kuna (HRK)" },
  ISK: { symbol: "kr", label: "Icelandic Króna (ISK)" },
  RSD: { symbol: "дин.", label: "Serbian Dinar (RSD)" },
  MKD: { symbol: "ден", label: "Macedonian Denar (MKD)" },
  ALL: { symbol: "L", label: "Albanian Lek (ALL)" },
  BAM: { symbol: "KM", label: "Bosnian Convertible Mark (BAM)" },
  KHR: { symbol: "៛", label: "Cambodian Riel (KHR)" },
  LAK: { symbol: "₭", label: "Lao Kip (LAK)" },
  MMK: { symbol: "K", label: "Myanmar Kyat (MMK)" },
  LKR: { symbol: "Rs", label: "Sri Lankan Rupee (LKR)" },
  NPR: { symbol: "₨", label: "Nepalese Rupee (NPR)" },
  BTN: { symbol: "Nu.", label: "Bhutanese Ngultrum (BTN)" },
  MVR: { symbol: "Rf", label: "Maldivian Rufiyaa (MVR)" },
  KGS: { symbol: "с", label: "Kyrgyzstani Som (KGS)" },
  TJS: { symbol: "SM", label: "Tajikistani Somoni (TJS)" },
  MNT: { symbol: "₮", label: "Mongolian Tögrög (MNT)" },
  KPW: { symbol: "₩", label: "North Korean Won (KPW)" },
  TWD: { symbol: "NT$", label: "New Taiwan Dollar (TWD)" },
  MOP: { symbol: "MOP$", label: "Macanese Pataca (MOP)" },
  BND: { symbol: "B$", label: "Brunei Dollar (BND)" },
  FJD: { symbol: "FJ$", label: "Fijian Dollar (FJD)" },
  PGK: { symbol: "K", label: "Papua New Guinean Kina (PGK)" },
  SBD: { symbol: "SI$", label: "Solomon Islands Dollar (SBD)" },
  VUV: { symbol: "VT", label: "Vanuatu Vatu (VUV)" },
  WST: { symbol: "T", label: "Samoan Tālā (WST)" },
  TOP: { symbol: "T$", label: "Tongan Paʻanga (TOP)" },
  KID: { symbol: "$", label: "Kiribati Dollar (KID)" },
  NZD: { symbol: "NZ$", label: "New Zealand Dollar (NZD)" },
  XAF: { symbol: "Fr", label: "Central African CFA Franc (XAF)" },
  XOF: { symbol: "Fr", label: "West African CFA Franc (XOF)" },
  XPF: { symbol: "Fr", label: "CFP Franc (XPF)" },
  GMD: { symbol: "D", label: "Gambian Dalasi (GMD)" },
  GHS: { symbol: "₵", label: "Ghanaian Cedi (GHS)" },
  TND: { symbol: "د.ت", label: "Tunisian Dinar (TND)" },
  DZD: { symbol: "د.ج", label: "Algerian Dinar (DZD)" },
  MAD: { symbol: "د.م.", label: "Moroccan Dirham (MAD)" },
  MUR: { symbol: "₨", label: "Mauritian Rupee (MUR)" },
  SCR: { symbol: "₨", label: "Seychellois Rupee (SCR)" },
  KES: { symbol: "KSh", label: "Kenyan Shilling (KES)" },
  UGX: { symbol: "USh", label: "Ugandan Shilling (UGX)" },
  TZS: { symbol: "TSh", label: "Tanzanian Shilling (TZS)" },
  RWF: { symbol: "FRw", label: "Rwandan Franc (RWF)" },
  BIF: { symbol: "FBu", label: "Burundian Franc (BIF)" },
  AOA: { symbol: "Kz", label: "Angolan Kwanza (AOA)" },
  CVE: { symbol: "Esc", label: "Cape Verdean Escudo (CVE)" },
  STN: { symbol: "Db", label: "São Tomé and Príncipe Dobra (STN)" },
  MZN: { symbol: "MT", label: "Mozambican Metical (MZN)" },
};

export default function CurrencyInput({
  value,
  onChange,
  name = "amount",
  currencyName = "currency",
  label = "Amount *",
  required = true,
}) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Initialize from props
  useEffect(() => {
    if (value && typeof value === "object") {
      setAmount(value.amount || "");
      setCurrency(value.currency || "USD");
    } else if (value !== undefined && value !== "") {
      setAmount(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAmountChange = (e) => {
    let val = e.target.value;
    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
      setAmount(val);
      if (onChange) {
        onChange({
          target: {
            name: name,
            value: val,
            currency: currency,
          },
        });
      }
    }
  };

  const handleCurrencySelect = (cur) => {
    setCurrency(cur);
    setIsOpen(false);
    setSearchTerm("");
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: amount,
          currency: cur,
        },
      });
    }
  };

  // Filter currencies based on search term (matches code, symbol, or label)
  const filteredCurrencies = Object.entries(CURRENCIES).filter(
    ([code, { symbol, label }]) =>
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const currentSymbol = CURRENCIES[currency]?.symbol || "$";

  return (
    <div className="mb-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative flex items-stretch">
        {/* Currency dropdown button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          <span className="text-base">{currentSymbol}</span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>

        {/* Amount input */}
        <input
          type="text"
          inputMode="decimal"
          required={required}
          value={amount}
          onChange={handleAmountChange}
          className="w-full border border-gray-200 rounded-r-xl px-3 py-2 outline-none focus:border-teal-400"
          placeholder="0.00"
        />

        {/* Currency dropdown with search */}
        {isOpen && (
          <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <div className="p-2 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50">
                <Search size={13} className="text-gray-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search currency..."
                  className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredCurrencies.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">
                  No currencies found
                </div>
              ) : (
                filteredCurrencies.map(([code, { symbol, label }]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleCurrencySelect(code)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                      currency === code
                        ? "bg-teal-50 text-teal-700"
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6">{symbol}</span>
                      <span>{label}</span>
                    </div>
                    {currency === code && (
                      <span className="text-teal-600 text-xs">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
