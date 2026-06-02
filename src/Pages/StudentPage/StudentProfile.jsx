import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CountryFlag from "react-country-flag";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  BookOpen,
  Briefcase,
  Save,
  Edit3,
  X,
  CheckCircle,
  Shield,
  Camera,
  ChevronDown,
  Search,
  BarChart,
  School,
  MapPin,
} from "lucide-react";
import { BASE_URL } from "../../Content/Url";
import { PHONE_COUNTRIES } from "../../constants/countries";
import PhoneInputWithCountry from "../../Components/InputFields/PhoneInputWithCountry";

// Helper: get country object from country name
const getCountryByName = (countryName) => {
  if (!countryName) return null;
  return PHONE_COUNTRIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase(),
  );
};

// Country selector component (same as before, used inside modal)
const CountrySelector = ({ value, onChange, disabled, error }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedCountry = getCountryByName(value);

  const filteredCountries = PHONE_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.value.includes(searchTerm),
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (country) => {
    onChange(country.name);
    setDropdownOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setDropdownOpen((prev) => !prev)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-xl bg-white transition ${
          disabled
            ? "bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed"
            : "border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-teal-400"
        }`}
      >
        <div className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              <CountryFlag
                countryCode={selectedCountry.iso}
                svg
                style={{ width: "1.4em", height: "1.1em", borderRadius: "2px" }}
                title={selectedCountry.name}
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedCountry.name} ({selectedCountry.value})
              </span>
            </>
          ) : (
            <span className="text-gray-500 text-sm">Select country</span>
          )}
        </div>
        {!disabled && (
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {dropdownOpen && !disabled && (
        <div className="absolute z-50 left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search country..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">No results</div>
            ) : (
              filteredCountries.map((country) => (
                <div
                  key={country.id}
                  onClick={() => handleSelectCountry(country)}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                    value === country.name
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CountryFlag
                      countryCode={country.iso}
                      svg
                      style={{
                        width: "1.4em",
                        height: "1.1em",
                        borderRadius: "2px",
                      }}
                    />
                    <span>{country.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{country.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// Profile Info Card component (same as CounsellorProfile)
const ProfileInfoCard = ({
  icon: Icon,
  label,
  value,
  valueColor = "text-gray-900",
}) => (
  <div className="flex items-start gap-4">
    <div className="p-3 bg-teal-50 rounded-xl">
      <Icon size={24} className="text-teal-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${valueColor} break-all`}>
        {value || "—"}
      </p>
    </div>
  </div>
);

