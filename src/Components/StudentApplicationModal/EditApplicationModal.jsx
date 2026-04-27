import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X, User, GraduationCap, FileText, Camera } from "lucide-react";
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
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // Personal Info
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
    // Academic Info
    last_degree: "",
    institute: "",
    cgpa: "",
    passing_year: "",
    english_test: "IELTS",
    test_score: "",
    // Application Details
    target_country: "",
    target_university: "",
    course: "",
    counselor_notes: "",
    status: "In Progress",
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
        status: application.status || "In Progress",
        deadline: application.deadline || "",
        round: application.round || "",
      });

      if (application.profile_picture) {
        setImagePreview(`${BASE_URL}${application.profile_picture}`);
      }
    }
  }, [application]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
      setFormData((prev) => ({ ...prev, age: age.toString() }));
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

        <div className="px-6 py-3 bg-white border-b">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600">
              Current Status:
            </span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="In Progress">In Progress</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
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
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter student name"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="student@example.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="+92 XXX XXXXXXX"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                    placeholder="Auto-calculated from DOB"
                    readOnly
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">
                    CNIC Number *
                  </label>
                  <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="12345-1234567-1"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    name="passport_number"
                    value={formData.passport_number}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="A12345678"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="e.g. Pakistani"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  Last Completed Degree *
                </label>
                <input
                  type="text"
                  name="last_degree"
                  value={formData.last_degree}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="e.g. Bachelor in CS"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  Institute/University *
                </label>
                <input
                  type="text"
                  name="institute"
                  value={formData.institute}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  CGPA / Percentage *
                </label>
                <input
                  type="text"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="3.5/4.0"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  Passing Year *
                </label>
                <input
                  type="number"
                  name="passing_year"
                  value={formData.passing_year}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="2023"
                  required
                />
              </div>
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
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  Test Score (Overall)
                </label>
                <input
                  type="text"
                  name="test_score"
                  value={formData.test_score}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="e.g. 7.0"
                />
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  Target Country *
                </label>
                <input
                  type="text"
                  name="target_country"
                  value={formData.target_country}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="e.g. UK, Canada"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  Target University *
                </label>
                <input
                  type="text"
                  name="target_university"
                  value={formData.target_university}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  Application Deadline
                </label>
                <input
                  type="text"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="e.g. Dec 31, 2026"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  Round
                </label>
                <input
                  type="text"
                  name="round"
                  value={formData.round}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="e.g. 1, 2, 3"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  Proposed Course *
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="e.g. MSc Data Science"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  Counselor Notes
                </label>
                <textarea
                  name="counselor_notes"
                  value={formData.counselor_notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                  placeholder="Any specific requirements or student concerns..."
                ></textarea>
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
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
