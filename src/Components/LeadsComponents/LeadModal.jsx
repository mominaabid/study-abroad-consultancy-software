import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { EMPTY_FORM } from "./LeadsConstants";
import { InputField } from "../InputFields/InputField";
import { TextareaField } from "../InputFields/TextareaField";
import { AddButton } from "../CustomButtons/AddButton";
import PhoneInputWithCountry from "../InputFields/PhoneInputWithCountry";

import { BASE_URL } from "../../Content/Url";
import {
  User,
  Mail,
  X,
  Phone,
  Globe,
  GraduationCap,
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
  Edit,
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

const DEGREE_GRADE_RULES = {
  Matric: {
    type: "numeric_or_grades",
    numeric: { min: 600, max: 1200 },
    grades: ["A", "A+", "B", "B+", "C", "D", "E"],
    maxLength: 4,
  },
  "Inter (12 years)": {
    type: "numeric_or_grades",
    numeric: { min: 600, max: 1200 },
    grades: ["A", "A+", "B", "B+", "C", "D", "E"],
    maxLength: 4,
  },
  "Bachelors (14 years)": {
    type: "cgpa",
    min: 2.5,
    max: 4.0,
    maxLength: 4,
  },
  "Bachelors (16 years)": {
    type: "cgpa",
    min: 2.5,
    max: 4.0,
    maxLength: 4,
  },
  "DAE (3 years)": {
    type: "numeric",
    min: 1700,
    max: 3550,
    maxLength: 4,
  },
  "ADP (2 years)": {
    type: "numeric",
    min: 400,
    max: 800,
    maxLength: 3,
  },
  "Masters (18 years)": {
    type: "cgpa",
    min: 2.5,
    max: 4.0,
    maxLength: 4,
  },
  "Short Courses": {
    type: "grades_list",
    grades: ["A", "A+", "B", "B+", "C", "D", "E"],
    maxLength: 2,
  },
  "Post Graduate Diploma": {
    type: "cgpa",
    min: 2.5,
    max: 4.0,
    maxLength: 4,
  },
  PhD: {
    type: "cgpa",
    min: 2.5,
    max: 4.0,
    maxLength: 4,
  },
};

const getGradeMaxLength = (degree) => {
  const rule = DEGREE_GRADE_RULES[degree];
  return rule?.maxLength || 4;
};

const validateGrade = (degree, gradeValue) => {
  if (!degree || !gradeValue || gradeValue.trim() === "") return null;

  const rule = DEGREE_GRADE_RULES[degree];
  if (!rule) return null;

  const value = gradeValue.trim();

  switch (rule.type) {
    case "numeric_or_grades": {
      const num = parseFloat(value);
      if (!isNaN(num) && num >= rule.numeric.min && num <= rule.numeric.max) {
        return null;
      }
      if (rule.grades.includes(value.toUpperCase())) {
        return null;
      }
      return `Must be a number between ${rule.numeric.min}–${rule.numeric.max} or one of: ${rule.grades.join(", ")}`;
    }
    case "numeric": {
      const numVal = parseFloat(value);
      if (isNaN(numVal) || numVal < rule.min || numVal > rule.max) {
        return `Must be a number between ${rule.min} and ${rule.max}`;
      }
      return null;
    }
    case "cgpa": {
      const cgpa = parseFloat(value);
      if (isNaN(cgpa) || cgpa < rule.min || cgpa > rule.max) {
        return `Must be a CGPA between ${rule.min} and ${rule.max}`;
      }
      const parts = value.split("/");
      if (parts.length === 2) {
        const scale = parseFloat(parts[1]);
        if (scale !== 4.0 && scale !== 4) {
          return "CGPA scale must be 4.0";
        }
      }
      return null;
    }
    case "grades_list": {
      if (rule.grades.includes(value.toUpperCase())) {
        return null;
      }
      return `Must be one of: ${rule.grades.join(", ")}`;
    }
    default:
      return null;
  }
};

const getGradePlaceholder = (degree) => {
  const rule = DEGREE_GRADE_RULES[degree];
  if (!rule) return "e.g., 3.5/4.0, 85%, A, etc.";

  switch (rule.type) {
    case "numeric_or_grades":
      return `e.g., 850 or A+ (${rule.numeric.min}–${rule.numeric.max} / ${rule.grades.join(", ")})`;
    case "numeric":
      return `e.g., ${rule.min}–${rule.max}`;
    case "cgpa":
      return `e.g., 3.5/4.0 (${rule.min}–${rule.max})`;
    case "grades_list":
      return `e.g., ${rule.grades.slice(0, 3).join(", ")}...`;
    default:
      return "e.g., 3.5/4.0, 85%, A, etc.";
  }
};

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

const formatEnglishScore = (testType, rawScore) => {
  if (!rawScore || rawScore === "") return rawScore;
  const num = parseFloat(rawScore);
  if (isNaN(num)) return rawScore;

  if (testType === "ielts") {
    return num.toFixed(2);
  } else if (["toefl", "pte", "duolingo"].includes(testType)) {
    return Math.round(num).toString();
  }
  return rawScore;
};

// Searchable Dropdown Component
// Searchable Dropdown Component - FIXED
function SearchableDropdown({
  options = [],
  value,
  onChange,
  label,
  name,
  placeholder = "Search...",
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

  // ✅ FIXED: Proper handleSelect function
  const handleSelect = (opt) => {
    const newValue = opt.value;
    // Create a synthetic event to match the expected onChange signature
    const event = {
      target: {
        name: name,
        value: newValue
      }
    };
    onChange(event);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="text-gray-600 text-xs font-semibold mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className="relative flex items-center w-full p-2.5 border border-gray-200 rounded-lg shadow bg-white text-gray-500 transition-all focus-within:ring-1 focus-within:ring-[#009E99] cursor-pointer"
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
          className="flex-1 outline-none bg-transparent text-gray-500 placeholder:text-gray-400 text-sm cursor-pointer"
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={open ? query : selectedOption ? selectedOption.label : ""}
          onChange={(e) => {
            let trimmed = e.target.value.replace(/^\s+/, "");
            trimmed = trimmed.replace(/[^a-zA-Z0-9\s]/g, "");
            setQuery(trimmed);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          readOnly={!open} // ✅ Prevents input from capturing click events
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
    </div>
  );
}

// LeadModal.jsx - Replace the entire SearchableCounsellorSelect component

// LeadModal.jsx - REPLACE SearchableCounsellorSelect with this

function SearchableCounsellorSelect({ counsellors = [], value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const counsellorsArray = Array.isArray(counsellors) ? counsellors : [];

  const options = [
    { id: null, name: "Unassigned", user: { id: null } },
    ...counsellorsArray,
  ];

const selected = options.find((c) => {
  const cId = c.counsellor_id;
  if (!value || value === "" || value === "null" || value === null) {
    return cId === null || cId === undefined;
  }
  return String(cId) === String(value);
});

  const filtered = options.filter((c) =>
    c.name?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

const handleSelect = (c) => {
  const id = c.counsellor_id;
  const newValue = (!id || id === "null" || id === null) ? null : id;
  console.log("✅ Selecting counsellor - id:", id, "newValue:", newValue);
  onChange({ target: { name: "counsellor_id", value: newValue } });
  setQuery("");
  setOpen(false);
};
  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Assign Counsellor
      </label>
      <div
        className="flex items-center gap-2 w-full px-3.5 py-2.5 border rounded-xl bg-white text-sm cursor-text transition-all border-slate-300 hover:border-slate-400"
        onClick={() => setOpen(true)}
      >
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          type="text"
          className="flex-1 outline-none bg-transparent text-slate-700 placeholder:text-slate-400 cursor-pointer"
          placeholder="Select counsellor or 'Unassigned'..."
          value={open ? query : selected ? selected.name : ""}
          onChange={(e) => {
            let trimmed = e.target.value.replace(/^\s+/, "");
            trimmed = trimmed.replace(/[^a-zA-Z0-9\s]/g, "");
            setQuery(trimmed);
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
  const id = c.counsellor_id;
  const isUnassigned = !id || id === "null" || id === null;

  let isSelected = false;
  if (!value || value === "" || value === "null" || value === null) {
    isSelected = isUnassigned;
  } else {
    isSelected = String(value) === String(id);
  }

  return (
    <div
      key={isUnassigned ? "unassigned" : id}
             
                    onClick={() => handleSelect(c)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors
                      ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    {!isUnassigned ? (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name?.charAt(0)?.toUpperCase() || "C"}
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
    </div>
  );
}

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

export default function LeadModal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isCounsellor = location.pathname.includes("/counsellor");
  let mode = "add";
  if (location.pathname.includes("/edit")) mode = "edit";
  else if (location.pathname.includes("/assign")) mode = "assign";
  const isAssignMode = mode === "assign";

  // ✅ CONFIG STATE - Fetch from API
  const [configs, setConfigs] = useState({
    lead_source: [],
    study_level: [],
    english_test_type: [],
    marital_status: [],
    degree_type: [],
  });

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    source_id: "",
    dob: "",
    marital_status_id: "",
    father_name: "",
    father_contact: "",
    home_address: "",
   counsellor_id: null,  // ✅
    english_test_id: "",
    english_test_overall_score: "",
  });
  
  const [saving, setSaving] = useState(false);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  const [educationEntries, setEducationEntries] = useState([]);
  const [tempDegree, setTempDegree] = useState({
    degree_id: "",
    year_awarded: "",
    grades_cgpa: "",
    board_university: "",
    editingId: null,
  });
  const [gradeError, setGradeError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    fatherName: "",
    totalScore: "",
  });

 
// LeadModal.jsx - Complete fixed function

const fetchConfigs = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${BASE_URL}/config`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch configs");
        const data = await response.json();

        console.log("Configs API response:", data); // Debug

        if (data.success) {
            // ✅ Helper to remove duplicates
            const uniqueBy = (arr, key) => {
                if (!arr || !Array.isArray(arr)) return [];
                const seen = new Set();
                return arr.filter(item => {
                    const value = item[key]?.toLowerCase() || '';
                    if (seen.has(value)) return false;
                    seen.add(value);
                    return true;
                });
            };

            setConfigs({
                lead_source: uniqueBy(data.data.lead_source, 'name'),
                study_level: uniqueBy(data.data.study_level, 'name'),
                english_test_type: uniqueBy(data.data.english_test_type, 'name'),
                marital_status: uniqueBy(data.data.marital_status, 'name'),
                degree_type: uniqueBy(data.data.degree_type, 'name'),
            });
        }
    } catch (error) {
        console.error("Error fetching configs:", error);
    }
};
const [countries, setCountries] = useState([]);

// ✅ REPLACE the entire fetchCountries function with this:
const fetchCountries = useCallback(async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BASE_URL}/countries`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.success) {
            // ✅ Flatten the nested array
            const countryData = Array.isArray(data.data) && Array.isArray(data.data[0]) 
                ? data.data[0] 
                : data.data;
            setCountries(countryData || []);
        }
    } catch (err) {
        console.error("Failed to fetch countries:", err);
    }
}, []);

// ✅ ADD THESE FUNCTIONS after fetchCountries:
const fetchCitiesByCountry = useCallback(async (countryId) => {
    if (!countryId) {
        setCities([]);
        return;
    }
    try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BASE_URL}/countries/${countryId}/cities`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.success) {
            setCities(data.data);
        }
    } catch (err) {
        console.error("Failed to fetch cities:", err);
    }
}, []);

const fetchUniversitiesByCountry = useCallback(async (countryId) => {
    if (!countryId) {
        setUniversities([]);
        return;
    }
    try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BASE_URL}/countries/${countryId}/universities`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.success) {
            setUniversities(data.data);
        }
    } catch (err) {
        console.error("Failed to fetch universities:", err);
    }
}, []);
  // ✅ DYNAMIC OPTIONS FROM CONFIGS
const sourceOptions = configs.lead_source.map((s) => ({
    value: s.id,
    label: s.name,
}));

  const studyLevelOptions = configs.study_level.map((s) => ({
    value: s.id,
    label: s.name,
  }));
const degreeOptions = configs.degree_type.map((s) => ({
    value: s.id,
    label: s.name,
}));

  const englishTestOptions = [
    ...configs.english_test_type.map((t) => ({
      value: t.id,
      label: t.name,
    })),
    { value: "none", label: "None" },
  ];

  const maritalStatusOptions = configs.marital_status.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const isDegreeDuplicate = (degreeId, editingId = null) => {
    return educationEntries.some(
      (entry) => entry.degree_id === degreeId && entry.id !== editingId,
    );
  };

// ✅ REPLACE with this safe version
const filteredCountries = (countries || [])
  .filter((c) => {
    if (!c) return false;
    const searchTerm = countrySearchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(searchTerm)) ||
      (c.code && c.code.toLowerCase().includes(searchTerm))
    );
  })
  .map((c) => ({ 
    value: c.name, 
    display: `${c.name} (${c.code || 'N/A'})` 
  }));

  useEffect(() => {
    if (!tempDegree.degree_id) {
      setGradeError("");
      return;
    }
    const degreeName = studyLevelOptions.find(
      (s) => s.value === tempDegree.degree_id
    )?.label;
    const error = validateGrade(degreeName, tempDegree.grades_cgpa);
    setGradeError(error || "");
  }, [tempDegree.degree_id, tempDegree.grades_cgpa, studyLevelOptions]);

  // ========== FIELD HANDLERS ==========
  const handleNameChange = (e) => {
    let rawValue = e.target.value;
    let cleaned = rawValue.replace(/^\s+/, "");
    cleaned = cleaned.replace(/[^A-Za-z\s]/g, "");
    let error = "";
    if (cleaned !== rawValue) {
      error = "Only letters and spaces are allowed";
    }
    setForm((prev) => ({ ...prev, name: cleaned }));
    setFieldErrors((prev) => ({ ...prev, name: error }));
  };

  const handleFatherNameChange = (e) => {
    let rawValue = e.target.value;
    let cleaned = rawValue.replace(/^\s+/, "");
    cleaned = cleaned.replace(/[^A-Za-z\s]/g, "");
    let error = "";
    if (cleaned !== rawValue) {
      error = "Only letters and spaces are allowed";
    }
    if (cleaned.length > 0) {
      if (cleaned.length < 3) {
        error = error || "Father name must be at least 3 characters";
      } else if (cleaned.length > 50) {
        error = error || "Father name cannot exceed 50 characters";
        cleaned = cleaned.slice(0, 50);
      }
    }
    setForm((prev) => ({ ...prev, father_name: cleaned }));
    setFieldErrors((prev) => ({ ...prev, fatherName: error }));
  };

  const handleEmailChange = (e) => {
    let rawValue = e.target.value;
    let cleaned = rawValue.replace(/^\s+/, "");
    cleaned = cleaned.replace(/[^a-zA-Z0-9.@_+-]/g, "");
    setForm((prev) => ({ ...prev, email: cleaned }));
  };

  const handleBoardUniversityChange = (e) => {
    let rawValue = e.target.value;
    let cleaned = rawValue.replace(/^\s+/, "");
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, "");
    setTempDegree((prev) => ({
      ...prev,
      board_university: cleaned,
    }));
  };

  const handleGradesChange = (e) => {
    let rawValue = e.target.value;
    let value = rawValue.replace(/^\s+/, "");
    const degreeName = studyLevelOptions.find(
      (s) => s.value === tempDegree.degree_id
    )?.label;
    const rule = DEGREE_GRADE_RULES[degreeName];

    if (value.length > getGradeMaxLength(degreeName)) {
      return;
    }

    if (rule?.type === "numeric" || rule?.type === "numeric_or_grades") {
      if (/^[0-9A-Za-z+.\s]*$/.test(value)) {
        setTempDegree((prev) => ({ ...prev, grades_cgpa: value }));
      }
      return;
    }

    if (rule?.type === "cgpa") {
      if (/^[0-9./]*$/.test(value)) {
        setTempDegree((prev) => ({ ...prev, grades_cgpa: value }));
      }
      return;
    }

    if (rule?.type === "grades_list") {
      if (/^[A-Za-z+]*$/.test(value)) {
        setTempDegree((prev) => ({
          ...prev,
          grades_cgpa: value.toUpperCase(),
        }));
      }
      return;
    }

    setTempDegree((prev) => ({ ...prev, grades_cgpa: value }));
  };

  const handleTotalScoreChange = (e) => {
    let rawValue = e.target.value;
    let cleaned = rawValue.replace(/^\s+/, "");
    cleaned = cleaned.replace(/[^\d.]/g, "");

    const decimalCount = (cleaned.match(/\./g) || []).length;
    if (decimalCount > 1) {
      cleaned = cleaned.slice(0, cleaned.lastIndexOf("."));
    }

    const testType = form.english_test_id;
    if (testType !== "ielts" && cleaned.includes(".")) {
      cleaned = cleaned.split(".")[0];
    }

    let error = "";
    if (cleaned.length > 0) {
      if (cleaned.length < 1) {
        error = "Score must be at least 1 character";
      } else if (cleaned.length > 4) {
        error = "Score cannot exceed 4 characters";
        cleaned = cleaned.slice(0, 4);
      } else {
        const numValue = parseFloat(cleaned);
        if (isNaN(numValue)) {
          error = "Please enter a valid number";
        } else {
          if (cleaned.endsWith(".")) {
            error = "Score cannot end with decimal point";
          } else if (
            testType === "ielts" &&
            cleaned.split(".")[1]?.length > 2
          ) {
            error = "Maximum 2 decimal places allowed";
            cleaned = parseFloat(cleaned).toFixed(2);
          }
        }
      }
    } else if (
      form.english_test_id &&
      form.english_test_id !== "none"
    ) {
      error = "Total score is required for selected English test";
    }

    setForm((prev) => ({ ...prev, english_test_overall_score: cleaned }));
    setFieldErrors((prev) => ({ ...prev, totalScore: error }));
  };

  const handleScoreBlur = () => {
    const testType = form.english_test_id;
    const currentScore = form.english_test_overall_score;
    if (!testType || testType === "none" || !currentScore) return;
    const formatted = formatEnglishScore(testType, currentScore);
    if (formatted !== currentScore) {
      setForm((prev) => ({ ...prev, english_test_overall_score: formatted }));
    }
  };

  const handleFatherNameBlur = () => {
    if (
      form.father_name &&
      form.father_name.length > 0 &&
      form.father_name.length < 3
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        fatherName: "Father name must be at least 3 characters",
      }));
    }
  };

  const handleNameBlur = () => {
    const trimmed = form.name.trim();
    if (trimmed !== form.name) {
      setForm((prev) => ({ ...prev, name: trimmed }));
    }
  };

