// CreateApplicationModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Title } from "../Title";
import SearchableSelect from "../SearchableSelect";
import { BASE_URL } from "../../Content/Url";

import {
  User,
  Mail,
  Phone,
  Building,
  BookOpen,
  MapPin,
  Calendar,
  Award,
  FileText,
  X,
  RefreshCw,
  GraduationCap,
  School,
  BarChart,
} from "lucide-react";
import PhoneInputWithCountry from "../../Components/InputFields/PhoneInputWithCountry";
import UniversitySelect from "../../Components/InputFields/UniversitySelect";
import universitieslist from "../../constants/universities.json";
import CourseSelect from "../../Components/InputFields/CourseSelect";
import coursesList from "../../constants/courses.json";
import CountrySelect from "../../Components/InputFields/CountrySelect";

const getToken = () => localStorage.getItem("token") || "";

const authAxios = {
  post: (url, data) =>
    axios.post(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};

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
    <div className="space-y-1.5">
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

export default function CreateApplicationModal({
  isOpen,
  onClose,
  onSuccess,
  students,
  selectedStudentForCreate,
}) {
  const [formData, setFormData] = useState({
    user_id: "",
    target_university: "",
    course: "",
    target_country: "",
    deadline: "",
    status: "inquiry",
    full_name: "",
    email: "",
    phone: "",
    study_level: "",
    grades_cgpa: "",
    english_proficiency_test: "",
    english_test_overall_score: "",
    year_awarded: "",
    board_university: "",
    counselor_notes: "",
    consultancy_fee: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [educationEntries, setEducationEntries] = useState([]);
  const [loadingEducation, setLoadingEducation] = useState(false);

  // Fetch educational history for a given lead
  const fetchLeadEducation = async (leadId) => {
    if (!leadId) {
      setEducationEntries([]);
      return;
    }
    setLoadingEducation(true);
    try {
      const token = getToken();
      const url = `${BASE_URL}/counsellor/leads/${leadId}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lead = res.data;
      if (lead.education && Array.isArray(lead.education)) {
        setEducationEntries(lead.education);
      } else {
        setEducationEntries([]);
      }
    } catch (err) {
      console.error("Failed to fetch lead education:", err);
      toast.error("Could not load student's education history", {
        toastId: "fetch-education-error",
      });
      setEducationEntries([]);
    } finally {
      setLoadingEducation(false);
    }
  };

  const counselingStudents = useMemo(() => {
    return students.filter((student) => student.status === "counseling");
  }, [students]);

  // Reset modal when opened/closed or when a preselected student is provided
  useEffect(() => {
    if (selectedStudentForCreate) {
      // For a preselected student: only fill name, email, phone; keep educational fields empty
      setFormData({
        user_id:
          selectedStudentForCreate.user_id || selectedStudentForCreate.id || "",
        full_name: selectedStudentForCreate.name || "",
        email: selectedStudentForCreate.email || "",
        phone: selectedStudentForCreate.phone || "",
        target_university: "",
        course: "",
        target_country: "",
        deadline: "",
        status: "inquiry",
        study_level: "", // do NOT auto‑fill
        grades_cgpa: "", // do NOT auto‑fill
        english_proficiency_test:
          selectedStudentForCreate.english_proficiency_test || "",
        english_test_overall_score:
          selectedStudentForCreate.english_test_overall_score || "",
        year_awarded: "", // do NOT auto‑fill
        board_university: "", // do NOT auto‑fill
        counselor_notes: "",
        consultancy_fee: "",
      });
      fetchLeadEducation(
        selectedStudentForCreate.user_id || selectedStudentForCreate.id,
      );
    } else {
      setFormData({
        user_id: "",
        target_university: "",
        course: "",
        target_country: "",
        deadline: "",
        status: "inquiry",
        full_name: "",
        email: "",
        phone: "",
        study_level: "",
        grades_cgpa: "",
        english_proficiency_test: "",
        english_test_overall_score: "",
        year_awarded: "",
        board_university: "",
        counselor_notes: "",
        consultancy_fee: "",
      });
      setEducationEntries([]);
    }
    setErrors({});
  }, [selectedStudentForCreate, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.user_id) newErrors.user_id = "Student is required";
    if (!formData.target_university?.trim())
      newErrors.target_university = "University name is required";
    if (!formData.course?.trim()) newErrors.course = "Course name is required";

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.grades_cgpa && formData.grades_cgpa.trim() !== "") {
      const grades_cgpaNum = parseFloat(formData.grades_cgpa);
      if (isNaN(grades_cgpaNum) || grades_cgpaNum < 0 || grades_cgpaNum > 10) {
        newErrors.grades_cgpa = "CGPA must be a number between 0 and 10";
      } else if (
        formData.grades_cgpa.includes(".") &&
        formData.grades_cgpa.split(".")[1]?.length > 2
      ) {
        newErrors.grades_cgpa = "CGPA can have at most 2 decimal places";
      }
    }

    if (
      formData.english_test_overall_score &&
      formData.english_test_overall_score.trim() !== ""
    ) {
      const scoreNum = parseFloat(formData.english_test_overall_score);
      if (isNaN(scoreNum) || scoreNum < 0) {
        newErrors.english_test_overall_score =
          "Test score must be a positive number";
      } else if (
        formData.english_test_overall_score.includes(".") &&
        formData.english_test_overall_score.split(".")[1]?.length > 2
      ) {
        newErrors.english_test_overall_score =
          "Score can have at most 2 decimal places";
      }
    }

    if (formData.year_awarded && formData.year_awarded.trim() !== "") {
      const yearNum = parseInt(formData.year_awarded, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 5) {
        newErrors.year_awarded = `Year must be between 1900 and ${currentYear + 5}`;
      }
    }

    if (formData.deadline && isNaN(new Date(formData.deadline).getTime())) {
      newErrors.deadline = "Invalid date format";
    }

    if (formData.counselor_notes) {
      const len = formData.counselor_notes.trim().length;

      if (len < 3) {
        newErrors.counselor_notes = "Description must be at least 3 characters";
      } else if (len > 255) {
        newErrors.counselor_notes = "Description cannot exceed 255 characters";
      }
    }

    if (!formData.consultancy_fee || formData.consultancy_fee.trim() === "") {
      newErrors.consultancy_fee = "Consultancy fee is required";
    } else {
      const feeValue = formData.consultancy_fee.trim();
      const fee = parseFloat(feeValue);
      if (feeValue.length < 3) {
        newErrors.consultancy_fee =
          "Consultancy fee must be at least 3 characters";
      } else if (feeValue.length > 12) {
        newErrors.consultancy_fee =
          "Consultancy fee cannot exceed 12 characters";
      } else if (isNaN(fee) || fee < 0) {
        newErrors.consultancy_fee = "Consultancy fee must be a positive number";
      } else if (feeValue.includes(".") && feeValue.split(".")[1]?.length > 2) {
        newErrors.consultancy_fee = "Fee can have at most 2 decimal places";
      }
    }

    // Leading space checks for Basic Information fields
    const basicFields = ["target_university", "course", "target_country"];
    basicFields.forEach((field) => {
      const val = formData[field];
      if (val && val.startsWith(" ")) {
        newErrors[field] = "Leading space is not allowed";
      }
    });

    return newErrors;
  };

  const preventLeadingSpace = (e) => {
    if (e.key === " " && e.target.value.length === 0) {
      e.preventDefault();
      toast.warning("Leading space is not allowed", {
        toastId: "leading-space-warning",
      });
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    if (value.startsWith(" ")) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Leading space is not allowed",
      }));
      return;
    }

    // Prevent numbers in specific text fields
    if (
      (name === "target_university" ||
        name === "course" ||
        name === "target_country" ||
        name === "full_name" ||
        name === "board_university") &&
      /\d/.test(value)
    )
      return;

    // Input masks
    if (name === "grades_cgpa") {
      if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) return;
    }
    if (name === "english_test_overall_score") {
      if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) return;
    }
    if (name === "year_awarded") {
      if (value !== "" && !/^\d{0,4}$/.test(value)) return;
    }

    if (name === "counselor_notes" && value.length > 255) return;

    // When student selection changes: only fill name, email, phone – NOT educational fields
    if (name === "user_id") {
      const selectedStudent = students.find(
        (s) => (s.user_id || s.id) === parseInt(value),
      );
      if (selectedStudent) {
        setFormData((prev) => ({
          ...prev,
          user_id: value,
          full_name: selectedStudent.name || "",
          email: selectedStudent.email || "",
          phone: selectedStudent.phone || "",
          // Keep previous educational values (they are read‑only and will be overwritten by manual copy)
          // Do NOT auto‑fill study_level, grades_cgpa, year_awarded, board_university
          english_proficiency_test:
            selectedStudent.english_proficiency_test || "",
          english_test_overall_score:
            selectedStudent.english_test_overall_score || "",
        }));
        fetchLeadEducation(selectedStudent.user_id || selectedStudent.id);
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }

      if (errors[name] && !value.startsWith(" ") && value.trim().length > 0) {
        setErrors((prev) => {
          const newErrs = { ...prev };
          delete newErrs[name];
          return newErrs;
        });
      }

      return;
    }

    if (name === "consultancy_fee") {
      if (value.length > 12) return;

      if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors", {
        toastId: "validation-error",
      });
      return;
    }

    setLoading(true);
    try {
      // Sanitize numeric fields: convert empty string to null
      const sanitizedYear =
        formData.year_awarded === "" ? null : formData.year_awarded;
      const sanitizedGrades =
        formData.grades_cgpa === "" ? null : formData.grades_cgpa;
      const sanitizedScore =
        formData.english_test_overall_score === ""
          ? null
          : formData.english_test_overall_score;

      const sanitizedConsultancyFee =
        formData.consultancy_fee === ""
          ? null
          : parseFloat(formData.consultancy_fee);

      const payload = {
        user_id: parseInt(formData.user_id),
        target_university: formData.target_university,
        course: formData.course,
        target_country: formData.target_country,
        deadline: formData.deadline,
        status: formData.status,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        study_level: formData.study_level,
        grades_cgpa: sanitizedGrades,
        english_proficiency_test: formData.english_proficiency_test,
        english_test_overall_score: sanitizedScore,
        year_awarded: sanitizedYear,
        board_university: formData.board_university,
        counselor_notes: formData.counselor_notes,
        consultancy_fee: sanitizedConsultancyFee,
      };

      const res = await authAxios.post(
        `${BASE_URL}/counsellor/applications`,
        payload,
      );

      if (res.data.success) {
        toast.success("Application created successfully", {
          toastId: "app-create-success",
        });
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(
        err.response?.data?.message || "Failed to create application",
        { toastId: "app-create-error" },
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <Title setModal={onClose}>Create New Application</Title>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information Section */}
            <InfoSection title="Basic Information">
              <FormField label="Student" required error={errors.user_id}>
                <SearchableSelect
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleFieldChange}
                  // options={students.map((s) => ({
                  //   value: String(s.user_id || s.id),
                  //   label: `${s.name} - ${s.email}`,
                  //   icon: <User size={14} className="text-slate-400" />,
                  // }))}

                  options={counselingStudents.map((s) => ({
                    // ← use filtered list
                    value: String(s.user_id || s.id),
                    label: `${s.name} - ${s.email}`,
                    icon: <User size={14} className="text-slate-400" />,
                  }))}
                  placeholder="Search student by name or email..."
                  required={true}
                  error={errors.user_id}
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CountrySelect
                  value={formData.target_country}
                  onChange={handleFieldChange}
                  name="target_country"
                  placeholder="Select target country"
                  required={true}
                  onKeyDown={preventLeadingSpace}
                  onBlur={(e) => {
                    if (e.target.value?.startsWith(" ")) {
                      setErrors((prev) => ({
                        ...prev,
                        target_country: "Leading space is not allowed",
                      }));
                    }
                  }}
                />
                <UniversitySelect
                  value={formData.target_university}
                  onChange={handleFieldChange}
                  name="target_university"
                  universities={universitieslist}
                  required={true}
                  onKeyDown={preventLeadingSpace}
                  onBlur={(e) => {
                    if (e.target.value?.startsWith(" ")) {
                      setErrors((prev) => ({
                        ...prev,
                        target_university: "Leading space is not allowed",
                      }));
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CourseSelect
                  value={formData.course}
                  onChange={handleFieldChange}
                  name="course"
                  courses={coursesList}
                  required={true}
                  onKeyDown={preventLeadingSpace}
                  onBlur={(e) => {
                    if (e.target.value?.startsWith(" ")) {
                      setErrors((prev) => ({
                        ...prev,
                        course: "Leading space is not allowed",
                      }));
                    }
                  }}
                />
                <FormField label="Deadline *">
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleFieldChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Consultancy Fee"
                  required
                  error={errors.consultancy_fee}
                >
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
                      required // ← add HTML5 required attribute
                      minLength={3}
                      maxLength={12}
                      className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    />
                  </div>
                </FormField>

                <FormField label="Initial Status *">
                  <SearchableSelect
                    name="status"
                    value={formData.status}
                    onChange={handleFieldChange}
                    options={STATUS_OPTIONS.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                      icon: "",
                    }))}
                    placeholder="Search or select status..."
                    required={false}
                  />
                </FormField>
              </div>
            </InfoSection>

            {/* Student Details Section – read‑only educational fields */}
            <InfoSection title="Student Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name *">
                  <input
                    type="text"
                    placeholder="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleFieldChange}
                    readOnly
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </FormField>

                <FormField label="Email *" error={errors.email}>
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleFieldChange}
                    readOnly
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </FormField>

                <FormField label="Phone Number *">
                  <PhoneInputWithCountry
                    key={formData.phone}
                    value={formData.phone}
                    onChange={handleFieldChange}
                    name="phone"
                    labelName=""
                    error={errors.phone}
                    readOnly
                  />
                </FormField>

                <FormField label="English Test">
                  <input
                    type="text"
                    placeholder="IELTS / TOEFL"
                    name="english_proficiency_test"
                    value={formData.english_proficiency_test}
                    onChange={handleFieldChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </FormField>

                <FormField
                  label="Test Score"
                  error={errors.english_test_overall_score}
                >
                  <input
                    type="text"
                    placeholder="Test Score"
                    name="english_test_overall_score"
                    value={formData.english_test_overall_score}
                    onChange={handleFieldChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </FormField>
              </div>
            </InfoSection>

            {/* Educational History Section – with eye icon for copying */}
            <InfoSection title="Educational History (from Lead)">
              {loadingEducation ? (
                <div className="flex justify-center py-6">
                  <RefreshCw size={24} className="animate-spin text-teal-500" />
                </div>
              ) : educationEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  <GraduationCap
                    size={32}
                    className="mx-auto mb-2 opacity-50"
                  />
                  <p>No education records found for this student.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {educationEntries.map((edu) => (
                    <div
                      key={edu.id}
                      className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-lg">
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
              <p className="text-xs text-slate-400 mt-2">
                * Educational information is fetched directly from the student's
                lead record. Click the <strong>eye icon</strong> on any card to
                copy its details into the "Student Details" fields above.
              </p>
            </InfoSection>

            {/* Additional Information */}
            <InfoSection title="Additional Information">
              <FormField label="Description">
                <textarea
                  rows="3"
                  name="counselor_notes"
                  value={formData.counselor_notes}
                  onChange={handleFieldChange}
                  minLength={3}
                  maxLength={255}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
                  placeholder="Internal notes about this application..."
                />
              </FormField>
            </InfoSection>
          </div>

          <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
