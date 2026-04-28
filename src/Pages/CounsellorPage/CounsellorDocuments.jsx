import { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "../../Content/Url";
import {
  CheckCircle, XCircle, Clock, RefreshCw,
  FileText, Image, File, Eye, AlertTriangle,
  Users, Search, UserCircle, FolderOpen, Grid3x3, List,
  History, Calendar, Upload, UserCheck, UserX, Activity,
  Zap, RotateCcw
} from "lucide-react";
import { toast } from "react-toastify";

// ── Constants ─────────────────────────────────────────────────────────────────
const DOC_TYPE_LABELS = {
  passport: "Passport Copy",
  transcript: "Academic Transcript",
  sop: "Statement of Purpose",
  ielts: "IELTS / English Test",
  photo: "Passport Photo",
  recommendation: "Recommendation Letter",
  financial: "Financial Statement",
  cv: "CV / Resume",
  offer_letter: "Offer Letter",
  visa: "Visa Document",
  other: "Other Document",
};

const STATUS = {
  pending: { label: "Pending", icon: Clock, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  review: { label: "In Review", icon: RefreshCw, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-400", badge: "bg-blue-100 text-blue-700" },
  verified: { label: "Verified", icon: CheckCircle, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", icon: XCircle, bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-400", badge: "bg-red-100 text-red-700" },
};

function getToken() { return localStorage.getItem("token") || ""; }
function formatSize(b) { if (!b) return "—"; if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`; return `${(b / (1024 * 1024)).toFixed(1)} MB`; }
function formatDT(d) { if (!d) return "—"; return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }); }
function fileIcon(mime) { if (!mime) return <File size={18} />; if (mime.startsWith("image/")) return <Image size={18} />; if (mime === "application/pdf") return <FileText size={18} />; return <File size={18} />; }

// ── Activity Log Modal Component - Shows Complete History ─────────────────────
// ── Activity Log Modal Component - Shows COMPLETE History with All Rejections ──
function ActivityLogModal({ doc, onClose }) {
  const activities = [];
  
  // Helper to format duration
  const getDuration = (startDate, endDate) => {
    const diff = Math.abs(new Date(endDate) - new Date(startDate));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (3600000)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return 'just now';
  };

  // 1. INITIAL UPLOAD - Always show when document was first created
  if (doc.submitted_at) {
    activities.push({
      type: 'upload',
      title: ' Document Uploaded',
      description: `${doc.student_name} uploaded "${doc.original_name}"`,
      date: doc.submitted_at,
      icon: Upload,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      details: `File: ${doc.original_name} • Size: ${formatSize(doc.file_size)}`
    });
  }
  
  // 2. PROCESS STATUS HISTORY FROM BACKEND - THIS IS THE KEY PART!
  // This will show ALL previous rejections, re-uploads, and verifications
  if (doc.status_history && Array.isArray(doc.status_history) && doc.status_history.length > 0) {
    console.log('📜 Processing history entries:', doc.status_history.length); // Debug
    
    doc.status_history.forEach((event, index) => {
      console.log(`History ${index + 1}:`, event); // Debug each event
      
      if (event.action === 'rejected') {
        activities.push({
          type: 'rejected',
          title: `❌ Document Rejected ${event.review_count ? `(#${event.review_count})` : ''}`,
          description: `Document was rejected by ${event.performed_by_name || 'Counsellor'}`,
          date: event.performed_at,
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-50',
          borderColor: 'border-red-200',
          performedBy: event.performed_by_name,
          details: ` Rejection reason: "${event.rejection_reason || event.note || 'No reason provided'}"`,
          status: event.status,
          reviewNumber: event.review_count || index + 1
        });
      } 
      else if (event.action === 'verified') {
        activities.push({
          type: 'verified',
          title: `Document Verified`,
          description: `Document was approved by ${event.performed_by_name || 'Counsellor'}`,
          date: event.performed_at,
          icon: CheckCircle,
          color: 'text-emerald-500',
          bg: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          performedBy: event.performed_by_name,
          details: `Document verified and accepted`,
          status: event.status
        });
      }
      else if (event.action === 'reupload') {
        activities.push({
          type: 'reupload',
          title: `🔄 Document Re-uploaded`,
          description: `Student uploaded a new version after rejection`,
          date: event.performed_at,
          icon: RotateCcw,
          color: 'text-purple-500',
          bg: 'bg-purple-50',
          borderColor: 'border-purple-200',
          performedBy: event.performed_by_name || doc.student_name,
          details: event.note || 'Document re-uploaded for review',
          previousRejectionReason: event.previous_rejection_reason
        });
      }
    });
  }
  
  // 3. ADD CURRENT STATUS AS THE FINAL STATE
  const lastHistoryEntry = doc.status_history && doc.status_history.length > 0 
    ? doc.status_history[doc.status_history.length - 1] 
    : null;
  
  // Add current status if it's different from last history entry or if no history
  if (doc.status === 'verified' && (!lastHistoryEntry || lastHistoryEntry.action !== 'verified')) {
    activities.push({
      type: 'verified-current',
      title: ` Currently Verified`,
      description: `Document is verified and approved`,
      date: doc.reviewed_at || new Date(),
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      details: `Final status: Verified`,
      isCurrent: true
    });
  } 
  else if (doc.status === 'rejected' && (!lastHistoryEntry || lastHistoryEntry.action !== 'rejected')) {
    activities.push({
      type: 'rejected-current',
      title: ` Currently Rejected`,
      description: `Document is currently rejected and needs re-upload`,
      date: doc.reviewed_at || new Date(),
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      borderColor: 'border-red-200',
      details: ` Rejection reason: "${doc.rejection_reason}"`,
      isCurrent: true
    });
  } 
  else if (doc.status === 'review') {
    activities.push({
      type: 'review',
      title: ` Under Review`,
      description: `Document is waiting for counsellor review`,
      date: doc.submitted_at,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      details: `Document has been re-uploaded and pending review`,
      isCurrent: true
    });
  }
  
  // Sort by date (oldest first) to show proper timeline
  activities.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Get rejection count
  const rejectionCount = activities.filter(a => a.type === 'rejected' || a.type === 'rejected-current').length;
  const reuploadCount = activities.filter(a => a.type === 'reupload').length;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
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
                    {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition">
                <XCircle size={20} />
              </button>
            </div>
          </div>

          {/* Student Info with Statistics */}
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <UserCircle size={32} className="text-gray-400" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{doc.student_name}</p>
                <p className="text-xs text-gray-500">{doc.student_email}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS[doc.status]?.badge}`}>
                  {STATUS[doc.status]?.label}
                </span>
                {rejectionCount > 0 && (
                  <p className="text-[10px] text-red-500 mt-1">Rejected {rejectionCount} time{rejectionCount > 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
            
            {/* Quick Stats */}
            {(rejectionCount > 0 || reuploadCount > 0) && (
              <div className="mt-3 flex gap-2 text-[10px]">
                {rejectionCount > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                     {rejectionCount} Rejection{rejectionCount > 1 ? 's' : ''}
                  </span>
                )}
                {reuploadCount > 0 && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                     {reuploadCount} Re-upload{reuploadCount > 1 ? 's' : ''}
                  </span>
                )}
                {doc.review_count > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                     {doc.review_count} Review{doc.review_count > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Timeline Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-gray-300 to-red-400 rounded-full" />
                
                {/* Activities */}
                <div className="space-y-6">
                  {activities.map((activity, index) => {
                    const Icon = activity.icon;
                    const isLast = index === activities.length - 1;
                    const nextActivity = activities[index + 1];
                    const duration = nextActivity ? getDuration(activity.date, nextActivity.date) : null;
                    
                    // Check if this is a rejection to highlight it
                    const isRejection = activity.type === 'rejected' || activity.type === 'rejected-current';
                    
                    return (
                      <div key={index} className="relative group">
                        {/* Timeline dot */}
                        <div className={`absolute left-0 top-0 w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center ring-4 ring-white shadow-md z-10 transition-transform group-hover:scale-110 ${activity.isCurrent ? 'ring-2 ring-teal-400 shadow-lg' : ''} ${isRejection ? 'ring-2 ring-red-200' : ''}`}>
                          <Icon size={16} className={activity.color} />
                        </div>
                        
                        {/* Content card */}
                        <div className={`ml-12 rounded-xl p-4 transition-all ${activity.isCurrent ? 'bg-teal-50 border-2 border-teal-200 shadow-md' : isRejection ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-bold text-sm ${activity.isCurrent ? 'text-teal-700' : isRejection ? 'text-red-700' : 'text-gray-800'}`}>
                                  {activity.title}
                                </h4>
                                {activity.isCurrent && (
                                  <span className="text-[10px] bg-teal-200 text-teal-800 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                                    Current
                                  </span>
                                )}
                                {activity.performedBy && !activity.isCurrent && (
                                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                    by {activity.performedBy}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.description}
                              </p>
                              {activity.details && (
                                <div className={`mt-2 p-2 rounded-lg ${isRejection ? 'bg-red-100' : 'bg-gray-50'}`}>
                                  <p className="text-xs text-gray-700">
                                    <span className="font-medium">{isRejection ? '🔴' : ''} Details:</span> {activity.details}
                                  </p>
                                </div>
                              )}
                              {activity.previousRejectionReason && (
                                <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <p className="text-xs text-yellow-700">
                                    <span className="font-medium">⚠️ Previous rejection reason:</span> {activity.previousRejectionReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3 text-xs">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-gray-500">{formatDT(activity.date)}</span>
                          </div>
                          
                    
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Summary Stats */}
         
          </div>

          {/* Footer with file info */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                {fileIcon(doc.file_mime)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{doc.original_name}</p>
                <p className="text-xs text-gray-400">{formatSize(doc.file_size)}</p>
              </div>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition flex items-center gap-1"
              >
                <Eye size={12} /> View
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({ doc, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle size={20} className="text-red-600" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg">Reject Document</h3>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Rejecting <strong className="text-gray-700">{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</strong> from <strong className="text-gray-700">{doc.student_name}</strong>
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Why is this document being rejected? (e.g., blurry, incomplete, wrong document, expired)"
          rows={4}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 resize-none"
        />
        <div className="flex gap-3 mt-5">
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

// ── Student Tab Component ─────────────────────────────────────────────────────
function StudentTab({ student, isActive, onClick, counts }) {
  return (
    <button onClick={onClick} className={`relative w-full px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-left ${isActive ? 'bg-white shadow-lg border border-gray-100 text-gray-800' : 'hover:bg-white/60 text-gray-500 hover:text-gray-700'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
        <UserCircle size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{student.name}</p>
        <p className="text-xs text-gray-400 truncate">{student.email}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {counts.pending > 0 && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">{counts.pending}</span>}
        {counts.review > 0 && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">{counts.review}</span>}
        {counts.verified > 0 && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">{counts.verified}</span>}
        {counts.rejected > 0 && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">{counts.rejected}</span>}
      </div>
      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-500 rounded-full" />}
    </button>
  );
}

// ── Document Row in Table ─────────────────────────────────────────────────────
function DocumentRow({ doc, onVerify, onReject, onViewHistory, verifying, rejecting }) {
  const s = STATUS[doc.status] || STATUS.pending;
  const Icon = s.icon;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            {fileIcon(doc.file_mime)}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm capitalize">
              {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{doc.original_name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${s.dot} ${doc.status === "review" ? "animate-pulse" : ""}`} />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
            {s.label}
          </span>
          {doc.status === "review" && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Re-uploaded</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">{formatDT(doc.submitted_at)}</td>
      <td className="px-4 py-3 text-xs text-gray-500">{doc.reviewed_at ? formatDT(doc.reviewed_at) : '—'}</td>
      <td className="px-4 py-3 max-w-[250px]">
        {doc.status === "rejected" && doc.rejection_reason && (
          <div className="flex items-start gap-1">
            <AlertTriangle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600 line-clamp-2">{doc.rejection_reason}</p>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <button onClick={() => onViewHistory(doc)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition" title="View History">
            <History size={15} />
          </button>
          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition" title="View Document">
            <Eye size={15} />
          </a>
          {doc.status !== "verified" && (
            <button onClick={() => onVerify(doc.id)} disabled={verifying === doc.id} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition" title="Verify">
              {verifying === doc.id ? <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={15} />}
            </button>
          )}
          {doc.status !== "rejected" && doc.status !== "verified" && (
            <button onClick={() => onReject(doc)} disabled={rejecting === doc.id} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition" title="Reject">
              <XCircle size={15} />
            </button>
          )}
          {doc.status === "verified" && <span className="p-1.5 text-emerald-400"><CheckCircle size={15} /></span>}
        </div>
      </td>
    </tr>
  );
}

// ── Document Grid Card ─────────────────────────────────────────────────────────
function DocumentGridCard({ doc, onVerify, onReject, onViewHistory, verifying, rejecting }) {
  const s = STATUS[doc.status] || STATUS.pending;
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            {fileIcon(doc.file_mime)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm capitalize">{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</p>
            <p className="text-xs text-gray-400 truncate">{doc.original_name}</p>
          </div>
        </div>
        <button onClick={() => onViewHistory(doc)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition" title="View History">
          <History size={15} />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
        <span className="text-xs text-gray-400">{formatSize(doc.file_size)}</span>
      </div>
      {doc.status === "rejected" && doc.rejection_reason && (
        <div className="mt-2 p-2 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600 line-clamp-2">{doc.rejection_reason}</p>
        </div>
      )}
      <div className="flex gap-2 mt-3">
        <a href={doc.file_url} target="_blank" className="text-teal-600 text-xs hover:underline flex items-center gap-1"><Eye size={12} /> View</a>
        {doc.status !== "verified" && (
          <button onClick={() => onVerify(doc.id)} className="text-emerald-600 text-xs hover:underline flex items-center gap-1"><CheckCircle size={12} /> Verify</button>
        )}
        {doc.status !== "rejected" && doc.status !== "verified" && (
          <button onClick={() => onReject(doc)} className="text-red-600 text-xs hover:underline flex items-center gap-1"><XCircle size={12} /> Reject</button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CounsellorDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [verifying, setVerifying] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectDoc, setRejectDoc] = useState(null);
  const [selectedDocForHistory, setSelectedDocForHistory] = useState(null);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/counsellor/documents/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch docs error:", err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const updateDocumentInState = (docId, updates) => {
    setDocuments(prevDocs => prevDocs.map(doc => doc.id === docId ? { ...doc, ...updates } : doc));
  };

  async function handleVerify(docId) {
    const docToVerify = documents.find(doc => doc.id === docId);
    if (!docToVerify) return;

    setVerifying(docId);
    updateDocumentInState(docId, {
      status: 'verified',
      reviewed_at: new Date().toISOString(),
    });

    try {
      const res = await fetch(`${BASE_URL}/counsellor/documents/${docId}/verify`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        updateDocumentInState(docId, { status: docToVerify.status });
        throw new Error(errorData.message || 'Verification failed');
      }
      
      toast.success("Document verified successfully!");
      await fetchDocs();
      
    } catch (err) {
      console.error('Verify error:', err);
      toast.error(err.message || "Failed to verify.");
      updateDocumentInState(docId, { status: docToVerify.status });
    } finally {
      setVerifying(null);
    }
  }

  async function handleReject(docId, reason) {
    const docToReject = documents.find(doc => doc.id === docId);
    if (!docToReject) return;

    setRejecting(docId);
    updateDocumentInState(docId, {
      status: 'rejected',
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
    });

    try {
      const res = await fetch(`${BASE_URL}/counsellor/documents/${docId}/reject`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        updateDocumentInState(docId, { status: docToReject.status, rejection_reason: null });
        throw new Error(errorData.message || 'Rejection failed');
      }
      
      toast.success("Document rejected. Student notified.");
      setRejectDoc(null);
      await fetchDocs();
      
    } catch (err) {
      console.error('Reject error:', err);
      toast.error(err.message || "Failed to reject.");
      updateDocumentInState(docId, { status: docToReject.status, rejection_reason: null });
    } finally {
      setRejecting(null);
    }
  }

  // Group documents by student
  const studentsMap = documents.reduce((acc, doc) => {
    if (!acc[doc.student_id]) {
      acc[doc.student_id] = {
        id: doc.student_id,
        name: doc.student_name,
        email: doc.student_email,
        documents: [],
      };
    }
    acc[doc.student_id].documents.push(doc);
    return acc;
  }, {});

  const students = Object.values(studentsMap);
  
  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    } else if (selectedStudent) {
      const updatedStudent = students.find(s => s.id === selectedStudent.id);
      if (updatedStudent) {
        setSelectedStudent(updatedStudent);
      }
    }
  }, [documents, selectedStudent, students]);

  const studentDocs = selectedStudent ? selectedStudent.documents : [];
  
  const filteredDocs = studentDocs.filter(doc => {
    const matchStatus = filterStatus === "all" || doc.status === filterStatus;
    const matchSearch = searchTerm === "" || 
      DOC_TYPE_LABELS[doc.doc_type]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.original_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStudentCounts = (studentDocs) => {
    return {
      pending: studentDocs.filter(d => d.status === "pending").length,
      review: studentDocs.filter(d => d.status === "review").length,
      verified: studentDocs.filter(d => d.status === "verified").length,
      rejected: studentDocs.filter(d => d.status === "rejected").length,
      total: studentDocs.length,
    };
  };

  const overallStats = {
    total: documents.length,
    pending: documents.filter(d => d.status === "pending").length,
    review: documents.filter(d => d.status === "review").length,
    verified: documents.filter(d => d.status === "verified").length,
    rejected: documents.filter(d => d.status === "rejected").length,
    students: students.length,
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-teal-900 text-white rounded-3xl p-7 shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative">
            <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-1">Document Management</p>
            <h1 className="text-2xl font-bold">Student Documents</h1>
            <p className="text-blue-200 text-sm mt-1">Review and verify documents submitted by your students</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">{overallStats.students}</p>
          <p className="text-xs text-gray-500 font-medium">Students</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 cursor-pointer hover:shadow-md transition" onClick={() => setFilterStatus("pending")}>
          <p className="text-2xl font-bold text-amber-700">{overallStats.pending}</p>
          <p className="text-xs text-amber-600 font-medium">Pending</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 cursor-pointer hover:shadow-md transition" onClick={() => setFilterStatus("review")}>
          <p className="text-2xl font-bold text-blue-700">{overallStats.review}</p>
          <p className="text-xs text-blue-600 font-medium">In Review</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 cursor-pointer hover:shadow-md transition" onClick={() => setFilterStatus("verified")}>
          <p className="text-2xl font-bold text-emerald-700">{overallStats.verified}</p>
          <p className="text-xs text-emerald-600 font-medium">Verified</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 cursor-pointer hover:shadow-md transition" onClick={() => setFilterStatus("rejected")}>
          <p className="text-2xl font-bold text-red-700">{overallStats.rejected}</p>
          <p className="text-xs text-red-600 font-medium">Rejected</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-2xl font-bold text-purple-700">{overallStats.total}</p>
          <p className="text-xs text-purple-600 font-medium">Total Docs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <Users size={16} className="text-teal-500" />
                Students ({students.length})
              </h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {students.map(student => {
                const counts = getStudentCounts(student.documents);
                return <StudentTab key={student.id} student={student} isActive={selectedStudent?.id === student.id} onClick={() => setSelectedStudent(student)} counts={counts} />;
              })}
              {students.length === 0 && (
                <div className="p-8 text-center">
                  <FolderOpen size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">No students found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <FileText size={16} className="text-teal-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">{selectedStudent?.name}'s Documents</h2>
                    <p className="text-xs text-gray-400">{selectedStudent?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search documents..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-teal-400 w-48" />
                  </div>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    <button onClick={() => setViewMode("table")} className={`p-1.5 px-3 text-xs font-medium transition ${viewMode === "table" ? "bg-teal-600 text-white" : "bg-white text-gray-600"}`}><List size={14} /></button>
                    <button onClick={() => setViewMode("grid")} className={`p-1.5 px-3 text-xs font-medium transition ${viewMode === "grid" ? "bg-teal-600 text-white" : "bg-white text-gray-600"}`}><Grid3x3 size={14} /></button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {["all", "pending", "review", "verified", "rejected"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${filterStatus === s ? "bg-teal-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {s === "all" ? "All" : STATUS[s]?.label}
                    {s !== "all" && <span className="ml-1.5 opacity-75">({studentDocs.filter(d => d.status === s).length})</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" /></div>
            ) : !selectedStudent ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Users size={28} className="text-gray-400" /></div>
                <p className="text-gray-500 font-semibold">Select a student</p>
                <p className="text-gray-400 text-sm mt-1">Choose a student from the left sidebar</p>
              </div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Document</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Submitted</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Reviewed</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Rejection Reason</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredDocs.length === 0 ? (
                      <tr><td colSpan="6" className="px-4 py-12 text-center"><div className="flex flex-col items-center"><FileText size={32} className="text-gray-300 mb-2" /><p className="text-gray-400 text-sm">No documents found</p></div></td></tr>
                    ) : (
                      filteredDocs.map(doc => <DocumentRow key={doc.id} doc={doc} onVerify={handleVerify} onReject={setRejectDoc} onViewHistory={setSelectedDocForHistory} verifying={verifying} rejecting={rejecting} />)
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                  {filteredDocs.length === 0 ? (
                    <div className="col-span-full p-12 text-center"><FileText size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-400 text-sm">No documents found</p></div>
                  ) : (
                    filteredDocs.map(doc => <DocumentGridCard key={doc.id} doc={doc} onVerify={handleVerify} onReject={setRejectDoc} onViewHistory={setSelectedDocForHistory} verifying={verifying} rejecting={rejecting} />)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {rejectDoc && <RejectModal doc={rejectDoc} onConfirm={handleReject} onCancel={() => setRejectDoc(null)} />}
      {selectedDocForHistory && <ActivityLogModal doc={selectedDocForHistory} onClose={() => setSelectedDocForHistory(null)} />}
    </div>
  );
}