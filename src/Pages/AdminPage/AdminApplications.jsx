import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectUser, selectToken } from "../../redux/slices/authSlice";
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

// Status configuration with colors and icons
const STATUS_CONFIG = {
  Pending: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
    label: "Pending",
  },
  "In Review": {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Eye,
    label: "In Review",
  },
  Approved: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
    label: "Approved",
  },
  "Visa Processing": {
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Send,
    label: "Visa Processing",
  },
  Completed: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: FileCheck,
    label: "Completed",
  },
  Rejected: {
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
    label: "Rejected",
  },
};

// Document icons mapping
const DOCUMENT_ICONS = {
  passport: User,
  transcript: FileText,
  sop: FileText,
  ielts: FileText,
  photo: User,
  recommendation: FileText,
  financial: FileText,
  cv: FileText,
  other: FileText,
};

// Status update dropdown component
const StatusDropdown = ({ currentStatus, applicationId, onStatusUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statuses = [
    "Pending",
    "In Review",
    "Approved",
    "Visa Processing",
    "Completed",
    "Rejected",
  ];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await authAxios.put(
        `${BASE_URL}/admin/applications/${applicationId}/status`,
        { status: newStatus }
      );
      onStatusUpdate(applicationId, newStatus, response.data);
      toast.success(`Application status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update application status"
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
        <span>{currentStatus}</span>
        <ChevronDown size={12} className="ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {statuses.map((status) => {
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
                <span>{status}</span>
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

// Three Dots Menu Component
const ThreeDotsMenu = ({ onViewDetails, onEditStatus }) => {
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
          <button
            onClick={() => {
              onEditStatus();
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
          >
            <Edit size={14} className="text-amber-500" />
            <span>Edit Status</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Progress bar component
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

// Document status indicator
const DocumentStatus = ({ documents }) => {
  const docList = documents ? (Array.isArray(documents) ? documents : []) : [];
  const total = docList.length;
  const submitted = docList.filter((d) => d && d.file_url).length;
  const verified = docList.filter((d) => d && d.status === "verified").length;

  if (total === 0) return <span className="text-xs text-gray-400">0/0</span>;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-medium text-gray-700">
        {verified}/{total}
      </span>
      <div className="w-12 bg-gray-200 rounded-full h-1">
        <div
          className="bg-green-500 h-1 rounded-full transition-all"
          style={{ width: `${(verified / total) * 100}%` }}
        />
      </div>
    </div>
  );
};

// Main Admin Application Component
export const AdminApplication = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [sortField, setSortField] = useState("updated");
  const [sortDirection, setSortDirection] = useState("desc");

  const reduxUser = useSelector(selectUser);
  const token = useSelector(selectToken);

  // Fetch all applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAxios.get(`${BASE_URL}/admin/applications`);
      let appsData = response.data;
      if (Array.isArray(appsData)) {
        setApplications(appsData);
        setFilteredApplications(appsData);
      } else if (appsData && appsData.applications) {
        setApplications(appsData.applications);
        setFilteredApplications(appsData.applications);
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
  }, [fetchApplications]);

  // Filter and search applications
  useEffect(() => {
    let filtered = [...applications];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          (app.application_id && app.application_id.toLowerCase().includes(term)) ||
          (app.student_name && app.student_name.toLowerCase().includes(term)) ||
          (app.target_university && app.target_university.toLowerCase().includes(term)) ||
          (app.course && app.course.toLowerCase().includes(term)) ||
          (app.email && app.email.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== "All Status") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Apply sorting
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
          aVal = a.status || "";
          bVal = b.status || "";
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

  // Handle status update from within the table
  const handleStatusUpdate = (id, newStatus, updatedData) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id || app.application_id === id
          ? { ...app, status: newStatus, ...updatedData }
          : app
      )
    );
  };

  // Export report as CSV
  const exportReport = () => {
    const headers = [
      "Application ID",
      "Student Name",
      "Email",
      "University",
      "Course",
      "Status",
      "Progress",
      "Documents",
      "Updated Date",
    ];

    const rows = filteredApplications.map((app) => [
      app.application_id || app.id,
      app.student_name || `${app.first_name || ""} ${app.last_name || ""}`.trim(),
      app.email || "",
      app.target_university || "",
      app.course || "",
      app.status || "",
      `${app.progress || 0}%`,
      `${app.documents?.length || 0}/${app.total_documents || 5}`,
      new Date(app.updated_at || app.created_at || Date.now()).toLocaleDateString(),
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

  // Get status summary counts
  const getStatusCounts = () => {
    const counts = {
      Total: applications.length,
      Pending: 0,
      "In Review": 0,
      Approved: 0,
      "Visa Processing": 0,
      Completed: 0,
      Rejected: 0,
    };
    applications.forEach((app) => {
      if (counts.hasOwnProperty(app.status)) {
        counts[app.status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Toggle sort
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={14} className="opacity-30" />;
    return sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // View details modal
  const ApplicationDetailsModal = ({ application, onClose }) => {
    if (!application) return null;

    const StatusIcon = STATUS_CONFIG[application.status]?.icon || Clock;
    const documents = application.documents || [];

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
                      {application.country || application.nationality || "N/A"}
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
                      <span>{application.status}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submission Date</p>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {application.submission_date ||
                      new Date(
                        application.created_at || Date.now()
                      ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FileText size={18} className="text-amber-600" />
                Documents ({documents.length})
              </h3>
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No documents uploaded yet
                  </p>
                ) : (
                  documents.map((doc, idx) => {
                    const DocIcon = DOCUMENT_ICONS[doc.doc_type] || FileText;
                    let statusColor = "bg-gray-100 text-gray-600";
                    let StatusIconComp = ClockIcon;
                    if (doc.status === "verified") {
                      statusColor = "bg-green-100 text-green-700";
                      StatusIconComp = CheckCircle2;
                    } else if (doc.status === "rejected") {
                      statusColor = "bg-red-100 text-red-700";
                      StatusIconComp = XCircleIcon;
                    } else if (doc.status === "review") {
                      statusColor = "bg-yellow-100 text-yellow-700";
                      StatusIconComp = ClockIcon;
                    }
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <DocIcon size={16} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {doc.doc_type?.toUpperCase() || "Document"}
                            </p>
                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink size={10} />
                                View File
                              </a>
                            )}
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${statusColor}`}
                        >
                          <StatusIconComp size={10} />
                          <span>{doc.status || "Pending"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
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
      {/* Header Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{statusCounts.Total}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 shadow-sm border border-amber-100">
          <p className="text-xs text-amber-600">Pending</p>
          <p className="text-2xl font-bold text-amber-700">{statusCounts.Pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 shadow-sm border border-blue-100">
          <p className="text-xs text-blue-600">In Review</p>
          <p className="text-2xl font-bold text-blue-700">
            {statusCounts["In Review"]}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 shadow-sm border border-green-100">
          <p className="text-xs text-green-600">Approved</p>
          <p className="text-2xl font-bold text-green-700">{statusCounts.Approved}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 shadow-sm border border-purple-100">
          <p className="text-xs text-purple-600">Visa Processing</p>
          <p className="text-2xl font-bold text-purple-700">
            {statusCounts["Visa Processing"]}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 shadow-sm border border-emerald-100">
          <p className="text-xs text-emerald-600">Completed</p>
          <p className="text-2xl font-bold text-emerald-700">
            {statusCounts.Completed}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 shadow-sm border border-red-100">
          <p className="text-xs text-red-600">Rejected</p>
          <p className="text-2xl font-bold text-red-700">{statusCounts.Rejected}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
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
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Visa Processing">Visa Processing</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
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
          </div>
        </div>
      </div>

      {/* Applications Table */}
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  DOCUMENTS
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-800"
                  onClick={() => toggleSort("updated")}
                >
                  <div className="flex items-center gap-1">
                    UPDATED
                    <SortIcon field="updated" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
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
                  const status = app.status || "Pending";
                  const StatusIconComp = STATUS_CONFIG[status]?.icon || Clock;
                  const progress = app.progress || 0;
                  const documentsCount = app.documents?.length || 0;
                  const totalDocuments = app.total_documents || 8;
                  const studentInitials = (app.student_name || app.first_name || "ST")
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
                          <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600 text-xs">
                            {app.application_id?.slice(-4) || app.id?.slice(-4) || "APP"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {app.application_id || app.id || "N/A"}
                            </p>
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
                          <span>{status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <ProgressBar percentage={progress} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {documentsCount}/{totalDocuments}
                          </span>
                          <div className="w-12 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-emerald-500 h-1 rounded-full"
                              style={{
                                width: `${(documentsCount / totalDocuments) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">
                          {app.updated_at
                            ? new Date(app.updated_at).toLocaleDateString()
                            : app.created_at
                            ? new Date(app.created_at).toLocaleDateString()
                            : "N/A"}
                        </p>
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
                            onEditStatus={() => {}}
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

