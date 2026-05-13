import { useState, useEffect, useRef } from "react";
import { SOURCES, STUDY_LEVELS, EMPTY_FORM } from "./LeadsConstants";
import { InputField } from "../InputFields/InputField";
import { OptionField } from "../InputFields/OptionField";
import { AddButton } from "../CustomButtons/AddButton";
import PhoneInputWithCountry from "../InputFields/PhoneInputWithCountry";
import { COUNTRIES } from "../../constants/countries";
import { Title } from "../Title";
import {
  User,
  Mail,
  BookOpen,
  X,
  Phone,
  Globe,
  GraduationCap,
  Radio,
  Search,
  ChevronDown,
} from "lucide-react";

const SOURCE_ICONS = {
  website: "🌐",
  walkin: "🚶",
  whatsapp: "💬",
  email: "📧",
  facebook: "🔵",
  referral: "🤝",
  google_ads: "🔍",
  linkedin: "💼",
  agent: "🏢",
};

// ─── Searchable Dropdown Component ───────────────────────────────────────────
function SearchableDropdown({ 
  options = [], 
  value, 
  onChange, 
  label, 
  placeholder = "Search...",
  error,
  icon,
  required = false
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  
  const filteredOptions = options.filter(opt =>
    opt.label?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt) => {
    onChange({ target: { name: label.toLowerCase().replace(/\s/g, "_"), value: opt.value } });
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && "*"}
      </label>

      <div
        className={`flex items-center gap-2 w-full px-4 py-2.5 border rounded-xl bg-white text-sm cursor-text transition-all
          ${error ? "border-red-400 ring-1 ring-red-200" : open ? "border-blue-500 ring-1 ring-blue-100" : "border-slate-300 hover:border-slate-400"}`}
        onClick={() => setOpen(true)}
      >
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          type="text"
          className="flex-1 outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={open ? query : selectedOption ? selectedOption.label : ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <ChevronDown
          size={15}
          className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
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
                      ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="ml-auto text-blue-500 text-xs">✓ Selected</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-[10px] mt-1 ml-1">{error}</p>}
    </div>
  );
}

