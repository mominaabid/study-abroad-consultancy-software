// CounsellorApplication.jsx - COMPLETE FIXED VERSION
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { X } from "lucide-react";
import CountrySelect from "../../Components/InputFields/CountrySelect";
import { AddBtnInHeader } from "../../Components/CustomButtons/AddBtnInHeader";
import { CancelButton } from "../../Components/CustomButtons/CancelButton";
import { Title } from "../../Components/Title";
import { AddButton } from "../../Components/CustomButtons/AddButton";

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

// ===================== SCROLL LOCK HOOK =====================
function useModalScrollLock(openStates) {
  const originalOverflowRef = useRef("");
  const originalPaddingRightRef = useRef("");
  const isLockedRef = useRef(false);

  const isAnyOpen = openStates.some((open) => open);

  useEffect(() => {
    if (isAnyOpen && !isLockedRef.current) {
      const body = document.body;
      originalOverflowRef.current = body.style.overflow;
      originalPaddingRightRef.current = body.style.paddingRight;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      body.style.paddingRight = `${scrollbarWidth}px`;
      body.style.overflow = "hidden";
      isLockedRef.current = true;
    } else if (!isAnyOpen && isLockedRef.current) {
      const body = document.body;
      body.style.overflow = originalOverflowRef.current;
      body.style.paddingRight = originalPaddingRightRef.current;
      isLockedRef.current = false;
    }
  }, [isAnyOpen]);
}

// ===================== CUSTOM PAGINATION COMPONENT =====================
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });
    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3  sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                currentPage === 1
                  ? "cursor-not-allowed bg-gray-50"
                  : "hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === page
                      ? "z-10 bg-teal-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                currentPage === totalPages
                  ? "cursor-not-allowed bg-gray-50"
                  : "hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// ===================== DOCUMENT PREVIEW MODAL =====================
