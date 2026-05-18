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
  Calendar,
  Heart,
  UserCircle,
  Home,
  Award,
  CalendarDays,
  BarChart,
  School,
  FileText,
  Mic,
  Book,
  PenTool,
  Headphones,
  Type,
  Eye,
  Edit3,
  MessageSquare,
  TrendingUp,
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

// Marital Status Options
const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

// English Proficiency Test Options
const ENGLISH_TEST_OPTIONS = [
  { value: "ielts", label: "IELTS" },
  { value: "toefl", label: "TOEFL" },
  { value: "pte", label: "PTE" },
  { value: "duolingo", label: "Duolingo" },
  { value: "cambridge", label: "Cambridge" },
  { value: "none", label: "None" },
];

// Helper function to calculate age from date of birth
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
    onChange({
      target: {
        // name: label.toLowerCase().replace(/\s/g, "_"),
        name: name,
        value: opt.value,
      },
    });
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

// ─── Searchable Counsellor Select (with Unassigned option) ──────────────────
function SearchableCounsellorSelect({
  counsellors = [],
  value,
  onChange,
  error,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Add "Unassigned" option at the beginning
  const counsellorsWithUnassigned = [
    { id: "unassigned", name: "Unassigned", user: { id: "unassigned" } },
    ...counsellors,
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

// ─── Tab Button Component ──────────────────────────────────────────────────
function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
        active
          ? "bg-blue-50 text-blue-700 shadow-sm"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── English Test Score Fields Component ───────────────────────────────────
function EnglishTestScoreFields({ testType, scores, onScoreChange }) {
  // Define field configurations based on test type
  const getFieldsConfig = () => {
    switch (testType) {
      case "ielts":
        return {
          fields: [
            {
              name: "listening",
              label: "Listening",
              icon: Headphones,
              min: 0,
              max: 9,
              step: 0.5,
            },
            {
              name: "reading",
              label: "Reading",
              icon: Book,
              min: 0,
              max: 9,
              step: 0.5,
            },
            {
              name: "writing",
              label: "Writing",
              icon: PenTool,
              min: 0,
              max: 9,
              step: 0.5,
            },
            {
              name: "speaking",
              label: "Speaking",
              icon: Mic,
              min: 0,
              max: 9,
              step: 0.5,
            },
          ],
          computeTotal: (scores) => {
            const values = Object.values(scores).filter(
              (v) => v !== "" && !isNaN(parseFloat(v)),
            );
            if (values.length !== 4) return null;
            const sum = values.reduce((a, b) => a + parseFloat(b), 0);
            const avg = sum / 4;
            return Math.round(avg); // Round to nearest integer
          },
          formatTotal: (total) => (total !== null ? total.toString() : "—"),
        };
      case "pte":
        return {
          fields: [
            {
              name: "listening",
              label: "Listening",
              icon: Headphones,
              min: 10,
              max: 90,
              step: 1,
            },
            {
              name: "reading",
              label: "Reading",
              icon: Book,
              min: 10,
              max: 90,
              step: 1,
            },
            {
              name: "writing",
              label: "Writing",
              icon: PenTool,
              min: 10,
              max: 90,
              step: 1,
            },
            {
              name: "speaking",
              label: "Speaking",
              icon: Mic,
              min: 10,
              max: 90,
              step: 1,
            },
          ],
          computeTotal: (scores) => {
            const values = Object.values(scores).filter(
              (v) => v !== "" && !isNaN(parseFloat(v)),
            );
            if (values.length !== 4) return null;
            const sum = values.reduce((a, b) => a + parseFloat(b), 0);
            const avg = sum / 4;
            return Math.round(avg);
          },
          formatTotal: (total) => (total !== null ? total.toString() : "—"),
        };
      case "toefl":
        return {
          fields: [
            {
              name: "listening",
              label: "Listening",
              icon: Headphones,
              min: 0,
              max: 30,
              step: 1,
            },
            {
              name: "reading",
              label: "Reading",
              icon: Book,
              min: 0,
              max: 30,
              step: 1,
            },
            {
              name: "writing",
              label: "Writing",
              icon: PenTool,
              min: 0,
              max: 30,
              step: 1,
            },
            {
              name: "speaking",
              label: "Speaking",
              icon: Mic,
              min: 0,
              max: 30,
              step: 1,
            },
          ],
          computeTotal: (scores) => {
            const values = Object.values(scores).filter(
              (v) => v !== "" && !isNaN(parseFloat(v)),
            );
            if (values.length !== 4) return null;
            const sum = values.reduce((a, b) => a + parseFloat(b), 0);
            return sum;
          },
          formatTotal: (total) => (total !== null ? total.toString() : "—"),
        };
      case "duolingo":
        return {
          fields: [
            {
              name: "literacy",
              label: "Literacy",
              icon: Book,
              min: 10,
              max: 160,
              step: 1,
            },
            {
              name: "comprehension",
              label: "Comprehension",
              icon: Eye,
              min: 10,
              max: 160,
              step: 1,
            },
            {
              name: "conversation",
              label: "Conversation",
              icon: MessageSquare,
              min: 10,
              max: 160,
              step: 1,
            },
            {
              name: "production",
              label: "Production",
              icon: Edit3,
              min: 10,
              max: 160,
              step: 1,
            },
          ],
          computeTotal: (scores) => {
            const values = Object.values(scores).filter(
              (v) => v !== "" && !isNaN(parseFloat(v)),
            );
            if (values.length !== 4) return null;
            const sum = values.reduce((a, b) => a + parseFloat(b), 0);
            const avg = sum / 4;
            return avg;
          },
          formatTotal: (total) => (total !== null ? total.toFixed(1) : "—"),
        };
      default:
        return null;
    }
  };

  const config = getFieldsConfig();
  if (!config) return null;

  const total = config.computeTotal(scores);

  return (
    <div className="mt-4 space-y-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-blue-500" />
        <h4 className="text-sm font-semibold text-slate-700">Module Scores</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <field.icon size={14} className="text-slate-400" />
              {field.label}
            </label>
            <input
              type="number"
              value={scores[field.name] || ""}
              // onChange={(e) => {
              //   let val = e.target.value;
              //   if (val === "") {
              //     onScoreChange(field.name, "");
              //     return;
              //   }
              //   let num = parseFloat(val);
              //   if (isNaN(num)) return;
              //   // Enforce min/max
              //   if (num < field.min) num = field.min;
              //   if (num > field.max) num = field.max;
              //   // For step 0.5, round to nearest 0.5
              //   if (field.step === 0.5) {
              //     num = Math.round(num * 2) / 2;
              //   }
              //   onScoreChange(field.name, num.toString());
              // }}

              onChange={(e) => {
                const val = e.target.value;

                if (val === "") {
                  onScoreChange(field.name, "");
                  return;
                }

                const num = Number(val);
                if (isNaN(num)) return;

                onScoreChange(field.name, val);
              }}
              step={field.step}
              min={field.min}
              max={field.max}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
              placeholder={`${field.min}-${field.max}`}
            />
            <p className="text-[10px] text-slate-400">
              Range: {field.min}–{field.max}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between bg-white rounded-lg p-3">
          <span className="text-sm font-medium text-slate-600">
            Total Score:
          </span>
          <span className="text-xl font-bold text-blue-600">
            {total !== null ? total : "—"}
          </span>
        </div>
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
  const [activeTab, setActiveTab] = useState("personal"); // "personal" or "educational"
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    source: "walkin",
    study_level: "",
    // Personal Information fields
    dob: "",
    marital_status: "",
    father_name: "",
    father_contact: "",
    home_address: "",
    // Educational Information fields
    year_awarded: "",
    grades_cgpa: "",
    board_university: "",
    english_proficiency_test: "",
  });

  // State for dynamic test scores
  const [testScores, setTestScores] = useState({
    ielts: { listening: "", reading: "", writing: "", speaking: "" },
    pte: { listening: "", reading: "", writing: "", speaking: "" },
    toefl: { listening: "", reading: "", writing: "", speaking: "" },
    duolingo: {
      literacy: "",
      comprehension: "",
      conversation: "",
      production: "",
    },
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
      c.iso.toLowerCase().includes(countrySearchTerm.toLowerCase()),
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

  // Reset test scores when English test changes
  useEffect(() => {
    // No need to reset on every render, only when test changes
  }, [form.english_proficiency_test]);

  // Reset form properly every time modal opens/closes or editLead changes
  useEffect(() => {
    if (!open) {
      // Clear everything when modal closes
      setForm({
        ...EMPTY_FORM,
        source: "walkin",
        study_level: "",
        counsellor_id: null,
        dob: "",
        marital_status: "",
        father_name: "",
        father_contact: "",
        home_address: "",
        year_awarded: "",
        grades_cgpa: "",
        board_university: "",
        english_proficiency_test: "",
      });
      setSelectedCountries([]);
      setCountrySearchTerm("");
      setErrors({});
      setActiveTab("personal");
      // Reset test scores
      setTestScores({
        ielts: { listening: "", reading: "", writing: "", speaking: "" },
        pte: { listening: "", reading: "", writing: "", speaking: "" },
        toefl: { listening: "", reading: "", writing: "", speaking: "" },
        duolingo: {
          literacy: "",
          comprehension: "",
          conversation: "",
          production: "",
        },
      });
      return;
    }

    if (editLead) {
      const countries = editLead.preferred_country
        ? editLead.preferred_country
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      setSelectedCountries(countries);

      setForm({
        name: editLead.name || "",
        email: editLead.email || "",
        phone: editLead.phone || "",
        source: editLead.source || "walkin",
        preferred_country: editLead.preferred_country || "",
        study_level: editLead.study_level || "",
        counsellor_id: editLead.counsellor_id || null,
        dob: editLead.dob || "",
        marital_status: editLead.marital_status || "",
        father_name: editLead.father_name || "",
        father_contact: editLead.father_contact || "",
        home_address: editLead.home_address || "",
        year_awarded: editLead.year_awarded || "",
        grades_cgpa: editLead.grades_cgpa || "",
        board_university: editLead.board_university || "",
        english_proficiency_test: editLead.english_proficiency_test || "",
      });

      // --- SAFE PARSE + NORMALIZE SCORES ---
      let parsedScores = {};

      try {
        parsedScores =
          typeof editLead.english_test_scores === "string"
            ? JSON.parse(editLead.english_test_scores)
            : editLead.english_test_scores || {};
      } catch (e) {
        parsedScores = {};
      }

      setTestScores(normalizeScores(parsedScores));
    } else {
      // Fresh Add Lead
      setSelectedCountries([]);
      setCountrySearchTerm("");

      setForm({
        ...EMPTY_FORM,
        source: "walkin",
        study_level: "",
        counsellor_id: null,
        dob: "",
        marital_status: "",
        father_name: "",
        father_contact: "",
        home_address: "",
        year_awarded: "",
        grades_cgpa: "",
        board_university: "",
        english_proficiency_test: "",
      });

      // Reset empty scores properly
      setTestScores({
        ielts: {
          listening: "",
          reading: "",
          writing: "",
          speaking: "",
        },
        pte: {
          listening: "",
          reading: "",
          writing: "",
          speaking: "",
        },
        toefl: {
          listening: "",
          reading: "",
          writing: "",
          speaking: "",
        },
        duolingo: {
          literacy: "",
          comprehension: "",
          conversation: "",
          production: "",
        },
      });
    }

    setErrors({});
  }, [open, editLead]);

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

  if (!open) return null;

  const validate = () => {
    const e = {};

    // In assignMode, counsellor is optional - no validation needed
    if (assignMode) {
      return e;
    }

    // if (!form.name?.trim()) e.name = "Name is required";
    // if (!form.phone?.trim()) {
    //   e.phone = "Phone number is required";
    // } else if (form.phone.replace(/\D/g, "").length < 8) {
    //   e.phone = "Phone number is too short";
    // }
    // if (!form.email?.trim()) e.email = "Email is required";
    // if (!form.source?.trim()) e.source = "Source is required";
    // if (!form.preferred_country?.trim())
    //   e.preferred_country = "Preferred country is required";
    // if (!form.study_level?.trim()) e.study_level = "Last Degree is required";

    // // Age validation: if date of birth is provided, age must be > 16
    // if (form.dob) {
    //   const age = calculateAge(form.dob);
    //   if (age !== null && age <= 16) {
    //     e.dob = "Age must be greater than 16 years";
    //   }
    // }

    if (!form.name?.trim()) e.name = "Name is required";
    if (!form.phone?.trim()) e.phone = "Phone number is required";
    if (!form.email?.trim()) e.email = "Email is required";
    if (!form.source?.trim()) e.source = "Source is required";
    if (!form.preferred_country?.trim())
      e.preferred_country = "Preferred country is required";
    if (!form.study_level?.trim()) e.study_level = "Last Degree is required";

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
      if (
        !submitData.counsellor_id ||
        submitData.counsellor_id === "" ||
        submitData.counsellor_id === "null"
      ) {
        submitData.counsellor_id = null;
      }

      // Attach test scores to submission (optional, for future use)
      const currentTest = form.english_proficiency_test;
      if (currentTest && testScores[currentTest]) {
        submitData.english_test_scores = testScores[currentTest];
      }

      console.log(
        "Submitting form with counsellor_id:",
        submitData.counsellor_id,
      ); // Debug log

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

    // Age validation on the fly for dob field
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
        // Clear dob error if date is cleared
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

  const handleScoreChange = (testType, fieldName, value) => {
    setTestScores((prev) => ({
      ...prev,
      [testType]: {
        ...prev[testType],
        [fieldName]: value,
      },
    }));
  };

  const sourceLabel = editLead?.source
    ? `${SOURCE_ICONS[editLead.source.toLowerCase()] || "📍"} ${
        editLead.source.charAt(0).toUpperCase() +
        editLead.source.slice(1).replace(/_/g, " ")
      }`
    : "—";

  const normalizeScores = (saved = {}) => ({
    ielts: {
      listening: "",
      reading: "",
      writing: "",
      speaking: "",
      ...saved.ielts,
    },
    pte: {
      listening: "",
      reading: "",
      writing: "",
      speaking: "",
      ...saved.pte,
    },
    toefl: {
      listening: "",
      reading: "",
      writing: "",
      speaking: "",
      ...saved.toefl,
    },
    duolingo: {
      literacy: "",
      comprehension: "",
      conversation: "",
      production: "",
      ...saved.duolingo,
    },
  });

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

              <InfoRow
                icon={<User size={15} />}
                label="Applicant Name"
                value={editLead?.name}
              />
              <InfoRow
                icon={<Mail size={15} />}
                label="Email"
                value={editLead?.email}
              />
              <InfoRow
                icon={<Phone size={15} />}
                label="Phone"
                value={editLead?.phone}
              />
              <InfoRow
                icon={<Globe size={15} />}
                label="Preferred Countries"
                value={editLead?.preferred_country}
              />
              <InfoRow
                icon={<GraduationCap size={15} />}
                label="Last Degree"
                value={editLead?.study_level}
              />
              <InfoRow
                icon={<Radio size={15} />}
                label="Source"
                value={sourceLabel}
              />
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
  // ADD / EDIT MODE with Tabs
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <Title setModal={onClose}>
          {editLead ? "Edit Lead" : "Add New Lead"}
        </Title>

        {/* Tab Navigation */}
        <div className="px-6 pt-2 border-b border-slate-100">
          <div className="flex gap-2">
            <TabButton
              active={activeTab === "personal"}
              onClick={() => setActiveTab("personal")}
              label="Personal Information"
              icon={<User size={16} />}
            />
            <TabButton
              active={activeTab === "educational"}
              onClick={() => setActiveTab("educational")}
              label="Educational Information"
              icon={<GraduationCap size={16} />}
            />
          </div>
        </div>

        <form
          className="flex-1 overflow-y-auto custom-scrollbar"
          onSubmit={handleSubmit}
        >
          <div className="p-6 space-y-4">
            {activeTab === "personal" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Row 1: Applicant Name + Email */}
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
                      label="Father's Contact"
                    />
                  </div>
                </div>

                {/* Row 2: Phone + Date of Birth */}
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type="date"
                        name="dob"
                        value={form.dob}
                        onChange={handleCustomChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                          errors.dob ? "border-red-400" : "border-slate-300"
                        }`}
                      />
                    </div>
                    {errors.dob && (
                      <p className="text-red-500 text-[10px] ml-1">
                        {errors.dob}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 4: Marital Status + Source */}
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
                      label="Source *"
                      placeholder="Search source..."
                      error={errors.source}
                      required={true}
                    />
                  </div>
                </div>

                {/* Row 5: Preferred Countries (full width) */}
                <div className="space-y-1" ref={countryDropdownRef}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <p className="text-red-500 text-[10px] ml-1">
                      {errors.preferred_country}
                    </p>
                  )}
                </div>

                {/* Row 6: Home Address (full width) */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
            )}

            {/* Educational Information Tab */}
            {activeTab === "educational" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Row 1 — Recent Qualification & Year Awarded */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Row 5 — Last Degree (Study Level) */}
                  <div className="space-y-1">
                    <SearchableDropdown
                      name="study_level"
                      options={studyLevelOptions}
                      value={form.study_level}
                      onChange={handleCustomChange}
                      label="Last Degree *"
                      placeholder="Search degree level..."
                      icon={<GraduationCap size={16} />}
                      error={errors.study_level}
                      required={true}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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

                {/* Row 2 — Grades/CGPA & Board/University */}
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

                {/* Row 3 — English Proficiency Test */}
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

                {/* Dynamic Score Fields for English Tests */}
                {["ielts", "pte", "toefl", "duolingo"].includes(
                  form.english_proficiency_test,
                ) && (
                  <EnglishTestScoreFields
                    testType={form.english_proficiency_test}
                    scores={testScores[form.english_proficiency_test] || {}}
                    onScoreChange={(field, value) =>
                      handleScoreChange(
                        form.english_proficiency_test,
                        field,
                        value,
                      )
                    }
                  />
                )}

                {form.english_proficiency_test === "cambridge" && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-sm text-amber-700 flex items-center gap-2">
                      <FileText size={16} />
                      Cambridge tests require certificate upload. Please attach
                      the score report in documents.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <AddButton
                label={editLead ? "Update Lead" : "Save Lead"}
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
