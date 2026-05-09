// src/components/student/StudentApplication.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";
import {
  User,
  FileText,
  BarChart,
  Upload,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Eye,
  Clock,
  XCircle,
  Building,
  MapPin,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

const getToken = () => localStorage.getItem("token") || "";

// Helper for authenticated requests
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

// Document types configuration
const DOC_TYPES = [
  { key: "passport", label: "Passport Copy", required: false, icon: User },
  {
    key: "transcript",
    label: "Academic Transcript",
    required: false,
    icon: FileText,
  },
  {
    key: "sop",
    label: "Statement of Purpose",
    required: false,
    icon: FileText,
  },
  {
    key: "ielts",
    label: "IELTS / English Test",
    required: false,
    icon: BarChart,
  },
  { key: "photo", label: "Passport Photo", required: false, icon: User },
  {
    key: "recommendation",
    label: "Recommendation Letter",
    required: false,
    icon: FileText,
  },
  {
    key: "financial",
    label: "Financial Statement",
    required: false,
    icon: FileText,
  },
  { key: "cv", label: "CV / Resume", required: false, icon: FileText },
  { key: "other", label: "Other Document", required: false, icon: FileText },
];

// Document Upload Modal
function DocumentUploadModal({
  isOpen,
  onClose,
  onSuccess,
  application,
  docType,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("application_id", application.id);
    formData.append("doc_type", docType.key);
    formData.append("file", file);

    try {
      const res = await authAxios.post(
        `${BASE_URL}/student/documents/upload`,
        formData,
      );
      if (res.data) {
        toast.success("Document uploaded successfully!");
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Upload Document</h2>
          <p className="text-sm text-gray-500">
            {docType?.label} for {application?.target_university}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select File *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOC, DOCX, JPG, PNG (Max 5MB)
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin mx-auto" />
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Document Card Component
// Document Card Component - FIXED
function DocumentCard({ doc, onRefresh }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (doc.status) {
      case "verified":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: CheckCircle2,
          label: "Verified",
        };
      case "rejected":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: XCircle,
          label: "Rejected",
        };
      case "review":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          icon: Clock,
          label: "In Review",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          icon: Clock,
          label: "Pending",
        };
    }
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  // Get the correct file URL
  const fileUrl = doc.file_path || doc.file_url;
  const fileName =
    doc.original_name || (fileUrl ? fileUrl.split("/").pop() : "document");

  console.log("Document:", {
    id: doc.id,
    fileUrl,
    fileName,
    status: doc.status,
  });

  return (
    <div className="bg-gray-50 rounded-xl p-3 hover:shadow-sm transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <FileText size={18} className="text-teal-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800 text-sm">{fileName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text} flex items-center gap-1`}
              >
                <StatusIcon size={10} /> {status.label}
              </span>
              {doc.uploaded_by === "counsellor" && (
                <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                  Shared by Counsellor
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-200 transition"
              title="View Document"
            >
              <Eye size={16} className="text-gray-500" />
            </a>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
          <p>
            <span className="font-medium">Submitted:</span>{" "}
            {new Date(doc.submitted_at).toLocaleDateString()}
          </p>
          {doc.reviewed_at && (
            <p>
              <span className="font-medium">Reviewed:</span>{" "}
              {new Date(doc.reviewed_at).toLocaleDateString()}
            </p>
          )}
          {doc.rejection_reason && (
            <p className="text-red-600">
              <span className="font-medium">Rejection Reason:</span>{" "}
              {doc.rejection_reason}
            </p>
          )}
          {doc.notes && (
            <p>
              <span className="font-medium">Notes:</span> {doc.notes}
            </p>
          )}
          {fileUrl && (
            <p className="text-blue-600">
              <a href={fileUrl} target="_blank" className="hover:underline">
                📄 Click to open document
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
// Application Card Component
function ApplicationCard({ application, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadModal, setUploadModal] = useState({
    isOpen: false,
    docType: null,
  });

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      // const res = await authAxios.get(`${BASE_URL}/student/documents`);
      const res = await authAxios.get(
        `${BASE_URL}/student/documents?application_id=${application.id}`,
      );
      const allDocs = res.data || [];
      // Don't filter by application_id - backend already returns student's documents
      setDocuments(allDocs);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      fetchDocuments();
    }
  }, [expanded, application.id]);

  const getStatusColor = () => {
    const statusMap = {
      inquiry: "bg-gray-100 text-gray-700",
      evaluation: "bg-amber-100 text-amber-700",
      "application submitted": "bg-blue-100 text-blue-700",
      "offer letter received": "bg-emerald-100 text-emerald-700",
      "offer letter not received": "bg-orange-100 text-orange-700",
      "visa filed": "bg-purple-100 text-purple-700",
      approved: "bg-green-100 text-green-700",
      reject: "bg-rose-100 text-rose-700",
    };
    return statusMap[application.status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = () => {
    const labelMap = {
      inquiry: "Inquiry",
      evaluation: "Evaluation",
      "application submitted": "App Submitted",
      "offer letter received": "Offer Received",
      "offer letter not received": "Offer Not Received",
      "visa filed": "Visa Filed",
      approved: "Approved",
      reject: "Rejected",
    };
    return labelMap[application.status] || application.status;
  };

  // Group documents by type for quick status
  const docStatusMap = {};
  documents.forEach((doc) => {
    docStatusMap[doc.doc_type] = doc.status;
  });

  // Check which document types have been uploaded
  const uploadedTypes = new Set(documents.map((d) => d.doc_type));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building size={16} className="text-teal-600" />
              <h3 className="font-bold text-gray-800 text-lg">
                {application.target_university || "University"}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <GraduationCap size={14} />{" "}
                {application.course || "Course not specified"}
              </span>
              {application.target_country && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {application.target_country}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor()}`}
            >
              {getStatusLabel()}
            </span>
            {expanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/30">
          {/* Document Checklist */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <FileText size={14} className="text-teal-500" />
              Document Checklist
              <span className="text-xs text-gray-400 ml-2">
                ({documents.filter((d) => d.status === "verified").length}/
                {documents.length} verified)
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {DOC_TYPES.map((docType) => {
                const docStatus = docStatusMap[docType.key];
                const isUploaded = uploadedTypes.has(docType.key);
                let statusBadge = {
                  bg: "bg-gray-100",
                  text: "text-gray-500",
                  label: "Not Uploaded",
                };

                if (docStatus === "verified")
                  statusBadge = {
                    bg: "bg-green-100",
                    text: "text-green-700",
                    label: "Verified",
                  };
                else if (docStatus === "rejected")
                  statusBadge = {
                    bg: "bg-red-100",
                    text: "text-red-700",
                    label: "Rejected",
                  };
                else if (docStatus === "review")
                  statusBadge = {
                    bg: "bg-blue-100",
                    text: "text-blue-700",
                    label: "In Review",
                  };
                else if (isUploaded)
                  statusBadge = {
                    bg: "bg-amber-100",
                    text: "text-amber-700",
                    label: "Pending",
                  };

                return (
                  <div
                    key={docType.key}
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <docType.icon size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {docType.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                      >
                        {statusBadge.label}
                      </span>
                      {!isUploaded && (
                        <button
                          onClick={() =>
                            setUploadModal({ isOpen: true, docType: docType })
                          }
                          className="p-1 rounded-lg hover:bg-teal-50 text-teal-600 transition"
                          title="Upload"
                        >
                          <Upload size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Eye size={14} className="text-teal-500" />
              Uploaded Documents ({documents.length})
            </h4>
            {loadingDocs ? (
              <div className="text-center py-4">
                <RefreshCw
                  size={20}
                  className="animate-spin mx-auto text-gray-400"
                />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No documents uploaded yet
              </p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onRefresh={fetchDocuments}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModal.isOpen}
        onClose={() => setUploadModal({ isOpen: false, docType: null })}
        onSuccess={fetchDocuments}
        application={application}
        docType={uploadModal.docType}
      />
    </div>
  );
}

// Main StudentApplication Component
export const StudentApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await authAxios.get(`${BASE_URL}/getApplications`);
      setApplications(res.data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to load applications");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GraduationCap
            className="text-teal-600 animate-pulse mx-auto mb-4"
            size={48}
          />
          <p className="text-slate-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-950 to-teal-900 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-1">
                Student Portal
              </p>
              <h1 className="text-2xl font-bold">My Applications</h1>
              <p className="text-blue-200 text-sm mt-1">
                View and track your university applications
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold">No applications yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your counsellor will add applications for you
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onRefresh={fetchApplications}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentApplication;
