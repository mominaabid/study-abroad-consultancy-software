// Header.jsx - Updated with Change Password Modal
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Bell,
  Trash2,
  Clock,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { logout, selectUser } from "../redux/slices/authSlice";
import {
  selectNotifications,
  selectUnreadCount,
  markAllAsRead,
  clearNotifications,
  markAllNotificationsRead,
} from "../redux/slices/notificationSlice";
import axios from "axios"; // or use your API client
import { BASE_URL } from "../Content/Url";

export const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const modalRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && changePasswordOpen) {
        setChangePasswordOpen(false);
        resetPasswordForm();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [changePasswordOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      dispatch(markAllAsRead());
      dispatch(markAllNotificationsRead());
    }
  };

  const handleNotificationClick = (notification) => {
    const role = user?.role;

    console.log("Notification clicked:", notification);

    switch (notification.type) {
      case "counsellor_added_lead":
        if (role === "admin") {
          navigate("/admin/leads");
        }
        return;

      case "application_created":
      case "application_updated":
      case "application_deleted":
      case "status_change":
        if (role === "student") {
          navigate("/student/application");
        }
        return;

      case "counsellor_added_application":
        if (role === "admin") {
          navigate("/admin/applications");
        } else if (role === "student") {
          navigate("/student/application");
        }
        return;

      case "document_shared":
      case "document_verified":
      case "document_rejected":
        if (role === "student") {
          navigate("/student/documents");
        }
        return;

      case "payment_awaiting_verification":
        if (role === "admin") {
          navigate("/admin/payments");
        }
        break;

      case "payment_verified":
      case "payment_rejected":
        if (role === "student") {
          navigate("/student/payments");
        }
        break;

      case "payment_added_by_admin":
        if (role === "student") {
          navigate("/student/payments");
        }
        break;

      case "chat_message": {
        let chatPath = "";

        if (role === "admin") chatPath = "/admin/chats";
        else if (role === "counsellor") chatPath = "/counsellor/chats";
        else if (role === "student") chatPath = "/student/chats";

        const conversationId = notification.metadata?.conversationId;

        if (conversationId) {
          navigate(chatPath, { state: { conversationId } });
        } else {
          navigate(chatPath);
        }

        return;
      }

      default:
        console.log("Unhandled notification type:", notification.type);
        return;
    }
  };

  const goToProfile = () => {
    setDropdownOpen(false);
    if (!user) return;
    if (user.role === "admin") navigate("/admin/profile");
    else if (user.role === "counsellor") navigate("/counsellor/profile");
    else if (user.role === "student") navigate("/student/profile");
    else navigate("/profile");
  };

  const openChangePassword = () => {
    setDropdownOpen(false);
    setChangePasswordOpen(true);
    resetPasswordForm();
  };

  const resetPasswordForm = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (error) setError("");
  };

  const validateForm = () => {
    if (!passwordData.oldPassword.trim()) {
      setError("Old password is required");
      return false;
    }
    if (!passwordData.newPassword.trim()) {
      setError("New password is required");
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match");
      return false;
    }
    if (passwordData.oldPassword === passwordData.newPassword) {
      setError("New password must be different from old password");
      return false;
    }
    return true;
  };

  const submitPasswordChange = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      // Replace with your actual API endpoint
      const response = await axios.post(
        `${BASE_URL}/auth/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.data.success) {
        // Show success message (you can integrate a toast library)
        alert("Password changed successfully! Please login again.");
        // Optionally logout user to force re-login with new password
        dispatch(logout());
        navigate("/login");
      } else {
        setError(response.data.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Change password error:", err);
      setError(
        err.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const role = user?.role;

    const menuMap = {
      admin: [
        { path: "/admin/dashboard", name: "Dashboard" },
        { path: "/admin/leads", name: "Leads" },
        { path: "/admin/applications", name: "Applications" },
        { path: "/admin/payments", name: "Payments" },
        { path: "/admin/chats", name: "Chats" },
        { path: "/admin/counsellors", name: "Counsellors" },
        { path: "/admin/profile", name: "Profile" },
      ],
      counsellor: [
        { path: "/counsellor/dashboard", name: "Dashboard" },
        { path: "/counsellor/leads", name: "Leads" },
        { path: "/counsellor/applications", name: "Applications" },
        { path: "/counsellor/chats", name: "Chats" },
        { path: "/counsellor/profile", name: "Profile" },
      ],
      student: [
        { path: "/student/dashboard", name: "Dashboard" },
        { path: "/student/application", name: "Applications" },
        { path: "/student/payments", name: "Payments" },
        { path: "/student/chats", name: "Chats" },
        { path: "/student/profile", name: "Profile" },
      ],
    };

    const routes = menuMap[role] || [];

    const match = routes.find((item) =>
      location.pathname.startsWith(item.path),
    );

    return match?.name || "Dashboard";
  };

  const userName = user?.name || "User";
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userName,
  )}&background=0D8ABC&color=fff`;

  return (
    <>
      <nav className="bg-white shadow-sm w-full sticky top-0 z-[50]">
        <div className="px-4 h-16 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <span className="text-sm sm:text-base md:text-xl font-bold text-gray-800 whitespace-nowrap ml-2">
              {getTitle()}
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleNotifClick}
                className="text-gray-500 hover:text-teal-600 transition-colors relative p-2 rounded-full hover:bg-gray-50 focus:outline-none"
              >
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
                <Bell size={22} />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 text-sm">
                      Notifications
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => dispatch(clearNotifications())}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Clear all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell size={20} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">
                          No new notifications
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="px-4 py-3 border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                          onClick={() => {
                            setNotifOpen(false); // close dropdown
                            handleNotificationClick(n);
                          }}
                        >
                          <p className="text-sm text-gray-700 leading-tight font-medium">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5 text-gray-400">
                            <Clock size={10} />
                            <p className="text-[10px] uppercase tracking-wider font-semibold">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <img
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                  src={defaultAvatar}
                  alt="User profile"
                />
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mb-2">
                      {user?.email}
                    </p>
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-blue-50 text-blue-700 rounded-md uppercase">
                      {user?.role || "User"}
                    </span>
                  </div>

                  <button
                    onClick={goToProfile}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <UserIcon size={18} />
                    Profile
                  </button>

                  {/* Change Password Button */}
                  <button
                    onClick={openChangePassword}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <Lock size={18} />
                    Change Password
                  </button>

                  <div className="border-t border-gray-50 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 font-semibold hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Change Password Modal */}
      {changePasswordOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setChangePasswordOpen(false);
              resetPasswordForm();
            }
          }}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Lock size={20} className="text-teal-600" />
                Change Password
              </h3>
              <button
                onClick={() => {
                  setChangePasswordOpen(false);
                  resetPasswordForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              {/* Old Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Old Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="Enter old password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setChangePasswordOpen(false);
                    resetPasswordForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPasswordChange}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
