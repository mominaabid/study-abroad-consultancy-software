import { useState, useEffect, useCallback } from "react";
import { BASE_URL }  from "../../Content/Url";
import {
  CheckCircle, XCircle, Clock, RefreshCw,
  FileText, Image, File, Eye, AlertTriangle,
  Users, Filter,
} from "lucide-react";
import { toast } from "react-toastify";

// ── Constants ─────────────────────────────────────────────────────────────────
const DOC_TYPE_LABELS = {
  passport:       "Passport Copy",
  transcript:     "Academic Transcript",
  sop:            "Statement of Purpose",
  ielts:          "IELTS / English Test",
  photo:          "Passport Photo",
  recommendation: "Recommendation Letter",
  financial:      "Financial Statement",
  cv:             "CV / Resume",
  other:          "Other Document",
};

const STATUS = {
  pending:  { label: "Pending",   icon: Clock,       bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-700"   },
  review:   { label: "In Review", icon: RefreshCw,   bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-400",    badge: "bg-blue-100 text-blue-700"     },
  verified: { label: "Verified",  icon: CheckCircle, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700"},
  rejected: { label: "Rejected",  icon: XCircle,     bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-400",     badge: "bg-red-100 text-red-700"       },
};

function getToken()    { return localStorage.getItem("token") || ""; }
function formatSize(b) { if (!b) return "—"; if (b < 1024 * 1024) return `${(b/1024).toFixed(1)} KB`; return `${(b/(1024*1024)).toFixed(1)} MB`; }
function formatDT(d)   { if (!d) return "—"; return new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true }); }
function fileIcon(mime){ if (!mime) return <File size={18}/>; if (mime.startsWith("image/")) return <Image size={18}/>; if (mime==="application/pdf") return <FileText size={18}/>; return <File size={18}/>; }

// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({ doc, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="font-bold text-gray-800 text-lg mb-1">Reject Document</h3>
        <p className="text-gray-500 text-sm mb-4">
          Rejecting <strong>{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</strong> from <strong>{doc.student_name}</strong>.
          Please provide a clear reason.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Document is blurry, please re-upload a clearer scan..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 h-10 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(doc.id, reason)}
            disabled={!reason.trim()}
            className="flex-1 h-10 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition"
          >
            Reject Document
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Document Row Card ─────────────────────────────────────────────────────────
function DocRow({ doc, onVerify, onReject, verifying, rejecting }) {
  const s    = STATUS[doc.status] || STATUS.pending;
  const Icon = s.icon;

  return (
    <div className={`bg-white rounded-2xl border ${s.border} shadow-sm overflow-hidden`}>

      {/* Top bar */}
      <div className={`px-5 py-2.5 ${s.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${s.dot} ${doc.status === "review" ? "animate-pulse" : ""}`} />
          <span className={`text-xs font-bold ${s.text} uppercase tracking-wider`}>{s.label}</span>
          {doc.status === "review" && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
              Re-submitted
            </span>
          )}
        </div>
        <Icon size={13} className={s.text} />
      </div>

      <div className="p-5">
        {/* Student + Doc info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
            {fileIcon(doc.file_mime)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-800 text-sm capitalize">
                {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.original_name}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Users size={10} /> {doc.student_name}
              </span>
              <span className="text-xs text-gray-400">{formatSize(doc.file_size)}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-1.5 border-t border-gray-50 pt-3 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Submitted</span>
            <span className="text-gray-600 font-medium">{formatDT(doc.submitted_at)}</span>
          </div>
          {doc.reviewed_at && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Last reviewed</span>
              <span className="text-gray-600 font-medium">{formatDT(doc.reviewed_at)}</span>
            </div>
          )}
        </div>

        {/* Rejection reason */}
        {doc.status === "rejected" && doc.rejection_reason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1.5">
              <AlertTriangle size={11} /> Previous Rejection Reason
            </p>
            <p className="text-xs text-red-700 leading-relaxed">{doc.rejection_reason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {/* View file */}
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 h-8 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
          >
            <Eye size={12} /> View
          </a>

          {/* Verify */}
          {doc.status !== "verified" && (
            <button
              onClick={() => onVerify(doc.id)}
              disabled={verifying === doc.id}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 transition"
            >
              {verifying === doc.id ? (
                <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><CheckCircle size={12} /> Verify</>
              )}
            </button>
          )}

          {/* Reject */}
          {doc.status !== "rejected" && doc.status !== "verified" && (
            <button
              onClick={() => onReject(doc)}
              disabled={rejecting === doc.id}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 disabled:opacity-60 transition"
            >
              <XCircle size={12} /> Reject
            </button>
          )}

          {/* Verified badge */}
          {doc.status === "verified" && (
            <div className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-200">
              <CheckCircle size={12} /> Verified
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CounsellorDocuments() {
  const [documents,    setDocuments]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStudent,setFilterStudent]= useState("all");
  const [verifying,    setVerifying]    = useState(null);
  const [rejecting,    setRejecting]    = useState(null);
  const [rejectDoc,    setRejectDoc]    = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchDocs = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE_URL}/counsellor/documents/all`, {
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

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // ── Verify ───────────────────────────────────────────────────────────────
  async function handleVerify(docId) {
    setVerifying(docId);
    try {
      const res = await fetch(`${BASE_URL}/counsellor/documents/${docId}/verify`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Document verified!");
      await fetchDocs();
    } catch (err) {
      toast.error(err.message || "Failed to verify.");
    } finally {
      setVerifying(null);
    }
  }

  // ── Reject ───────────────────────────────────────────────────────────────
  async function handleReject(docId, reason) {
    setRejecting(docId);
    try {
      const res = await fetch(`${BASE_URL}/counsellor/documents/${docId}/reject`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Document rejected. Student notified.");
      setRejectDoc(null);
      await fetchDocs();
    } catch (err) {
      toast.error(err.message || "Failed to reject.");
    } finally {
      setRejecting(null);
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────
  const students = [...new Set(documents.map(d => d.student_name))].filter(Boolean);

  const filtered = documents.filter(d => {
    const matchStatus  = filterStatus  === "all" || d.status       === filterStatus;
    const matchStudent = filterStudent === "all" || d.student_name === filterStudent;
    return matchStatus && matchStudent;
  });

  const counts = {
    pending:  documents.filter(d => d.status === "pending").length,
    review:   documents.filter(d => d.status === "review").length,
    verified: documents.filter(d => d.status === "verified").length,
    rejected: documents.filter(d => d.status === "rejected").length,
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <div className="bg-blue-950 text-white rounded-3xl p-7 shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="relative">
            <p className="text-purple-300 text-xs font-semibold uppercase tracking-widest mb-1">
              Document Review
            </p>
            <h1 className="text-2xl font-bold">Student Documents</h1>
            <p className="text-blue-200 text-sm mt-1">
              Review and verify documents submitted by your students
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { key: "pending",  label: "Pending",   color: "#f59e0b", bg: "bg-amber-50",   text: "text-amber-700"   },
          { key: "review",   label: "In Review", color: "#3b82f6", bg: "bg-blue-50",    text: "text-blue-700"    },
          { key: "verified", label: "Verified",  color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700" },
          { key: "rejected", label: "Rejected",  color: "#ef4444", bg: "bg-red-50",     text: "text-red-700"     },
        ].map(s => (
          <div
            key={s.key}
            onClick={() => setFilterStatus(s.key)}
            className={`${s.bg} rounded-2xl p-4 cursor-pointer border-2 transition-all
              ${filterStatus === s.key ? "border-current shadow-md" : "border-white"}`}
            style={{ borderColor: filterStatus === s.key ? s.color : undefined }}
          >
            <p className={`text-2xl font-bold ${s.text}`}>{counts[s.key]}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "review", "verified", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                ${filterStatus === s
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-teal-300"
                }`}
            >
              {s === "all" ? "All" : STATUS[s]?.label}
            </button>
          ))}
        </div>

        {/* Student filter */}
        {students.length > 1 && (
          <select
            value={filterStudent}
            onChange={e => setFilterStudent(e.target.value)}
            className="ml-auto px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 outline-none focus:border-teal-400 cursor-pointer"
          >
            <option value="all">All Students</option>
            {students.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* Document grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-dashed border-gray-200">
            <FileText size={22} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold text-sm">No documents found</p>
          <p className="text-gray-400 text-xs mt-1">Try a different filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <DocRow
              key={doc.id}
              doc={doc}
              onVerify={handleVerify}
              onReject={setRejectDoc}
              verifying={verifying}
              rejecting={rejecting}
            />
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectDoc && (
        <RejectModal
          doc={rejectDoc}
          onConfirm={handleReject}
          onCancel={() => setRejectDoc(null)}
        />
      )}
    </div>
  );
}