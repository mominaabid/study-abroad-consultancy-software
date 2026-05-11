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
  Users,
  Briefcase,
  Save,
  Edit3,
  X,
  CheckCircle,
  Shield,
  Camera,
  ChevronDown,
  Search,
} from "lucide-react";
import { BASE_URL } from "../../Content/Url";
import { PHONE_COUNTRIES } from "../../constants/countries";
import PhoneInputWithCountry from "../../components/InputFields/PhoneInputWithCountry";

// Helper: get country object from country name (e.g., "Pakistan" -> { name, code, iso })
const getCountryByName = (countryName) => {
  if (!countryName) return null;
  return PHONE_COUNTRIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase(),
  );
};

// Country selector component for preferred country (flag + code picker)
const CountrySelector = ({ value, onChange, disabled, error }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Find selected country object based on stored country name
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
    onChange(country.name); // store country name (compatible with backend)
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

export const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferred_country: "",
    study_level: "",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setProfile(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        preferred_country: data.preferred_country || "",
        study_level: data.study_level || "",
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error(err?.response?.data?.message || "Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (formattedValue.startsWith(" ")) return;

    if (name === "name") {
      const alphaRegex = /^[a-zA-Z\s]*$/;
      if (!alphaRegex.test(formattedValue)) return;
      if (formattedValue.length > 50) return;
    }

    if (name === "phone") {
      // Phone is now handled by PhoneInputWithCountry, so we keep raw value
      if (value.length > 20) return;
      formattedValue = value;
    }

    if (name === "study_level" && value.length > 50) return;

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // Handle phone change from custom component
  const handlePhoneChange = (phoneValue) => {
    setFormData((prev) => ({ ...prev, phone: phoneValue }));
  };

  // Handle country change from selector
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUpdating(true);
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
      setEditMode(false);
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      preferred_country: profile.preferred_country || "",
      study_level: profile.study_level || "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-teal-700 font-medium text-lg">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
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
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="p-2 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Profile Summary Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-28 bg-gradient-to-r from-teal-500 to-emerald-500">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="w-28 h-28 bg-white rounded-full p-1 shadow-lg">
                      <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-teal-700">
                          {profile.name?.charAt(0).toUpperCase() || "S"}
                        </span>
                      </div>
                    </div>
                    <button className="absolute bottom-0 right-0 bg-teal-600 p-1.5 rounded-full text-white shadow-md hover:bg-teal-700 transition">
                      <Camera size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-6 px-6 text-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {profile.name}
                </h2>
                <p className="text-sm text-teal-600 font-medium mt-1 flex items-center justify-center gap-1">
                  <Shield size={14} />
                  Student
                </p>
                <div className="mt-3 flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                      profile.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <CheckCircle size={12} />
                    {profile.status === "active"
                      ? "Active Account"
                      : profile.status || "Pending"}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-600">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-600">
                    {profile.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-600">
                    Joined {formatDate(profile.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Briefcase size={18} className="text-teal-600" />
                Student Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Users size={14} /> Counsellor
                  </span>
                  <span className="font-medium text-gray-700">
                    {profile.counsellor?.name ||
                      profile.counsellor_name ||
                      "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Globe size={14} /> Preferred Country
                  </span>
                  <span className="font-medium text-gray-700 flex items-center gap-1.5">
                    {profile.preferred_country && (
                      <CountryFlag
                        countryCode={
                          getCountryByName(profile.preferred_country)?.iso || ""
                        }
                        svg
                        style={{ width: "1.2em", height: "0.9em" }}
                      />
                    )}
                    {profile.preferred_country || "—"}
                    {profile.preferred_country &&
                      getCountryByName(profile.preferred_country) && (
                        <span className="text-gray-400 text-xs ml-1">
                          ({getCountryByName(profile.preferred_country)?.value})
                        </span>
                      )}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <BookOpen size={14} /> Study Level
                  </span>
                  <span className="font-medium text-gray-700">
                    {profile.study_level || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium text-gray-700">
                    {formatDate(profile.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Editable Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editMode
                    ? "Edit Personal Information"
                    : "Personal Information"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editMode
                    ? "Update your details below and save changes."
                    : "Your profile information is read-only. Click edit to make changes."}
                </p>
              </div>

              <form onSubmit={handleUpdate} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition ${
                          editMode
                            ? "bg-white border-gray-200 hover:border-gray-300"
                            : "bg-gray-50 border-gray-100 text-gray-600"
                        }`}
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone Number - using PhoneInputWithCountry */}
                  <div>
                    <PhoneInputWithCountry
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      name="phone"
                      labelName="Phone Number *"
                      disabled={!editMode}
                      error={
                        !formData.phone && editMode ? "Phone is required" : ""
                      }
                    />
                  </div>

                  {/* Preferred Country with flag & code selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Preferred Country <span className="text-red-500">*</span>
                    </label>
                    {editMode ? (
                      <CountrySelector
                        value={formData.preferred_country}
                        onChange={handleCountryChange}
                        disabled={!editMode}
                        error={
                          !formData.preferred_country && editMode
                            ? "Country is required"
                            : ""
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-700">
                        {formData.preferred_country ? (
                          <>
                            <CountryFlag
                              countryCode={
                                getCountryByName(formData.preferred_country)
                                  ?.iso || ""
                              }
                              svg
                              style={{ width: "1.4em", height: "1.1em" }}
                            />
                            <span>
                              {formData.preferred_country}{" "}
                              {getCountryByName(formData.preferred_country) && (
                                <span className="text-gray-400 text-xs">
                                  (
                                  {
                                    getCountryByName(formData.preferred_country)
                                      ?.value
                                  }
                                  )
                                </span>
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500">Not provided</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Study Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Study Level <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BookOpen size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="study_level"
                        value={formData.study_level}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition ${
                          editMode
                            ? "bg-white border-gray-200 hover:border-gray-300"
                            : "bg-gray-50 border-gray-100 text-gray-600"
                        }`}
                        placeholder="e.g., Bachelor, Master, PhD"
                      />
                    </div>
                  </div>

                  {/* Role (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Role
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value="Student"
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {editMode && (
                  <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-2.5 rounded-xl font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition shadow-sm disabled:opacity-70"
                    >
                      <Save size={18} />
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>

              {!editMode && (
                <div className="px-6 pb-6 flex justify-end">
                  <button
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-sm transition duration-200"
                  >
                    <Edit3 size={18} />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
