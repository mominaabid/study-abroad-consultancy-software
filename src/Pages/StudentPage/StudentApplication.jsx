import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AddApplicationModal } from "../../Components/StudentApplicationModal/AddApplicationModal";
import { EditApplicationModal } from "../../Components/StudentApplicationModal/EditApplicationModal";
import { ViewApplicationModal } from "../../Components/StudentApplicationModal/ViewApplicationModal";
import { DeleteConfirmationModal } from "../../Components/DeleteConfirmationModal";
import { BASE_URL } from "../../Content/Url";
import ActionButton from "../../Components/StudentApplicationModal/ActionButton";
import { TaskCard } from "../../Components/StudentApplicationModal/TaskCard";

import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";
import {
  User,
  FileText,
  BarChart,
  Upload,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Plus,
  Edit,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
} from "lucide-react";

// Map document types to icons and titles
const DOCUMENT_CONFIG = {
  passport: { title: "Passport Copy", icon: User, status: "pending" },
  transcript: {
    title: "Academic Transcript",
    icon: FileText,
    status: "pending",
  },
  sop: { title: "Statement of Purpose", icon: FileText, status: "pending" },
  ielts: {
    title: "English Proficiency Score",
    icon: BarChart,
    status: "pending",
  },
  photo: { title: "Passport Photo", icon: User, status: "pending" },
  recommendation: {
    title: "Recommendation Letter",
    icon: FileText,
    status: "pending",
  },
  financial: {
    title: "Financial Statement",
    icon: FileText,
    status: "pending",
  },
  cv: { title: "CV / Resume", icon: FileText, status: "pending" },
  other: { title: "Other Document", icon: FileText, status: "pending" },
};

// Helper to get token
const getToken = () => localStorage.getItem("token") || "";