function DocumentPreviewModal({
  isOpen,
  onClose,
  documents,
  onVerify,
  onReject,
  onToggleReceived,
  isAdmin = false,
  documentTypes = [],
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

  const handleToggleReceived = async (docId, currentStatus) => {
    await onToggleReceived(docId, !currentStatus);
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

  const getDocTypeDisplay = (doc) => {
    if (doc.doc_type_name) return doc.doc_type_name;
    if (doc.doc_type) return doc.doc_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    return "Document";
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <Title setModal={onClose} className="rounded-t-2xl">
            Documents
          </Title>

          <div className="px-4 sm:px-5 pt-2 pb-3 text-xs sm:text-sm text-gray-500 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <span>{documents.length} document(s) uploaded</span>
            <span className="flex gap-2">
              <span className="text-green-600">✓ {verifiedDocs.length} verified</span>
              <span className="text-amber-600">⏳ {pendingDocs.length} pending</span>
              {rejectedDocs.length > 0 && (
                <span className="text-red-600">✗ {rejectedDocs.length} rejected</span>
              )}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
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
                  const docTypeDisplay = getDocTypeDisplay(doc);
                  const isCollective = doc.is_collective === 1 || doc.is_collective === true;
                  const isReceived = doc.is_received === 1 || doc.is_received === true;

                  return (
                    <div
                      key={doc.id}
                      className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <FileText
                              size={18}
                              className="text-teal-600 shrink-0"
                            />
                            <span className="font-medium text-gray-800 capitalize">
                              {docTypeDisplay}
                            </span>
                            {isCollective && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                                📄 Combined PDF
                              </span>
                            )}
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
                            {isReceived ? (
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} /> Received
                              </span>
                            ) : (
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                Not Received
                              </span>
                            )}
                          </div>
                          {isCollective && doc.collective_doc_ids && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              <span className="text-xs text-gray-500">Includes:</span>
                              {(() => {
                                try {
                                  let ids = doc.collective_doc_ids;
                                  if (typeof ids === 'string') {
                                    ids = JSON.parse(ids);
                                  }
                                  if (!Array.isArray(ids)) return null;
                                  
                                  return ids.map((id) => {
                                    const docType = documentTypes?.find(t => 
                                      t.id === id || 
                                      t.key === id || 
                                      String(t.id) === String(id) ||
                                      String(t.key) === String(id)
                                    );
                                    
                                    return docType ? (
                                      <span key={id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {docType.label || docType.name || id}
                                      </span>
                                    ) : (
                                      <span key={id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {id}
                                      </span>
                                    );
                                  });
                                } catch (e) {
                                  return null;
                                }
                              })()}
                            </div>
                          )}
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
                        <div className="flex gap-2 self-end sm:self-start flex-wrap">
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
                          
                          {isAdmin && (
                            <button
                              onClick={() => handleToggleReceived(doc.id, isReceived)}
                              className={`p-2 rounded-lg transition ${
                                isReceived 
                                  ? "hover:bg-teal-50 text-teal-600" 
                                  : "hover:bg-gray-100 text-gray-400"
                              }`}
                              title={isReceived ? "Mark as Not Received" : "Mark as Received"}
                            >
                              {isReceived ? (
                                <CheckCircle size={16} className="text-teal-600" />
                              ) : (
                                <Clock size={16} />
                              )}
                            </button>
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

          <div className="border-t border-gray-100 p-4 flex justify-end">
            <CancelButton handleCancel={onClose} />
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                Reject Document
              </h2>
              <p className="text-sm text-gray-500">
                Document: {selectedDoc ? getDocTypeDisplay(selectedDoc) : ""}
              </p>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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

// ===================== DOCUMENT UPLOAD MODAL (WITH DYNAMIC DROPDOWN & RESPONSIVE) =====================
function CounsellorDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  student,
  application,
  blockedDocTypes = new Set(),
  documentTypes = [],
}) {
  const [formData, setFormData] = useState({
    doc_type: "",
    notes: "",
    is_received: false,
    is_collective: false,
    collective_doc_ids: [],
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const submittedRef = useRef(false);

  // ✅ DYNAMIC DROPDOWN: Filter available document types - EXCLUDE already added ones
  const availableDocTypes = useMemo(() => {
    console.log('🔍 All Document Types:', documentTypes);
    console.log('🔍 Blocked Doc Types:', blockedDocTypes);
    
    if (!documentTypes || documentTypes.length === 0) {
      return [];
    }

    const available = documentTypes.filter((type) => {
      const isBlocked = 
        blockedDocTypes.has(type.key) ||
        blockedDocTypes.has(type.label) ||
        blockedDocTypes.has(type.name) ||
        blockedDocTypes.has(type.key?.toLowerCase()) ||
        blockedDocTypes.has(type.label?.toLowerCase()) ||
        blockedDocTypes.has(type.label?.toLowerCase().replace(/\s+/g, "_")) ||
        blockedDocTypes.has(type.key?.toLowerCase().replace(/\s+/g, "_")) ||
        blockedDocTypes.has(String(type.id)) ||
        blockedDocTypes.has(type.id);
      
      return !isBlocked;
    });

    console.log('✅ Available Doc Types:', available);
    return available;
  }, [documentTypes, blockedDocTypes]);

  const noTypesAvailable = availableDocTypes.length === 0;

  // Set default doc_type only when it's missing or no longer valid
  useEffect(() => {
    if (!isOpen || availableDocTypes.length === 0) return;

    setFormData((prev) => {
      const stillValid = availableDocTypes.some((t) => t.key === prev.doc_type);
      if (stillValid) return prev;
      return { ...prev, doc_type: availableDocTypes[0].key };
    });
  }, [isOpen, availableDocTypes]);

  useEffect(() => {
    if (!isOpen) {
      submittedRef.current = false;
      setFile(null);
      setErrors({});
      setFormData({
        doc_type: "",
        notes: "",
        is_received: false,
        is_collective: false,
        collective_doc_ids: [],
      });
    }
  }, [isOpen]);

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

  const toggleCollectiveDoc = (docKey) => {
    setFormData(prev => {
      const currentIds = prev.collective_doc_ids || [];
      let newIds;
      if (currentIds.includes(docKey)) {
        newIds = currentIds.filter(id => id !== docKey);
      } else {
        newIds = [...currentIds, docKey];
      }
      return { ...prev, collective_doc_ids: newIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submittedRef.current) return;
    submittedRef.current = true;
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors", {
        toastId: "upload-validation-error",
      });
      submittedRef.current = false;
      return;
    }

    setLoading(true);
    const formDataObj = new FormData();
    formDataObj.append("student_email", student.email);
    formDataObj.append("application_id", application.id);
    
    const selectedDocType = documentTypes.find(t => t.key === formData.doc_type);
    formDataObj.append("doc_type", selectedDocType ? selectedDocType.key : formData.doc_type);
    formDataObj.append("notes", formData.notes);
    formDataObj.append("file", file);
    
    formDataObj.append("is_received", formData.is_received ? "true" : "false");
    
    if (formData.is_collective && formData.collective_doc_ids.length > 0) {
      formDataObj.append("is_collective", "true");
      formDataObj.append("collective_doc_ids", JSON.stringify(formData.collective_doc_ids));
    }

    try {
      const res = await authAxios.post(
        `${BASE_URL}/counsellor/documents/upload-for-student`,
        formDataObj,
      );
      if (res.data.success) {
        const statusMsg = formData.is_received 
          ? "Document marked as received and verified!" 
          : "Document uploaded successfully!";
        toast.success(statusMsg, {
          toastId: "doc-share-success",
        });
        onSuccess();
        onClose();
        setFile(null);
        setFormData({ 
          doc_type: "", 
          notes: "", 
          is_received: false,
          is_collective: false,
          collective_doc_ids: []
        });
        setErrors({});
        submittedRef.current = false;
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Upload failed", {
        toastId: "doc-upload-failed",
      });
      submittedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ SINGLE handleFileChange function (only one!)
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 my-8 overflow-hidden max-h-[90vh] flex flex-col">
        <Title setModal={onClose} className="rounded-t-2xl flex-shrink-0">
          Share Document
        </Title>

        <div className="px-5 py-3 text-sm text-gray-600 bg-gray-50 border-b border-gray-100 flex-shrink-0">
          <p className="font-medium break-words">Student: {student?.name}</p>
          <p className="text-xs text-gray-500 break-words">
            {application?.target_university}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1">
          <div className="space-y-4">
            {/* Document Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Document Type *
              </label>
              {noTypesAvailable ? (
                <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="font-medium">✅ All documents uploaded</p>
                  <p className="text-xs mt-1">
                    All document types for this application have been added.
                    You can re-upload if a document was rejected.
                  </p>
                </div>
              ) : (
                <select
                  required
                  value={formData.doc_type}
                  onChange={(e) =>
                    setFormData({ ...formData, doc_type: e.target.value })
                  }
                  className={`w-full border ${
                    errors.doc_type ? "border-red-400" : "border-gray-200"
                  } rounded-lg px-4 py-2.5 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition`}
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
              {!noTypesAvailable && (
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Only shows document types not yet added
                </p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Document File *
              </label>
              <div className={`border-2 border-dashed ${
                errors.file ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-teal-400"
              } rounded-lg p-4 transition`}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                </p>
              </div>
              {errors.file && (
                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
              )}
            </div>

            {/* Mark as Received Checkbox */}
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="is_received"
                  checked={formData.is_received}
                  onChange={(e) => setFormData({ ...formData, is_received: e.target.checked })}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5 cursor-pointer"
                />
                <label htmlFor="is_received" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Mark as Received & Verified
                </label>
              </div>
              <p className="text-xs text-gray-400 ml-6">
                Checking this will verify the document immediately (Admin/Counsellor only)
              </p>
            </div>

            {/* Combined PDF Option */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="is_collective"
                  checked={formData.is_collective}
                  onChange={(e) => setFormData({ ...formData, is_collective: e.target.checked })}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5 cursor-pointer"
                />
                <label htmlFor="is_collective" className="text-sm font-medium text-gray-700 cursor-pointer">
                  This PDF contains multiple documents
                </label>
              </div>

              {formData.is_collective && (
                <div className="ml-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Select which documents are included in this PDF:
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {availableDocTypes.map((type) => (
                      <label key={type.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.collective_doc_ids.includes(type.key)}
                          onChange={() => toggleCollectiveDoc(type.key)}
                          className="w-3.5 h-3.5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                        />
                        <span className="text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                rows="3"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className={`w-full border ${
                  errors.notes ? "border-red-400" : "border-gray-200"
                } rounded-lg px-4 py-2.5 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none resize-none transition`}
                placeholder="Add notes for the student..."
                maxLength={255}
              />
              <div className="flex justify-between mt-1">
                {errors.notes && (
                  <p className="text-red-500 text-xs">{errors.notes}</p>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {formData.notes.length}/255
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
            <CancelButton handleCancel={onClose} />
            <AddButton
              label="Share Document"
              loading={loading}
              disabled={loading || noTypesAvailable}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

// ===================== SEARCHABLE DROPDOWN COMPONENT =====================
function SearchableStudentDropdown({ students, onSelect, selectedStudent }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = (students || []).filter((student) => {
    if (!student) return false;
    const name = student.name || '';
    const email = student.email || '';
    const search = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search)
    );
  });

  const handleSelect = (student) => {
    if (student) {
      onSelect(student);
      setSearchTerm(student.name || '');
    }
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (e.target.value === "" && selectedStudent) {
      onSelect(null);
    }
  };

  const displayValue = selectedStudent ? selectedStudent.name || '' : searchTerm;

  return (
    <div className="relative w-full sm:w-80" ref={dropdownRef}>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search student by name or email..."
          className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
        />
        <ChevronDown
          size={16}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No students found
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id || student.user_id}
                onClick={() => handleSelect(student)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="font-medium text-gray-800">
                  {student.name || 'Unnamed Student'}
                </div>
                <div className="text-xs text-gray-500 break-all">
                  {student.email || 'No email'}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ===================== MAIN COMPONENT =====================
export const CounsellorApplication = () => {
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedAppForDoc, setSelectedAppForDoc] = useState(null);
  const [currentAppDocuments, setCurrentAppDocuments] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [documentTypes, setDocumentTypes] = useState([]);

  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin";

  useModalScrollLock([
    showStatusModal,
    showCreateModal,
    showEditModal,
    showDocModal,
    showDocumentPreview,
  ]);

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

  const fetchDocumentTypes = useCallback(async () => {
    try {
      const res = await authAxios.get(`${BASE_URL}/config/document_type`);
      if (res.data.success) {
        let types = res.data.data || [];
        if (Array.isArray(types) && types.length === 1 && Array.isArray(types[0])) {
          types = types[0];
        }
        if (!Array.isArray(types)) {
          types = [];
        }
        const formattedTypes = types.map((t) => ({
          key: t.name?.toLowerCase().replace(/\s+/g, '_') || t.id,
          label: t.name || 'Unknown',
          id: t.id,
        }));
        setDocumentTypes(formattedTypes);
      }
    } catch (error) {
      console.error("Failed to fetch document types:", error);
      setDocumentTypes([]);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authAxios.get(
        `${BASE_URL}/counsellor/applications/students`,
      );

      if (res.data.success) {
        const studentsData = (res.data.students || [])
          .filter(student => student && student.id)
          .map(student => ({
            ...student,
            name: student.name || 'Unnamed Student',
            email: student.email || '',
          }));
        
        setStudents(studentsData);

        const allApps = [];
        const allDocs = [];

        studentsData.forEach((student) => {
          const applicationsList = student.applications || [];

          applicationsList.forEach((app) => {
            if (!app || !app.id) return;

            const appDocuments = app.documents || [];

            appDocuments.forEach((doc) => {
              if (!doc) return;
              allDocs.push({
                ...doc,
                application_id: app.id,
                student_id: student.id,
                student_name: student.name || 'Unnamed Student',
                student_email: student.email || '',
              });
            });

            allApps.push({
              id: app.id,
              target_university: app.target_university || 'N/A',
              course: app.course || 'N/A',
              target_country: app.target_country || 'N/A',
              deadline: app.deadline || null,
              status: app.status || 'inquiry',
              full_name: app.full_name || student.name || '',
              email: app.email || student.email || '',
              phone: app.phone || student.phone || '',
              study_level: app.study_level || '',
              grades_cgpa: app.grades_cgpa || '',
              english_proficiency_test: app.english_proficiency_test || '',
              english_test_overall_score: app.english_test_overall_score || '',
              counselor_notes: app.counselor_notes || '',
              created_at: app.created_at || new Date().toISOString(),
              student_name: student.name || 'Unnamed Student',
              student_email: student.email || '',
              country_id: app.country_id || null,
              city_id: app.city_id || null,
              university_id: app.university_id || null,
              course_id: app.course_id || null,
              lead_id: app.lead_id || student.id,
              student_id: student.id,
              user_id: student.user_id || student.id,
              documents: appDocuments,
              consultancy_fee: app.consultancy_fee || 0,
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
    }
  }, []);

  const fetchStudentsForDropdown = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user?.role === 'admin';
      
      const url = `${BASE_URL}/counsellor/leads`;
      
      console.log("🔍 Fetching leads from:", url);
      const res = await authAxios.get(url);
      console.log("📥 Leads API response:", res.data);
      
      if (res.data.success) {
        let leadsData = [];
        
        if (res.data.data && res.data.data.leads && Array.isArray(res.data.data.leads)) {
          leadsData = res.data.data.leads;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          leadsData = res.data.data;
        } else if (res.data.leads && Array.isArray(res.data.leads)) {
          leadsData = res.data.leads;
        } else {
          console.warn("Unexpected response structure:", res.data);
          leadsData = [];
        }
        
        console.log("📊 Total leads from API:", leadsData.length);
        
        const formattedStudents = leadsData.map(lead => ({
          id: lead.id,
          user_id: lead.user_id || lead.id,
          name: lead.name || 'Unnamed Student',
          email: lead.email || '',
          phone: lead.phone || '',
          status: lead.status || '',
          counsellor_id: lead.counsellor_id,
        }));
        
        console.log("✅ Final formatted students:", formattedStudents.length);
        setAllStudents(formattedStudents);
        return formattedStudents;
      } else {
        console.error("API returned success: false", res.data);
        setAllStudents([]);
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch students for dropdown:", error);
      toast.error("Failed to load students: " + (error.response?.data?.message || error.message));
      setAllStudents([]);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchDocumentTypes();
    fetchStudentsForDropdown();
  }, [fetchData, fetchDocumentTypes, fetchStudentsForDropdown]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStudent]);

  const handleToggleReceived = async (docId, newStatus) => {
    try {
      const res = await authAxios.put(
        `${BASE_URL}/admin/documents/${docId}/toggle-received`,
        { is_received: newStatus }
      );
      if (res.data.success) {
        toast.success(`Document ${newStatus ? 'marked as received' : 'marked as not received'}`, {
          toastId: "doc-toggle-received",
        });
        await fetchData();
        setCurrentAppDocuments(prev => 
          prev.map(doc => 
            doc.id === docId ? { ...doc, is_received: newStatus } : doc
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update received status", {
        toastId: "doc-toggle-received-failed",
      });
    }
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

  const allAssignedStudents = useMemo(() => {
    return students.map((s) => ({
      id: s.id,
      user_id: s.user_id || s.id,
      name: s.name || 'Unnamed Student',
      email: s.email || '',
      phone: s.phone || "",
      status: s.status || '',
      study_level: s.study_level || "",
      grades_cgpa: s.grades_cgpa || "",
      english_proficiency_test: s.english_proficiency_test || "",
      english_test_overall_score: s.english_test_overall_score || "",
    }));
  }, [students]);

  const studentsWithApps = useMemo(() => {
    return students.filter((s) => {
      if (!s.applications) return false;
      if (!Array.isArray(s.applications)) return false;
      const validApps = s.applications.filter(app => app && app.id);
      return validApps.length > 0;
    });
  }, [students]);

  const eligibleForNewApp = useMemo(() => {
    return allStudents;
  }, [allStudents]);

  const studentApplications = useMemo(() => {
    if (!selectedStudent) return [];
    return applications.filter((app) => app.student_id === selectedStudent.id);
  }, [applications, selectedStudent]);

  const totalItems = studentApplications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = studentApplications.slice(startIndex, endIndex);

  const existingDocTypesForSelectedApp = useMemo(() => {
    if (!selectedAppForDoc) return new Set();
    
    const app = applications.find((a) => a.id === selectedAppForDoc.id);
    if (!app || !app.documents) return new Set();
    
    const blocked = new Set();
    
    const addToBlocked = (docType) => {
      if (!docType) return;
      blocked.add(docType);
      blocked.add(docType.toLowerCase());
      blocked.add(docType.toLowerCase().replace(/\s+/g, "_"));
      blocked.add(docType.replace(/\s+/g, "_"));
      blocked.add(docType.trim());
    };
    
    app.documents.forEach((doc) => {
      if (doc.status === "rejected") return;
      
      if (doc.doc_type) {
        addToBlocked(doc.doc_type);
      }
      if (doc.doc_type_name) {
        addToBlocked(doc.doc_type_name);
      }
      
      const isCombined = doc.is_collective === 1 || doc.is_collective === true;
      
      if (isCombined && doc.collective_doc_ids) {
        try {
          let collectiveIds = doc.collective_doc_ids;
          if (typeof collectiveIds === 'string') {
            collectiveIds = JSON.parse(collectiveIds);
          }
          
          if (Array.isArray(collectiveIds) && collectiveIds.length > 0) {
            collectiveIds.forEach((id) => {
              const docType = documentTypes.find(t => 
                t.id === id || 
                t.key === id || 
                String(t.id) === String(id) ||
                String(t.key) === String(id)
              );
              
              if (docType) {
                addToBlocked(docType.key);
                addToBlocked(docType.label);
                addToBlocked(docType.name);
              } else {
                blocked.add(id);
                blocked.add(String(id));
              }
            });
          }
        } catch (error) {
          console.error('Error processing combined PDF documents:', error);
        }
      }
    });
    
    console.log('🚫 Blocked Doc Types:', Array.from(blocked));
    return blocked;
  }, [selectedAppForDoc, applications, documentTypes]);

  return (
    <div className="p-3 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="w-full md:w-auto order-2 md:order-1">
          <SearchableStudentDropdown
            students={studentsWithApps}
            onSelect={(student) => setSelectedStudent(student)}
            selectedStudent={selectedStudent}
          />
        </div>
        <AddBtnInHeader
          label="Add Application"
          handleToggle={() => setShowCreateModal(true)}
          className="order-1 md:order-2 self-end md:self-auto"
        />
      </div>

      <div className=" overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="font-bold text-gray-800">
              {selectedStudent
                ? `Applications - ${selectedStudent.name}`
                : "Applications"}
            </h2>
            <p className="text-xs text-gray-400">
              {selectedStudent
                ? `${studentApplications.length} application(s) found`
                : "Select a student to view applications"}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] md:min-w-0">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  Sr#
                </th>
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
                  <td colSpan="7" className="text-center py-8">
                    <RefreshCw size={20} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : !selectedStudent ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="text-center">
                      <Users size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">
                        Please select a student from the dropdown
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Only students with existing applications are shown
                      </p>
                    </div>
                  </td>
                </tr>
              ) : studentApplications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="text-center">
                      <FileText
                        size={40}
                        className="mx-auto text-gray-300 mb-2"
                      />
                      <p className="text-gray-500">
                        No applications found for {selectedStudent.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "New Application" to create one
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedApplications.map((app, idx) => {
                  const globalIndex = startIndex + idx + 1;
                  const appDocs = app.documents || [];
                  const pendingDocs = appDocs.filter(
                    (d) => d.status === "pending" || d.status === "review",
                  ).length;
                  const verifiedDocs = appDocs.filter(
                    (d) => d.status === "verified",
                  ).length;


                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && selectedStudent && studentApplications.length > 10 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <DocumentPreviewModal
        isOpen={showDocumentPreview}
        onClose={() => {
          setShowDocumentPreview(false);
          setCurrentAppDocuments([]);
        }}
        documents={currentAppDocuments}
        onVerify={handleVerifyDocument}
        onReject={handleRejectDocument}
        onToggleReceived={handleToggleReceived}
        isAdmin={isAdmin}
        documentTypes={documentTypes}
      />

      <ApplicationStatusModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onSuccess={() => fetchData()}
      />

      <CreateApplicationModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedStudent(null);
        }}
        onSuccess={() => {
          fetchData();
          setShowCreateModal(false);
        }}
        students={eligibleForNewApp}
        selectedStudentForCreate={selectedStudent}
      />

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

      <CounsellorDocumentModal
        isOpen={showDocModal}
        onClose={() => {
          setShowDocModal(false);
          setSelectedAppForDoc(null);
        }}
        onSuccess={() => {
          if (showDocModal) {
            fetchData();
          }
        }}
        student={selectedStudent}
        application={selectedAppForDoc}
        blockedDocTypes={existingDocTypesForSelectedApp}
        documentTypes={documentTypes}
      />
    </div>
  );
};

export default CounsellorApplication;