// Edit Student Profile Modal (similar to Counsellor's modal)
const EditStudentProfileModal = ({
  isOpen,
  onClose,
  profile,
  onUpdate,
  isUpdating,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    preferred_country: "",
    study_level: "",
  });

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        preferred_country: profile.preferred_country || "",
        study_level: profile.study_level || "",
      });
    }
  }, [isOpen, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (formattedValue.startsWith(" ")) return;

    if (name === "name") {
      const alphaRegex = /^[a-zA-Z\s]*$/;
      if (!alphaRegex.test(formattedValue)) return;
      if (formattedValue.length > 50) return;
    }

    if (name === "study_level" && value.length > 50) return;

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handlePhoneChange = (phoneValue) => {
    setFormData((prev) => ({ ...prev, phone: phoneValue }));
  };

  const handleCountryChange = (countryName) => {
    setFormData((prev) => ({ ...prev, preferred_country: countryName }));
  };

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!formData.preferred_country.trim()) {
      toast.error("Preferred country is required");
      return false;
    }
    if (!formData.study_level.trim()) {
      toast.error("Study level is required");
      return false;
    }
    return true;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onUpdate(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-teal-600">*</span>
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-teal-200 focus-within:border-teal-400 transition">
                <User size={18} className="text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  placeholder="Your full name"
                  disabled={isUpdating}
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
                <Mail size={18} className="text-gray-400" />
                <span className="flex-1">{profile?.email}</span>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-teal-600">*</span>
              </label>
              <PhoneInputWithCountry
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                name="phone"
                labelName=""
                defaultCountryCode="+92"
                disabled={isUpdating}
                error={!formData.phone && "Phone is required"}
              />
            </div>

            {/* Preferred Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Country <span className="text-teal-600">*</span>
              </label>
              <CountrySelector
                value={formData.preferred_country}
                onChange={handleCountryChange}
                disabled={isUpdating}
                error={!formData.preferred_country && "Country is required"}
              />
            </div>

            {/* Study Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Study Level <span className="text-teal-600">*</span>
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-teal-200 focus-within:border-teal-400 transition">
                <BookOpen size={18} className="text-gray-400" />
                <input
                  type="text"
                  name="study_level"
                  value={formData.study_level}
                  onChange={handleChange}
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  placeholder="e.g., Bachelor, Master, PhD"
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          {/* Status & Registered Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                <CheckCircle size={18} className="text-green-600" />
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registered Date
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
                <Calendar size={18} className="text-gray-400" />
                <span className="flex-1">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-GB")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-70"
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error(err?.response?.data?.message || "Failed to load profile", {
        toastId: "student-profile-load-fail",
      });
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle profile picture upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, WEBP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/student/upload-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setProfile((prev) => ({
        ...prev,
        profilePictureUrl: response.data.profilePictureUrl,
      }));
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleUpdateProfile = async (formData) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        phone: formData.phone,
        preferred_country: formData.preferred_country,
        study_level: formData.study_level,
      };
      const response = await axios.put(
        `${BASE_URL}/student/updateProfile`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setProfile(response.data);
      toast.success("Profile updated successfully!");
      setModalOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-teal-700 font-medium text-lg">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={40} className="text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Unable to Load Profile
          </h3>
          <p className="text-gray-500">
            Please try again later or contact support.
          </p>
          <button
            onClick={fetchProfile}
            className="mt-6 px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Info cards for right section
  const cardItems = [
    { icon: User, label: "Full Name", value: profile.name },
    { icon: Mail, label: "Email Address", value: profile.email },
    { icon: Phone, label: "Phone Number", value: profile.phone || "—" },
    {
      icon: Globe,
      label: "Preferred Country",
      value: profile.preferred_country || "—",
    },
    { icon: BookOpen, label: "Study Level", value: profile.study_level || "—" },
    {
      icon: Calendar,
      label: "Joined Date",
      value: formatDate(profile.createdAt),
    },
    {
      icon: Shield,
      label: "Role",
      value: "Student",
      valueColor: "text-teal-600",
    },
    {
      icon: Briefcase,
      label: "Assigned Counsellor",
      value:
        profile.counsellor?.name || profile.counsellor_name || "Unassigned",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Main container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Section - Profile Summary */}
          <div className="lg:w-1/3 lg:border-r lg:border-gray-200 lg:pr-6">
            <div className="text-center sticky top-6">
              <div className="relative inline-block mx-auto mb-4">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-teal-100 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-teal-700">
                      {profile.name?.charAt(0).toUpperCase() || "S"}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="profile-upload"
                  className={`absolute bottom-1 right-1 bg-white p-2 rounded-full text-teal-600 shadow-md border border-gray-200 cursor-pointer hover:bg-teal-50 transition ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Camera size={16} />
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                {profile.name}
              </h2>

              <button
                onClick={() => setModalOpen(true)}
                className="mt-20 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-teal-600 hover:bg-teal-50 text-teal-700 rounded-xl font-semibold transition"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Right Section - Personal Information Cards */}
          <div className="lg:w-2/3">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Personal Information
              </h1>
              <p className="text-gray-500 mt-1">
                Review your profile details. Click 'Edit Profile' to make
                changes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {cardItems.map((item, idx) => (
                <ProfileInfoCard
                  key={idx}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  valueColor={item.valueColor}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Education Section (if any) */}
      {profile.education && profile.education.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={22} className="text-teal-600" />
              Academic Programs / Degrees
            </h2>
            <p className="text-gray-500 text-sm">
              Your educational qualifications
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.education.map((edu) => (
              <div
                key={edu.id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-sm transition"
              >
                <h4 className="font-semibold text-gray-800 text-base">
                  {edu.degree}
                </h4>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {edu.year_awarded}
                  </span>
                  {edu.grades_cgpa && (
                    <span className="flex items-center gap-1">
                      <BarChart size={14} className="text-gray-400" />
                      {edu.grades_cgpa}
                    </span>
                  )}
                </div>
                {edu.board_university && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <School size={14} className="text-gray-400" />
                    {edu.board_university}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditStudentProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={profile}
        onUpdate={handleUpdateProfile}
        isUpdating={isUpdating}
      />
    </div>
  );
};
