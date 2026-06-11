import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";
import {
  FileText,
  CheckCircle,
  Clock,
  MessageSquare,
  Upload,
  ChevronRight,
  Calendar,
  Globe,
  BookOpen,
  Award,
  AlertCircle,
  Sparkles,
  XCircle,
  RefreshCw,
  Eye,
  Download,
} from "lucide-react";
import { GraduationCap } from "lucide-react";
import useSSE from "../../redux/hooks/useSSE";

import { BASE_URL } from "../../Content/Url";

// ── helpers ───────────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("token") || "";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Stage pipeline config (unchanged) ────────────────────────────────────────
const STAGES = [
  { key: "new", label: "Inquiry", color: "#3b82f6" },
  { key: "contacted", label: "Contacted", color: "#f59e0b" },
  { key: "counseling", label: "Counseling", color: "#8b5cf6" },
  { key: "applied", label: "Applied", color: "#06b6d4" },
  { key: "visa", label: "Visa", color: "#ec4899" },
  { key: "success", label: "Enrolled", color: "#10b981" },
];

const DOC_STATUS = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Pending",
    dot: "bg-amber-400",
  },
  review: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "In Review",
    dot: "bg-blue-400",
  },
  verified: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Verified",
    dot: "bg-emerald-400",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Rejected",
    dot: "bg-red-400",
  },
};

// ── Sub-components (StatCard, DocCard) with consistent spacing ──
const StatCard = ({
  title,
  value,
  icon,
  gradient,
  sub,
  onClick,
  clickable,
  alert,
}) => (
  <div
    onClick={onClick}
    className={`relative group bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100
      transition-all duration-300 overflow-hidden
      ${clickable ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : ""}`}
  >
    <div
      className="absolute -right-3 -top-3 w-20 h-20 rounded-full opacity-5 transition-transform duration-700 ease-out group-hover:scale-150"
      style={{ background: gradient }}
    />
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-xs font-medium text-gray-800 tracking-wider">
          {title}
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5 tracking-tight">
          {value}
        </h2>
        {sub && <p className="text-xs text-gray-400 mt-1 break-words">{sub}</p>}
      </div>
      <div
        className="p-3 rounded-xl text-white shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ background: gradient }}
      >
        {icon}
      </div>
    </div>
    {alert && (
      <div className="relative z-10 mt-3 flex items-center gap-1.5 text-red-500">
        <AlertCircle size={12} />
        <span className="text-xs font-semibold">{alert}</span>
      </div>
    )}
    {clickable && !alert && (
      <p className="relative z-10 mt-2 text-xs text-teal-600 font-medium">
        View details →
      </p>
    )}
  </div>
);

// FIXED: DocumentCard component with correct file URL handling
const DocumentCard = ({ doc, application }) => {
  const s = DOC_STATUS[doc.status] || DOC_STATUS.pending;
  const docTypeLabel =
    DOC_TYPE_LABELS[doc.doc_type] ||
    doc.doc_type?.replace(/_/g, " ") ||
    "Document";

  // Use file_url if available, otherwise fallback to file_path
  const fileUrl = doc.file_url || doc.file_path;

  return (
    <div className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      {/* Card header with icon and status */}
      <div className="p-4 pb-2 flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-teal-600" />
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${s.bg} ${s.text}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      {/* Document details */}
      <div className="px-4 pb-2 flex-1">
        <h4 className="text-sm font-bold text-gray-800 capitalize leading-tight line-clamp-2">
          {docTypeLabel}
        </h4>

        {/* Application context */}
        {application && (
          <div className="mt-2 flex items-start gap-1.5">
            <GraduationCap
              size={12}
              className="text-gray-400 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-gray-500 line-clamp-1">
              {application.target_university || "University Application"}
            </p>
          </div>
        )}

        {/* Date */}
        <div className="mt-2 flex items-center gap-1.5">
          <Calendar size={11} className="text-gray-400" />
          <p className="text-xs text-gray-400">
            Uploaded: {formatDate(doc.submitted_at || doc.created_at)}
          </p>
        </div>
      </div>

      {/* Card footer with action buttons - FIXED: buttons placed correctly */}
      <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between gap-2 mt-auto">
        <button
          onClick={() => fileUrl && window.open(fileUrl, "_blank")}
          disabled={!fileUrl}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg py-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye size={12} /> View
        </button>
        <button
          onClick={() => {
            if (!fileUrl) return;
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = doc.file_name || docTypeLabel;
            link.click();
          }}
          disabled={!fileUrl}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg py-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={12} /> Download
        </button>
      </div>
    </div>
  );
};

