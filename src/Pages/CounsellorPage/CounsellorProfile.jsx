import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import {
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Edit3,
  Camera,
  Briefcase,
  X,
  Save,
  Phone,
  MapPin,
  CreditCard,
  Users,
} from "lucide-react";
import { BASE_URL } from "../../Content/Url";
import { selectUser, loadUser } from "../../redux/slices/authSlice";
import PhoneInputWithCountry from "../../Components/InputFields/PhoneInputWithCountry";
import { PHONE_COUNTRIES } from "../../constants/countries";

// Helper component for displaying each info card - fully responsive
const ProfileInfoCard = ({
  icon: Icon,
  label,
  value,
  valueColor = "text-gray-900",
}) => (
  <div className="flex items-start gap-3 sm:gap-4">
    <div className="p-2 sm:p-3 bg-teal-50 rounded-lg sm:rounded-xl flex-shrink-0">
      <Icon size={20} className="sm:w-6 sm:h-6 text-teal-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1">
        {label}
      </p>
      <p
        className={`text-sm sm:text-lg font-semibold ${valueColor} break-words`}
      >
        {value}
      </p>
    </div>
  </div>
);

// Edit Profile Modal – fully responsive with scrollable content and mobile-optimized layout
const EditCounsellorProfileModal = ({
  isOpen,
  onClose,
  profile,
  onUpdate,
  isUpdating,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    phone: "",
    cnic: "",
    address: "",
  });

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.name || "",
        father_name: profile.father_name || "",
        phone: profile.phone || "",
        cnic: profile.cnic || "",
        address: profile.address || "",
      });
    }
  }, [isOpen, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (formattedValue.startsWith(" ")) return;

    if ((name === "name" || name === "father_name") && value.length > 50)
      return;
    if (name === "address" && value.length > 250) return;

    if (name === "name" || name === "father_name") {
      const alphaRegex = /^[a-zA-Z\s]*$/;
      if (!alphaRegex.test(formattedValue)) return;
    }

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
    if (!formData.phone || formData.phone.trim().length < 8) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (formData.cnic.replace(/-/g, "").length !== 13) {
      toast.error("CNIC must be exactly 13 digits (format: #####-#######-#)");
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

  const statusText = profile?.is_active ? "Active" : "Active";
  const StatusIcon = profile?.is_active ? CheckCircle : CheckCircle;
  const statusColor = profile?.is_active ? "text-green-600" : "text-green-600";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors active:bg-gray-200"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6 pt-3 sm:pt-4">
          {/* Two-column grid for editable fields - responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-teal-600">*</span>
              </label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus-within:ring-2 focus-within:ring-teal-200 focus-within:border-teal-400 transition">
                <User
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] text-gray-400"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Your full name"
                  disabled={isUpdating}
                />
              </div>
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Father's Name <span className="text-teal-600">*</span>
              </label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus-within:ring-2 focus-within:ring-teal-200 focus-within:border-teal-400 transition">
                <Users
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] text-gray-400"
                />
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Father's full name"
                  disabled={isUpdating}
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base">
                <Mail
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] text-gray-400"
                />
                <span className="flex-1 truncate">{profile?.email}</span>
              </div>
            </div>

            {/* Phone Number with Country Picker */}
            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-teal-600">*</span>
              </label>
              <PhoneInputWithCountry
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                labelName=""
                defaultCountryCode="+92"
                disabled={isUpdating}
                error={false}
              />
            </div>

            {/* CNIC */}
            <div className="md:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                CNIC <span className="text-teal-600">*</span>
              </label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus-within:ring-2 focus-within:ring-teal-200 focus-within:border-teal-400 transition">
                <CreditCard
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] text-gray-400"
                />
                <input
                  type="text"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="34104-1234567-8"
                  disabled={isUpdating}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Format: #####-#######-# (13 digits)
              </p>
            </div>
          </div>

          {/* Address - full width row */}
          <div className="mt-4 sm:mt-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-teal-600">*</span>
            </label>
            <div className="flex items-start gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus-within:ring-2 focus-within:ring-teal-200 focus-within:border-teal-400 transition">
              <MapPin
                size={16}
                className="sm:w-[18px] sm:h-[18px] text-gray-400 mt-0.5"
              />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400 resize-none text-sm sm:text-base"
                placeholder="Full address"
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* Status & Registered Date (two columns, read-only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 sm:mt-4 pt-2">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl">
                <StatusIcon
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] text-green-600"
                />
                <span
                  className={`font-medium text-sm sm:text-base ${statusColor}`}
                >
                  {statusText}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Registered Date
              </label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base">
                <Calendar
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] text-gray-400"
                />
                <span className="flex-1">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-GB")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile optimized */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors active:bg-slate-100"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-70 active:bg-teal-800"
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

