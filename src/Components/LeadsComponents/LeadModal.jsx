import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { SOURCES, STUDY_LEVELS, EMPTY_FORM } from "./LeadsConstants";
import { InputField } from "../InputFields/InputField";
import { AddButton } from "../CustomButtons/AddButton";
import PhoneInputWithCountry from "../InputFields/PhoneInputWithCountry";
import { COUNTRIES } from "../../constants/countries";
import { BASE_URL } from "../../Content/Url";
import {
  User,
  Mail,
  X,
  Phone,
  Globe,
  GraduationCap,
  Radio,
  Search,
  ChevronDown,
  Calendar,
  Heart,
  UserCircle,
  Home,
  CalendarDays,
  BarChart,
  School,
  FileText,
  ArrowLeft,
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

const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

const ENGLISH_TEST_OPTIONS = [
  { value: "ielts", label: "IELTS" },
  { value: "toefl", label: "TOEFL" },
  { value: "pte", label: "PTE" },
  { value: "duolingo", label: "Duolingo" },
  { value: "none", label: "None" },
];

const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

// ─── Searchable Dropdown Component ───────────────────────────────────────────
function SearchableDropdown({
  options = [],
  value,
  onChange,
  label,
  name,
  placeholder = "Search...",
  error,
  icon,
  required = false,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );
  const filteredOptions = options.filter((opt) =>
    opt.label?.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt) => {
    onChange({ target: { name, value: opt.value } });
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="text-gray-600 text-xs font-semibold mb-1">
        {label} {required && "*"}
      </label>
      <div
        className={`relative flex items-center w-full p-2.5 border border-gray-200 rounded-lg shadow bg-white text-gray-500 transition-all
    ${
      error
        ? "border-red-400 focus-within:ring-1 focus-within:ring-red-200"
        : "focus-within:ring-1 focus-within:ring-[#009E99]"
    }`}
        onClick={() => setOpen(true)}
      >
        {icon && (
          <div className="flex items-center text-[#009E99] shrink-0 mr-2">
            {icon}
          </div>
        )}

        <Search size={15} className="text-slate-400 shrink-0 mr-2" />
        <input
          type="text"
          className="flex-1 outline-none bg-transparent text-gray-500 placeholder:text-gray-400 text-sm"
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
          <div className="max-h-64 overflow-y-auto py-1">
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
                      <span className="ml-auto text-blue-500 text-xs">
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
      {error && <p className="text-red-500 text-[10px] mt-1 ml-1">{error}</p>}
    </div>
  );
}

// ─── Searchable Counsellor Select (visible only for admin) ──────────────────────────
function SearchableCounsellorSelect({
  counsellors = [],
  value,
  onChange,
  error,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const counsellorsWithUnassigned = [
    { id: "unassigned", name: "Unassigned", user: { id: "unassigned" } },
    ...counsellors,
  ];

  const selected = counsellorsWithUnassigned.find((c) => {
    const cId = String(c.user?.id || c.id);
    if (!value || value === "" || value === "null" || value === null)
      return cId === "unassigned";
    return cId === String(value);
  });

  const filtered = counsellorsWithUnassigned.filter((c) =>
    c.name?.toLowerCase().includes(query.toLowerCase()),
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
    const newValue = id === "unassigned" ? null : id;
    onChange({ target: { name: "counsellor_id", value: newValue } });
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        Assign Counsellor
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
                const isSelected =
                  !value || value === "" || value === "null" || value === null
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
                        <span className="text-[10px] text-slate-400">
                          Remove assignment
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="ml-auto text-blue-500 text-xs">
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
        <p className="text-sm font-medium text-slate-700 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function LeadModal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isCounsellor = location.pathname.includes("/counsellor");
  let mode = "add";
  if (location.pathname.includes("/edit")) mode = "edit";
  else if (location.pathname.includes("/assign")) mode = "assign";
  const isAssignMode = mode === "assign";

  // ─── All state hooks (unconditional) ──────────────────────────────────────
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    source: "walkin",
    study_level: "",
    dob: "",
    marital_status: "",
    father_name: "",
    father_contact: "",
    home_address: "",
    year_awarded: "",
    grades_cgpa: "",
    board_university: "",
    english_proficiency_test: "",
    english_test_overall_score: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.country.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
      c.iso.toLowerCase().includes(countrySearchTerm.toLowerCase()),
  ).map((c) => ({ value: c.country, display: `${c.country} (${c.iso})` }));

  const sourceOptions = SOURCES.map((s) => ({
    value: s,
    label: `${SOURCE_ICONS[s.toLowerCase()] || "📍"} ${s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")}`,
    icon: SOURCE_ICONS[s.toLowerCase()] || "📍",
  }));

  const studyLevelOptions = STUDY_LEVELS.map((l) => ({ value: l, label: l }));

  const getApiBaseUrl = useCallback(
    () =>
      isCounsellor ? `${BASE_URL}/counsellor/leads` : `${BASE_URL}/admin/leads`,
    [isCounsellor],
  );

  const fetchCounsellors = useCallback(async () => {
    if (isCounsellor) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${BASE_URL}/admin/getCounsellors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCounsellors(Array.isArray(data) ? data : data.data || []);
    } catch {
      console.error("Failed to fetch counsellors");
    }
  }, [isCounsellor]);

  const fetchLead = useCallback(
    async (leadId) => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/${leadId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const lead = await res.json();
        setEditLead(lead);

        const countries = lead.preferred_country
          ? lead.preferred_country
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        setSelectedCountries(countries);

        setForm({
          name: lead.name || "",
          email: lead.email || "",
          phone: lead.phone || "",
          source: lead.source || "walkin",
          preferred_country: lead.preferred_country || "",
          study_level: lead.study_level || "",
          counsellor_id: lead.counsellor_id || null,
          dob: lead.dob || "",
          marital_status: lead.marital_status || "",
          father_name: lead.father_name || "",
          father_contact: lead.father_contact || "",
          home_address: lead.home_address || "",
          year_awarded: lead.year_awarded || "",
          grades_cgpa: lead.grades_cgpa || "",
          board_university: lead.board_university || "",
          english_proficiency_test: lead.english_proficiency_test || "",
          english_test_overall_score: lead.english_test_overall_score || "",
        });
      } catch {
        toast.error("Failed to load lead data");
        navigate(isCounsellor ? "/counsellor/leads" : "/admin/leads");
      } finally {
        setLoading(false);
      }
    },
    [getApiBaseUrl, isCounsellor, navigate],
  );

  // Auto-set counsellor_id for counsellor add mode
  useEffect(() => {
    if (isCounsellor && mode === "add") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.id) setForm((prev) => ({ ...prev, counsellor_id: user.id }));
    }
  }, [isCounsellor, mode]);

  // Initial data fetch and reset
  useEffect(() => {
    fetchCounsellors();
    if (mode !== "add" && id) {
      fetchLead(id);
    } else {
      setForm({
        ...EMPTY_FORM,
        source: "walkin",
        study_level: "",
        counsellor_id: isCounsellor
          ? JSON.parse(localStorage.getItem("user") || "{}").id || null
          : null,
        dob: "",
        marital_status: "",
        father_name: "",
        father_contact: "",
        home_address: "",
        year_awarded: "",
        grades_cgpa: "",
        board_university: "",
        english_proficiency_test: "",
        english_test_overall_score: "",
      });
      setSelectedCountries([]);
      setErrors({});
    }
  }, [mode, id, isCounsellor, fetchCounsellors, fetchLead]);

  // Click outside handler for country dropdown
  useEffect(() => {
    const handler = (e) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target)
      )
        setCountryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Validation
  const validate = () => {
    const e = {};
    if (isAssignMode) return e;
    if (!form.name?.trim()) e.name = "Name is required";
    if (!form.phone?.trim()) e.phone = "Phone number is required";
    if (!form.email?.trim()) e.email = "Email is required";
    if (!form.source?.trim()) e.source = "Source is required";
    if (!form.preferred_country?.trim())
      e.preferred_country = "Preferred country is required";
    if (!form.study_level?.trim()) e.study_level = "Last Degree is required";
    if (
      form.english_proficiency_test &&
      form.english_proficiency_test !== "none" &&
      (!form.english_test_overall_score ||
        form.english_test_overall_score === "")
    ) {
      e.english_test_overall_score =
        "Total score is required for selected test";
    }
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
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");

      let url, method;
      const baseUrl = getApiBaseUrl();
      const submitData = { ...form };

      if (isCounsellor && !submitData.counsellor_id) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        submitData.counsellor_id = user.id;
      }

      if (mode === "add") {
        url = baseUrl;
        method = "POST";
      } else if (mode === "edit") {
        url = `${baseUrl}/${id}`;
        method = "PUT";
      } else {
        url = `${BASE_URL}/admin/leads/${id}/assign`;
        method = "PUT";
        submitData.counsellor_id = form.counsellor_id
          ? Number(form.counsellor_id)
          : null;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          method === "PUT" && mode === "assign"
            ? { counsellor_id: submitData.counsellor_id }
            : submitData,
        ),
      });

      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message || `HTTP ${res.status}`,
        );

      toast.success(
        mode === "add"
          ? "Lead added successfully"
          : mode === "edit"
            ? "Lead updated successfully"
            : "Counsellor assigned successfully",
      );
      navigate(isCounsellor ? "/counsellor/leads" : "/admin/leads");
    } catch (err) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    if (value && value.startsWith(" ")) return;
    if (name === "name" && /\d/.test(value)) return;

    if (name === "dob") {
      if (value) {
        const age = calculateAge(value);
        if (age !== null && age <= 16) {
          setErrors((prev) => ({
            ...prev,
            dob: "Age must be greater than 16 years",
          }));
        } else {
          setErrors((prev) => {
            const newErrs = { ...prev };
            delete newErrs.dob;
            return newErrs;
          });
        }
      } else {
        setErrors((prev) => {
          const newErrs = { ...prev };
          delete newErrs.dob;
          return newErrs;
        });
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name] && name !== "dob") {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleAddCountry = (countryValue) => {
    if (
      selectedCountries.includes(countryValue) ||
      selectedCountries.length >= 5
    )
      return;
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
    ? `${SOURCE_ICONS[editLead.source.toLowerCase()] || "📍"} ${editLead.source.charAt(0).toUpperCase() + editLead.source.slice(1).replace(/_/g, " ")}`
    : "—";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAssignMode && editLead) {
    const assignedCounsellor = counsellors.find(
      (c) => String(c.user?.id || c.id) === String(editLead?.counsellor_id),
    );
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-6">
        <div className="">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/leads")}
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Assign Counsellor
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Review lead details and assign a counsellor
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT SIDE - Lead Information */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Top Banner */}
                <div className="relative bg-[#009E99] px-6 py-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {editLead?.name || "Unnamed Lead"}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium backdrop-blur-sm">
                          {editLead?.study_level || "No Degree"}
                        </span>

                        <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium backdrop-blur-sm">
                          {sourceLabel}
                        </span>

                        {editLead?.preferred_country && (
                          <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium backdrop-blur-sm">
                            {editLead.preferred_country}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold shrink-0">
                      {editLead?.name?.charAt(0)?.toUpperCase() || "L"}
                    </div>
                  </div>
                </div>

                {/* Information Sections */}
                <div className="p-6 space-y-8">
                  {/* Personal Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                        <User size={18} className="text-blue-600" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Personal Information
                        </h3>
                        <p className="text-xs text-slate-500">
                          Applicant basic details
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        icon={<Mail size={16} />}
                        label="Email Address"
                        value={editLead?.email}
                      />

                      <InfoRow
                        icon={<Phone size={16} />}
                        label="Phone Number"
                        value={editLead?.phone}
                      />

                      <InfoRow
                        icon={<Calendar size={16} />}
                        label="Date of Birth"
                        value={editLead?.dob}
                      />

                      <InfoRow
                        icon={<Heart size={16} />}
                        label="Marital Status"
                        value={editLead?.marital_status}
                      />

                      <InfoRow
                        icon={<UserCircle size={16} />}
                        label="Father Name"
                        value={editLead?.father_name}
                      />

                      <InfoRow
                        icon={<Phone size={16} />}
                        label="Father Contact"
                        value={editLead?.father_contact}
                      />
                    </div>

                    {editLead?.home_address && (
                      <div className="mt-4">
                        <InfoRow
                          icon={<Home size={16} />}
                          label="Home Address"
                          value={editLead?.home_address}
                        />
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <GraduationCap size={18} className="text-indigo-600" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Educational Information
                        </h3>
                        <p className="text-xs text-slate-500">
                          Academic background & test details
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        icon={<GraduationCap size={16} />}
                        label="Last Degree"
                        value={editLead?.study_level}
                      />

                      <InfoRow
                        icon={<CalendarDays size={16} />}
                        label="Year Awarded"
                        value={editLead?.year_awarded}
                      />

                      <InfoRow
                        icon={<BarChart size={16} />}
                        label="Grades / CGPA"
                        value={editLead?.grades_cgpa}
                      />

                      <InfoRow
                        icon={<School size={16} />}
                        label="Board / University"
                        value={editLead?.board_university}
                      />

                      <InfoRow
                        icon={<Globe size={16} />}
                        label="Preferred Countries"
                        value={editLead?.preferred_country}
                      />

                      {editLead?.english_proficiency_test &&
                        editLead?.english_proficiency_test !== "none" && (
                          <InfoRow
                            icon={<FileText size={16} />}
                            label="English Test"
                            value={`${editLead.english_proficiency_test.toUpperCase()} • ${editLead.english_test_overall_score || "No score"}`}
                          />
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Assignment Panel */}
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <UserCircle size={22} className="text-blue-600" />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Counsellor Assignment
                        </h3>
                        <p className="text-sm text-slate-500">
                          Select a counsellor for this lead
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Current Status */}
                    <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Current Assignment
                      </p>

                      {assignedCounsellor ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold">
                            {assignedCounsellor.name?.charAt(0)?.toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {assignedCounsellor.name}
                            </p>

                            <p className="text-xs text-emerald-600 font-medium">
                              Currently Assigned
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                            <User size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-700">
                              Unassigned
                            </p>

                            <p className="text-xs text-amber-600 font-medium">
                              No counsellor assigned yet
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dropdown */}
                    <div className="mb-6 relative z-50">
                      <SearchableCounsellorSelect
                        counsellors={counsellors}
                        value={form.counsellor_id}
                        onChange={handleCustomChange}
                        error={errors.counsellor_id}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/admin/leads")}
                        className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>

                      <AddButton
                        label="Assign Counsellor"
                        loading={saving}
                        handleClick={handleSubmit}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add / Edit Mode (full form)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() =>
              navigate(isCounsellor ? "/counsellor/leads" : "/admin/leads")
            }
            className="p-2 rounded-lg hover:bg-white/80 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "add"
              ? "Add New Lead"
              : isCounsellor
                ? "Edit My Lead"
                : "Edit Lead"}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <User size={18} className="text-blue-500" /> Personal
                Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <InputField
                      labelName="Applicant Name *"
                      name="name"
                      value={form.name}
                      handlerChange={handleCustomChange}
                      icon={<User size={16} />}
                      maxLength={50}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-[10px] ml-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <PhoneInputWithCountry
                      value={form.phone}
                      onChange={handleCustomChange}
                      name="phone"
                      error={errors.phone}
                      labelName="Applicant's Contact *"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <InputField
                      labelName="Applicant's Father Name"
                      name="father_name"
                      value={form.father_name}
                      handlerChange={handleCustomChange}
                      icon={<UserCircle size={16} />}
                    />
                  </div>
                  <div className="space-y-1">
                    <PhoneInputWithCountry
                      value={form.father_contact}
                      onChange={handleCustomChange}
                      name="father_contact"
                      labelName="Father's Contact *"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <InputField
                      labelName="Applicant Email *"
                      type="email"
                      name="email"
                      value={form.email}
                      handlerChange={handleCustomChange}
                      icon={<Mail size={16} />}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-[10px] ml-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <InputField
                      labelName="Date of Birth"
                      type="date"
                      name="dob"
                      value={form.dob}
                      handlerChange={handleCustomChange}
                      icon={<Calendar size={16} />}
                      className={
                        errors.dob ? "border-red-400 focus:ring-red-200" : ""
                      }
                    />

                    {errors.dob && (
                      <p className="text-red-500 text-[10px] ml-1">
                        {errors.dob}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <SearchableDropdown
                      name="marital_status"
                      options={MARITAL_STATUS_OPTIONS}
                      value={form.marital_status}
                      onChange={handleCustomChange}
                      label="Marital Status"
                      placeholder="Select marital status..."
                      icon={<Heart size={16} />}
                    />
                  </div>
                  <div className="space-y-1">
                    <SearchableDropdown
                      name="source"
                      options={sourceOptions}
                      value={form.source}
                      onChange={handleCustomChange}
                      label="Source"
                      placeholder="Search source..."
                      error={errors.source}
                      required
                    />
                  </div>
                </div>

                {/* Preferred Countries */}
                <div className="space-y-1" ref={countryDropdownRef}>
                  <label className="block text-sm font-medium text-slate-700">
                    Preferred Countries *
                  </label>
                  <div className="relative">
                    <Globe
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
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
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors
                        ${errors.preferred_country ? "border-red-400" : "border-slate-300 focus:border-blue-500"}
                        ${selectedCountries.length >= 5 ? "bg-slate-100 cursor-not-allowed opacity-60" : "bg-white"}`}
                    />
                    {countryDropdownOpen && countrySearchTerm && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-auto py-1">
                        {filteredCountries.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-slate-400">
                            No countries found
                          </div>
                        ) : (
                          filteredCountries.map((c) => (
                            <div
                              key={c.value}
                              onClick={() => handleAddCountry(c.value)}
                              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-100 transition-colors ${selectedCountries.includes(c.value) ? "opacity-40 pointer-events-none" : ""}`}
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
                    <p className="text-red-500 text-[10px] ml-1">
                      {errors.preferred_country}
                    </p>
                  )}
                </div>

                {/* Home Address */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 ">
                    Home Address
                  </label>
                  <div className="relative">
                    <Home
                      className="absolute left-3 top-3 text-slate-400"
                      size={16}
                    />
                    <textarea
                      name="home_address"
                      value={form.home_address}
                      onChange={handleCustomChange}
                      rows={2}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="Enter full home address..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <GraduationCap size={18} className="text-blue-500" />{" "}
                Educational Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <SearchableDropdown
                      name="study_level"
                      options={studyLevelOptions}
                      value={form.study_level}
                      onChange={handleCustomChange}
                      label="Last Degree "
                      placeholder="Search degree level..."
                      icon={<GraduationCap size={16} />}
                      error={errors.study_level}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Year Awarded
                    </label>
                    <div className="relative">
                      <CalendarDays
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type="number"
                        name="year_awarded"
                        value={form.year_awarded}
                        onChange={handleCustomChange}
                        placeholder="YYYY"
                        min="1950"
                        max={new Date().getFullYear()}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <InputField
                      labelName="Grades / CGPA"
                      name="grades_cgpa"
                      value={form.grades_cgpa}
                      handlerChange={handleCustomChange}
                      icon={<BarChart size={16} />}
                      placeholder="e.g., 3.5/4.0, 85%, A, etc."
                    />
                  </div>
                  <div className="space-y-1">
                    <InputField
                      labelName="Board / University"
                      name="board_university"
                      value={form.board_university}
                      handlerChange={handleCustomChange}
                      icon={<School size={16} />}
                      placeholder="e.g., CBSE, Punjab University, etc."
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <SearchableDropdown
                    name="english_proficiency_test"
                    options={ENGLISH_TEST_OPTIONS}
                    value={form.english_proficiency_test}
                    onChange={handleCustomChange}
                    label="English Proficiency Test"
                    placeholder="Select test..."
                    icon={<FileText size={16} />}
                  />
                </div>
                {form.english_proficiency_test &&
                  form.english_proficiency_test !== "none" && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Total Score
                      </label>
                      <input
                        type="number"
                        name="english_test_overall_score"
                        value={form.english_test_overall_score}
                        onChange={handleCustomChange}
                        step="0.5"
                        min="0"
                        max={
                          form.english_proficiency_test === "toefl"
                            ? 120
                            : form.english_proficiency_test === "duolingo"
                              ? 160
                              : form.english_proficiency_test === "ielts"
                                ? 9
                                : form.english_proficiency_test === "pte"
                                  ? 90
                                  : 999
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter total score"
                      />
                      <p className="text-[10px] text-slate-400">
                        Range: 0–
                        {form.english_proficiency_test === "toefl"
                          ? "120"
                          : form.english_proficiency_test === "duolingo"
                            ? "160"
                            : form.english_proficiency_test === "ielts"
                              ? "9"
                              : form.english_proficiency_test === "pte"
                                ? "90"
                                : ""}
                      </p>
                      {errors.english_test_overall_score && (
                        <p className="text-red-500 text-[10px] ml-1">
                          {errors.english_test_overall_score}
                        </p>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(isCounsellor ? "/counsellor/leads" : "/admin/leads")
                }
                className="px-6 py-2 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <AddButton
                label={mode === "add" ? "Save Lead" : "Update Lead"}
                loading={saving}
                handleClick={handleSubmit}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