// ─── Searchable Counsellor Select (with Unassigned option) ──────────────────
function SearchableCounsellorSelect({ counsellors = [], value, onChange, error }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Add "Unassigned" option at the beginning
  const counsellorsWithUnassigned = [
    { id: "unassigned", name: "Unassigned", user: { id: "unassigned" } },
    ...counsellors
  ];

  // Find selected option - treat null/undefined/empty as "unassigned"
  const selected = counsellorsWithUnassigned.find((c) => {
    const cId = String(c.user?.id || c.id);
    // If value is falsy (null, undefined, empty string, false, 0), show Unassigned
    if (!value || value === "" || value === "null" || value === null) {
      return cId === "unassigned";
    }
    return cId === String(value);
  });

  const filtered = counsellorsWithUnassigned.filter((c) =>
    c.name?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (c) => {
    const id = String(c.user?.id || c.id);
    // Send null for unassigned, otherwise send the ID
    const newValue = id === "unassigned" ? null : id;
    console.log("Setting counsellor_id to:", newValue); // Debug log
    onChange({ target: { name: "counsellor_id", value: newValue } });
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        Assign Counsellor (Optional)
      </label>

      <div
        className={`flex items-center gap-2 w-full px-3.5 py-2.5 border rounded-xl bg-white text-sm cursor-text transition-all
          ${error ? "border-red-400 ring-1 ring-red-200" : open ? "border-blue-500 ring-1 ring-blue-100" : "border-slate-300 hover:border-slate-400"}`}
        onClick={() => setOpen(true)}
      >
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          type="text"
          className="flex-1 outline-none bg-transparent text-slate-700 placeholder:text-slate-400 cursor-pointer"
          placeholder="Select counsellor or 'Unassigned'..."
          value={open ? query : selected ? selected.name : ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <ChevronDown
          size={15}
          className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                No options found
              </div>
            ) : (
              filtered.map((c) => {
                const id = String(c.user?.id || c.id);
                const isSelected = (!value || value === "" || value === "null" || value === null) 
                  ? id === "unassigned" 
                  : String(value) === id;
                const isUnassigned = id === "unassigned";
                
                return (
                  <div
                    key={id}
                    onClick={() => handleSelect(c)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors
                      ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    {!isUnassigned ? (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name?.charAt(0)?.toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                        <User size={14} />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span>{c.name}</span>
                      {isUnassigned && (
                        <span className="text-[10px] text-slate-400">Remove assignment</span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="ml-auto text-blue-500 text-xs">✓ Selected</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-[10px] mt-1 ml-1">{error}</p>}
    </div>
  );
}

// ─── Info Row ───────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-700 break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function LeadModal({
  open,
  onClose,
  onSave,
  counsellors = [],
  editLead,
  assignMode = false,
}) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    source: "walkin",
    study_level: "",
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.country.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
      c.iso.toLowerCase().includes(countrySearchTerm.toLowerCase())
  ).map((c) => ({
    value: c.country,
    display: `${c.country} (${c.iso})`,
  }));

  // Prepare options for searchable dropdowns
  const sourceOptions = SOURCES.map((s) => ({
    value: s,
    label: `${SOURCE_ICONS[s.toLowerCase()] || "📍"} ${s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")}`,
    icon: SOURCE_ICONS[s.toLowerCase()] || "📍",
  }));

  const studyLevelOptions = STUDY_LEVELS.map((l) => ({
    value: l,
    label: l,
  }));

  useEffect(() => {
    if (!open) return;

    if (editLead) {
      const countries = editLead.preferred_country
        ? editLead.preferred_country.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      setSelectedCountries(countries);
      
      // CRITICAL FIX: Check if counsellor_id exists and is not null/empty
      let counsellorValue = null;
      if (editLead.counsellor_id && 
          editLead.counsellor_id !== "" && 
          editLead.counsellor_id !== "null" &&
          editLead.counsellor_id !== null) {
        counsellorValue = String(editLead.counsellor_id);
      }
      
      console.log("Loading lead with counsellor_id:", counsellorValue); // Debug log
      
      setForm({
        name: editLead.name || "",
        email: editLead.email || "",
        phone: editLead.phone || "",
        source: editLead.source || "walkin",
        preferred_country: editLead.preferred_country || "",
        study_level: editLead.study_level || "",
        counsellor_id: counsellorValue,
      });
    } else {
      setSelectedCountries([]);
      setCountrySearchTerm("");
      setForm({ ...EMPTY_FORM, source: "walkin", study_level: "", counsellor_id: null });
    }

    setErrors({});
  }, [open, editLead]);

  useEffect(() => {
    const handler = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target))
        setCountryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!open) return null;

  const validate = () => {
    const e = {};
    
    // In assignMode, counsellor is optional - no validation needed
    if (assignMode) {
      return e;
    }
    
    if (!form.name?.trim()) e.name = "Name is required";
    if (!form.phone?.trim()) {
      e.phone = "Phone number is required";
    } else if (form.phone.replace(/\D/g, "").length < 8) {
      e.phone = "Phone number is too short";
    }
    if (!form.email?.trim()) e.email = "Email is required";
    if (!form.source?.trim()) e.source = "Source is required";
    if (!form.preferred_country?.trim())
      e.preferred_country = "Preferred country is required";
    if (!form.study_level?.trim()) e.study_level = "Study level is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSaving(true);
    try {
      // Create a copy of form data to submit
      const submitData = { ...form };
      
      // Ensure counsellor_id is properly set (null for unassigned)
      if (!submitData.counsellor_id || submitData.counsellor_id === "" || submitData.counsellor_id === "null") {
        submitData.counsellor_id = null;
      }
      
      console.log("Submitting form with counsellor_id:", submitData.counsellor_id); // Debug log
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    if (value && value.startsWith(" ")) return;
    if (name === "name" && /\d/.test(value)) return;
    
    console.log("Changing", name, "to:", value); // Debug log
    
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleAddCountry = (countryValue) => {
    if (selectedCountries.includes(countryValue) || selectedCountries.length >= 5) return;
    const updated = [...selectedCountries, countryValue];
    setSelectedCountries(updated);
    setForm((prev) => ({ ...prev, preferred_country: updated.join(", ") }));
    if (errors.preferred_country) {
      setErrors((prev) => {
        const e = { ...prev };
        delete e.preferred_country;
        return e;
      });
    }
    setCountrySearchTerm("");
    setCountryDropdownOpen(false);
  };

  const handleRemoveCountry = (countryValue) => {
    const updated = selectedCountries.filter((c) => c !== countryValue);
    setSelectedCountries(updated);
    setForm((prev) => ({ ...prev, preferred_country: updated.join(", ") }));
  };

  const sourceLabel = editLead?.source
    ? `${SOURCE_ICONS[editLead.source.toLowerCase()] || "📍"} ${
        editLead.source.charAt(0).toUpperCase() + editLead.source.slice(1).replace(/_/g, " ")
      }`
    : "—";

  // ════════════════════════════════════════════════════════════════════════
  // ASSIGN MODE
  // ════════════════════════════════════════════════════════════════════════
  if (assignMode) {
    return (
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
          <Title setModal={onClose}>Assign Counsellor</Title>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Lead Details
              </p>

              <InfoRow icon={<User size={15} />} label="Full Name" value={editLead?.name} />
              <InfoRow icon={<Mail size={15} />} label="Email" value={editLead?.email} />
              <InfoRow icon={<Phone size={15} />} label="Phone" value={editLead?.phone} />
              <InfoRow
                icon={<Globe size={15} />}
                label="Preferred Countries"
                value={editLead?.preferred_country}
              />
              <InfoRow
                icon={<GraduationCap size={15} />}
                label="Study Level"
                value={editLead?.study_level}
              />
              <InfoRow icon={<Radio size={15} />} label="Source" value={sourceLabel} />
            </div>

            <SearchableCounsellorSelect
              counsellors={counsellors}
              value={form.counsellor_id}
              onChange={handleCustomChange}
              error={errors.counsellor_id}
            />
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <AddButton
                label="Assign"
                loading={saving}
                handleClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // ADD / EDIT MODE with Searchable Dropdowns
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <Title setModal={onClose}>
          {editLead ? "Edit Lead" : "Add New Lead"}
        </Title>

        <form className="p-6 pt-4 space-y-4" onSubmit={handleSubmit}>
          {/* Row 1 — Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <InputField
                labelName="Full Name *"
                name="name"
                value={form.name}
                handlerChange={handleCustomChange}
                icon={<User size={16} />}
                maxLength={50}
              />
              {errors.name && <p className="text-red-500 text-[10px] ml-1">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <InputField
                labelName="Email *"
                type="email"
                name="email"
                value={form.email}
                handlerChange={handleCustomChange}
                icon={<Mail size={16} />}
              />
              {errors.email && <p className="text-red-500 text-[10px] ml-1">{errors.email}</p>}
            </div>
          </div>

          {/* Row 2 — Phone & Source (Searchable) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhoneInputWithCountry
              value={form.phone}
              onChange={handleCustomChange}
              name="phone"
              error={errors.phone}
            />

            <div className="space-y-1">
              <SearchableDropdown
                options={sourceOptions}
                value={form.source}
                onChange={handleCustomChange}
                label="Source"
                placeholder="Search source..."
                error={errors.source}
                required={true}
              />
            </div>
          </div>

          {/* Row 3 — Preferred Countries & Study Level (Searchable) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1" ref={countryDropdownRef}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Preferred Countries *
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={countrySearchTerm}
                  onChange={(e) => {
                    setCountrySearchTerm(e.target.value);
                    setCountryDropdownOpen(true);
                  }}
                  onFocus={() => setCountryDropdownOpen(true)}
                  disabled={selectedCountries.length >= 5}
                  placeholder={
                    selectedCountries.length >= 5
                      ? "Max 5 countries selected"
                      : "Type to search countries..."
                  }
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors
                    ${errors.preferred_country ? "border-red-400" : "border-slate-300 focus:border-blue-500"}
                    ${selectedCountries.length >= 5 ? "bg-slate-100 cursor-not-allowed opacity-60" : "bg-white"}`}
                />

                {countryDropdownOpen && countrySearchTerm && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-auto py-1">
                    {filteredCountries.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-400">No countries found</div>
                    ) : (
                      filteredCountries.map((c) => (
                        <div
                          key={c.value}
                          onClick={() => handleAddCountry(c.value)}
                          className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-100 transition-colors
                            ${selectedCountries.includes(c.value) ? "opacity-40 pointer-events-none" : ""}`}
                        >
                          {c.display}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedCountries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedCountries.map((country) => (
                    <span
                      key={country}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-lg"
                    >
                      {country}
                      <X
                        size={11}
                        className="cursor-pointer hover:text-red-500 transition-colors"
                        onClick={() => handleRemoveCountry(country)}
                      />
                    </span>
                  ))}
                </div>
              )}

              {errors.preferred_country && (
                <p className="text-red-500 text-[10px] ml-1">{errors.preferred_country}</p>
              )}
            </div>

            <div className="space-y-1">
              <SearchableDropdown
                options={studyLevelOptions}
                value={form.study_level}
                onChange={handleCustomChange}
                label="Study Level"
                placeholder="Search study level..."
                icon={<BookOpen size={16} />}
                error={errors.study_level}
                required={true}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-1.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <AddButton
              label={editLead ? "Update Lead" : "Save Lead"}
              loading={saving}
              handleClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
}