export const CounsellorProfile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
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
      const response = await axios.get(`${BASE_URL}/counsellor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(error?.response?.data?.message || "Failed to load profile", {
        toastId: "counsellor-profile-load-fail",
      });
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
        `${BASE_URL}/counsellor/upload-profile-image`,
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
        profile_image: response.data.profilePicturePath,
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

      setProfile(response.data);
      toast.success("Profile updated successfully!");
      setModalOpen(false);

      // Update Redux user if name/email changed
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
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-teal-700 font-medium text-base sm:text-lg">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border max-w-md w-full mx-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="sm:w-10 sm:h-10 text-red-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Unable to Load Profile
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            Please try again later or contact support.
          </p>
          <button
            onClick={fetchProfile}
            className="mt-6 px-4 sm:px-6 py-2 sm:py-2.5 bg-teal-600 text-white rounded-lg sm:rounded-xl hover:bg-teal-700 transition font-medium w-full sm:w-auto"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Build info cards for right section
  const cardItems = [
    { icon: User, label: "Full Name", value: profile.name },
    { icon: Users, label: "Father's Name", value: profile.father_name || "—" },
    { icon: Mail, label: "Email Address", value: profile.email },
    { icon: Phone, label: "Phone Number", value: profile.phone || "—" },
    { icon: CreditCard, label: "CNIC", value: profile.cnic || "—" },
    { icon: MapPin, label: "Address", value: profile.address || "—" },
    {
      icon: Calendar,
      label: "Joined Date",
      value: formatDate(profile.createdAt),
    },
    {
      icon: Shield,
      label: "Role",
      value: "Counsellor",
      valueColor: "text-teal-600",
    },
  ];

  const statusInfo = {
    text: profile.is_active ? "Active" : "Inactive",
    color: profile.is_active ? "text-green-600" : "text-red-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 overflow-x-hidden">
      {/* Main container */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8 max-w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Section - Profile Summary - Mobile optimized */}
          <div className="lg:w-1/3 lg:border-r lg:border-gray-200 lg:pr-6">
            <div className="text-center lg:sticky lg:top-6">
              <div className="relative inline-block mx-auto mb-4">
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-teal-100 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto">
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-700">
                      {profile.name?.charAt(0).toUpperCase() || "C"}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="profile-upload"
                  className={`absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-white p-1.5 sm:p-2 rounded-full text-teal-600 shadow-md border border-gray-200 cursor-pointer hover:bg-teal-50 transition ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Camera size={14} className="sm:w-4 sm:h-4" />
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

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words px-2">
                {profile.name}
              </h2>

              <button
                onClick={() => setModalOpen(true)}
                className="mt-6 sm:mt-8 md:mt-12 lg:mt-20 w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-teal-600 hover:bg-teal-50 text-teal-700 rounded-lg sm:rounded-xl font-semibold transition active:bg-teal-100"
              >
                <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Right Section - Personal Information Cards - Responsive grid */}
          <div className="lg:w-2/3">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Personal Information
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Review your profile details. Click 'Edit Profile' to make
                changes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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

      {/* Edit Profile Modal */}
      <EditCounsellorProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={profile}
        onUpdate={handleUpdateProfile}
        isUpdating={isUpdating}
      />
    </div>
  );
};