const handleCustomChange = (e) => {
  const { name, value } = e.target;
  console.log("📝 handleCustomChange - name:", name, "value:", value, "type:", typeof value);
  
  // ✅ Handle counsellor_id separately
  if (name === "counsellor_id") {
    // If value is null, undefined, "null", or empty string → set to null
    if (value === null || value === undefined || value === "null" || value === "") {
      setForm(prev => {
        console.log("📝 Setting counsellor_id to null");
        return { ...prev, counsellor_id: null };
      });
    } else {
      // Convert to number
      const numValue = Number(value);
      console.log("📝 Setting counsellor_id to:", numValue);
      setForm(prev => ({ ...prev, counsellor_id: isNaN(numValue) ? null : numValue }));
    }
    return;
  }

  // Handle other fields
  let processedValue = value;
  if (typeof processedValue === "string") {
    processedValue = processedValue.replace(/^\s+/, "");
  }

  const fieldMap = {
    source: "source_id",
    marital_status: "marital_status_id",
    english_proficiency_test: "english_test_id",
  };
  const dbFieldName = fieldMap[name] || name;
  setForm(prev => ({ ...prev, [dbFieldName]: processedValue }));
};

  const getApiBaseUrl = useCallback(
    () =>
      isCounsellor ? `${BASE_URL}/counsellor/leads` : `${BASE_URL}/admin/leads`,
    [isCounsellor],
  );