const DOC_TYPE_LABELS = {
  passport: "Passport Copy",
  transcript: "Academic Transcript",
  sop: "Statement of Purpose",
  ielts: "IELTS Certificate",
  photo: "Passport Photo",
  recommendation: "Recommendation Letter",
  financial: "Financial Statement",
  cv: "CV/Resume",
  offer_letter: "Offer Letter",
  visa: "Visa Document",
  other: "Other Document",
};

// ── Main Component ────────────────────────────────────────────────────────────
export const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  // SSE connection
  const { lastEvent, isConnected, reconnect } = useSSE();

  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(null);
  const [mobileDocs, setMobileDocs] = useState([]);

  // ── Helper: group documents per application and compute verified/total ──
  const applicationsWithDocStats = useMemo(() => {
    const statsMap = new Map();

    documents.forEach((doc) => {
      const appId = doc.application_id;
      if (!appId) return;

      if (!statsMap.has(appId)) {
        statsMap.set(appId, { verified: 0, total: 0 });
      }
      const stats = statsMap.get(appId);
      stats.total += 1;
      if (doc.status === "verified") {
        stats.verified += 1;
      }
    });

    return applications.map((app) => ({
      ...app,
      docStats: statsMap.get(app.id) || { verified: 0, total: 0 },
    }));
  }, [applications, documents]);

  // NEW: Flatten documents with application details for card layout
  const documentsWithAppDetails = useMemo(() => {
    const appMap = new Map(applications.map((app) => [app.id, app]));
    return documents
      .map((doc) => ({
        ...doc,
        application: appMap.get(doc.application_id) || null,
      }))
      .sort(
        (a, b) =>
          new Date(b.submitted_at || b.created_at) -
          new Date(a.submitted_at || a.created_at),
      );
  }, [documents, applications]);

  // ── SSE event handling ──────────────────────────────────────────────────────
  useEffect(() => {
    if (lastEvent) {
      console.log("Received SSE event:", lastEvent);
      setShowNotification({
        type: lastEvent.type || "update",
        message: lastEvent.message || "New update received!",
        data: lastEvent.data,
      });
      const timer = setTimeout(() => setShowNotification(null), 5000);

      switch (lastEvent.type) {
        case "document_verified":
        case "document_rejected":
        case "document_uploaded":
          fetchDocs();
          break;
        case "application_updated":
        case "application_status_changed":
          fetchApplications();
          break;
        default:
          fetchDocs();
          fetchApplications();
      }
      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  // ── API calls ───────────────────────────────────────────────────────────────
  const fetchDocs = async () => {
    setDocsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/student/documents`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Docs fetch error:", err);
    } finally {
      setDocsLoading(false);
    }
  };

  const fetchMobileDocs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/student/documents/mobile-docs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setMobileDocs(data.data || []);
    } catch (err) {
      console.error("Error fetching mobile docs:", err);
    }
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/getApplications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } finally {
      setAppsLoading(false);
    }
  };

  const fetchDocStats = async () => {
    const res = await fetch(`${BASE_URL}/student/documents/stats`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    console.log(data);
  };

  useEffect(() => {
    fetchDocs();
    fetchMobileDocs();
    fetchApplications();
    fetchDocStats();
  }, []);

  // ── Derived global calculations ─────────────────────────────────
  const verifiedDocs = documents.filter((d) => d.status === "verified").length;
  const totalUploaded = documents.length;
  const totalRequired = applications.length * (mobileDocs.length || 0);
  const progressPct =
    totalRequired === 0
      ? 0
      : Math.min(100, Math.round((verifiedDocs / totalRequired) * 100));

  const counsellorName = "Not Assigned";
  const activeApplicationsCount = applications.filter(
    (app) => app.status !== "rejected" && app.status !== "completed",
  ).length;

  const recentApplications = applicationsWithDocStats
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt) -
        new Date(a.created_at || a.createdAt),
    )
    .slice(0, 3);

  return (
    <main className="bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen overflow-x-hidden p-3">
      {/* SSE Connection Status Indicator - Responsive positioning */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-gray-200">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-xs text-gray-600 hidden xs:inline">
            {isConnected ? "Live Updates" : "Reconnecting..."}
          </span>
          <span className="text-xs text-gray-600 xs:hidden">
            {isConnected ? "Live" : "Offline"}
          </span>
          {!isConnected && (
            <button
              onClick={reconnect}
              className="ml-1 p-1 hover:bg-gray-100 rounded-full transition"
              aria-label="Reconnect"
            >
              <RefreshCw size={12} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Real‑time Notification Toast - Responsive sizing */}
      {showNotification && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-teal-500 p-3 max-w-[calc(100%-2rem)] sm:max-w-sm mx-auto sm:mx-0">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {showNotification.type === "document_verified" && (
                  <CheckCircle size={20} className="text-green-500" />
                )}
                {showNotification.type === "document_rejected" && (
                  <XCircle size={20} className="text-red-500" />
                )}
                {showNotification.type === "message_received" && (
                  <MessageSquare size={20} className="text-blue-500" />
                )}
                {showNotification.type === "stage_changed" && (
                  <Sparkles size={20} className="text-teal-500" />
                )}
                {!showNotification.type && (
                  <AlertCircle size={20} className="text-teal-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 break-words">
                  {showNotification.type?.replace(/_/g, " ").toUpperCase() ||
                    "Update"}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 break-words">
                  {showNotification.message}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                aria-label="Close notification"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Responsive 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <StatCard
          title="Active Applications"
          value={appsLoading ? "..." : activeApplicationsCount}
          icon={<CheckCircle size={20} />}
          gradient="linear-gradient(135deg,#10b981,#059669)"
          sub={`Total ${applications.length} application${applications.length !== 1 ? "s" : ""}`}
          onClick={() => navigate("/student/application")}
          clickable
        />
        <StatCard
          title="Verified Documents"
          value={docsLoading ? "..." : `${verifiedDocs}/${totalRequired}`}
          icon={<CheckCircle size={20} />}
          gradient="linear-gradient(135deg,#3b82f6,#2563eb)"
          sub="Approved"
          onClick={() => navigate("/student/application")}
          clickable
        />
        <StatCard
          title="Total Applications"
          value={appsLoading ? "..." : applications.length}
          icon={<FileText size={20} />}
          gradient="linear-gradient(135deg,#8b5cf6,#6d28d9)"
          sub="All time applications"
          onClick={() => navigate("/student/application")}
          clickable
        />
        <StatCard
          title="Document Progress"
          value={docsLoading ? "..." : `${progressPct}%`}
          icon={<Award size={20} />}
          gradient="linear-gradient(135deg,#f59e0b,#d97706)"
          sub={`${verifiedDocs} of ${totalRequired} verified`}
          onClick={() => navigate("/student/application")}
          clickable
        />
      </div>

      {/* MAIN GRID – now single column on desktop so My Documents takes full width */}
      <div className="grid grid-cols-1 gap-3">
        {/* Left column – spans full width on all screens */}
        <div className="space-y-3">
          {/* Recent Applications Section */}
          {!appsLoading && applicationsWithDocStats.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-3 py-3 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                    Recent Applications
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your university applications at a glance
                  </p>
                </div>
                <button
                  onClick={() => navigate("/student/application")}
                  className="text-teal-600 text-xs font-semibold hover:underline py-2 px-3 -m-2 self-start sm:self-auto"
                >
                  View All
                </button>
              </div>
              <div className="p-3 space-y-3">
                {recentApplications.map((app) => {
                  const { verified, total } = app.docStats;
                  const percent = total === 0 ? 0 : (verified / total) * 100;
                  return (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all bg-white cursor-pointer"
                      onClick={() => navigate("/student/application")}
                    >
                      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center flex-shrink-0">
                            <GraduationCap
                              size={18}
                              className="text-teal-600"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 break-words">
                              {app.target_university ||
                                "University Application"}
                            </p>
                            <p className="text-xs text-gray-500 break-words">
                              {app.course || "Course not specified"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full self-start xs:self-center ${
                            app.status === "In Progress" ||
                            app.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : app.status === "submitted" ||
                                  app.status === "applied"
                                ? "bg-blue-100 text-blue-700"
                                : app.status === "accepted"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {app.status || "In Progress"}
                        </span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-50">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">
                            Documents verified
                          </span>
                          <span className="font-medium text-teal-600">
                            {verified} / {total}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-teal-500 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        {total === 0 && (
                          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            <AlertCircle size={12} /> No documents uploaded yet
                            for this application.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========== MY DOCUMENTS SECTION – Card-based layout ========== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-3 py-3 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                  My Documents
                </h3>
                <p className="text-xs text-gray-400">
                  {verifiedDocs} of {totalRequired} required documents verified
                </p>
              </div>
              <button
                onClick={() => navigate("/student/application")}
                className="flex items-center justify-center gap-2 bg-teal-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-teal-700 transition shadow-sm shadow-teal-200 min-h-[40px]"
              >
                <Upload size={12} /> Upload
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-3 py-2 border-b border-gray-50 bg-gray-50/50">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-medium">
                  Document completion
                </span>
                <span className="font-bold text-teal-600">{progressPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, #0d9488, #06b6d4)",
                  }}
                />
              </div>
            </div>

            {/* Card Grid for Documents */}
            <div className="p-3">
              {docsLoading ? (
                <div className="text-center py-8">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : documentsWithAppDetails.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-dashed border-gray-200">
                    <Upload size={22} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm font-semibold">
                    No documents uploaded yet
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Upload your required documents to proceed
                  </p>
                  <button
                    onClick={() => navigate("/student/application")}
                    className="mt-3 bg-teal-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 transition min-h-[40px]"
                  >
                    Upload Now
                  </button>
                </div>
              ) : (
                <>
                  {/* Responsive grid: 1 column on mobile, 2 on sm, 3 on md, 4 on lg */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {documentsWithAppDetails.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        application={doc.application}
                      />
                    ))}
                  </div>

                  {documentsWithAppDetails.length > 8 && (
                    <button
                      onClick={() => navigate("/student/application")}
                      className="w-full text-center text-xs text-teal-600 font-semibold py-3 hover:underline mt-4"
                    >
                      View all {documentsWithAppDetails.length} documents →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ========== DOCUMENT STATUS SUMMARY – moved below My Documents ========== */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              Document Status Summary
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "Verified",
                  count: verifiedDocs,
                  color: "#10b981",
                  bg: "bg-emerald-50",
                },
                {
                  label: "In Review",
                  count: documents.filter(
                    (d) => d.status === "review" || d.status === "pending",
                  ).length,
                  color: "#f59e0b",
                  bg: "bg-amber-50",
                },
                {
                  label: "Rejected",
                  count: documents.filter((d) => d.status === "rejected")
                    .length,
                  color: "#ef4444",
                  bg: "bg-red-50",
                },
                {
                  label: "Not Uploaded",
                  count: Math.max(0, totalRequired - totalUploaded),
                  color: "#9ca3af",
                  bg: "bg-gray-50",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs text-gray-600 font-medium">
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${item.bg}`}
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Documents:</span>
                <span className="font-bold text-gray-700">{totalUploaded}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentDashboard;