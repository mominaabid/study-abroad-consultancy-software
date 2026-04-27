import { useState, useEffect, useRef, useCallback } from "react";
// import { useSelector } from "react-redux";
// import { selectUser }  from "../../redux/slices/authSlice";
import { BASE_URL } from "../../Content/Url";
import {
  Upload,
  FileText,
  Image,
  File,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Download,
  RefreshCw,
  Eye,
  ChevronDown,
  History,
  UserCheck,
  UserX,
  Calendar,
  ChevronRight,
  Activity,
} from "lucide-react";
import { toast } from "react-toastify";

// ── Doc types ─────────────────────────────────────────────────────────────────
const DOC_TYPES = [
  { key: "passport", label: "Passport Copy", required: true },
  { key: "transcript", label: "Academic Transcript", required: true },
  { key: "sop", label: "Statement of Purpose", required: true },
  { key: "ielts", label: "IELTS / English Test", required: true },
  { key: "photo", label: "Passport Photo", required: true },
  { key: "recommendation", label: "Recommendation Letter", required: false },
  { key: "financial", label: "Financial Statement", required: false },
  { key: "cv", label: "CV / Resume", required: false },
  { key: "other", label: "Other Document", required: false },
];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  review: {
    label: "In Review",
    icon: RefreshCw,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  verified: {
    label: "Verified",
    icon: CheckCircle,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("token") || "";
}

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getFileIcon(mime) {
  if (!mime) return <File size={20} />;
  if (mime.startsWith("image/")) return <Image size={20} />;
  if (mime === "application/pdf") return <FileText size={20} />;
  return <File size={20} />;
}

// ── Activity Log Component ───────────────────────────────────────────────────
function ActivityLog({ doc, isOpen, onClose }) {
  if (!isOpen) return null;

  // Build activity timeline based on document status and data
  const activities = [];

  // Upload activity
  if (doc.submitted_at) {
    activities.push({
      type: "upload",
      title: "Document Uploaded",
      description: `You uploaded ${doc.original_name}`,
      date: doc.submitted_at,
      icon: Upload,
      color: "text-blue-500",
      bg: "bg-blue-50",
    });
  }

  // Review activity (if document was reviewed)
  if (doc.reviewed_at) {
    if (doc.status === "verified") {
      activities.push({
        type: "verified",
        title: "Document Verified",
        description: "Your document has been verified and approved",
        date: doc.reviewed_at,
        icon: CheckCircle,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
      });
    } else if (doc.status === "rejected" && doc.rejection_reason) {
      activities.push({
        type: "rejected",
        title: "Document Rejected",
        description: `Reason: ${doc.rejection_reason}`,
        date: doc.reviewed_at,
        icon: XCircle,
        color: "text-red-500",
        bg: "bg-red-50",
      });
    }
  }

  // Add re-upload activity if status is review (means it was re-uploaded after rejection)
  if (doc.status === "review" && doc.submitted_at) {
    // Check if there was a rejection before
    if (doc.rejection_reason) {
      activities.push({
        type: "reupload",
        title: "Document Re-uploaded",
        description: "You re-uploaded the document after rejection",
        date: doc.submitted_at,
        icon: RefreshCw,
        color: "text-purple-500",
        bg: "bg-purple-50",
      });
    }
  }

  // Sort activities by date (oldest first)
  activities.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out animate-slide-in">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-950 to-teal-900 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <History size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Document Timeline</h3>
                  <p className="text-xs text-blue-200 opacity-90">
                    {DOC_TYPES.find((t) => t.key === doc.doc_type)?.label ||
                      doc.doc_type}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No activity yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Activity log will appear here
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* Activities */}
                <div className="space-y-6">
                  {activities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="relative pl-12">
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-0 top-0 w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center ring-4 ring-white`}
                        >
                          <Icon size={16} className={activity.color} />
                        </div>

                        {/* Content */}
                        <div className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm">
                                {activity.title}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">
                                {activity.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                            <Calendar size={12} />
                            <span>{formatDateTime(activity.date)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer with document info */}
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                {getFileIcon(doc.file_mime)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {doc.original_name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatSize(doc.file_size)}
                </p>
              </div>
              <a
                href={doc.file_url}
                target="_blank"
                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition flex items-center gap-1"
              >
                <Eye size={12} /> View
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// ── Upload Zone Component ─────────────────────────────────────────────────────
function UploadZone({ docType, onUpload, uploading }) {
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState(null);
  const [localType, setLocalType] = useState(docType || "");
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelected(file);
  }

  function handleChange(e) {
    const file = e.target.files[0];
    if (file) setSelected(file);
  }

  async function handleSubmit() {
    if (!selected || !localType) {
      toast.error("Please select a document type and file.");
      return;
    }
    await onUpload(selected, localType);
    setSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
        <Upload size={15} className="text-teal-500" />
        Upload New Document
      </h3>

      <div className="relative mb-3">
        <select
          value={localType}
          onChange={(e) => setLocalType(e.target.value)}
          className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 cursor-pointer"
        >
          <option value="">Select document type...</option>
          {DOC_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label} {t.required ? "(Required)" : "(Optional)"}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200
          ${
            dragOver
              ? "border-teal-400 bg-teal-50"
              : selected
                ? "border-teal-300 bg-teal-50/50"
                : "border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50/30"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          onChange={handleChange}
        />

        {selected ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 flex-shrink-0">
              {getFileIcon(selected.type)}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {selected.name}
              </p>
              <p className="text-xs text-gray-400">
                {formatSize(selected.size)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelected(null);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <XCircle size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Upload size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">
              Drop file here or <span className="text-teal-600">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOC, DOCX, JPG, PNG, WEBP · Max 5MB
            </p>
          </>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected || !localType || uploading}
        className="w-full mt-3 h-10 bg-teal-600 text-white rounded-xl text-sm font-semibold
          hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all
          flex items-center justify-center gap-2 shadow-sm shadow-teal-200"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={15} />
            Upload Documents
          </>
        )}
      </button>
    </div>
  );
}

// ── Document Card with Activity Log Button ────────────────────────────────────
function DocCard({ doc, onDelete, onReupload, onViewHistory }) {
  const s = STATUS[doc.status] || STATUS.pending;
  const Icon = s.icon;
  const isRejected = doc.status === "rejected";
  const canDelete = ["pending", "rejected"].includes(doc.status);

  return (
    <div
      className={`bg-white rounded-2xl border ${s.border} shadow-sm overflow-hidden transition-all hover:shadow-md`}
    >
      <div className={`px-5 py-3 ${s.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2 h-2 rounded-full ${s.dot} ${doc.status === "review" ? "animate-pulse" : ""}`}
          />
          <span
            className={`text-xs font-bold ${s.text} uppercase tracking-wider`}
          >
            {s.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewHistory(doc)}
            className="p-1 hover:bg-white/50 rounded-lg transition"
            title="View History"
          >
            <History size={14} className="text-gray-500" />
          </button>
          <Icon size={14} className={s.text} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 flex-shrink-0 border border-gray-100">
            {getFileIcon(doc.file_mime)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm capitalize leading-tight">
              {DOC_TYPES.find((t) => t.key === doc.doc_type)?.label ||
                doc.doc_type}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {doc.original_name}
            </p>
            <p className="text-xs text-gray-400">{formatSize(doc.file_size)}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-gray-500 border-t border-gray-50 pt-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Submitted</span>
            <span className="font-medium text-gray-600">
              {formatDateTime(doc.submitted_at)}
            </span>
          </div>
          {doc.reviewed_at && (
            <div className="flex justify-between">
              <span className="text-gray-400">Reviewed</span>
              <span className="font-medium text-gray-600">
                {formatDateTime(doc.reviewed_at)}
              </span>
            </div>
          )}
        </div>

        {isRejected && doc.rejection_reason && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1.5">
              <AlertTriangle size={12} /> Rejection Reason
            </p>
            <p className="text-xs text-red-700 leading-relaxed">
              {doc.rejection_reason}
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 h-8 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
          >
            <Eye size={12} /> View
          </a>

          {isRejected && (
            <button
              onClick={() => onReupload(doc.doc_type)}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
            >
              <RefreshCw size={12} /> Re-upload
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(doc)}
              className="w-8 h-8 flex items-center justify-center border border-red-100 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reuploadType, setReuploadType] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedDocForHistory, setSelectedDocForHistory] = useState(null);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/student/documents`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch docs error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // const updateDocumentInState = (docId, updates) => {
  //   setDocuments(prevDocs =>
  //     prevDocs.map(doc => doc.id === docId ? { ...doc, ...updates } : doc)
  //   );
  // };

  const addDocumentToState = (newDoc) => {
    setDocuments((prevDocs) => [newDoc, ...prevDocs]);
  };

  const removeDocumentFromState = (docId) => {
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== docId));
  };

  async function handleUpload(file, docType) {
    setUploading(true);

    const optimisticDoc = {
      id: `temp-${Date.now()}`,
      doc_type: docType,
      status: "pending",
      original_name: file.name,
      file_size: file.size,
      file_mime: file.type,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      rejection_reason: null,
      file_url: null,
    };

    addDocumentToState(optimisticDoc);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);

      const res = await fetch(`${BASE_URL}/student/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      removeDocumentFromState(optimisticDoc.id);
      if (data.document) {
        addDocumentToState({
          ...data.document,
          file_url: data.document.file_url,
          submitted_at: data.document.submitted_at,
        });
      }

      toast.success("Document uploaded successfully!");
      setReuploadType("");
    } catch (err) {
      removeDocumentFromState(optimisticDoc.id);
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc) {
    removeDocumentFromState(doc.id);
    setDeleteConfirm(null);

    try {
      const res = await fetch(`${BASE_URL}/student/documents/${doc.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Document deleted.");
    } catch (err) {
      addDocumentToState(doc);
      toast.error(err.message || "Delete failed.");
    }
  }

  const handleReupload = (docType) => {
    setReuploadType(docType);
    document
      .getElementById("upload-zone")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const verified = documents.filter((d) => d.status === "verified").length;
  const pending = documents.filter((d) => d.status === "pending").length;
  const rejected = documents.filter((d) => d.status === "rejected").length;
  const review = documents.filter((d) => d.status === "review").length;

  const filtered =
    filterStatus === "all"
      ? documents
      : documents.filter((d) => d.status === filterStatus);

  // const uploadedTypes = new Set(documents.map(d => d.doc_type));

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-950 to-teal-900 text-white rounded-3xl p-7 shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative">
            <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-1">
              Documents
            </p>
            <h1 className="text-2xl font-bold">My Documents</h1>
            <p className="text-blue-200 text-sm mt-1">
              Upload and track all required documents for your application
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Verified",
            count: verified,
            status: "verified",
            color: "#10b981",
            bg: "bg-emerald-50",
            text: "text-emerald-700",
          },
          {
            label: "Pending",
            count: pending,
            status: "pending",
            color: "#f59e0b",
            bg: "bg-amber-50",
            text: "text-amber-700",
          },
          {
            label: "In Review",
            count: review,
            status: "review",
            color: "#3b82f6",
            bg: "bg-blue-50",
            text: "text-blue-700",
          },
          {
            label: "Rejected",
            count: rejected,
            status: "rejected",
            color: "#ef4444",
            bg: "bg-red-50",
            text: "text-red-700",
          },
        ].map((s) => (
          <div
            key={s.label}
            onClick={() => setFilterStatus(s.status)}
            className={`${s.bg} rounded-2xl p-4 border-2 transition-all cursor-pointer hover:shadow-md
              ${filterStatus === s.status ? "border-current shadow-md" : "border-white"}`}
            style={{
              borderColor: filterStatus === s.status ? s.color : undefined,
            }}
          >
            <p className={`text-2xl font-bold ${s.text}`}>{s.count}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload + Checklist */}
        <div className="space-y-5">
          <div id="upload-zone">
            <UploadZone
              docType={reuploadType}
              onUpload={handleUpload}
              uploading={uploading}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <CheckCircle size={15} className="text-teal-500" />
              Required Documents
            </h3>
            <div className="space-y-2">
              {DOC_TYPES.filter((t) => t.required).map((t) => {
                const uploaded = documents.find((d) => d.doc_type === t.key);
                const s = uploaded ? STATUS[uploaded.status] : null;
                return (
                  <div
                    key={t.key}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0
                        ${!uploaded ? "bg-gray-200" : s?.dot}`}
                      />
                      <span className="text-xs font-medium text-gray-700">
                        {t.label}
                      </span>
                    </div>
                    {uploaded ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s?.bg} ${s?.text}`}
                      >
                        {s?.label}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium">
                        Not uploaded
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Document list */}
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "pending", "review", "verified", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all
                  ${
                    filterStatus === s
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-teal-300"
                  }`}
              >
                {s === "all" ? "All" : STATUS[s]?.label}
                {s !== "all" && (
                  <span className="ml-1.5 opacity-70">
                    ({documents.filter((d) => d.status === s).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-dashed border-gray-200">
                <FileText size={22} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold text-sm">
                {filterStatus === "all"
                  ? "No documents uploaded yet"
                  : `No ${STATUS[filterStatus]?.label} documents`}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {filterStatus === "all"
                  ? "Use the upload panel to add your documents"
                  : "Try a different filter"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  onDelete={setDeleteConfirm}
                  onReupload={handleReupload}
                  onViewHistory={setSelectedDocForHistory}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">
                Delete Document?
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Delete{" "}
                <strong>
                  {
                    DOC_TYPES.find((t) => t.key === deleteConfirm.doc_type)
                      ?.label
                  }
                </strong>
                ? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-10 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 h-10 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {selectedDocForHistory && (
        <ActivityLog
          doc={selectedDocForHistory}
          isOpen={true}
          onClose={() => setSelectedDocForHistory(null)}
        />
      )}
    </div>
  );
}