// LeadModal.jsx - Replace fetchCounsellors

// LeadModal.jsx - Replace fetchCounsellors

const fetchCounsellors = useCallback(async () => {
  // ✅ Don't skip for counsellor - we need to show "Unassigned" option anyway
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setCounsellors([]);
      return;
    }
    const res = await fetch(`${BASE_URL}/admin/getCounsellors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("📥 Counsellors API response:", data);
    
    // ✅ Handle nested array structure
    let counsellorsData = [];
    
    if (data.success && data.data) {
      // Check if data.data.counsellors exists
      if (data.data.counsellors) {
        // If it's a nested array, flatten it
        if (Array.isArray(data.data.counsellors) && data.data.counsellors.length > 0) {
          // Check if first element is also an array (nested)
          if (Array.isArray(data.data.counsellors[0])) {
            counsellorsData = data.data.counsellors[0] || [];
          } else {
            counsellorsData = data.data.counsellors;
          }
        }
      } else if (Array.isArray(data.data)) {
        // Fallback: if data.data is an array
        counsellorsData = data.data;
      }
    } else if (Array.isArray(data)) {
      counsellorsData = data;
    }
    
    console.log("📊 Processed counsellors:", counsellorsData);
    setCounsellors(counsellorsData);
  } catch (error) {
    console.error("❌ Failed to fetch counsellors:", error);
    setCounsellors([]);
  }
}, []);
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

        let formattedScore = lead.english_test_overall_score || "";
        if (lead.english_test_id && lead.english_test_overall_score) {
          formattedScore = formatEnglishScore(
            lead.english_test_id,
            lead.english_test_overall_score,
          );
        }

        setForm({
          name: lead.name || "",
          email: lead.email || "",
          phone: lead.phone || "",
          source_id: lead.source_id || "",
          preferred_country: lead.preferred_country || "",
          counsellor_id: lead.counsellor_id || null,
          dob: lead.dob || "",
          marital_status_id: lead.marital_status_id || "",
          father_name: lead.father_name || "",
          father_contact: lead.father_contact || "",
          home_address: lead.home_address || "",
     
          english_test_id: lead.english_test_id || "",
          english_test_overall_score: formattedScore,
        });

        if (lead.education && Array.isArray(lead.education)) {
          setEducationEntries(
            lead.education.map((edu) => ({ ...edu, id: edu.id })),
          );
        } else {
          setEducationEntries([]);
        }
      } catch {
        toast.error("Failed to load lead data", { toastId: "lead-load-fail" });
        navigate(isCounsellor ? "/counsellor/leads" : "/admin/leads");
      } finally {
        setLoading(false);
      }
    },
    [getApiBaseUrl, isCounsellor, navigate],
  );

  // ✅ FETCH CONFIGS ON MOUNT
  useEffect(() => {
    fetchConfigs();
    fetchCounsellors();
     fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isCounsellor && mode === "add") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.id) setForm((prev) => ({ ...prev, counsellor_id: user.id }));
    }
  }, [isCounsellor, mode]);

// ✅ FETCH LEAD DATA ON MOUNT OR MODE CHANGE
useEffect(() => {
  // If we have an ID and we're in edit or assign mode, fetch the lead
  if (id && (mode === "edit" || mode === "assign")) {
    fetchLead(id);
  }
  // If we're in add mode, reset the form
  else if (mode === "add") {
    setForm({
      ...EMPTY_FORM,
      source_id: "",
      counsellor_id: isCounsellor
        ? JSON.parse(localStorage.getItem("user") || "{}").id || null
        : null,
      dob: "",
      marital_status_id: "",
      father_name: "",
      father_contact: "",
      home_address: "",
      english_test_id: "",
      english_test_overall_score: "",
    });
    setSelectedCountries([]);
    setEducationEntries([]);
  }
}, [mode, id, isCounsellor, fetchLead]);

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

  const handleAddOrUpdateEducation = () => {
    if (!tempDegree.degree_id) {
      toast.error("Degree is required", { toastId: "degree-required" });
      return;
    }
    if (!tempDegree.year_awarded) {
      toast.error("Year awarded is required", { toastId: "year-required" });
      return;
    }

    if (isDegreeDuplicate(tempDegree.degree_id, tempDegree.editingId)) {
      toast.error("This degree has already been added for this student.", {
        toastId: "duplicate-degree",
      });
      return;
    }

    if (gradeError) {
      toast.error(gradeError, { toastId: "grade-error" });
      return;
    }

    const year = parseInt(tempDegree.year_awarded);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1950 || year > currentYear) {
      toast.error(`Year must be between 1950 and ${currentYear}`, {
        toastId: "year-range",
      });
      return;
    }

    const trimmedBoard = tempDegree.board_university?.replace(/^\s+/, "") || "";
    const trimmedGrades = tempDegree.grades_cgpa?.replace(/^\s+/, "") || "";

    if (tempDegree.editingId) {
      setEducationEntries((prev) =>
        prev.map((edu) =>
          edu.id === tempDegree.editingId
            ? {
                ...edu,
                degree_id: tempDegree.degree_id,
                year_awarded: year,
                grades_cgpa: trimmedGrades,
                board_university: trimmedBoard,
                editingId: undefined,
              }
            : edu,
        ),
      );
      toast.success("Education updated", { toastId: "edu-updated" });
    } else {
  const newEntry = {
    id: Date.now(),
    degree_id: tempDegree.degree_id,  // ← CORRECT
    year_awarded: year,
    grades_cgpa: trimmedGrades || null,
    board_university: trimmedBoard || null,
};
      setEducationEntries((prev) => [...prev, newEntry]);
      toast.success("Degree added", { toastId: "degree-added" });
    }
    setTempDegree({
      degree_id: "",
      year_awarded: "",
      grades_cgpa: "",
      board_university: "",
      editingId: null,
    });
    setGradeError("");
  };

  const handleRemoveEducation = (id) => {
    setEducationEntries((prev) => prev.filter((edu) => edu.id !== id));
    toast.info("Degree removed", { toastId: "degree-removed" });
  };

  const handleEditEducation = (entry) => {
    setTempDegree({
      degree_id: entry.degree_id,
      year_awarded: entry.year_awarded,
      grades_cgpa: entry.grades_cgpa || "",
      board_university: entry.board_university || "",
      editingId: entry.id,
    });
  };

  const handleCancelEdit = () => {
    setTempDegree({
      degree_id: "",
      year_awarded: "",
      grades_cgpa: "",
      board_university: "",
      editingId: null,
    });
    setGradeError("");
  };

// LeadModal.jsx - Update validate function

const validate = () => {
  // ✅ If in assign mode, only validate counsellor_id
if (isAssignMode) {
  const errors = [];
  // Allow null for unassignment - only validate if it's a number
  if (form.counsellor_id !== null && form.counsellor_id !== undefined && form.counsellor_id !== '') {
    const numValue = Number(form.counsellor_id);
    if (isNaN(numValue)) {
      errors.push("Invalid counsellor selection.");
    }
  }
  return errors;
}

  // ✅ Full validation for add/edit mode
  const errors = [];

  if (!form.name?.trim()) {
    errors.push("Name is required.");
  } else {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(form.name.trim())) {
      errors.push("Name must contain only letters and spaces.");
    } else if (form.name.trim().length < 3 || form.name.trim().length > 50) {
      errors.push("Name must be 3–50 characters long.");
    }
  }

  if (!form.email?.trim()) {
    errors.push("Email is required.");
  } else {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    const trimmedEmail = form.email.trim();
    if (!emailRegex.test(trimmedEmail)) {
      errors.push("Email must be a valid format (e.g., name@domain.com).");
    } else {
      const localPart = trimmedEmail.split("@")[0];
      if (localPart.length > 0 && /^\d/.test(localPart)) {
        errors.push("Email local part (before @) cannot start with a digit.");
      }
    }
  }

  if (!form.phone?.trim()) {
    errors.push("Phone number is required.");
  } else {
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 11) {
      errors.push("Phone number must have at least 11 digits.");
    }
  }

  if (form.father_name?.trim()) {
    const fatherNameRegex = /^[A-Za-z\s]+$/;
    if (!fatherNameRegex.test(form.father_name.trim())) {
      errors.push("Father name must contain only letters and spaces.");
    }
    if (
      form.father_name.trim().length < 3 ||
      form.father_name.trim().length > 50
    ) {
      errors.push("Father name must be 3–50 characters long.");
    }
  }

  if (form.father_contact?.trim()) {
    const digits = form.father_contact.replace(/\D/g, "");
    if (digits.length < 11) {
      errors.push(
        "Father contact must have at least 11 digits (if provided).",
      );
    }
  }

  if (form.dob) {
    const age = calculateAge(form.dob);
    if (age === null || age <= 16) {
      errors.push(
        "Date of birth must make the applicant older than 16 years.",
      );
    }
  }

  if (!form.source_id) {
    errors.push("Source must be selected.");
  }

  if (selectedCountries.length === 0) {
    errors.push("At least one preferred country must be selected.");
  }

  if (form.home_address?.trim()) {
    const addr = form.home_address.trim();
    const addressRegex = /^[a-zA-Z0-9\s.,!?;:\-()'"&@#/]+$/;
    if (!addressRegex.test(addr)) {
      errors.push(
        "Home address may only contain letters, numbers, spaces, and basic punctuation (.,!?;:-_()'\"&@#/).",
      );
    } else if (addr.length < 3 || addr.length > 255) {
      errors.push(
        "Home address must be 3–255 characters long (if provided).",
      );
    }
  }

  if (educationEntries.length === 0) {
    errors.push("At least one degree entry is required.");
  } else {
    educationEntries.forEach((edu, idx) => {
      if (!edu.degree_id) {
        errors.push(`Degree #${idx + 1}: Degree is required.`);
      }
      if (!edu.year_awarded) {
        errors.push(`Degree #${idx + 1}: Year awarded is required.`);
      } else {
        const year = Number(edu.year_awarded);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1950 || year > currentYear) {
          errors.push(
            `Degree #${idx + 1}: Year awarded must be between 1950 and ${currentYear}.`,
          );
        }
      }

      if (edu.board_university?.trim()) {
        const boardValue = edu.board_university;
        if (boardValue[0] === " ") {
          errors.push(
            `Degree #${idx + 1}: Board/University cannot start with a space.`,
          );
        }
        if (/\d/.test(boardValue)) {
          errors.push(
            `Degree #${idx + 1}: Board/University cannot contain numbers.`,
          );
        }
        const trimmedLength = boardValue.trim().length;
        if (trimmedLength < 3 || trimmedLength > 55) {
          errors.push(
            `Degree #${idx + 1}: Board/University must be 3–55 characters long (if provided).`,
          );
        }
      }
    });
  }

  if (
    form.english_test_id &&
    form.english_test_id !== "none"
  ) {
    const score = parseFloat(form.english_test_overall_score);
    if (isNaN(score)) {
      errors.push("Total score is required for the selected English test.");
    } else {
      let max = 0;
      const testName = englishTestOptions.find(
        (t) => t.value === form.english_test_id
      )?.label?.toLowerCase();
      switch (testName) {
        case "ielts":
          max = 9;
          break;
        case "toefl":
          max = 120;
          break;
        case "pte":
          max = 90;
          break;
        case "duolingo":
          max = 160;
          break;
        default:
          max = 999;
      }
      if (score < 0 || score > max) {
        errors.push(
          `Total score must be between 0 and ${max} for ${testName?.toUpperCase() || "this test"}.`,
        );
      }
      const scoreStr = form.english_test_overall_score.toString();
      if (scoreStr.length < 1 || scoreStr.length > 4) {
        errors.push("Total score must be 1-4 characters long.");
      }
      if (testName !== "ielts" && scoreStr.includes(".")) {
        errors.push(
          `${testName?.toUpperCase() || "This test"} score must be an integer.`,
        );
      }
    }
  }

  return errors;
};

  const handleSubmit = async (e) => {
    console.log("🔥 handleSubmit CALLED");
    e?.preventDefault();

    const validationErrors = validate();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(" "), { toastId: "validation-error" });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");

      let url, method;
      const baseUrl = getApiBaseUrl();
      const submitData = { ...form };

      // ✅ Clean data - only keep valid fields
      const validFields = [
        "name",
        "email",
        "phone",
        "source_id",
        "preferred_country",
        "counsellor_id",
        "dob",
        "marital_status_id",
        "father_name",
        "father_contact",
        "home_address", 
        "english_test_id",
        "english_test_overall_score",
        "education",
      ];

