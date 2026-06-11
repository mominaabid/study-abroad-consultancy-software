import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
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
  Loader2,
} from "lucide-react";
import { BASE_URL } from "../../Content/Url";

// Helper component for displaying each info card - responsive design
const ProfileInfoCard = ({
  icon: Icon,
  label,
  value,
  valueColor = "text-gray-900",
}) => (
  <div className="flex items-start gap-3 sm:gap-4 p-2 sm:p-0">
    <div className="p-2 sm:p-3 bg-teal-50 rounded-xl shrink-0">
      <Icon size={20} className="sm:w-6 sm:h-6 text-teal-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1">
        {label}
      </p>
      <p
        className={`text-base sm:text-lg font-semibold ${valueColor} break-words`}
      >
        {value}
      </p>
    </div>
  </div>
);

// Edit Profile Modal – fully responsive with scroll on mobile
const EditProfileModal = ({
  isOpen,
  onClose,
  currentName,
  email,
  role,
  isActive,
  registeredDate,
  onNameUpdate,
  isUpdatingName,
}) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    onNameUpdate(name.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  const statusText = isActive ? "Active" : "Inactive";
  const StatusIcon = isActive ? CheckCircle : XCircle;
  const statusColor = isActive ? "text-green-600" : "text-red-600";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in fade-in zoom-in duration-200">
        {/* Modal Header - Sticky */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Body - Scrollable on mobile */}
        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-teal-600">(editable)</span>
            </label>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-teal-200 focus-within:border-teal-400 transition">
              <User size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                placeholder="Your full name"
                disabled={isUpdatingName}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
                <Mail size={18} className="text-gray-400 shrink-0" />
                <span className="flex-1 truncate text-sm sm:text-base">
                  {email}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
                <Briefcase size={18} className="text-gray-400 shrink-0" />
                <span className="flex-1 capitalize text-sm sm:text-base">
                  {role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                <StatusIcon size={18} className={`${statusColor} shrink-0`} />
                <span
                  className={`font-medium ${statusColor} text-sm sm:text-base`}
                >
                  {statusText}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registered Date
              </label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
                <Calendar size={18} className="text-gray-400 shrink-0" />
                <span className="flex-1 text-sm sm:text-base">
                  {registeredDate}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors min-h-[44px]"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isUpdatingName}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-70 min-h-[44px]"
            >
              {isUpdatingName ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isUpdatingName ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [uploading, setUploading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

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
        `${BASE_URL}/admin/upload-admin-profile-image`,
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

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Admin profile fetch error:", err);
      toast.error(err?.response?.data?.message || "Failed to load profile", {
        toastId: "admin-fetch-profile-error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateName = async (newName) => {
    setIsUpdatingName(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/admin/profile`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProfile((prev) => ({ ...prev, ...response.data }));
      toast.success("Name updated successfully!");
      setModalOpen(false);
    } catch (error) {
      console.error("Update name error:", error);
      toast.error(error?.response?.data?.message || "Failed to update name");
    } finally {
      setIsUpdatingName(false);
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
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-sm border max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="sm:w-10 sm:h-10 text-red-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Unable to Load Profile
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Please try again later or contact support.
          </p>
          <button
            onClick={fetchProfile}
            className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-medium min-h-[44px]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = {
    text:
      profile.is_active === 1 || profile.is_active === true
        ? "Active"
        : "Inactive",
    color:
      profile.is_active === 1 || profile.is_active === true
        ? "text-green-600"
        : "text-red-600",
  };

  const cardItems = [
    { icon: User, label: "Full Name", value: profile.name },
    { icon: Mail, label: "Email Address", value: profile.email },
    {
      icon: statusInfo.text === "Active" ? CheckCircle : XCircle,
      label: "Status",
      value: statusInfo.text,
      valueColor: statusInfo.color,
    },
    {
      icon: Calendar,
      label: "Registered Date",
      value: formatDate(profile.createdAt),
    },
    {
      icon: Briefcase,
      label: "Role",
      value: profile.role || "admin",
      valueColor: "text-teal-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 overflow-x-hidden">
      {/* Main container - responsive padding */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8 max-w-10xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">
          {/* Left Section - Profile Summary */}
          <div className="lg:w-1/3 lg:border-r lg:border-gray-200 lg:pr-6 xl:pr-8">
            <div className="text-center lg:sticky lg:top-6">
              <div className="relative inline-block mx-auto mb-4">
                <div className="w-32 h-32 xs:w-40 xs:h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-teal-100 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto">
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl sm:text-5xl font-bold text-teal-700">
                      {profile.name?.charAt(0).toUpperCase() || "A"}
                    </span>
                  )}
                </div>

                <label
                  htmlFor="admin-profile-upload"
                  className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white p-2 sm:p-2.5 rounded-full text-teal-600 shadow-md border border-gray-200 cursor-pointer hover:bg-teal-50 transition ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  } min-h-[40px] min-w-[40px] flex items-center justify-center`}
                  aria-label="Upload profile picture"
                >
                  {uploading ? (
                    <Loader2
                      size={16}
                      className="animate-spin sm:w-[18px] sm:h-[18px]"
                    />
                  ) : (
                    <Camera size={16} className="sm:w-[18px] sm:h-[18px]" />
                  )}
                </label>

                <input
                  id="admin-profile-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 px-2 break-words">
                {profile.name}
              </h2>

              <button
                onClick={() => setModalOpen(true)}
                className="mt-5 sm:mt-6 w-full sm:max-w-[280px] mx-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-teal-600 hover:bg-teal-50 text-teal-700 rounded-xl font-semibold transition min-h-[44px] text-sm sm:text-base"
              >
                <Edit3 size={18} className="sm:w-5 sm:h-5" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Right Section - Personal Information */}
          <div className="lg:w-2/3">
            <div className="mb-5 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                Personal Information
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
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
      <EditProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentName={profile.name}
        email={profile.email}
        role={profile.role || "admin"}
        isActive={profile.is_active === 1 || profile.is_active === true}
        registeredDate={formatDate(profile.createdAt)}
        onNameUpdate={handleUpdateName}
        isUpdatingName={isUpdatingName}
      />
    </div>
  );
};
