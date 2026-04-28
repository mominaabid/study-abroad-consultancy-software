import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X, Camera } from "lucide-react";
import { BASE_URL } from "../../Content/Url";

export const EditApplicationModal = ({
  isOpen,
  onClose,
  application,
  onApplicationUpdated,
}) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    dob: "",
    age: "",
    gender: "",
    cnic: "",
    passport_number: "",
    nationality: "",
    profile_picture: null,
    last_degree: "",
    institute: "",
    cgpa: "",
    passing_year: "",
    english_test: "IELTS",
    test_score: "",
    target_country: "",
    target_university: "",
    course: "",
    counselor_notes: "",
    status: "inquiry",
    deadline: "",
    round: "",
  });

  useEffect(() => {
    if (application) {
      setFormData({
        full_name: application.full_name || "",
        email: application.email || "",
        phone: application.phone || "",
        dob: application.dob || "",
        age: application.age || "",
        gender: application.gender || "",
        cnic: application.cnic || "",
        passport_number: application.passport_number || "",
        nationality: application.nationality || "",
        profile_picture: null,
        last_degree: application.last_degree || "",
        institute: application.institute || "",
        cgpa: application.cgpa || "",
        passing_year: application.passing_year || "",
        english_test: application.english_test || "IELTS",
        test_score: application.test_score || "",
        target_country: application.target_country || "",
        target_university: application.target_university || "",
        course: application.course || "",
        counselor_notes: application.counselor_notes || "",
        status: application.status || "inquiry",
        deadline: application.deadline || "",
        round: application.round || "",
      });

      if (application.profile_picture) {
        setImagePreview(`${BASE_URL}${application.profile_picture}`);
      }
    }
  }, [application]);

  if (!isOpen) return null;

  // Helper functions
  const hasLeadingSpaces = (value) => {
    return value && value.startsWith(" ");
  };

  const containsNumbers = (value) => {
    return /[0-9]/.test(value);
  };

  const containsLetters = (value) => {
    return /[a-zA-Z]/.test(value);
  };

  const validatePhone = (value) => {
    if (!value) return null;
    if (hasLeadingSpaces(value)) return "Cannot start with spaces";
    if (containsLetters(value)) return "Cannot contain alphabets";
    if (!/^\d{11}$/.test(value))
      return "Phone number must be exactly 11 digits";
    return null;
  };

  const validateCnic = (value) => {
    if (!value) return null;
    if (hasLeadingSpaces(value)) return "Cannot start with spaces";
    if (containsLetters(value)) return "Cannot contain alphabets";
    const cleanCnic = value.replace(/-/g, "");
    if (!/^\d{13}$/.test(cleanCnic)) return "CNIC must be exactly 13 digits";
    return null;
  };

  const validatePassport = (value) => {
    if (!value) return null;
    if (hasLeadingSpaces(value)) return "Cannot start with spaces";
    if (!/^[A-Za-z0-9]{6,9}$/.test(value)) {
      return "Passport number must be 6-9 characters (letters and numbers only)";
    }
    return null;
  };

  const validateCgpa = (value) => {
    if (!value) return null;
    if (hasLeadingSpaces(value)) return "Cannot start with spaces";
    if (containsLetters(value)) return "Cannot contain alphabets";
    if (!/^\d+(\.\d+)?$/.test(value)) return "Enter a valid CGPA (e.g., 3.5)";
    return null;
  };

  const validateTestScore = (value) => {
    if (!value) return null;
    if (hasLeadingSpaces(value)) return "Cannot start with spaces";
    if (containsLetters(value)) return "Cannot contain alphabets";
    if (!/^\d+(\.\d+)?$/.test(value))
      return "Enter a valid test score (e.g., 7.0)";
    return null;
  };

  const validateAge = (age) => {
    if (!age) return "Age is required";
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return "Invalid age";
    if (ageNum < 18) return "Age must be 18 or older";
    return null;
  };

  const validateTextOnlyField = (value, min = 3, max = 50) => {
    if (!value) return null;
    if (hasLeadingSpaces(value)) return "Cannot start with spaces";
    if (containsNumbers(value)) return "Cannot contain numbers";
    if (value.length < min) return `Minimum ${min} characters required`;
    if (value.length > max) return `Maximum ${max} characters allowed`;
    return null;
  };

  const validateField = (name, value) => {
    switch (name) {
      case "full_name":
      case "nationality":
      case "target_country":
      case "target_university":
      case "course":
      case "last_degree":
      case "institute":
      case "gender":
        return validateTextOnlyField(value, 3, 50);

      case "phone":
        return validatePhone(value);

      case "cnic":
        return validateCnic(value);

      case "passport_number":
        return validatePassport(value);

      case "cgpa":
        return validateCgpa(value);

      case "test_score":
        return validateTestScore(value);

      case "counselor_notes": {
        if (!value) return null;
        if (hasLeadingSpaces(value)) return "Cannot start with spaces";
        if (value.length < 3) return "Minimum 3 characters required";
        if (value.length > 250) return "Maximum 250 characters allowed";
        return null;
      }

      case "email": {
        if (!value) return null;
        if (hasLeadingSpaces(value)) return "Cannot start with spaces";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Enter a valid email address";
        return null;
      }

      case "age":
        return validateAge(value);

      case "passing_year": {
        if (!value) return null;
        if (hasLeadingSpaces(value)) return "Cannot start with spaces";
        if (containsLetters(value)) return "Cannot contain alphabets";
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        if (year < 1950 || year > currentYear + 5) {
          return `Year must be between 1950 and ${currentYear + 5}`;
        }
        return null;
      }

      case "dob": {
        if (!value) return "Date of birth is required";
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        if (age < 18) return "Age must be 18 or older";
        return null;
      }

      default:
        return null;
    }
  };

  // Check if all required fields are filled and valid
  const isFormComplete = () => {
    const requiredFields = [
      "full_name", "email", "cnic", "nationality", "gender",
      "last_degree", "institute", "cgpa", "passing_year",
      "target_country", "target_university", "course", "dob"
    ];
    
    // Check if all required fields have values
    const allFieldsFilled = requiredFields.every(field => {
      const value = formData[field];
      return value && value.toString().trim() !== "";
    });
    
    if (!allFieldsFilled) return false;
    
    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error !== null && error !== undefined);
    
    return !hasErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "dob" && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      const ageStr = age.toString();
      setFormData((prev) => ({ ...prev, age: ageStr }));
      const ageError = validateAge(ageStr);
      setErrors((prev) => ({ ...prev, age: ageError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const trimmedValue = value.replace(/^\s+/, "");
    if (trimmedValue !== value) {
      setFormData((prev) => ({ ...prev, [name]: trimmedValue }));
    }
    const error = validateField(name, trimmedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only JPG, PNG, WEBP images");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setUploadedImage(file);
      setFormData((prev) => ({ ...prev, profile_picture: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = [
      "full_name",
      "email",
      "phone",
      "cnic",
      "nationality",
      "gender",
      "last_degree",
      "institute",
      "cgpa",
      "passing_year",
      "target_country",
      "target_university",
      "course",
      "dob",
      "age",
    ];

    fieldsToValidate.forEach((field) => {
      if (field === "phone" && !formData.phone) return;
      if (field === "passport_number" && !formData.passport_number) return;
      if (field === "test_score" && !formData.test_score) return;

      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    if (!application || !application.id) {
      toast.error("Invalid application data");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "profile_picture") {
          if (
            formData.profile_picture &&
            formData.profile_picture instanceof File
          ) {
            submitData.append("profile_picture", formData.profile_picture);
          }
        } else if (formData[key] !== null && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });

      const response = await axios.put(
        `${BASE_URL}/editApplication/${application.id}`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Application updated successfully!");

      if (onApplicationUpdated) {
        onApplicationUpdated(response.data);
      }

      onClose();
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error(
        error.response?.data?.message || "Failed to update application",
      );
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 
        ${
          activeTab === id
            ? "border-blue-500 text-blue-600 bg-blue-50/50"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
    >
      {label}
    </button>
  );

  const renderInput = (name, type, placeholder, required, options = {}) => {
    const error = errors[name];
    return (
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-600">
          {placeholder} {required && "*"}
        </label>
        {type === "select" ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none ${
              error ? "border-red-500" : ""
            }`}
            required={required}
          >
            {options.children}
          </select>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={options.rows || 3}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none ${
              error ? "border-red-500" : ""
            }`}
            placeholder={placeholder}
            required={required}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none ${
              error ? "border-red-500" : ""
            }`}
            placeholder={placeholder}
            required={required}
          />
        )}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  const isSubmitDisabled = loading || !isFormComplete();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            Edit Application - {application?.target_university || ""}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b px-6 bg-white overflow-x-auto">
          <TabButton id="personal" label="Personal Info" />
          <TabButton id="academic" label="Academic Info" />
          <TabButton id="details" label="Application Details" />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="w-32 h-32 rounded-full bg-gray-100 border-2 border-gray-300 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Camera size={32} />
                        <span className="text-xs mt-1">Upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput("full_name", "text", "Full Name", true)}
                {renderInput("email", "email", "Email Address", true)}
                {renderInput("phone", "tel", "Phone / WhatsApp", false)}

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none ${
                      errors.gender ? "border-red-500" : ""
                    }`}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>

                {renderInput("dob", "date", "Date of Birth", true)}
                {renderInput("age", "number", "Age", false)}
                {renderInput("cnic", "text", "CNIC Number", true)}
                {renderInput(
                  "passport_number",
                  "text",
                  "Passport Number",
                  false,
                )}
                {renderInput("nationality", "text", "Nationality", true)}
              </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(
                "last_degree",
                "text",
                "Last Completed Degree",
                true,
              )}
              {renderInput("institute", "text", "Institute/University", true)}
              {renderInput("cgpa", "text", "CGPA / Percentage", true)}
              {renderInput("passing_year", "number", "Passing Year", true)}

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  English Proficiency Test
                </label>
                <select
                  name="english_test"
                  value={formData.english_test}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="IELTS">IELTS</option>
                  <option value="PTE">PTE</option>
                  <option value="Duolingo">Duolingo</option>
                  <option value="None">None/MOI</option>
                </select>
              </div>

              {renderInput("test_score", "text", "Test Score (Overall)", false)}
            </div>
          )}

          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("target_country", "text", "Target Country", true)}
              {renderInput(
                "target_university",
                "text",
                "Target University",
                true,
              )}
              {renderInput("deadline", "text", "Application Deadline", false)}
              {renderInput("round", "text", "Round", false)}
              {renderInput("course", "text", "Proposed Course", true)}

              <div className="md:col-span-2">
                {renderInput(
                  "counselor_notes",
                  "textarea",
                  "Counselor Notes",
                  false,
                  { rows: 3 },
                )}
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitDisabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};