const cleanedData = {};
Object.keys(submitData).forEach((key) => {
  if (validFields.includes(key)) {
    let value = submitData[key];
    
    // ✅ FIX: Format date to YYYY-MM-DD
    if (key === 'dob' && value) {
      const dateObj = new Date(value);
      if (!isNaN(dateObj.getTime())) {
        value = dateObj.toISOString().split('T')[0];
      } else {
        value = null;
      }
    }
    
    cleanedData[key] = value;
  }
});

      if (isCounsellor && !cleanedData.counsellor_id) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        cleanedData.counsellor_id = user.id;
      }

      cleanedData.education = educationEntries.map(({ id, ...rest }) => rest);

      if (mode === "add") {
        url = baseUrl;
        method = "POST";
      } else if (mode === "edit") {
        url = `${baseUrl}/${id}`;
        method = "PUT";
 } else {
  url = `${BASE_URL}/admin/leads/${id}/assign`;
  method = "PUT";
  // Handle unassignment explicitly
  if (form.counsellor_id === null || form.counsellor_id === undefined || form.counsellor_id === '') {
    cleanedData.counsellor_id = null;
  } else {
    cleanedData.counsellor_id = Number(form.counsellor_id);
  }
}
console.log("🚀 About to fetch:", url, method, cleanedData);
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          method === "PUT" && mode === "assign"
            ? { counsellor_id: cleanedData.counsellor_id }
            : cleanedData,
        ),
      });

      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message || `HTTP ${res.status}`,
        );

      let successMessage;
      if (mode === "add") {
        successMessage =
          "Lead added successfully. Please assign a counsellor to this lead.";
      } else if (mode === "edit") {
        successMessage = "Lead updated successfully";
      } else if (mode === "assign" && editLead) {
        const prevId = editLead.counsellor_id;
        const newId = form.counsellor_id;
        if (prevId && !newId) {
          successMessage = "Counsellor unassigned successfully";
        } else if (!prevId && newId) {
          successMessage = "Counsellor assigned successfully";
        } else if (prevId && newId && prevId !== newId) {
          successMessage = "Counsellor reassigned successfully";
        } else {
          successMessage = "Counsellor assignment updated";
        }
      } else {
        successMessage = "Counsellor assigned successfully";
      }

      toast.success(successMessage, { toastId: "lead-save-success" });
      navigate(isCounsellor ? "/counsellor/leads" : "/admin/leads");
    } catch (err) {
      toast.error("Failed to save: " + err.message, {
        toastId: "lead-save-fail",
      });
    } finally {
      setSaving(false);
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
    setCountrySearchTerm("");
    setCountryDropdownOpen(false);
  };

  const handleRemoveCountry = (countryValue) => {
    const updated = selectedCountries.filter((c) => c !== countryValue);
    setSelectedCountries(updated);
    setForm((prev) => ({ ...prev, preferred_country: updated.join(", ") }));
  };

  const sourceLabel = editLead?.source_id
    ? sourceOptions.find((s) => s.value === editLead.source_id)?.label || "—"
    : "—";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Assign Mode
  if (isAssignMode && editLead) {
 const assignedCounsellor = Array.isArray(counsellors) 
  ? counsellors.find(
      (c) => String(c.user?.id || c.id) === String(editLead?.counsellor_id),
    )
  : null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-6">
        <div className="">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/leads")}
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl md:text-xl font-semibold text-slate-900">
                  Assign Counsellor
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Review lead details and assign a counsellor
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="relative bg-[#009E99] px-6 py-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {editLead?.name || "Unnamed Lead"}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
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
                <div className="p-6 space-y-8">
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
                        value={
                          maritalStatusOptions.find(
                            (m) => m.value === editLead?.marital_status_id
                          )?.label || "—"
                        }
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
                      {editLead?.education && editLead.education.length > 0 ? (
                        editLead.education.map((edu, idx) => {
                          const degreeName = studyLevelOptions.find(
                            (s) => s.value === edu.degree_id
                          )?.label;
                          return (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                              <p className="font-medium text-slate-800">
                                {degreeName || edu.degree_id}
                              </p>
                              <p className="text-xs text-slate-500">
                                Year: {edu.year_awarded}
                              </p>
                              {edu.grades_cgpa && (
                                <p className="text-xs text-slate-500">
                                  Grades: {edu.grades_cgpa}
                                </p>
                              )}
                              {edu.board_university && (
                                <p className="text-xs text-slate-500">
                                  Board/Uni: {edu.board_university}
                                </p>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-2 text-center text-slate-400 p-4">
                          No education details added
                        </div>
                      )}
                    </div>
                    {editLead?.english_test_id &&
                      editLead?.english_test_id !== "none" && (
                        <div className="mt-4">
                          <InfoRow
                            icon={<FileText size={16} />}
                            label="English Test"
                            value={`${
                              englishTestOptions.find(
                                (t) => t.value === editLead.english_test_id
                              )?.label || "Test"
                            } • ${editLead.english_test_overall_score || "No score"}`}
                          />
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
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
                    <div className="mb-6 relative z-50">
                      <SearchableCounsellorSelect
                        counsellors={counsellors}
                        value={form.counsellor_id}
                        onChange={handleCustomChange}
                      />
                    </div>
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
          <h1 className="text-xl font-semibold text-gray-900">
            {mode === "add"
              ? "Add New Lead"
              : isCounsellor
                ? "Edit My Lead"
                : "Edit Lead"}
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm"
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
                  <div>
                    <InputField
                      labelName="Applicant Name *"
                      name="name"
                      value={form.name}
                      handlerChange={handleNameChange}
                      onBlur={handleNameBlur}
                      icon={<User size={16} />}
                      maxLength={50}
                    />
                    {fieldErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>
                  <PhoneInputWithCountry
                    value={form.phone}
                    onChange={handleCustomChange}
                    name="phone"
                    labelName="Applicant's Contact *"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      labelName="Applicant's Father Name"
                      name="father_name"
                      value={form.father_name}
                      handlerChange={handleFatherNameChange}
                      onBlur={handleFatherNameBlur}
                      icon={<UserCircle size={16} />}
                      maxLength={50}
                    />
                    {fieldErrors.fatherName && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.fatherName}
                      </p>
                    )}
                  </div>
                  <PhoneInputWithCountry
                    value={form.father_contact}
                    onChange={handleCustomChange}
                    name="father_contact"
                    labelName="Father's Contact"
                  />
                </div>
                <div className="space-y-1">
                  <div className="relative">
                    <TextareaField
                      labelName="Home Address"
                      name="home_address"
                      value={form.home_address}
                      handlerChange={handleCustomChange}
                      maxLength={255}
                      className="rounded-xl border-slate-300 focus:border-blue-500 resize-none w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    labelName="Applicant Email *"
                    type="email"
                    name="email"
                    value={form.email}
                    handlerChange={handleEmailChange}
                    onBlur={() =>
                      setForm((prev) => ({ ...prev, email: prev.email.trim() }))
                    }
                    icon={<Mail size={16} />}
                  />
                  <InputField
                    labelName="Date of Birth"
                    type="date"
                    name="dob"
                    value={form.dob}
                    handlerChange={handleCustomChange}
                    icon={<Calendar size={16} />}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableDropdown
                    name="marital_status_id"
                    options={maritalStatusOptions}
                    value={form.marital_status_id}
                    onChange={handleCustomChange}
                    label="Marital Status"
                    placeholder="Select marital status..."
                    icon={<Heart size={16} />}
                  />
                  <SearchableDropdown
                    name="source_id"
                    options={sourceOptions}
                    value={form.source_id}
                    onChange={handleCustomChange}
                    label="Source"
                    placeholder="Search source..."
                    required
                  />
                </div>

                {/* Preferred Countries */}
                <div className="space-y-1" ref={countryDropdownRef}>
                  <label className="block text-sm font-medium text-slate-700">
                    Preferred Countries <span className="text-red-500">*</span>
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
                        let trimmed = e.target.value.replace(/^\s+/, "");
                        trimmed = trimmed.replace(/[^a-zA-Z0-9\s]/g, "");
                        setCountrySearchTerm(trimmed);
                        setCountryDropdownOpen(true);
                      }}
                      onFocus={() => setCountryDropdownOpen(true)}
                      disabled={selectedCountries.length >= 5}
                      placeholder={
                        selectedCountries.length >= 5
                          ? "Max 5 countries selected"
                          : "Type to search countries..."
                      }
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none transition-colors border-slate-300 focus:border-blue-500 bg-white"
                    />
                    {countryDropdownOpen && countrySearchTerm && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-52 overflow-auto py-1">
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
                </div>
              </div>
            </div>

            {/* Educational Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <GraduationCap size={18} className="text-blue-500" />{" "}
                Educational Information
              </h3>
              <div className="bg-slate-50 p-2 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableDropdown
                    name="degree_id"
                   options={degreeOptions}
                    value={tempDegree.degree_id}
                    onChange={(e) =>
                      setTempDegree((prev) => ({
                        ...prev,
                        degree_id: e.target.value,
                      }))
                    }
                    label="Degree"
                    placeholder="Select degree..."
                    icon={<GraduationCap size={16} />}
                    required
                  />
                  <div className="space-y-1">
                    <label className="text-gray-600 text-xs font-semibold mb-1">
                      Year Awarded <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarDays
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type="text"
                        name="year_awarded"
                        value={tempDegree.year_awarded}
                        placeholder="YYYY"
                        maxLength={4}
                        onChange={(e) => {
                          let trimmed = e.target.value.replace(/^\s+/, "");
                          let value = trimmed.replace(/\D/g, "");
                          if (value.length > 4) return;
                          const year = Number(value);
                          const currentYear = new Date().getFullYear();
                          if (
                            value.length === 4 &&
                            (year < 1950 || year > currentYear)
                          ) {
                            return;
                          }
                          setTempDegree((prev) => ({
                            ...prev,
                            year_awarded: value,
                          }));
                        }}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <InputField
                      labelName="Grades / CGPA"
                      name="grades_cgpa"
                      value={tempDegree.grades_cgpa}
                      handlerChange={handleGradesChange}
                      icon={<BarChart size={16} />}
                      placeholder={getGradePlaceholder(
                        studyLevelOptions.find(
                          (s) => s.value === tempDegree.degree_id
                        )?.label
                      )}
                      className={gradeError ? "border-red-500" : ""}
                    />
                    {gradeError && (
                      <p className="text-xs text-red-500 mt-1">{gradeError}</p>
                    )}
                    {tempDegree.degree_id &&
                      studyLevelOptions.find(
                        (s) => s.value === tempDegree.degree_id
                      ) &&
                      !gradeError && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {(() => {
                            const degreeName = studyLevelOptions.find(
                              (s) => s.value === tempDegree.degree_id
                            )?.label;
                            const rule = DEGREE_GRADE_RULES[degreeName];
                            if (!rule) return "";
                            if (rule.type === "numeric_or_grades")
                              return `Allowed: ${rule.numeric.min}–${rule.numeric.max} or grades ${rule.grades.join(", ")}`;
                            if (rule.type === "cgpa")
                              return `CGPA range: ${rule.min}–${rule.max} (4.0 scale) – use numbers, dot, slash`;
                            if (rule.type === "numeric")
                              return `Range: ${rule.min}–${rule.max}`;
                            if (rule.type === "grades_list")
                              return `Allowed grades: ${rule.grades.join(", ")}`;
                            return "";
                          })()}
                        </p>
                      )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-col md:flex-row items-stretch md:items-end gap-2">
                      <div className="flex-1">
                        <InputField
                          labelName="Board / University"
                          name="board_university"
                          value={tempDegree.board_university}
                          handlerChange={handleBoardUniversityChange}
                          icon={<School size={16} />}
                          placeholder="e.g., CBSE, Punjab University, etc."
                          maxLength={55}
                        />
                      </div>
                      <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={handleAddOrUpdateEducation}
                          disabled={!!gradeError}
                          className={`w-full md:w-auto min-w-[120px] h-[46px] px-5 rounded-lg text-white transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md active:scale-[0.98] ${
                            gradeError
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-[#009E99] hover:bg-[#00807a]"
                          }`}
                        >
                          {tempDegree.editingId ? "Edit" : "Add"}
                        </button>
                        {tempDegree.editingId && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="w-full md:w-auto min-w-[110px] h-[46px] px-5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 text-sm font-semibold shadow-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {educationEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                  <GraduationCap
                    size={32}
                    className="mx-auto mb-2 opacity-50"
                  />
                  <p>
                    No degrees added yet. Use the form above to add your
                    academic qualifications.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {educationEntries.map((edu) => {
                    const degreeName = studyLevelOptions.find(
                      (s) => s.value === edu.degree_id
                    )?.label;
                    return (
                      <div
                        key={edu.id}
                        className="group relative bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
                      >
                        <div className="absolute top-3 right-3 flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleEditEducation(edu)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit degree"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(edu.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove degree"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-lg shadow-inner">
                            {degreeName?.charAt(0)?.toUpperCase() || "D"}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 text-base mb-1 pr-12">
                              {degreeName || edu.degree_id}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                                <Calendar
                                  size={12}
                                  className="text-slate-500"
                                />
                                {edu.year_awarded}
                              </span>
                              {edu.grades_cgpa && (
                                <span className="inline-flex items-center gap-1">
                                  <BarChart
                                    size={12}
                                    className="text-slate-500"
                                  />
                                  {edu.grades_cgpa}
                                </span>
                              )}
                              {edu.board_university && (
                                <span className="inline-flex items-center gap-1">
                                  <School
                                    size={12}
                                    className="text-slate-500"
                                  />
                                  {edu.board_university}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* English Proficiency Test */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <FileText size={18} className="text-blue-500" /> English
                Proficiency
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <SearchableDropdown
                    name="english_test_id"
                    options={englishTestOptions}
                    value={form.english_test_id}
                    onChange={handleCustomChange}
                    label="English Proficiency Test"
                    placeholder="Select test..."
                    icon={<FileText size={16} />}
                  />
                </div>
                {form.english_test_id &&
                  form.english_test_id !== "none" && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Total Score
                      </label>
                      <input
                        type="text"
                        name="english_test_overall_score"
                        value={form.english_test_overall_score}
                        onChange={handleTotalScoreChange}
                        onBlur={handleScoreBlur}
                        maxLength={4}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter total score"
                      />
                      {fieldErrors.totalScore && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldErrors.totalScore}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Range: 0–
                        {(() => {
                          const testName = englishTestOptions.find(
                            (t) => t.value === form.english_test_id
                          )?.label?.toLowerCase();
                          switch (testName) {
                            case "toefl":
                              return "120";
                            case "duolingo":
                              return "160";
                            case "ielts":
                              return "9";
                            case "pte":
                              return "90";
                            default:
                              return "";
                          }
                        })()}
                        {form.english_test_id !== "ielts" &&
                          " (integer only)"}
                      </p>
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