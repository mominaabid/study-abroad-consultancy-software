import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../Content/Url";
import PhoneInputWithCountry from "../../Components/InputFields/PhoneInputWithCountry";
import UniversitySelect from "../../Components/InputFields/UniversitySelect";
import universitieslist from "../../constants/universities.json";
import CourseSelect from "../../Components/InputFields/CourseSelect";
import coursesList from "../../constants/courses.json";
import ApplicationStatusModal from "../../Components/Modals/ApplicationStatusModal";
import CreateApplicationModal from "../../Components/Modals/CreateApplicationModal";
import EditApplicationModal from "../../Components/Modals/EditApplicationModal";
import {
  User,
  FileText,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Building,
  MapPin,
  Calendar,
  Upload,
  RefreshCw,
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import CountrySelect from "../../Components/InputFields/CountrySelect";

const getToken = () => localStorage.getItem("token") || "";

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

// Status options for dropdown
const STATUS_OPTIONS = [
  { value: "inquiry", label: "Inquiry", color: "gray" },
  { value: "evaluation", label: "Evaluation", color: "amber" },
  {
    value: "application submitted",
    label: "Application Submitted",
    color: "blue",
  },
  {
    value: "offer letter received",
    label: "Offer Letter Received",
    color: "emerald",
  },
  {
    value: "offer letter not received",
    label: "Offer Letter Not Received",
    color: "orange",
  },
  { value: "visa filed", label: "Visa Filed", color: "purple" },
  { value: "approved", label: "Approved", color: "green" },
  { value: "reject", label: "Reject", color: "rose" },
];

// Document types for counsellor upload
const DOC_TYPES = [
  { key: "passport", label: "Passport" },
  { key: "transcript", label: "Academic Transcript" },
  { key: "offer_letter", label: "Offer Letter" },
  { key: "visa", label: "Visa" },
  { key: "sop", label: "Statement of Purpose (SOP)" },
  { key: "ielts", label: "IELTS / English Test Score" },
  { key: "photo", label: "Photograph" },
  { key: "recommendation", label: "Recommendation Letter" },
  { key: "financial", label: "Financial Document" },
  { key: "cv", label: "CV / Resume" },
  { key: "other", label: "Other Document" },
  { key: "acceptance_letter", label: "Acceptance Letter" },
  { key: "visa_letter", label: "Visa Letter" },
  { key: "scholarship_certificate", label: "Scholarship Certificate" },
  { key: "fee_invoice", label: "Fee Invoice" },
];

// ===================== DOCUMENT PREVIEW MODAL =====================
function DocumentPreviewModal({
  isOpen,
  onClose,
  documents,
  onVerify,
  onReject,
}) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (docId) => {
    await onVerify(docId);
    setSelectedDoc(null);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason", {
        toastId: "reject-no-reason",
      });

      return;
    }
    await onReject(selectedDoc.id, rejectReason);
    setShowRejectModal(false);
    setSelectedDoc(null);
    setRejectReason("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: CheckCircle,
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
          bg: "bg-amber-100",
          text: "text-amber-700",
          icon: Clock,
          label: "Pending",
        };
    }
  };

  const pendingDocs = documents.filter(
    (d) => d.status === "pending" || d.status === "review",
  );
  const verifiedDocs = documents.filter((d) => d.status === "verified");
  const rejectedDocs = documents.filter((d) => d.status === "rejected");

  const getFileUrl = (doc) => {
    return doc.file_path || doc.file_url;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Documents</h2>
              <p className="text-sm text-gray-500">
                {pendingDocs.length} pending, {verifiedDocs.length} verified,{" "}
                {rejectedDocs.length} rejected
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <XCircle size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => {
                  const status = getStatusBadge(doc.status);
                  const StatusIcon = status.icon;
                  const fileUrl = getFileUrl(doc);
                  const fileName =
                    doc.original_name ||
                    (fileUrl ? fileUrl.split("/").pop() : "document");

                  return (
                    <div
                      key={doc.id}
                      className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText size={18} className="text-teal-600" />
                            <span className="font-medium text-gray-800 capitalize">
                              {doc.doc_type?.replace(/_/g, " ")}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text} flex items-center gap-1`}
                            >
                              <StatusIcon size={10} /> {status.label}
                            </span>
                            {doc.uploaded_by === "counsellor" && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                                Shared by you
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            File: {fileName}
                          </p>
                          <p className="text-xs text-gray-400">
                            Submitted:{" "}
                            {(() => {
                              const dateValue =
                                doc.submitted_at ||
                                doc.created_at ||
                                doc.uploaded_at ||
                                doc.date;
                              if (!dateValue) return "No date";
                              const parsed = new Date(dateValue);
                              if (isNaN(parsed.getTime()))
                                return "Invalid date";

                              const day = String(parsed.getDate()).padStart(
                                2,
                                "0",
                              );
                              const month = String(
                                parsed.getMonth() + 1,
                              ).padStart(2, "0");
                              const year = parsed.getFullYear();
                              return `${day}-${month}-${year}`;
                            })()}
                          </p>
                          {doc.rejection_reason && (
                            <p className="text-xs text-red-600 mt-2">
                              Rejection reason: {doc.rejection_reason}
                            </p>
                          )}
                          {doc.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              Notes: {doc.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-gray-100 transition"
                              title="View Document"
                            >
                              <Eye size={16} className="text-gray-500" />
                            </a>
                          )}
                          {(doc.status === "pending" ||
                            doc.status === "review") && (
                            <>
                              <button
                                onClick={() => handleVerify(doc.id)}
                                className="p-2 rounded-lg hover:bg-green-50 transition"
                                title="Verify"
                              >
                                <CheckCircle
                                  size={16}
                                  className="text-green-600"
                                />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setShowRejectModal(true);
                                }}
                                className="p-2 rounded-lg hover:bg-red-50 transition"
                                title="Reject"
                              >
                                <XCircle size={16} className="text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                Reject Document
              </h2>
              <p className="text-sm text-gray-500">
                Document: {selectedDoc?.doc_type?.replace(/_/g, " ")}
              </p>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===================== DOCUMENT UPLOAD MODAL =====================
function CounsellorDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  student,
  application,
  blockedDocTypes = new Set(),
}) {
  const [formData, setFormData] = useState({
    doc_type: "offer_letter",
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const availableDocTypes = DOC_TYPES.filter(
    (type) => !blockedDocTypes.has(type.key),
  );

  const noTypesAvailable = availableDocTypes.length === 0;

  const validate = () => {
    const newErrors = {};
    if (!formData.doc_type) newErrors.doc_type = "Document type is required";

    if (formData.notes) {
      if (formData.notes.length < 3) {
        newErrors.notes = "Notes must be at least 3 characters";
      } else if (formData.notes.length > 255) {
        newErrors.notes = "Notes cannot exceed 255 characters";
      }
    }

    if (!file) {
      newErrors.file = "Please select a file";
    } else {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        newErrors.file = "Only PDF, DOC, DOCX, JPG, PNG files are allowed";
      }
      if (file.size > 5 * 1024 * 1024) {
        newErrors.file = "File size must be less than 5MB";
      }
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors", {
        toastId: "upload-validation-error",
      });
      return;
    }

    setLoading(true);
    const formDataObj = new FormData();
    formDataObj.append("student_email", student.email);
    formDataObj.append("application_id", application.id);
    formDataObj.append("doc_type", formData.doc_type);
    formDataObj.append("notes", formData.notes);
    formDataObj.append("file", file);

    try {
      const res = await authAxios.post(
        `${BASE_URL}/counsellor/documents/upload-for-student`,
        formDataObj,
      );
      if (res.data.success) {
        toast.success("Document shared with student successfully!", {
          toastId: "doc-share-success",
        });
        onSuccess();
        onClose();
        setFile(null);
        setFormData({ doc_type: "offer_letter", notes: "" });
        setErrors({});
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Upload failed", {
        toastId: "doc-upload-failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (errors.file) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs.file;
        return newErrs;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Share Document</h2>
          <p className="text-sm text-gray-500">Student: {student?.name}</p>
          <p className="text-xs text-gray-400">
            {application?.target_university}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type *
            </label>
            {noTypesAvailable ? (
              <div className="text-amber-600 text-sm bg-amber-50 p-2 rounded-lg">
                All document types for this application have already been shared
                and are pending/verified.
                <br />
                You can upload again if a document was rejected.
              </div>
            ) : (
              <select
                required
                value={formData.doc_type}
                onChange={(e) =>
                  setFormData({ ...formData, doc_type: e.target.value })
                }
                className={`w-full border ${errors.doc_type ? "border-red-400" : "border-gray-200"} rounded-xl px-4 py-2.5 focus:border-teal-400`}
              >
                {availableDocTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            )}
            {errors.doc_type && (
              <p className="text-red-500 text-xs mt-1">{errors.doc_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document File *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className={`w-full border ${errors.file ? "border-red-400" : "border-gray-200"} rounded-xl px-4 py-2.5 focus:border-teal-400`}
              required
            />
            {errors.file && (
              <p className="text-red-500 text-xs mt-1">{errors.file}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>

            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className={`w-full border ${
                errors.notes ? "border-red-400" : "border-gray-200"
              } rounded-xl px-4 py-2.5 focus:border-teal-400 resize-none`}
              placeholder="Add notes for the student..."
              maxLength={255}
            />

            <div className="flex justify-between mt-1">
              {errors.notes && (
                <p className="text-red-500 text-xs">{errors.notes}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto">
                {formData.notes.length}/255
              </p>
            </div>
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
              disabled={loading || noTypesAvailable}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin mx-auto" />
              ) : (
                "Share Document"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===================== DELETE CONFIRM MODAL =====================
function DeleteConfirmModal({ isOpen, onClose, onConfirm, application }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Delete Application
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to delete the application for{" "}
            <strong>{application?.target_university}</strong>? This action
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN COMPONENT =====================
export const CounsellorApplication = () => {
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedAppForDoc, setSelectedAppForDoc] = useState(null);
  const [currentAppDocuments, setCurrentAppDocuments] = useState([]);

  useEffect(() => {
    if (showDocumentPreview && selectedApplication) {
      const updatedApp = applications.find(
        (app) => app.id === selectedApplication.id,
      );
      if (updatedApp) {
        setCurrentAppDocuments(updatedApp.documents || []);
      }
    }
  }, [applications, showDocumentPreview, selectedApplication]);

  // Get logged-in user from Redux
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin";

  // Fetch students + applications
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authAxios.get(
        `${BASE_URL}/counsellor/applications/students`,
      );

      if (res.data.success) {
        const studentsData = res.data.students || [];
        setStudents(studentsData);

        const allApps = [];
        const allDocs = [];

        studentsData.forEach((student) => {
          const applicationsList = student.applications || [];

          applicationsList.forEach((app) => {
            const appDocuments = app.documents || [];

            appDocuments.forEach((doc) => {
              allDocs.push({
                ...doc,
                application_id: app.id,
                student_id: student.id,
                student_name: student.name,
                student_email: student.email,
              });
            });

            allApps.push({
              id: app.id || app._id,
              target_university: app.target_university,
              course: app.course,
              target_country: app.target_country,
              deadline: app.deadline,
              status: app.status,
              full_name: app.full_name,
              email: app.email,
              phone: app.phone,
              study_level: app.study_level,
              grades_cgpa: app.grades_cgpa,
              english_proficiency_test: app.english_proficiency_test,
              english_test_overall_score: app.english_test_overall_score,
              counselor_notes: app.counselor_notes,
              created_at: app.created_at,
              student_name: student.name,
              student_email: student.email,
              student_id: student.id,
              user_id: student.user_id,
              documents: appDocuments,
              consultancy_fee: app.consultancy_fee,
            });
          });
        });

        setApplications(allApps);
        setDocuments(allDocs);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data", { toastId: "load-data-failed" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleVerifyDocument = async (docId) => {
    try {
      const res = await authAxios.put(
        `${BASE_URL}/counsellor/documents/${docId}/verify`,
      );
      if (res.data.message) {
        toast.success("Document verified successfully", {
          toastId: "doc-verify-success",
        });

        await fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed", {
        toastId: "doc-verify-failed",
      });
    }
  };

  const handleRejectDocument = async (docId, reason) => {
    try {
      const res = await authAxios.put(
        `${BASE_URL}/counsellor/documents/${docId}/reject`,
        { reason },
      );
      if (res.data.message) {
        toast.success("Document rejected", { toastId: "doc-reject-success" });
        await fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed", {
        toastId: "doc-reject-success",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;
    try {
      await authAxios.delete(
        `${BASE_URL}/counsellor/applications/${selectedApplication.id}`,
      );
      toast.success("Application deleted successfully", {
        toastId: "delete-success",
      });
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed", {
        toastId: "delete-failed",
      });
    }
  };

  const handleViewDocuments = (application) => {
    const latestApp = applications.find((a) => a.id === application.id);
    const appDocs = latestApp?.documents || application.documents || [];
    setCurrentAppDocuments(appDocs);
    setSelectedApplication(latestApp || application);
    setShowDocumentPreview(true);
  };

  const getStatusBadge = (status) => {
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
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status) => {
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
    return labelMap[status] || status;
  };

  // All leads assigned to this counsellor (from API) – for sidebar display
  const allAssignedStudents = useMemo(() => {
    return students.map((s) => ({
      id: s.id,
      user_id: s.user_id || s.id,
      name: s.name,
      email: s.email,
      phone: s.phone || "",
      status: s.status,
      study_level: s.study_level || "",
      grades_cgpa: s.grades_cgpa || "",
      english_proficiency_test: s.english_proficiency_test || "",
      english_test_overall_score: s.english_test_overall_score || "",
    }));
  }, [students]);

  // Leads eligible for creating a new application (counsellor only)
  const eligibleForNewApp = useMemo(() => {
    if (isAdmin) return allAssignedStudents;
    const allowedStatuses = ["new", "contacted", "counseling"];
    return allAssignedStudents.filter((s) =>
      allowedStatuses.includes(s.status?.toLowerCase()),
    );
  }, [allAssignedStudents, isAdmin]);

  // Inside CounsellorApplication component, after other useMemo definitions
  const existingDocTypesForSelectedApp = useMemo(() => {
    if (!selectedAppForDoc) return new Set();
    const app = applications.find((a) => a.id === selectedAppForDoc.id);
    if (!app || !app.documents) return new Set();
    const blocked = new Set();
    app.documents.forEach((doc) => {
      // Block doc_type if it exists and is NOT rejected
      if (doc.status !== "rejected") {
        blocked.add(doc.doc_type);
      }
    });
    return blocked;
  }, [selectedAppForDoc, applications]);

  const counselingStudents = useMemo(() => {
    return allAssignedStudents.filter(
      (s) => s.status?.toLowerCase() === "counseling",
    );
  }, [allAssignedStudents]);

  const filteredStudents = counselingStudents.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-end flex-wrap gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition shadow-md"
          >
            <Plus size={18} /> New Application
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <Users size={16} className="text-teal-500" />
                {isAdmin ? "All Students" : "My Students"} (
                {filteredStudents.length})
              </h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {filteredStudents.map((student) => {
                const studentApps = applications.filter(
                  (a) => a.student_id === student.id,
                );
                const allStudentDocs = studentApps.flatMap(
                  (app) => app.documents || [],
                );
                const pendingDocsCount = allStudentDocs.filter(
                  (d) => d.status === "pending" || d.status === "review",
                ).length;

                return (
                  <div
                    key={student.id}
                    onClick={() =>
                      setSelectedStudent(
                        selectedStudent?.id === student.id ? null : student,
                      )
                    }
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      selectedStudent?.id === student.id
                        ? "bg-teal-50 border-l-4 border-l-teal-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <User size={16} className="text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                      <div className="flex gap-1">
                        {pendingDocsCount > 0 && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {pendingDocsCount} pending
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          {studentApps.length} apps
                        </span>
                      </div>
                    </div>
                    {selectedStudent?.id === student.id && (
                      <div className="mt-3 pl-12 space-y-2">
                        {studentApps.map((app) => {
                          const appDocs = app.documents || [];
                          const pendingDocs = appDocs.filter(
                            (d) =>
                              d.status === "pending" || d.status === "review",
                          ).length;
                          const verifiedDocs = appDocs.filter(
                            (d) => d.status === "verified",
                          ).length;

                          return (
                            <div
                              key={app.id}
                              className="p-2 bg-white rounded-lg border border-gray-100 text-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {app.target_university}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {app.course}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(app.status)}`}
                                    >
                                      {getStatusLabel(app.status)}
                                    </span>
                                    {pendingDocs > 0 && (
                                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                        {pendingDocs} doc pending
                                      </span>
                                    )}
                                    {verifiedDocs > 0 && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        {verifiedDocs} verified
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDocuments(app);
                                    }}
                                    className="p-1 rounded hover:bg-blue-50"
                                    title="View Documents"
                                  >
                                    <FileText
                                      size={12}
                                      className="text-blue-600"
                                    />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedApplication(app);
                                      setShowEditModal(true);
                                    }}
                                    className="p-1 rounded hover:bg-amber-50"
                                    title="Edit"
                                  >
                                    <Edit
                                      size={12}
                                      className="text-amber-600"
                                    />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAppForDoc(app);
                                      setSelectedStudent(student);
                                      setShowDocModal(true);
                                    }}
                                    className="p-1 rounded hover:bg-teal-50"
                                    title="Share Document"
                                  >
                                    <Upload
                                      size={12}
                                      className="text-teal-600"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No eligible students found</p>
                  {!isAdmin && (
                    <p className="text-xs mt-1">
                      Only leads with status: New, Contacted, Counselling,
                      Inquiry can create applications
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-gray-800">All Applications</h2>
                <p className="text-xs text-gray-400">
                  {applications.length} total applications
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      University
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Documents
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <RefreshCw size={20} className="animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <div className="text-center">
                          <FileText
                            size={40}
                            className="mx-auto text-gray-300 mb-2"
                          />
                          <p className="text-gray-500">No applications found</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Click "New Application" to create one
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => {
                      const appDocs = app.documents || [];
                      const pendingDocs = appDocs.filter(
                        (d) => d.status === "pending" || d.status === "review",
                      ).length;
                      const verifiedDocs = appDocs.filter(
                        (d) => d.status === "verified",
                      ).length;

                      return (
                        <tr
                          key={app.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">
                              {app.student_name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {app.student_email || "No email"}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {app.target_university || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {app.course || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(app.status)}`}
                            >
                              {getStatusLabel(app.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {pendingDocs > 0 && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  {pendingDocs} pending
                                </span>
                              )}
                              {verifiedDocs > 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  {verifiedDocs} verified
                                </span>
                              )}
                              {appDocs.length === 0 && (
                                <span className="text-xs text-gray-400">
                                  No docs
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDocuments(app)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 transition"
                                title="View Documents"
                              >
                                <FileText size={14} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowEditModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-amber-50 transition"
                                title="Edit"
                              >
                                <Edit size={14} className="text-amber-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAppForDoc(app);
                                  setSelectedStudent({
                                    id: app.student_id,
                                    name: app.student_name,
                                    email: app.student_email,
                                    user_id: app.user_id,
                                  });
                                  setShowDocModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-teal-50 transition"
                                title="Share Document"
                              >
                                <Upload size={14} className="text-teal-600" />
                              </button>
                              {/* Change Status Button */}
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowStatusModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-purple-50 transition"
                                title="Change Status"
                              >
                                <Clock size={14} className="text-purple-600" />
                              </button>
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
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={showDocumentPreview}
        onClose={() => {
          setShowDocumentPreview(false);
          setCurrentAppDocuments([]);
        }}
        documents={currentAppDocuments}
        onVerify={handleVerifyDocument}
        onReject={handleRejectDocument}
      />

      {/* Status Change Modal */}
      <ApplicationStatusModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onSuccess={() => fetchData()}
      />

      {/* Create Application Modal */}
      <CreateApplicationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => fetchData()}
        students={eligibleForNewApp}
        selectedStudentForCreate={selectedStudent}
      />

      {/* Edit Application Modal */}
      <EditApplicationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedApplication(null);
        }}
        onSuccess={() => fetchData()}
        application={selectedApplication}
        students={eligibleForNewApp}
      />

      {/* Share Document Modal */}
      <CounsellorDocumentModal
        isOpen={showDocModal}
        onClose={() => {
          setShowDocModal(false);
          setSelectedAppForDoc(null);
        }}
        onSuccess={() => {
          fetchData();
        }}
        student={selectedStudent}
        application={selectedAppForDoc}
        blockedDocTypes={existingDocTypesForSelectedApp}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedApplication(null);
        }}
        onConfirm={handleDelete}
        application={selectedApplication}
      />
    </div>
  );
};

export default CounsellorApplication;
