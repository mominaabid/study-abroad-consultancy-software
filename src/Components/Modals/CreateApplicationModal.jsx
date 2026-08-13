// CreateApplicationModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { Title } from "../Title";
import SearchableSelect from "../SearchableSelect";
import { BASE_URL } from "../../Content/Url";
import { AddButton } from "../../Components/CustomButtons/AddButton";
import { CancelButton } from "../../Components/CustomButtons/CancelButton";
import {
  User, RefreshCw, GraduationCap,
  School, BarChart, Calendar,
} from "lucide-react";
import PhoneInputWithCountry from "../../Components/InputFields/PhoneInputWithCountry";

const getToken = () => localStorage.getItem("token") || "";

const STATUS_OPTIONS = [
  { value: "inquiry", label: "Inquiry" },
  { value: "evaluation", label: "Evaluation" },
  { value: "application submitted", label: "Application Submitted" },
  { value: "offer letter received", label: "Offer Letter Received" },
  { value: "offer letter not received", label: "Offer Letter Not Received" },
  { value: "visa filed", label: "Visa Filed" },
  { value: "approved", label: "Approved" },
  { value: "reject", label: "Reject" },
];

function FormField({ label, required, children, error }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

// ── initial form state ──
const EMPTY_FORM = {
  user_id: "",
  country_id: "",
  city_id: "",
  university_id: "",
  course_id: "",
  deadline: "",
  status: "inquiry",
  counsellor_notes: "",
  consultancy_fee: "",
  full_name: "",
  email: "",
  phone: "",
  english_proficiency_test: "",
  english_test_overall_score: "",
};

export default function CreateApplicationModal({
  isOpen,
  onClose,
  onSuccess,
  students,
  selectedStudentForCreate,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [allUniversities, setAllUniversities] = useState([]); // Store all universities
  const [courses, setCourses] = useState([]);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(false);

  const [educationEntries, setEducationEntries] = useState([]);
  const [loadingEducation, setLoadingEducation] = useState(false);

  // ── Helper to flatten nested API responses ──
  const extractData = useCallback((data) => {
    if (!data) return [];
    if (Array.isArray(data)) {
      if (data.length > 0 && Array.isArray(data[0])) {
        return data[0];
      }
      return data;
    }
    return [];
  }, []);

  // ── load countries + courses once on mount ──
  useEffect(() => {
    const loadStatic = async () => {
      if (!isOpen) return;
      
      setLoadingCountries(true);
      try {
        const token = getToken();
        if (!token) {
          toast.error("Please login to continue");
          return;
        }

        const [countriesRes, configsRes] = await Promise.all([
          fetch(`${BASE_URL}/countries`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/config`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (!countriesRes.ok || !configsRes.ok) {
          throw new Error("Failed to fetch dropdown data");
        }

        const countriesData = await countriesRes.json();
        const configsData = await configsRes.json();

        console.log("🌍 Countries API response:", countriesData);
        console.log("⚙️ Configs API response:", configsData);

        let countriesList = [];
        if (countriesData.success) {
          countriesList = extractData(countriesData.data);
        }
        setCountries(Array.isArray(countriesList) ? countriesList : []);

        let coursesList = [];
        if (configsData.success && configsData.data) {
          if (configsData.data.course) {
            coursesList = extractData(configsData.data.course);
          } else if (configsData.data.courses) {
            coursesList = extractData(configsData.data.courses);
          } else if (configsData.data.degree_type) {
            coursesList = extractData(configsData.data.degree_type);
          }
        }
        setCourses(Array.isArray(coursesList) ? coursesList : []);
        
        console.log("✅ Countries loaded:", countriesList.length);
        console.log("✅ Courses loaded:", coursesList.length);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
        toast.error("Failed to load dropdown data");
      } finally {
        setLoadingCountries(false);
      }
    };
    
    loadStatic();
  }, [isOpen, extractData]);

  // ── fetch education for selected student ──
// ── fetch education for selected student ──
const fetchLeadEducation = async (leadId) => {
  if (!leadId) { 
    setEducationEntries([]); 
    return; 
  }
  
  // First check if student data already has education
  const existingStudent = students?.find(
    (s) => String(s.user_id || s.id) === String(leadId)
  );
  
  if (existingStudent?.education && existingStudent.education.length > 0) {
    setEducationEntries(existingStudent.education);
    setLoadingEducation(false);
    return;
  }
  
  setLoadingEducation(true);
  try {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/counsellor/leads/${leadId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) throw new Error("Failed to fetch education");
    const data = await res.json();
    
    let educationData = [];
    // ✅ FIXED: Check education array directly
    if (data.education && Array.isArray(data.education)) {
      educationData = data.education;
    } else if (data.success && data.education) {
      educationData = data.education;
    } else if (data.data && Array.isArray(data.data)) {
      educationData = data.data;
    } else if (Array.isArray(data)) {
      educationData = data;
    }
    
    setEducationEntries(educationData);
  } catch (error) {
    console.error("Failed to fetch education:", error);
    setEducationEntries([]);
  } finally {
    setLoadingEducation(false);
  }
};

  // ── reset form when modal opens ──
  useEffect(() => {
    if (!isOpen) return;
    
    setCities([]);
    setUniversities([]);
    setAllUniversities([]);
    setErrors({});

    if (selectedStudentForCreate) {
      setFormData({
        ...EMPTY_FORM,
        user_id: String(selectedStudentForCreate.user_id || selectedStudentForCreate.id || ""),
        full_name: selectedStudentForCreate.name || "",
        email: selectedStudentForCreate.email || "",
        phone: selectedStudentForCreate.phone || "",
        english_proficiency_test: selectedStudentForCreate.english_proficiency_test || "",
        english_test_overall_score: selectedStudentForCreate.english_test_overall_score || "",
      });
fetchLeadEducation(selectedStudentForCreate.id);
    } else {
      setFormData(EMPTY_FORM);
      setEducationEntries([]);
    }
  }, [selectedStudentForCreate, isOpen]);

  // ── counseling students only ──
  const counselingStudents = useMemo(
    () => students || [],
    [students]
  );

  // ── cascade: country selected → load cities and universities ──
  const handleCountryChange = async (e) => {
    const countryId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      country_id: countryId,
      city_id: "",
      university_id: "",
    }));
    setCities([]);
    setUniversities([]);
    setAllUniversities([]);
    
    if (!countryId) return;

    setLoadingCities(true);
    setLoadingUniversities(true);
    try {
      const token = getToken();
      
      // Fetch cities for this country
      const citiesRes = await fetch(`${BASE_URL}/countries/${countryId}/cities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        let citiesList = [];
        if (citiesData.success && citiesData.data) {
          citiesList = extractData(citiesData.data);
        }
        setCities(Array.isArray(citiesList) ? citiesList : []);
      }

      // ✅ Fetch universities for this country (NOT city)
      const univRes = await fetch(`${BASE_URL}/countries/${countryId}/universities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (univRes.ok) {
        const univData = await univRes.json();
        let universitiesList = [];
        if (univData.success && univData.data) {
          universitiesList = extractData(univData.data);
        }
        setAllUniversities(Array.isArray(universitiesList) ? universitiesList : []);
        setUniversities(Array.isArray(universitiesList) ? universitiesList : []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load cities and universities");
    } finally {
      setLoadingCities(false);
      setLoadingUniversities(false);
    }
  };

  // ── cascade: city selected → filter universities by city ──
  const handleCityChange = async (e) => {
    const cityId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      city_id: cityId,
      university_id: "",
    }));
    
    // Filter universities by city (client-side filtering)
    if (cityId && allUniversities.length > 0) {
      const filtered = allUniversities.filter(u => {
        // Check if university has city_id or city field
        return u.city_id === parseInt(cityId) || u.city === parseInt(cityId);
      });
      setUniversities(filtered.length > 0 ? filtered : allUniversities);
    } else {
      setUniversities(allUniversities);
    }
  };

  // ── student dropdown change ──
// ✅ FIXED: Use s.id (lead_id) for user_id field
const handleStudentChange = (e) => {
  const value = e.target.value;
  const selected = students?.find(
    (s) => String(s.id) === String(value)  // ← Use s.id
  );
  if (selected) {
    setFormData((prev) => ({
      ...prev,
      user_id: value,  // ← This will be lead_id (5)
      full_name: selected.name || "",
      email: selected.email || "",
      phone: selected.phone || "",
      english_proficiency_test: selected.english_proficiency_test || "",
      english_test_overall_score: selected.english_test_overall_score || "",
    }));
    fetchLeadEducation(selected.id);
  } else {
    setFormData((prev) => ({ ...prev, user_id: value }));
  }
  setErrors((prev) => { const e = { ...prev }; delete e.user_id; return e; });
};

  // ── generic field change ──
  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    if (name === "consultancy_fee") {
      if (value.length > 12) return;
      if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const e = { ...prev }; delete e[name]; return e; });
    }
  };

  // ── validation ──
  const validate = () => {
    const e = {};
    if (!formData.user_id) e.user_id = "Student is required";
    if (!formData.country_id) e.country_id = "Country is required";
    if (!formData.city_id) e.city_id = "City is required";
    if (!formData.university_id) e.university_id = "University is required";
    if (!formData.course_id) e.course_id = "Course is required";

    if (!formData.consultancy_fee || formData.consultancy_fee.trim() === "") {
      e.consultancy_fee = "Consultancy fee is required";
    } else {
      const fee = parseFloat(formData.consultancy_fee);
      if (isNaN(fee) || fee < 0)
        e.consultancy_fee = "Must be a positive number";
    }

    if (formData.counsellor_notes) {
      const len = formData.counsellor_notes.trim().length;
      if (len > 0 && len < 3) e.counsellor_notes = "At least 3 characters";
      if (len > 255) e.counsellor_notes = "Max 255 characters";
    }

    return e;
  };

  // ── submit ──
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors", { toastId: "val-err" });
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const payload = {
        user_id: parseInt(formData.user_id),
        country_id: parseInt(formData.country_id),
        city_id: parseInt(formData.city_id),
        university_id: parseInt(formData.university_id),
        course_id: parseInt(formData.course_id),
        deadline: formData.deadline || null,
        status: formData.status,
        counsellor_notes: formData.counsellor_notes || null,
        consultancy_fee: parseFloat(formData.consultancy_fee),
      };

      const res = await fetch(`${BASE_URL}/counsellor/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Application created successfully", { toastId: "app-ok" });
        onSuccess();
        onClose();
      } else {
        throw new Error(data.message || "Failed to create application");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create application", {
        toastId: "app-err",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectCls = (disabled) =>
    `w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none
     focus:border-teal-500 focus:ring-2 focus:ring-teal-100
     ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : "bg-white"}`;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <Title setModal={onClose}>Create New Application</Title>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            <InfoSection title="Basic Information">
              <FormField label="Student" required error={errors.user_id}>
                <SearchableSelect
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleStudentChange}
              options={counselingStudents.map((s) => ({
  value: String(s.id),  // ← Lead ID
  label: `${s.name} — ${s.email}`,
  icon: <User size={14} className="text-slate-400" />,
}))}
                  placeholder="Search student by name or email..."
                  required
                  error={errors.user_id}
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Country" required error={errors.country_id}>
                  <select
                    name="country_id"
                    value={formData.country_id}
                    onChange={handleCountryChange}
                    className={selectCls(loadingCountries)}
                  >
                    <option value="">
                      {loadingCountries ? "Loading..." : "Select country"}
                    </option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="City" required error={errors.city_id}>
                  <select
                    name="city_id"
                    value={formData.city_id}
                    onChange={handleCityChange}
                    disabled={!formData.country_id || loadingCities}
                    className={selectCls(!formData.country_id || loadingCities)}
                  >
                    <option value="">
                      {loadingCities
                        ? "Loading cities..."
                        : !formData.country_id
                        ? "Select country first"
                        : cities.length === 0
                        ? "No cities available"
                        : "Select city"}
                    </option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="University" required error={errors.university_id}>
                  <select
                    name="university_id"
                    value={formData.university_id}
                    onChange={handleFieldChange}
                    disabled={!formData.city_id || loadingUniversities}
                    className={selectCls(!formData.city_id || loadingUniversities)}
                  >
                    <option value="">
                      {loadingUniversities
                        ? "Loading universities..."
                        : !formData.city_id
                        ? "Select city first"
                        : universities.length === 0
                        ? "No universities available"
                        : "Select university"}
                    </option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Course" required error={errors.course_id}>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleFieldChange}
                    className={selectCls(false)}
                  >
                    <option value="">Select course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Consultancy Fee" required error={errors.consultancy_fee}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      PKR
                    </span>
                    <input
                      type="text"
                      name="consultancy_fee"
                      value={formData.consultancy_fee}
                      onChange={handleFieldChange}
                      placeholder="Enter consultancy fee"
                      maxLength={12}
                      className="w-full border border-slate-300 rounded-lg pl-12 pr-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    />
                  </div>
                </FormField>

                <FormField label="Initial Status">
                  <SearchableSelect
                    name="status"
                    value={formData.status}
                    onChange={handleFieldChange}
                    options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label, icon: "" }))}
                    placeholder="Select status..."
                  />
                </FormField>
              </div>

              <FormField label="Deadline">
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleFieldChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                />
              </FormField>
            </InfoSection>

            {/* ── Student Details (read-only) ── */}
            <InfoSection title="Student Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name">
                  <input
                    readOnly
                    value={formData.full_name}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                  />
                </FormField>

                <FormField label="Email">
                  <input
                    readOnly
                    value={formData.email}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                  />
                </FormField>

                <FormField label="Phone">
                  <PhoneInputWithCountry
                    key={formData.phone}
                    value={formData.phone}
                    onChange={() => {}}
                    name="phone"
                    labelName=""
                    readOnly
                  />
                </FormField>

                <FormField label="English Test">
                  <input
                    readOnly
                    value={formData.english_proficiency_test}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                  />
                </FormField>

                <FormField label="Test Score">
                  <input
                    readOnly
                    value={formData.english_test_overall_score}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                  />
                </FormField>
              </div>
            </InfoSection>

            {/* ── Educational History ── */}
            <InfoSection title="Educational History (from Lead)">
              {loadingEducation ? (
                <div className="flex justify-center py-6">
                  <RefreshCw size={24} className="animate-spin text-teal-500" />
                </div>
              ) : educationEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                  <GraduationCap size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No education records found for this student.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {educationEntries.map((edu) => (
                    <div
                      key={edu.id || edu._id || Math.random()}
                      className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-lg">
                          {edu.degree?.charAt(0)?.toUpperCase() || "D"}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 text-base mb-1">
                            {edu.degree}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                              <Calendar size={12} /> {edu.year_awarded}
                            </span>
                            {edu.grades_cgpa && (
                              <span className="inline-flex items-center gap-1">
                                <BarChart size={12} /> {edu.grades_cgpa}
                              </span>
                            )}
                            {edu.board_university && (
                              <span className="inline-flex items-center gap-1">
                                <School size={12} /> {edu.board_university}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </InfoSection>

            {/* ── Notes ── */}
            <InfoSection title="Additional Information">
              <FormField label="Description" error={errors.counsellor_notes}>
                <textarea
                  rows="3"
                  name="counsellor_notes"
                  value={formData.counsellor_notes}
                  onChange={handleFieldChange}
                  maxLength={255}
                  placeholder="Internal notes about this application..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
                />
              </FormField>
            </InfoSection>
          </div>

          <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
            <CancelButton handleCancel={onClose} />
            <AddButton label="Create Application" loading={loading} disabled={loading} />
          </div>
        </form>
      </div>
    </div>
  );
}