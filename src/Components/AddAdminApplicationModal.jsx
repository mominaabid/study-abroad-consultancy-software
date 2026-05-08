import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../Content/Url";
import { Plus, User, RefreshCw, XCircle as XCircleIcon } from "lucide-react";

// Custom components
import { UserSelect } from "./InputFields/UserSelect";
import { InputField } from "./InputFields/InputField";
import { TextareaField } from "./InputFields/TextareaField";
import { AddButton } from "./CustomButtons/AddButton";
import { CancelButton } from "./CustomButtons/CancelButton";

// Helper to get token
const getToken = () => localStorage.getItem("token") || "";

// Auth axios helper
const authAxios = {
  get: (url) =>
    axios.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
  post: (url, data) =>
    axios.post(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};

const STATUS_CONFIG = {
  inquiry: { label: "Inquiry" },
  evaluation: { label: "Evaluation" },
  "application submitted": { label: "Application Submitted" },
  "offer letter received": { label: "Offer Letter Received" },
  "offer letter not received": { label: "Offer Letter Not Received" },
  "visa filed": { label: "Visa Filed" },
  approved: { label: "Approved" },
  reject: { label: "Reject" },
};

const STATUSES = [
  "inquiry",
  "evaluation",
  "application submitted",
  "offer letter received",
  "offer letter not received",
  "visa filed",
  "approved",
  "reject",
];

const initialFormState = {
  user_id: "",
  full_name: "",
  email: "",
  phone: "",
  target_university: "",
  course: "",
  target_country: "",
  deadline: "",
  status: "inquiry",
  last_degree: "",
  cgpa: "",
  english_test: "",
  test_score: "",
  counselor_notes: "",
};

export const AddAdminApplicationModal = ({ isOpen, onClose, onSuccess }) => {
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [newAppForm, setNewAppForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch students
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await authAxios.get(`${BASE_URL}/admin/students`);
      let studentsData = response.data;
      if (Array.isArray(studentsData)) {
        setStudentsList(studentsData);
      } else if (studentsData?.data && Array.isArray(studentsData.data)) {
        setStudentsList(studentsData.data);
      } else {
        setStudentsList([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  // Validation
  const validateAddAppForm = () => {
    const errors = {};
    if (!newAppForm.user_id) errors.user_id = "Please select a student";
    if (!newAppForm.full_name?.trim())
      errors.full_name = "Full name is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newAppForm.email?.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(newAppForm.email))
      errors.email = "Invalid email format";
    if (newAppForm.phone && !/^\d+$/.test(newAppForm.phone))
      errors.phone = "Phone must contain only numbers";
    if (!newAppForm.target_university?.trim())
      errors.target_university = "University is required";
    if (!newAppForm.course?.trim()) errors.course = "Course is required";
    if (!newAppForm.target_country?.trim())
      errors.target_country = "Country is required";
    if (!newAppForm.last_degree?.trim())
      errors.last_degree = "Last degree is required";
    if (!newAppForm.cgpa?.trim()) errors.cgpa = "CGPA is required";
    if (!newAppForm.test_score?.trim())
      errors.test_score = "Test score is required";
    return errors;
  };

  // Handle field change
  const handleAddAppChange = (e) => {
    const { name, value } = e.target;
    if (value.startsWith(" ")) return;
    const alphaOnlyFields = [
      "target_university",
      "course",
      "target_country",
      "last_degree",
    ];
    if (alphaOnlyFields.includes(name) && /\d/.test(value)) return;
    const numericOnlyFields = ["cgpa", "test_score"];
    if (numericOnlyFields.includes(name) && /[^0-9.]/.test(value)) return;

    setNewAppForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Student select handler
  const handleStudentSelect = (e) => {
    const studentId = e.target.value;
    const selectedStudent = studentsList.find(
      (s) => (s.user_id || s.id).toString() === studentId,
    );
    if (selectedStudent) {
      setNewAppForm((prev) => ({
        ...prev,
        user_id: studentId,
        full_name: selectedStudent.name || selectedStudent.full_name || "",
        email: selectedStudent.email || "",
        phone: selectedStudent.phone || "",
      }));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateAddAppForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      toast.error("Please fix the highlighted errors before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      const fullName = newAppForm.full_name.trim();
      let firstName = fullName;
      let lastName = "";
      const spaceIndex = fullName.indexOf(" ");
      if (spaceIndex !== -1) {
        firstName = fullName.substring(0, spaceIndex);
        lastName = fullName.substring(spaceIndex + 1);
      }
      const payload = {
        user_id: parseInt(newAppForm.user_id),
        first_name: firstName,
        last_name: lastName,
        email: newAppForm.email.trim(),
        phone: newAppForm.phone.trim(),
        target_university: newAppForm.target_university.trim(),
        course: newAppForm.course.trim(),
        target_country: newAppForm.target_country.trim(),
        deadline: newAppForm.deadline,
        status: newAppForm.status,
        last_degree: newAppForm.last_degree.trim(),
        cgpa: newAppForm.cgpa.trim(),
        english_test: newAppForm.english_test,
        test_score: newAppForm.test_score.trim(),
        counselor_notes: newAppForm.counselor_notes,
      };
      await authAxios.post(`${BASE_URL}/admin/addApplications`, payload);
      toast.success("Application created successfully!");
      setNewAppForm(initialFormState);
      setFormErrors({});
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error(
        error.response?.data?.message || "Failed to create application",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Prepare student options for UserSelect
  const studentOptions = studentsList.map((student) => ({
    value: (student.user_id || student.id).toString(),
    label: `${student.name || student.full_name} - ${student.email}`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-xl overflow-hidden">
        {/* Header - Fixed at top */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Add New Application
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XCircleIcon size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Student Select using UserSelect */}
            <UserSelect
              labelName="Student *"
              handlerChange={handleStudentSelect}
              name="user_id"
              value={newAppForm.user_id}
              optionData={studentOptions}
              disabled={loadingStudents}
            />
            {loadingStudents && (
              <p className="text-xs text-gray-400 mt-1">Loading students...</p>
            )}

            {/* University & Course */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                type="text"
                labelName="University *"
                placeHolder="Enter university"
                handlerChange={handleAddAppChange}
                name="target_university"
                value={newAppForm.target_university}
                className={formErrors.target_university ? "border-red-500" : ""}
              />
              <InputField
                type="text"
                labelName="Course *"
                placeHolder="Enter course"
                handlerChange={handleAddAppChange}
                name="course"
                value={newAppForm.course}
                className={formErrors.course ? "border-red-500" : ""}
              />
            </div>

            {/* Country & Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                type="text"
                labelName="Country *"
                placeHolder="Enter country"
                handlerChange={handleAddAppChange}
                name="target_country"
                value={newAppForm.target_country}
                className={formErrors.target_country ? "border-red-500" : ""}
              />
              <InputField
                type="date"
                labelName="Deadline"
                placeHolder="Select deadline"
                handlerChange={handleAddAppChange}
                name="deadline"
                value={newAppForm.deadline}
              />
            </div>

            {/* Status */}
            <select
              name="status"
              value={newAppForm.status}
              onChange={handleAddAppChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s]?.label || s}
                </option>
              ))}
            </select>

            {/* Student Details Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Student Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  type="text"
                  labelName="Full Name *"
                  placeHolder="Full name"
                  handlerChange={handleAddAppChange}
                  name="full_name"
                  value={newAppForm.full_name}
                  className={formErrors.full_name ? "border-red-500" : ""}
                />
                <InputField
                  type="email"
                  labelName="Email *"
                  placeHolder="Email"
                  handlerChange={handleAddAppChange}
                  name="email"
                  value={newAppForm.email}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                <InputField
                  type="tel"
                  labelName="Phone"
                  placeHolder="Phone"
                  handlerChange={handleAddAppChange}
                  name="phone"
                  value={newAppForm.phone}
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                <InputField
                  type="text"
                  labelName="Last Degree *"
                  placeHolder="Last degree"
                  handlerChange={handleAddAppChange}
                  name="last_degree"
                  value={newAppForm.last_degree}
                  className={formErrors.last_degree ? "border-red-500" : ""}
                />
                <InputField
                  type="text"
                  labelName="CGPA *"
                  placeHolder="CGPA"
                  handlerChange={handleAddAppChange}
                  name="cgpa"
                  value={newAppForm.cgpa}
                  className={formErrors.cgpa ? "border-red-500" : ""}
                />
                <InputField
                  type="text"
                  labelName="IELTS / TOEFL"
                  placeHolder="IELTS / TOEFL"
                  handlerChange={handleAddAppChange}
                  name="english_test"
                  value={newAppForm.english_test}
                />
                <InputField
                  type="text"
                  labelName="Test Score *"
                  placeHolder="Test score"
                  handlerChange={handleAddAppChange}
                  name="test_score"
                  value={newAppForm.test_score}
                  className={formErrors.test_score ? "border-red-500" : ""}
                />
              </div>
            </div>

            {/* Admin Notes using TextareaField */}
            <TextareaField
              labelName="Admin Notes"
              placeHolder="Admin notes..."
              handlerChange={handleAddAppChange}
              name="counselor_notes"
              value={newAppForm.counselor_notes}
              className="resize-none"
            />
          </div>

          {/* Footer - Fixed at bottom with custom buttons */}
          <div className="p-6 border-t border-gray-200 flex justify-end items-center gap-3 shrink-0 bg-white">
            <CancelButton handleCancel={onClose} />
            <AddButton
              label="Create Application"
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};