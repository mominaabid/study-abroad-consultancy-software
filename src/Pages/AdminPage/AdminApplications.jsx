// src/components/admin/AdminApplication.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";
import {
  Search,
  FileText,
  User,
  GraduationCap,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  FileCheck,
  UserCheck,
  Briefcase,
  MapPin,
  Calendar,
  BookOpen,
  Mail,
  Phone,
  Globe,
  Award,
  ExternalLink,
  FileQuestion,
  MailCheck,
  FileWarning,
  FileX,
  Plane,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Users,
} from "lucide-react";

// Helper to get token
const getToken = () => localStorage.getItem("token") || "";

// Helper for authenticated axios requests
const authAxios = {
  get: (url) =>
    axios.get(url, { headers: { Authorization: `Bearer ${getToken()}` } }),
  put: (url, data) =>
    axios.put(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
  post: (url, data) =>
    axios.post(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
  delete: (url) =>
    axios.delete(url, { headers: { Authorization: `Bearer ${getToken()}` } }),
};

// Status configuration (same as before)
const STATUS_CONFIG = {
  inquiry: {
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: FileQuestion,
    label: "Inquiry",
    order: 1,
  },
  evaluation: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Eye,
    label: "Evaluation",
    order: 2,
  },
  "application submitted": {
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    icon: Send,
    label: "Application Submitted",
    order: 3,
  },
  "offer letter received": {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: MailCheck,
    label: "Offer Letter Received",
    order: 4,
  },
  "offer letter not received": {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: FileWarning,
    label: "Offer Letter Not Received",
    order: 5,
  },
  "visa filed": {
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Plane,
    label: "Visa Filed",
    order: 6,
  },
  approved: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: ThumbsUp,
    label: "Approved",
    order: 7,
  },
  reject: {
    color: "bg-red-100 text-red-700 border-red-200",
    icon: ThumbsDown,
    label: "Reject",
    order: 8,
  },
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

// Status dropdown component (unchanged)
const StatusDropdown = ({ currentStatus, applicationId, onStatusUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await authAxios.put(
        `${BASE_URL}/admin/applications/${applicationId}/status`,
        { status: newStatus },
      );
      onStatusUpdate(applicationId, newStatus, response.data);
      toast.success(
        `Application status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}!`,
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update application status",
      );
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const StatusIcon = STATUS_CONFIG[currentStatus]?.icon || Clock;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${STATUS_CONFIG[currentStatus]?.color} hover:opacity-80`}
      >
        <StatusIcon size={12} />
        <span>{STATUS_CONFIG[currentStatus]?.label || currentStatus}</span>
        <ChevronDown size={12} className="ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-80 overflow-y-auto">
          {STATUSES.map((status) => {
            const Icon = STATUS_CONFIG[status]?.icon || Clock;
            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                  status === currentStatus
                    ? "bg-gray-100 text-gray-800 font-medium"
                    : "text-gray-600"
                }`}
              >
                <Icon size={12} />
                <span>{STATUS_CONFIG[status]?.label || status}</span>
                {status === currentStatus && (
                  <CheckCircle2 size={12} className="ml-auto text-green-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Three dots menu (unchanged)
const ThreeDotsMenu = ({ onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in duration-200">
          <button
            onClick={() => {
              onViewDetails();
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
          >
            <Eye size={14} className="text-blue-500" />
            <span>View Details</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Progress bar component (unchanged)
const ProgressBar = ({ percentage }) => {
  let colorClass = "bg-red-500";
  if (percentage >= 80) colorClass = "bg-green-500";
  else if (percentage >= 60) colorClass = "bg-emerald-500";
  else if (percentage >= 40) colorClass = "bg-yellow-500";
  else if (percentage >= 20) colorClass = "bg-orange-500";

  return (
    <div className="w-32">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`${colorClass} h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Main Admin Application Component
export const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [sortField, setSortField] = useState("updated");
  const [sortDirection, setSortDirection] = useState("desc");

  // State for add application modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
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
  });

  // Fetch all students for dropdown
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      // Adjust endpoint as per your backend: either /admin/students or /users?role=student
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
      // If endpoint fails, try alternative or show empty list
      setStudentsList([]);
      toast.warn(
        "Could not load student list. Please refresh or check backend.",
      );
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // Fetch all applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAxios.get(`${BASE_URL}/admin/applications`);
      let appsData = response.data;

      if (Array.isArray(appsData)) {
        const normalizedApps = appsData.map((app) => ({
          ...app,
          status: app.status || "inquiry",
        }));
        setApplications(normalizedApps);
        setFilteredApplications(normalizedApps);
      } else {
        setApplications([]);
        setFilteredApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Unauthorized. Admin access required.");
      } else {
        toast.error("Failed to load applications");
      }
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchStudents();
  }, [fetchApplications, fetchStudents]);

  // Filter and search applications (unchanged)
  useEffect(() => {
    let filtered = [...applications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          (app.application_id &&
            app.application_id.toLowerCase().includes(term)) ||
          (app.student_name && app.student_name.toLowerCase().includes(term)) ||
          (app.target_university &&
            app.target_university.toLowerCase().includes(term)) ||
          (app.course && app.course.toLowerCase().includes(term)) ||
          (app.email && app.email.toLowerCase().includes(term)),
      );
    }

    if (statusFilter !== "All Status") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case "updated":
          aVal = new Date(a.updated_at || a.created_at || 0);
          bVal = new Date(b.updated_at || b.created_at || 0);
          break;
        case "name":
          aVal = a.student_name || "";
          bVal = b.student_name || "";
          break;
        case "status":
          aVal = STATUS_CONFIG[a.status]?.order || 999;
          bVal = STATUS_CONFIG[b.status]?.order || 999;
          break;
        default:
          aVal = a[sortField] || "";
          bVal = b[sortField] || "";
      }
      if (sortDirection === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications, sortField, sortDirection]);

  const handleStatusUpdate = (id, newStatus, updatedData) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id || app.application_id === id
          ? { ...app, status: newStatus, ...updatedData }
          : app,
      ),
    );
  };

  // Export report (unchanged)
  const exportReport = () => {
    const headers = [
      "Application ID",
      "Student Name",
      "Email",
      "University",
      "Course",
      "Status",
      "Progress",
      "Updated Date",
    ];

    const rows = filteredApplications.map((app) => [
      app.application_id || app.id,
      app.student_name ||
        `${app.first_name || ""} ${app.last_name || ""}`.trim(),
      app.email || "",
      app.target_university || "",
      app.course || "",
      STATUS_CONFIG[app.status]?.label || app.status || "",
      `${app.progress || 0}%`,
      new Date(
        app.updated_at || app.created_at || Date.now(),
      ).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  // Get status summary counts (unchanged, but shortened for brevity)
  const getStatusCounts = () => {
    const counts = {
      Total: applications.length,
      inquiry: 0,
      evaluation: 0,
      "application submitted": 0,
      "offer letter received": 0,
      "offer letter not received": 0,
      "visa filed": 0,
      approved: 0,
      reject: 0,
    };
    applications.forEach((app) => {
      if (Object.prototype.hasOwnProperty.call(counts, app.status)) {
        counts[app.status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronDown size={14} className="opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  // Add application change handler
  const handleAddAppChange = (e) => {
    const { name, value } = e.target;
    setNewAppForm((prev) => ({ ...prev, [name]: value }));
  };

  // When student is selected, pre-fill name, email, phone (optional but helpful)
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
    } else {
      setNewAppForm((prev) => ({
        ...prev,
        user_id: studentId,
        full_name: "",
        email: "",
        phone: "",
      }));
    }
  };

  // Submit add application
  const handleAddAppSubmit = async (e) => {
    e.preventDefault();
    if (!newAppForm.user_id) {
      toast.error("Please select a student");
      return;
    }
    setIsSubmitting(true);
    try {
      // Split full_name into first_name and last_name for backend compatibility
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
        email: newAppForm.email,
        phone: newAppForm.phone,
        target_university: newAppForm.target_university,
        course: newAppForm.course,
        target_country: newAppForm.target_country,
        deadline: newAppForm.deadline,
        status: newAppForm.status,
        last_degree: newAppForm.last_degree,
        cgpa: newAppForm.cgpa,
        english_test: newAppForm.english_test,
        test_score: newAppForm.test_score,
        counselor_notes: newAppForm.counselor_notes,
      };

      await authAxios.post(`${BASE_URL}/admin/addApplications`, payload);
      toast.success("Application created successfully!");
      setIsAddModalOpen(false);
      setNewAppForm({
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
      });
      fetchApplications();
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error(
        error.response?.data?.message || "Failed to create application",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Details modal (unchanged but kept for completeness)
  const ApplicationDetailsModal = ({ application, onClose }) => {
    if (!application) return null;

    const StatusIcon = STATUS_CONFIG[application.status]?.icon || Clock;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl animate-in zoom-in-95 duration-200">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Application Details
                </h2>
                <p className="text-sm text-gray-500">
                  ID: {application.application_id || application.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XCircleIcon size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Student Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <User size={18} className="text-blue-600" />
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-800">
                      {application.student_name ||
                        `${application.first_name || ""} ${application.last_name || ""}`.trim() ||
                        "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">
                      {application.email || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">
                      {application.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium text-gray-800">
                      {application.country ||
                        application.nationality ||
                        application.target_country ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <GraduationCap size={18} className="text-emerald-600" />
                Application Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Target University</p>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {application.target_university || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Course / Program</p>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <BookOpen size={14} className="text-gray-400" />
                    {application.course || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[application.status]?.color}`}
                    >
                      <StatusIcon size={12} />
                      <span>
                        {STATUS_CONFIG[application.status]?.label ||
                          application.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submission Date</p>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {application.submission_date ||
                      new Date(
                        application.created_at || Date.now(),
                      ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <StatusDropdown
                currentStatus={application.status}
                applicationId={application.id || application.application_id}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4">
            <GraduationCap className="text-blue-600" size={40} />
          </div>
          <p className="text-slate-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans">
      {/* Header Stats Cards - unchanged */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">
            {statusCounts.Total}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-600">Inquiry</p>
          <p className="text-2xl font-bold text-gray-700">
            {statusCounts.inquiry}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 shadow-sm border border-blue-100">
          <p className="text-xs text-blue-600">Evaluation</p>
          <p className="text-2xl font-bold text-blue-700">
            {statusCounts.evaluation}
          </p>
        </div>
        <div className="bg-cyan-50 rounded-xl p-3 shadow-sm border border-cyan-100">
          <p className="text-xs text-cyan-600">App Submitted</p>
          <p className="text-2xl font-bold text-cyan-700">
            {statusCounts["application submitted"]}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 shadow-sm border border-green-100">
          <p className="text-xs text-green-600">Offer Received</p>
          <p className="text-2xl font-bold text-green-700">
            {statusCounts["offer letter received"]}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 shadow-sm border border-yellow-100">
          <p className="text-xs text-yellow-600">Offer Not Received</p>
          <p className="text-2xl font-bold text-yellow-700">
            {statusCounts["offer letter not received"]}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 shadow-sm border border-purple-100">
          <p className="text-xs text-purple-600">Visa Filed</p>
          <p className="text-2xl font-bold text-purple-700">
            {statusCounts["visa filed"]}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 shadow-sm border border-emerald-100">
          <p className="text-xs text-emerald-600">Approved</p>
          <p className="text-2xl font-bold text-emerald-700">
            {statusCounts.approved}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 shadow-sm border border-red-100">
          <p className="text-xs text-red-600">Reject</p>
          <p className="text-2xl font-bold text-red-700">
            {statusCounts.reject}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar - unchanged */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search applications by ID, student name, university..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="All Status">All Status</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_CONFIG[status]?.label || status}
                  </option>
                ))}
              </select>
              <Filter
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm"
            >
              <Download size={16} />
              Export Report
            </button>
            <button
              onClick={fetchApplications}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
            >
              <Plus size={16} />
              Add Application
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table - unchanged except removed comments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-800"
                  onClick={() => toggleSort("id")}
                >
                  <div className="flex items-center gap-1">
                    APPLICATION
                    <SortIcon field="id" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-800"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    STUDENT
                    <SortIcon field="name" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PROGRAM
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-800"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    STATUS
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PROGRESS
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={40} className="text-gray-300" />
                      <p>No applications found</p>
                      <p className="text-sm">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const status = app.status || "inquiry";
                  const StatusIconComp = STATUS_CONFIG[status]?.icon || Clock;
                  const progress = app.progress || 0;
                  const studentInitials = (
                    app.student_name ||
                    app.first_name ||
                    "ST"
                  )
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={app.id || app.application_id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-auto px-3 py-1.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center font-mono font-semibold text-blue-700 text-xs border border-blue-100">
                            {(() => {
                              if (
                                app.application_id &&
                                app.application_id.startsWith("EDU-")
                              ) {
                                return app.application_id;
                              }
                              const appDate =
                                app.created_at ||
                                app.submission_date ||
                                new Date();
                              const date = new Date(appDate);
                              const year = date.getFullYear();
                              const month = String(
                                date.getMonth() + 1,
                              ).padStart(2, "0");
                              const day = String(date.getDate()).padStart(
                                2,
                                "0",
                              );
                              const dateStr = `${year}${month}${day}`;
                              const existingId = app.application_id || app.id;
                              let sequence = "0001";
                              if (existingId && existingId !== "N/A") {
                                const match = existingId.match(/\d{4}$/);
                                if (match) {
                                  sequence = match[0];
                                } else {
                                  const simpleHash = (str) => {
                                    let hash = 0;
                                    for (let i = 0; i < str.length; i++) {
                                      const char = str.charCodeAt(i);
                                      hash = (hash << 5) - hash + char;
                                      hash = hash & hash;
                                    }
                                    return Math.abs(hash);
                                  };
                                  sequence = String(
                                    simpleHash(existingId) % 10000,
                                  ).padStart(4, "0");
                                }
                              }
                              return `EDU-${dateStr}-${sequence}`;
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-700 text-sm">
                            {studentInitials}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {app.student_name ||
                                `${app.first_name || ""} ${app.last_name || ""}`.trim() ||
                                "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {app.country || app.nationality || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-800 text-sm">
                          {app.course || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {app.target_university || ""}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[status]?.color}`}
                        >
                          <StatusIconComp size={12} />
                          <span>{STATUS_CONFIG[status]?.label || status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <ProgressBar percentage={progress} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <StatusDropdown
                            currentStatus={status}
                            applicationId={app.id || app.application_id}
                            onStatusUpdate={handleStatusUpdate}
                          />
                          <ThreeDotsMenu
                            onViewDetails={() => {
                              setSelectedApplication(app);
                              setIsDetailsModalOpen(true);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== ADD APPLICATION MODAL (REDESIGNED) ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Plus size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Add New Application
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircleIcon size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddAppSubmit} className="p-6 space-y-6">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newAppForm.user_id}
                  onChange={handleStudentSelect}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                >
                  <option value="">Select Student</option>
                  {studentsList.map((student) => (
                    <option
                      key={student.id}
                      value={student.user_id || student.id}
                    >
                      {student.name || student.full_name} - {student.email}
                    </option>
                  ))}
                </select>
                {loadingStudents && (
                  <p className="text-xs text-gray-400 mt-1">
                    Loading students...
                  </p>
                )}
              </div>

              {/* Row: University & Course */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="target_university"
                    value={newAppForm.target_university}
                    onChange={handleAddAppChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="University name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={newAppForm.course}
                    onChange={handleAddAppChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="Course name"
                  />
                </div>
              </div>

              {/* Row: Country & Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="target_country"
                    value={newAppForm.target_country}
                    onChange={handleAddAppChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="Country name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={newAppForm.deadline}
                    onChange={handleAddAppChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={newAppForm.status}
                  onChange={handleAddAppChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s]?.label || s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Details Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 text-md mb-4 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Student Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={newAppForm.full_name}
                      onChange={handleAddAppChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newAppForm.email}
                      onChange={handleAddAppChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="student@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={newAppForm.phone}
                      onChange={handleAddAppChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Degree
                    </label>
                    <input
                      type="text"
                      name="last_degree"
                      value={newAppForm.last_degree}
                      onChange={handleAddAppChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="e.g., Bachelor of Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CGPA
                    </label>
                    <input
                      type="text"
                      name="cgpa"
                      value={newAppForm.cgpa}
                      onChange={handleAddAppChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="3.5/4.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      English Test (IELTS/TOEFL)
                    </label>
                    <input
                      type="text"
                      name="english_test"
                      value={newAppForm.english_test}
                      onChange={handleAddAppChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="IELTS / TOEFL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Score
                    </label>
                    <input
                      type="text"
                      name="test_score"
                      value={newAppForm.test_score}
                      onChange={handleAddAppChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="e.g., 7.5"
                    />
                  </div>
                </div>
              </div>

              {/* Counselor Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  name="counselor_notes"
                  rows="3"
                  value={newAppForm.counselor_notes}
                  onChange={handleAddAppChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                  placeholder="Internal notes..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : null}
                  {isSubmitting ? "Creating..." : "Create Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminApplications;
