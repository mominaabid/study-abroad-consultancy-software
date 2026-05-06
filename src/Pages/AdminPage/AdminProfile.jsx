// components/AdminProfile.jsx
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
  X,
  Save,
  Camera,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { BASE_URL } from "../../Content/Url";

export const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  // Fetch admin profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setProfile(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
      });
    } catch (err) {
      console.error("Admin profile fetch error:", err);
      toast.error(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle edit form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && value.length > 50) return;
    if (name === "email" && value.length > 100) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate edit form
  const validateEdit = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    return true;
  };

  // Submit updated profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateEdit()) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/admin/profile`,
        {
          name: formData.name,
          email: formData.email,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setProfile(response.data);
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate and submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/admin/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
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
        <div className="px-4 sm:px-6 lg:px-8 py-4">
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
                    email: profile.email || "",
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
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          {profile.name?.charAt(0).toUpperCase() || "A"}
                        </span>
                      </div>
                    </div>
                    <button
                      disabled
                      className="absolute bottom-0 right-0 bg-teal-600 p-1.5 rounded-full text-white shadow-md opacity-50 cursor-not-allowed"
                    >
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
                  Administrator
                </p>
                <div className="mt-3 flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                      profile.is_active === 1 || profile.is_active === true
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {profile.is_active === 1 || profile.is_active === true ? (
                      <>
                        <CheckCircle size={12} />
                        Active Account
                      </>
                    ) : (
                      <>
                        <XCircle size={12} />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-600">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-600">
                    Joined {formatDate(profile.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Briefcase size={18} className="text-teal-600" />
                Admin Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium text-gray-700 capitalize">
                    {profile.role}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-medium ${
                      profile.is_active === 1 || profile.is_active === true
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {profile.is_active === 1 || profile.is_active === true
                      ? "Active"
                      : "Inactive"}
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

          {/* Right Column - Editable Form & Password Change */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile Section */}
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
                  {/* Name */}
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
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition ${
                          editMode
                            ? "bg-white border-gray-200 hover:border-gray-300"
                            : "bg-gray-50 border-gray-100 text-gray-600"
                        }`}
                        placeholder="admin@example.com"
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
                        value={profile.role || "admin"}
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Status (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={
                          profile.is_active === 1 || profile.is_active === true
                            ? "Active"
                            : "Inactive"
                        }
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-500"
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
                          email: profile.email || "",
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

            {/* Change Password Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Lock size={18} className="text-teal-600" />
                  Change Password
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Update your password to keep your account secure.
                </p>
              </div>
              <div className="p-6">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
                >
                  <Lock size={16} />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2 rounded-xl font-medium bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-70"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
