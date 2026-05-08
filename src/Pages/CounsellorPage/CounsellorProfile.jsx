import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Save,
  Edit3,
  X,
  Calendar,
  CheckCircle,
  Shield,
  Camera,
  Briefcase,
} from "lucide-react";
import { BASE_URL } from "../../Content/Url";
import { selectUser, loadUser } from "../../redux/slices/authSlice";

export const CounsellorProfile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    email: "",
    phone: "",
    cnic: "",
    address: "",
  });

  // Fetch counsellor profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/counsellor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setProfile(data);
      setFormData({
        name: data.name || "",
        father_name: data.father_name || "",
        email: data.email || "",
        phone: data.phone || "",
        cnic: data.cnic || "",
        address: data.address || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Prevent leading spaces
    if (formattedValue.startsWith(" ")) return;

    // Length limits
    if ((name === "name" || name === "father_name") && value.length > 50)
      return;
    if (name === "address" && value.length > 250) return;

    // Only letters and spaces for names
    if (name === "name" || name === "father_name") {
      const alphaRegex = /^[a-zA-Z\s]*$/;
      if (!alphaRegex.test(formattedValue)) return;
    }

    // Phone: digits only, max 11
    if (name === "phone") {
      const numValue = value.replace(/\D/g, "");
      if (numValue.length > 11) return;
      formattedValue = numValue;
    }

    // CNIC: auto-format #####-#######-# (total 13 digits → 15 chars with dashes)
    if (name === "cnic") {
      const nums = value.replace(/\D/g, "");
      if (nums.length > 13) return;
      let masked = nums;
      if (nums.length > 5) {
        if (nums.length <= 12) {
          masked = `${nums.slice(0, 5)}-${nums.slice(5)}`;
        } else {
          masked = `${nums.slice(0, 5)}-${nums.slice(5, 12)}-${nums.slice(12, 13)}`;
        }
      }
      formattedValue = masked;
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // Validation before submit
  const validateForm = () => {
    if (formData.name.trim().length < 3) {
      toast.error("Full name must be at least 3 characters");
      return false;
    }
    if (formData.father_name.trim().length < 3) {
      toast.error("Father's name must be at least 3 characters");
      return false;
    }
    if (formData.address.trim().length < 3) {
      toast.error("Address must be at least 3 characters");
      return false;
    }
    if (formData.phone.length !== 11) {
      toast.error("Phone number must be exactly 11 digits");
      return false;
    }
    if (formData.cnic.replace(/-/g, "").length !== 13) {
      toast.error("CNIC must be exactly 13 digits (format: #####-#######-#)");
      return false;
    }

    return true;
  };

  // Submit updated profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        father_name: formData.father_name,
        phone: formData.phone,
        cnic: formData.cnic,
        address: formData.address,
      };
      const response = await axios.put(
        `${BASE_URL}/counsellor/updateProfile`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update local state
      setProfile(response.data);
      toast.success("Profile updated successfully!");
      setEditMode(false);

      // If name or email changed, refresh Redux user state
      if (
        response.data.name !== currentUser?.name ||
        response.data.email !== currentUser?.email
      ) {
        dispatch(loadUser());
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
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
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className=" px-2 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-end gap-4">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-sm transition duration-200"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: profile.name || "",
                    father_name: profile.father_name || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                    cnic: profile.cnic || "",
                    address: profile.address || "",
                  });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition duration-200"
              >
                <X size={18} />
                Cancel Editing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-2 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Left Column - Profile Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-28 bg-gradient-to-r from-teal-500 to-emerald-500">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="w-28 h-28 bg-white rounded-full p-1 shadow-lg">
                      <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-teal-700">
                          {profile.name?.charAt(0).toUpperCase() || "C"}
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
                  Counsellor
                </p>
                <div className="mt-3 flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                      profile.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <CheckCircle size={12} />
                    {profile.status === "active"
                      ? "Active Account"
                      : "Inactive"}
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
                    Joined{" "}
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Briefcase size={18} className="text-teal-600" />
                Counsellor Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Father's Name</span>
                  <span className="font-medium text-gray-700">
                    {profile.father_name || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">CNIC</span>
                  <span className="font-medium text-gray-700">
                    {profile.cnic ? "•••••-•••••••-•" : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium text-gray-700">
                    {profile.updatedAt
                      ? new Date(profile.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Editable Form */}
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

                  {/* Father Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Father's Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="father_name"
                        value={formData.father_name}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition ${
                          editMode
                            ? "bg-white border-gray-200 hover:border-gray-300"
                            : "bg-gray-50 border-gray-100 text-gray-600"
                        }`}
                        placeholder="Enter father's name"
                      />
                    </div>
                  </div>

                  {/* Email */}
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

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition ${
                          editMode
                            ? "bg-white border-gray-200 hover:border-gray-300"
                            : "bg-gray-50 border-gray-100 text-gray-600"
                        }`}
                        placeholder="03001234567"
                      />
                    </div>
                  </div>

                  {/* CNIC */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      CNIC <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition ${
                          editMode
                            ? "bg-white border-gray-200 hover:border-gray-300"
                            : "bg-gray-50 border-gray-100 text-gray-600"
                        }`}
                        placeholder="34104-1234567-8"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Format: #####-#######-# (13 digits)
                    </p>
                  </div>

                  {/* Role (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Role
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile.role || "counsellor"}
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Address - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <MapPin size={18} className="text-gray-400" />
                      </div>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!editMode}
                        rows="3"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition ${
                          editMode
                            ? "bg-white border-gray-200 hover:border-gray-300"
                            : "bg-gray-50 border-gray-100 text-gray-600"
                        }`}
                        placeholder="Full address"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button (only in edit mode) */}
                {editMode && (
                  <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          name: profile.name || "",
                          father_name: profile.father_name || "",
                          email: profile.email || "",
                          phone: profile.phone || "",
                          cnic: profile.cnic || "",
                          address: profile.address || "",
                        });
                      }}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
