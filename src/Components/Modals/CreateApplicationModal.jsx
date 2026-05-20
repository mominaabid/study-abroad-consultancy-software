import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Title } from "../Title";
import SearchableSelect from "../SearchableSelect";
import { BASE_URL } from "../../Content/Url";

import {
  Plus,
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

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 shrink-0 mt-0.5 shadow-sm">
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
    last_degree: "",
    cgpa: "",
    english_test: "",
    test_score: "",
    counselor_notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedStudentForCreate) {
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
        // last_degree: "",
        // cgpa: "",
        // english_test: "",
        // test_score: "",

        last_degree: selectedStudentForCreate.last_degree || "",
        cgpa: selectedStudentForCreate.cgpa || "",
        english_test: selectedStudentForCreate.english_test || "",
        test_score: selectedStudentForCreate.test_score || "",
        counselor_notes: "",
      });
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
        last_degree: "",
        cgpa: "",
        english_test: "",
        test_score: "",
        counselor_notes: "",
      });
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

    if (formData.cgpa && formData.cgpa.trim() !== "") {
      const cgpaNum = parseFloat(formData.cgpa);
      if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        newErrors.cgpa = "CGPA must be a number between 0 and 10";
      } else if (
        formData.cgpa.includes(".") &&
        formData.cgpa.split(".")[1]?.length > 2
      ) {
        newErrors.cgpa = "CGPA can have at most 2 decimal places";
      }
    }

    if (formData.test_score && formData.test_score.trim() !== "") {
      const scoreNum = parseFloat(formData.test_score);
      if (isNaN(scoreNum) || scoreNum < 0) {
        newErrors.test_score = "Test score must be a positive number";
      } else if (
        formData.test_score.includes(".") &&
        formData.test_score.split(".")[1]?.length > 1
      ) {
        newErrors.test_score = "Score can have at most 1 decimal place";
      }
    }

    if (formData.deadline && isNaN(new Date(formData.deadline).getTime())) {
      newErrors.deadline = "Invalid date format";
    }

    return newErrors;
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    if (value.startsWith(" ")) return;

    if (
      (name === "target_university" ||
        name === "course" ||
        name === "target_country" ||
        name === "full_name") &&
      /\d/.test(value)
    )
      return;

    if (name === "cgpa") {
      if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) return;
    }
    if (name === "test_score") {
      if (value !== "" && !/^\d*\.?\d{0,1}$/.test(value)) return;
    }

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
          last_degree: selectedStudent.last_degree || "",
          cgpa: selectedStudent.cgpa || "",
          english_test: selectedStudent.english_test || "",
          test_score: selectedStudent.test_score || "",
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs.user_id;
        delete newErrs.email;
        return newErrs;
      });
      return;
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
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);
    try {
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
        last_degree: formData.last_degree,
        cgpa: formData.cgpa,
        english_test: formData.english_test,
        test_score: formData.test_score,
        counselor_notes: formData.counselor_notes,
      };

      const res = await authAxios.post(
        `${BASE_URL}/counsellor/applications`,
        payload,
      );

      if (res.data.success) {
        toast.success("Application created successfully");
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(
        err.response?.data?.message || "Failed to create application",
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
        {/* Header using Title component */}
        <Title setModal={onClose}>Create New Application</Title>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information Section */}
            <InfoSection title="Basic Information">
              {/* Student Selection - Searchable */}
              <FormField label="Student" required error={errors.user_id}>
                <SearchableSelect
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleFieldChange}
                  options={students.map((s) => ({
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
                />

                <UniversitySelect
                  value={formData.target_university}
                  onChange={handleFieldChange}
                  name="target_university"
                  universities={universitieslist}
                  required={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CourseSelect
                  value={formData.course}
                  onChange={handleFieldChange}
                  name="course"
                  courses={coursesList}
                  required={true}
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

              <FormField label="Initial Status *">
                <SearchableSelect
                  name="status"
                  value={formData.status}
                  onChange={handleFieldChange}
                  options={STATUS_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                    icon:
                      opt.value === "inquiry"
                        ? ""
                        : opt.value === "evaluation"
                          ? ""
                          : opt.value === "application submitted"
                            ? ""
                            : opt.value === "offer letter received"
                              ? ""
                              : opt.value === "offer letter not received"
                                ? ""
                                : opt.value === "visa filed"
                                  ? ""
                                  : opt.value === "approved"
                                    ? ""
                                    : "",
                  }))}
                  placeholder="Search or select status..."
                  required={false}
                />
              </FormField>
            </InfoSection>

            {/* Student Details Section */}
            <InfoSection title="Student Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name *">
                  <input
                    type="text"
                    placeholder="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleFieldChange}
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
                  />
                </FormField>

                <FormField label="Last Degree *">
                  <input
                    type="text"
                    placeholder="Last Degree"
                    name="last_degree"
                    value={formData.last_degree}
                    onChange={handleFieldChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </FormField>

                <FormField label="CGPA (0-10) *" error={errors.cgpa}>
                  <input
                    type="text"
                    placeholder="CGPA"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleFieldChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </FormField>

                <FormField label="English Test *">
                  <input
                    type="text"
                    placeholder="IELTS / TOEFL"
                    name="english_test"
                    value={formData.english_test}
                    onChange={handleFieldChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </FormField>

                <FormField label="Test Score *" error={errors.test_score}>
                  <input
                    type="text"
                    placeholder="Test Score"
                    name="test_score"
                    value={formData.test_score}
                    onChange={handleFieldChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </FormField>
              </div>
            </InfoSection>

            {/* Additional Notes */}
            <InfoSection title="Additional Information">
              <FormField label="Notes *">
                <textarea
                  rows="3"
                  name="counselor_notes"
                  value={formData.counselor_notes}
                  onChange={handleFieldChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
                  placeholder="Internal notes about this application..."
                />
              </FormField>
            </InfoSection>
          </div>

          {/* Footer */}
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