// Helper function for authenticated axios requests
const authAxios = {
  get: (url) =>
    axios.get(url, { headers: { Authorization: `Bearer ${getToken()}` } }),
  post: (url, data) =>
    axios.post(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
  put: (url, data) =>
    axios.put(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
  delete: (url) =>
    axios.delete(url, { headers: { Authorization: `Bearer ${getToken()}` } }),
};

// Three Dots Menu Component
const ThreeDotsMenu = ({ onEdit, onDelete, onView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

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
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="More options"
      >
        <MoreVertical size={20} className="text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in duration-200">
          <button
            onClick={() => {
              onView();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Eye size={16} className="text-blue-600" />
            <span>View Details</span>
          </button>
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Edit size={16} className="text-amber-600" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={16} className="text-red-600" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const StudentApplication = () => {
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingApplication, setEditingApplication] = useState(null);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [viewingApplication, setViewingApplication] = useState(null);

  const reduxUser = useSelector(selectUser);
  const [user, setUser] = useState({ name: "" });

  // Fetch documents from backend
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/student/documents`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      // Don't show toast error here to avoid spamming
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ Using authAxios for authenticated request
      const appsResponse = await authAxios.get(`${BASE_URL}/getApplications`);
      setApplications(appsResponse.data);

      // Fetch documents as well
      await fetchDocuments();

      if (!reduxUser) {
        const userResponse = await authAxios.get(`${BASE_URL}/user/profile`);
        setUser(userResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        // Redirect to login
        window.location.href = "/login";
      } else {
        toast.error("Failed to load dashboard data", {
          toastId: "dashboard-load-error",
        });
      }
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [reduxUser, fetchDocuments]);

  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
    }
  }, [reduxUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Build tasks from actual documents or create default tasks for missing docs
  const buildTasks = () => {
    const tasks = [];

    // Create a map of existing documents by type
    const docMap = new Map();
    documents.forEach((doc) => {
      docMap.set(doc.doc_type, doc);
    });

    // Define required documents order
    const requiredDocs = [
      { type: "passport", title: "Passport Copy", required: true },
      { type: "transcript", title: "Academic Transcript", required: true },
      { type: "sop", title: "Statement of Purpose", required: true },
      { type: "ielts", title: "English Proficiency Score", required: true },
      { type: "photo", title: "Passport Photo", required: true },
    ];

    // Optional documents
    const optionalDocs = [
      {
        type: "recommendation",
        title: "Recommendation Letter",
        required: false,
      },
      { type: "financial", title: "Financial Statement", required: false },
      { type: "cv", title: "CV / Resume", required: false },
    ];

    const allDocs = [...requiredDocs, ...optionalDocs];

    for (const docConfig of allDocs) {
      const existingDoc = docMap.get(docConfig.type);

      let status = "Pending";
      let statusIcon = null;

      if (existingDoc) {
        switch (existingDoc.status) {
          case "verified":
            status = "Verified";
            statusIcon = <CheckCircle2 className="text-green-500" size={16} />;
            break;
          case "rejected":
            status = "Rejected";
            statusIcon = <XCircle className="text-red-500" size={16} />;
            break;
          case "review":
            status = "In Review";
            statusIcon = <Clock className="text-yellow-500" size={16} />;
            break;
          default:
            status = "Pending";
            statusIcon = <Clock className="text-gray-400" size={16} />;
        }
      } else {
        statusIcon = <Clock className="text-gray-400" size={16} />;
      }

      // Determine icon based on document type
      let IconComponent = FileText;
      if (docConfig.type === "passport" || docConfig.type === "photo") {
        IconComponent = User;
      } else if (docConfig.type === "ielts") {
        IconComponent = BarChart;
      }

      // Determine status color class
      let statusClass = "";
      if (existingDoc?.status === "verified") {
        statusClass = "bg-green-100 text-green-700 border-green-200";
      } else if (existingDoc?.status === "rejected") {
        statusClass = "bg-red-100 text-red-700 border-red-200";
      } else if (existingDoc?.status === "review") {
        statusClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
      } else {
        statusClass = "bg-gray-100 text-gray-600 border-gray-200";
      }

      tasks.push({
        id: docConfig.type,
        title: docConfig.title,
        desc: docConfig.required ? "Required document" : "Optional document",
        status: status,
        statusIcon: statusIcon,
        statusClass: statusClass,
        icon: (
          <IconComponent
            className={
              existingDoc?.status === "verified"
                ? "text-green-500"
                : "text-gray-400"
            }
            size={20}
          />
        ),
        document: existingDoc,
        required: docConfig.required,
        submittedAt: existingDoc?.submitted_at,
        rejectionReason: existingDoc?.rejection_reason,
      });
    }

    return tasks;
  };

  const tasks = buildTasks();

  // Calculate progress based on verified documents
  const requiredDocsCount = tasks.filter((t) => t.required).length;
  const verifiedCount = tasks.filter(
    (t) => t.status === "Verified" && t.required,
  ).length;
  const progressValue =
    requiredDocsCount > 0 ? (verifiedCount / requiredDocsCount) * 100 : 0;

  const handleAddApplication = async (newApplication) => {
    // Add the new application to the beginning of the applications array
    // This ensures it shows up immediately without needing a refresh
    setApplications((prevApplications) => [
      newApplication,
      ...prevApplications,
    ]);
  };

  // Handle status update from ViewApplicationModal
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // ✅ Using authAxios for authenticated request
      const response = await authAxios.put(
        `${BASE_URL}/updateApplicationStatus/${id}`,
        { status: newStatus },
      );
      setApplications(
        applications.map((app) =>
          app.id === id ? { ...app, status: newStatus, ...response.data } : app,
        ),
      );
      toast.success(`Application status updated to ${newStatus}!`);
      return response.data;
    } catch (error) {
      console.error("Error updating application status:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to update application status");
      }
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4">
            <GraduationCap className="text-blue-600" size={40} />
          </div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-50 min-h-screen font-sans">
      <div className="bg-gradient-to-r from-[#e6f6f4] to-[#d1ede9] border border-[#d1ede9] rounded-2xl p-5 mb-8 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-full shadow-sm flex items-center justify-center">
            <GraduationCap className="text-[#40b3a2]" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-xl">
              Welcome back,{" "}
              <span className="text-[#40b3a2]">{user?.name || "Student"}!</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {applications.length > 0
                ? `📚 You have ${applications.length} active application${applications.length > 1 ? "s" : ""}`
                : "✨ Start your journey by creating a new application"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Plus size={18} />
          New Application
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-700 mb-3">Applications</h3>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
              <GraduationCap
                className="mx-auto mb-3 text-slate-400"
                size={48}
              />
              <p className="text-slate-500">No applications yet.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first application →
              </button>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-red-700 border">
                    {app.universityCode ||
                      app.target_university?.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      {app.target_university} - {app.course}
                    </h4>
                    <div className="flex flex-wrap gap-3 text-sm mt-1">
                      <span className="text-slate-500">
                        Deadline:{" "}
                        <span className="font-medium text-slate-700">
                          {app.deadline || "Dec 31, 2026"}
                        </span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
                          app.status === "In Progress"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {app.status || "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Three Dots Menu */}
                <div className="flex items-center gap-2">
                  <ThreeDotsMenu
                    onView={() => setViewingApplication(app)}
                    onEdit={() => {
                      setEditingApplication(app);
                      setIsEditModalOpen(true);
                    }}
                    onDelete={() => {
                      setApplicationToDelete(app);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-3">
          <h3 className="text-lg font-bold mb-3 text-slate-700">
            Application Task Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateStatus={() => {
                  // Optional: Navigate to documents page
                  window.location.href = "/student/documents";
                }}
                onUploadDocument={() => {
                  // Navigate to documents page for upload
                  window.location.href = "/student/documents";
                }}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-700">
                Document Progress
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {Math.round(progressValue)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressValue}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {verifiedCount} of {requiredDocsCount} required documents verified
            </p>
            <button
              onClick={() => (window.location.href = "/student/documents")}
              className="w-full mt-4 py-3 rounded-xl font-bold text-sm bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            >
              Manage Documents
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-3">Quick Actions</h4>
            <div className="space-y-3">
              <ActionButton
                icon={<Upload size={18} />}
                label="Upload Documents"
                onClick={() => (window.location.href = "/student/documents")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Application Modal */}
      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplicationAdded={handleAddApplication}
        user={user}
      />

      {/* Edit Application Modal */}
      {editingApplication && (
        <EditApplicationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          application={editingApplication}
          onApplicationUpdated={(updatedApp) => {
            setApplications(
              applications.map((app) =>
                app.id === updatedApp.id ? updatedApp : app,
              ),
            );
          }}
        />
      )}

      {/* View Application Modal - Using ViewApplicationModal */}
      {viewingApplication && (
        <ViewApplicationModal
          application={viewingApplication}
          onClose={() => setViewingApplication(null)}
          onUpdate={handleStatusUpdate}
        />
      )}

      {/* Submit Application Modal (keep if needed) */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Submit Application</h3>
            <p>Are you sure you want to submit this application?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // ✅ Using authAxios for authenticated request
                    await authAxios.put(
                      `${BASE_URL}/updateApplicationStatus/${selectedApp.id}`,
                      { status: "submitted" },
                    );
                    setApplications(
                      applications.map((app) =>
                        app.id === selectedApp.id
                          ? { ...app, status: "submitted" }
                          : app,
                      ),
                    );
                    toast.success("Application submitted successfully!");
                    setSelectedApp(null);
                  } catch (error) {
                    console.error("Error submitting application:", error);
                    if (error.response?.status === 401) {
                      toast.error("Session expired. Please login again.");
                    } else {
                      toast.error("Failed to submit application");
                    }
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!applicationToDelete) return;
          try {
            // ✅ Using authAxios for authenticated request
            await authAxios.delete(
              `${BASE_URL}/deleteApplication/${applicationToDelete.id}`,
            );
            setApplications(
              applications.filter((app) => app.id !== applicationToDelete.id),
            );
            toast.success("Application deleted successfully!");
          } catch (error) {
            console.error("Error deleting application:", error);
            if (error.response?.status === 401) {
              toast.error("Session expired. Please login again.");
            } else {
              toast.error("Failed to delete application");
            }
          } finally {
            setIsDeleteModalOpen(false);
            setApplicationToDelete(null);
          }
        }}
        title="Delete Application"
        message={`Are you sure you want to delete the application for ${applicationToDelete?.target_university}?`}
      />
    </div>
  );
};
