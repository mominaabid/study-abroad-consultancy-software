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

// ===================== SCROLL LOCK HOOK =====================
function useModalScrollLock(openStates) {
  const originalOverflowRef = useRef("");
  const originalPaddingRightRef = useRef("");
  const isLockedRef = useRef(false);

  const isAnyOpen = openStates.some((open) => open);

  useEffect(() => {
    if (isAnyOpen && !isLockedRef.current) {
      // Lock the body
      const body = document.body;
      originalOverflowRef.current = body.style.overflow;
      originalPaddingRightRef.current = body.style.paddingRight;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      body.style.paddingRight = `${scrollbarWidth}px`;
      body.style.overflow = "hidden";
      isLockedRef.current = true;
    } else if (!isAnyOpen && isLockedRef.current) {
      // Restore original styles
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
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sm:px-6">
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
          <Title setModal={onClose} className="rounded-t-2xl">
            Documents
          </Title>

          <div className="px-4 sm:px-5 pt-2 pb-3 text-xs sm:text-sm text-gray-500 border-b border-gray-100">
            {pendingDocs.length} pending, {verifiedDocs.length} verified,{" "}
            {rejectedDocs.length} rejected
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
                  const fileName =
                    doc.original_name ||
                    (fileUrl ? fileUrl.split("/").pop() : "document");

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
                          <p className="text-sm text-gray-600 break-all">
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
                        <div className="flex gap-2 self-end sm:self-start">
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
                Document: {selectedDoc?.doc_type?.replace(/_/g, " ")}
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
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden">
        <Title setModal={onClose} className="rounded-t-2xl">
          Share Document
        </Title>

        <div className="px-5 py-2 text-sm text-gray-600 bg-gray-50 border-b border-gray-100">
          <p className="font-medium break-words">Student: {student?.name}</p>
          <p className="text-xs text-gray-500 break-words">
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
                className={`w-full border ${
                  errors.doc_type ? "border-red-400" : "border-gray-200"
                } rounded-lg px-4 py-2.5 focus:border-teal-400`}
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
              className={`w-full border ${
                errors.file ? "border-red-400" : "border-gray-200"
              } rounded-lg px-4 py-2.5 focus:border-teal-400 text-sm`}
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
              } rounded-lg px-4 py-2.5 focus:border-teal-400 resize-none`}
              placeholder="Add notes for the student..."
              maxLength={255}
            />
            <div className="flex justify-between mt-1">
              {errors.notes && (
                <p className="text-red-500 text-xs">{errors.notes}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelect = (student) => {
    onSelect(student);
    setSearchTerm(student.name);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (e.target.value === "" && selectedStudent) {
      onSelect(null);
    }
  };

  const displayValue = selectedStudent ? selectedStudent.name : searchTerm;

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
                key={student.id}
                onClick={() => handleSelect(student)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="font-medium text-gray-800">{student.name}</div>
                <div className="text-xs text-gray-500 break-all">
                  {student.email}
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Scroll lock for all modals
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

  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin";

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
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when selected student changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStudent]);

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

  const studentsWithApps = useMemo(() => {
    return students.filter((s) => s.applications && s.applications.length > 0);
  }, [students]);

  const eligibleForNewApp = useMemo(() => {
    if (isAdmin) return allAssignedStudents;
    const allowedStatuses = ["new", "contacted", "counseling"];
    return allAssignedStudents.filter((s) =>
      allowedStatuses.includes(s.status?.toLowerCase()),
    );
  }, [allAssignedStudents, isAdmin]);

  const studentApplications = useMemo(() => {
    if (!selectedStudent) return [];
    return applications.filter((app) => app.student_id === selectedStudent.id);
  }, [applications, selectedStudent]);

  // Pagination logic
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
    app.documents.forEach((doc) => {
      if (doc.status !== "rejected") {
        blocked.add(doc.doc_type);
      }
    });
    return blocked;
  }, [selectedAppForDoc, applications]);

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

      {/* Applications Table - Responsive with horizontal scroll on mobile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {globalIndex}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {app.student_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 break-all">
                          {app.student_email || "No email"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm break-words">
                        {app.target_university || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm break-words">
                        {app.course || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusBadge(
                            app.status,
                          )}`}
                        >
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {pendingDocs > 0 && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {pendingDocs} pending
                            </span>
                          )}
                          {verifiedDocs > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
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
                        <div className="flex flex-wrap gap-2">
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

        {/* Pagination - Only shown when total entries > 10 */}
        {!loading && selectedStudent && studentApplications.length > 10 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
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
    </div>
  );
};

export default CounsellorApplication;
