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
  UserCheck,
  XCircleIcon,
  X,
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

export default function LeadModal({
  open,
  onClose,
  onSave,
  counsellors = [],
  editLead,
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

  const filteredCountries = COUNTRIES
    .filter((c) =>
      c.country.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
      c.iso.toLowerCase().includes(countrySearchTerm.toLowerCase())
    )
    .map((c) => ({
      value: c.country,
      display: `${c.country} (${c.iso})`,
    }));

  useEffect(() => {
    if (!open) return;

    if (editLead) {
      const countries = editLead.preferred_country
        ? editLead.preferred_country.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      setSelectedCountries(countries);
      setForm({
        name: editLead.name || "",
        email: editLead.email || "",
        phone: editLead.phone || "",
        source: editLead.source || "walkin",
        preferred_country: editLead.preferred_country || "",
        study_level: editLead.study_level || "",
        counsellor_id: editLead.counsellor_id ? String(editLead.counsellor_id) : "",
      });
    } else {
      setSelectedCountries([]);
      setCountrySearchTerm("");
      setForm({
        ...EMPTY_FORM,
        source: "walkin",
        study_level: "",
      });
    }

    setErrors({});
  }, [open, editLead]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Name is required";
    if (!form.phone?.trim()) {
      e.phone = "Phone number is required";
    } else if (form.phone.replace(/\D/g, "").length < 8) {
      e.phone = "Phone number is too short";
    }
    if (!form.email?.trim()) e.email = "Email is required";
    if (!form.source?.trim()) e.source = "Source is required";
    if (!form.preferred_country?.trim()) e.preferred_country = "Preferred country is required";
    if (!form.study_level?.trim()) e.study_level = "Study level is required";
    if (editLead && !form.counsellor_id) e.counsellor_id = "Counsellor is required";
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
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    if (value.startsWith(" ")) return;
    if (name === "name" && /\d/.test(value)) return;
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
      setErrors((prev) => { const e = { ...prev }; delete e.preferred_country; return e; });
    }
    setCountrySearchTerm("");
    setCountryDropdownOpen(false);
  };

  const handleRemoveCountry = (countryValue) => {
    const updated = selectedCountries.filter((c) => c !== countryValue);
    setSelectedCountries(updated);
    setForm((prev) => ({ ...prev, preferred_country: updated.join(", ") }));
  };

  const sourceOptions = SOURCES.map((s) => ({
    id: s,
    value: s,
    label: `${SOURCE_ICONS[s.toLowerCase()] || "📍"} ${s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}`,
  }));

  const studyLevelOptions = STUDY_LEVELS.map((l) => ({ id: l, value: l, label: l }));

  const counsellorOptions = counsellors.map((c) => ({
    id: c.user?.id || c.id,
    value: c.user?.id || c.id,
    label: c.name,
  }));

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
          <Title setModal={onClose}>{editLead ? "Edit Lead" : "Add New Lead"}</Title>
         
       

        <form className="p-8 pt-4 space-y-4" onSubmit={handleSubmit}>

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

          {/* Row 2 — Phone & Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhoneInputWithCountry
              value={form.phone}
              onChange={handleCustomChange}
              name="phone"
              error={errors.phone}
            />

            <div className="space-y-1">
              <OptionField
                labelName="Source *"
                name="source"
                value={form.source}
                handlerChange={handleCustomChange}
                optionData={sourceOptions}
                inital="Select Source"
              />
              {errors.source && <p className="text-red-500 text-[10px] ml-1">{errors.source}</p>}
            </div>
          </div>

          {/* Row 3 — Preferred Countries & Study Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* ── Preferred Countries (inline search, no separate component) ── */}
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
                  placeholder={
                    selectedCountries.length >= 5
                      ? "Max 5 countries selected"
                      : "Type to search countries..."
                  }
                  disabled={selectedCountries.length >= 5}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors
                    ${errors.preferred_country
                      ? "border-red-400"
                      : "border-slate-300 focus:border-blue-500"}
                    ${selectedCountries.length >= 5 ? "bg-slate-50 cursor-not-allowed" : "bg-white"}`}
                />

                {/* Dropdown */}
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

              {/* Selected country tags */}
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

            {/* Study Level */}
            <div className="space-y-1">
              <OptionField
                labelName="Study Level *"
                name="study_level"
                value={form.study_level}
                handlerChange={handleCustomChange}
                optionData={studyLevelOptions}
                inital="Select level"
                icon={<BookOpen size={16} />}
              />
              {errors.study_level && (
                <p className="text-red-500 text-[10px] ml-1">{errors.study_level}</p>
              )}
            </div>
          </div>

          {/* Row 4 — Counsellor (edit only) */}
          {editLead && (
            <div className="space-y-1">
              <OptionField
                labelName="Assign Counsellor *"
                name="counsellor_id"
                value={form.counsellor_id}
                handlerChange={handleCustomChange}
                optionData={counsellorOptions}
                inital="Select Counsellor"
                icon={<UserCheck size={16} />}
              />
              {errors.counsellor_id && (
                <p className="text-red-500 text-[10px] ml-1">{errors.counsellor_id}</p>
              )}
            </div>
          )}

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