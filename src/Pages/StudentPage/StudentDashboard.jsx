// StudentDashboard.jsx - With SSE Integration
import React, { useState, useEffect } from "react";
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

// ── Stage pipeline config ─────────────────────────────────────────────────────
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

// ── Sub-components ────────────────────────────────────────────────────────────

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
    className={`relative group bg-white px-5 py-2 rounded-xl shadow-sm border border-gray-100
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
        <h2 className="text-2xl font-bold text-gray-900 mt-1.5 tracking-tight">
          {value}
        </h2>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
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

const QuickAction = ({ icon, label, color, bgColor, onClick, badge }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:shadow-md
      transition-all duration-200 border border-gray-100 hover:border-gray-200 group bg-white"
  >
    <div className={`p-2 rounded-xl ${bgColor}`} style={{ color }}>
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1 text-left">
      {label}
    </span>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
    <ChevronRight
      size={15}
      className="text-gray-300 group-hover:text-gray-500 transition-colors"
    />
  </button>
);

// ── Application Timeline ──────────────────────────────────────────────────────
function ApplicationTimeline({ currentStatus }) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="relative pt-2">
      <div className="absolute top-7 left-5 right-5 h-0.5 bg-gray-100 z-0" />
      <div
        className="absolute top-7 left-5 h-0.5 z-0 transition-all duration-1000"
        style={{
          width:
            currentIndex <= 0
              ? "0%"
              : `${(currentIndex / (STAGES.length - 1)) * 90}%`,
          background: `linear-gradient(90deg, ${STAGES[0].color}, ${STAGES[currentIndex]?.color || STAGES[0].color})`,
        }}
      />
      <div className="relative z-10 flex justify-between">
        {STAGES.map((stage, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex;
          return (
            <div
              key={stage.key}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 text-xs font-bold
                  ${current ? "scale-125 shadow-lg shadow-teal-100" : done ? "scale-100" : "scale-90 border-gray-200 bg-white text-gray-300"}`}
                style={
                  current
                    ? {
                        background: stage.color,
                        borderColor: stage.color,
                        color: "#fff",
                      }
                    : done
                      ? {
                          background: stage.color + "20",
                          borderColor: stage.color,
                          color: stage.color,
                        }
                      : {}
                }
              >
                {done ? (
                  <CheckCircle size={16} />
                ) : current ? (
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                ) : (
                  <div className="w-2 h-2 bg-gray-200 rounded-full" />
                )}
              </div>
              <span
                className={`text-[9px] font-semibold text-center leading-tight max-w-[52px] ${current ? "text-gray-800" : done ? "text-gray-500" : "text-gray-300"}`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Document Card ─────────────────────────────────────────────────────────────
function DocCard({ doc }) {
  const s = DOC_STATUS[doc.status] || DOC_STATUS.pending;
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all bg-white group">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileText size={15} className="text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 capitalize leading-tight">
            {DOC_TYPE_LABELS[doc.doc_type] ||
              doc.doc_type?.replace(/_/g, " ") ||
              "Document"}
          </p>
          <p className="text-xs text-gray-400">
            {formatDate(doc.submitted_at || doc.created_at)}
          </p>
        </div>
      </div>
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${s.bg} ${s.text}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    </div>
  );
}

// ── Document Type Labels ──────────────────────────────────────────────────────
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

  // Initialize SSE connection - this will automatically connect when component mounts
  // The hook returns the latest event data and connection status
  const { lastEvent, isConnected, reconnect } = useSSE();

  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]); // Added for applications
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(null);

  // Handle real-time SSE events
  useEffect(() => {
    if (lastEvent) {
      console.log("Received SSE event:", lastEvent);

      // Show notification for real-time updates
      setShowNotification({
        type: lastEvent.type || "update",
        message: lastEvent.message || "New update received!",
        data: lastEvent.data,
      });

      // Auto-hide notification after 5 seconds
      const timer = setTimeout(() => setShowNotification(null), 5000);

      // Handle different event types
      switch (lastEvent.type) {
        case "document_verified":
        case "document_rejected":
        case "document_uploaded":
          // Refresh documents when document status changes
          fetchDocs();
          break;

        case "application_updated":
        case "application_status_changed":
          // Refresh applications when application status changes
          fetchApplications();
          break;

        case "profile_updated":
        case "stage_changed":
          // Refresh profile when stage changes
          fetchProfile();
          break;

        case "message_received":
          // New message notification (could trigger chat refresh)
          if (lastEvent.message) {
            // Optional: Show chat notification badge
            console.log("New message received:", lastEvent.message);
          }
          break;

        default:
          // For unknown event types, refresh all data
          console.log("Unknown event type, refreshing all data");
          fetchDocs();
          fetchApplications();
          fetchProfile();
      }

      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  // ── Fetch profile ────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/student/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setProfile(data.data || data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch documents ──────────────────────────────────────────────────────
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

  // ── Fetch applications ────────────────────────────────────────────────────
  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/getApplications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Applications fetch error:", err);
    } finally {
      setAppsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProfile();
    fetchDocs();
    fetchApplications();
  }, []);

  // ── Derived calculations ──────────────────────────────────────────────────
  const currentStatus = profile?.lead?.status || "new";
  const currentStage = STAGES.find((s) => s.key === currentStatus);

  const verifiedDocs = documents.filter((d) => d.status === "verified").length;
  const pendingDocs = documents.filter((d) => d.status === "pending").length;
  const reviewDocs = documents.filter((d) => d.status === "review").length;
  const rejectedDocs = documents.filter((d) => d.status === "rejected").length;

  const totalRequired = 9; // Required documents count
  const totalUploaded = documents.length;
  const progressPct = Math.min(
    100,
    Math.round((verifiedDocs / totalRequired) * 100),
  );

  const counsellorName =
    profile?.lead?.counsellor?.name ||
    profile?.counsellor?.name ||
    "Not Assigned";

  // Get recent documents (last 5)
  const recentDocs = [...documents]
    .sort(
      (a, b) =>
        new Date(b.submitted_at || b.created_at) -
        new Date(a.submitted_at || a.created_at),
    )
    .slice(0, 5);

  // Get active applications count
  const activeApplicationsCount = applications.filter(
    (app) => app.status !== "rejected" && app.status !== "completed",
  ).length;

  // Get recent applications (last 3)
  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt) -
        new Date(a.created_at || a.createdAt),
    )
    .slice(0, 3);

  return (
    <main className="p-3 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* SSE Connection Status Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-gray-200">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-xs text-gray-600">
            {isConnected ? "Live Updates" : "Reconnecting..."}
          </span>
          {!isConnected && (
            <button
              onClick={reconnect}
              className="ml-1 p-1 hover:bg-gray-100 rounded-full transition"
            >
              <RefreshCw size={12} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-teal-500 p-4 max-w-sm">
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
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {showNotification.type?.replace(/_/g, " ").toUpperCase() ||
                    "Update"}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {showNotification.message}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Welcome Banner ── */}
      <div className="mb-3">
        <div className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 text-white rounded-xl p-3 shadow-xl overflow-hidden">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -right-2 top-20 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute right-32 -bottom-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-teal-200" />
                <p className="text-teal-100 text-sm font-medium">
                  Student Portal
                </p>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Hello, {user?.name?.split(" ")[0] || "Student"} 👋
              </h1>
              <p className="mt-2 text-teal-100 text-base">
                Your application is at{" "}
                <span className="font-bold bg-white/20 px-2.5 py-0.5 rounded-lg text-white">
                  {currentStage?.label || "Inquiry"}
                </span>{" "}
                stage.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {profile?.lead?.preferred_country && (
                  <span className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                    <Globe size={11} /> {profile.lead.preferred_country}
                  </span>
                )}
                {profile?.lead?.study_level && (
                  <span className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                    <BookOpen size={11} /> {profile.lead.study_level}
                  </span>
                )}
                {counsellorName !== "Not Assigned" && (
                  <span className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                    <Award size={11} /> {counsellorName}
                  </span>
                )}
                {activeApplicationsCount > 0 && (
                  <span className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                    <FileText size={11} /> {activeApplicationsCount} Active
                    Application{activeApplicationsCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 self-center">
              <Calendar size={16} className="text-teal-100" />
              <span className="text-sm font-medium text-white">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard
          title="Current Stage"
          value={currentStage?.label || "Inquiry"}
          icon={<FileText size={20} />}
          gradient={currentStage?.color || "#0d9488"}
          sub="Application progress"
        />
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
          sub="Approved by counsellor"
          onClick={() => navigate("/student/documents")}
          clickable
        />
        <StatCard
          title="Action Needed"
          value={docsLoading ? "..." : rejectedDocs}
          icon={<Upload size={20} />}
          gradient="linear-gradient(135deg,#ef4444,#dc2626)"
          sub="Re-upload required"
          onClick={
            rejectedDocs > 0 ? () => navigate("/student/documents") : undefined
          }
          clickable={rejectedDocs > 0}
          alert={
            rejectedDocs > 0
              ? `${rejectedDocs} doc${rejectedDocs > 1 ? "s" : ""} rejected`
              : null
          }
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* ── Left: Timeline + Documents + Applications ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Journey */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  Application Journey
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Track your progress through each stage
                </p>
              </div>
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{
                  background: (currentStage?.color || "#0d9488") + "15",
                  color: currentStage?.color || "#0d9488",
                }}
              >
                {currentStage?.label || "Inquiry"}
              </span>
            </div>
            {loading ? (
              <div className="h-20 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
              </div>
            ) : (
              <ApplicationTimeline currentStatus={currentStatus} />
            )}
          </div>

          {/* Recent Applications Section */}
          {!appsLoading && applications.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    Recent Applications
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your university applications at a glance
                  </p>
                </div>
                <button
                  onClick={() => navigate("/student/application")}
                  className="text-teal-600 text-xs font-semibold hover:underline"
                >
                  View All →
                </button>
              </div>
              <div className="p-5 space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all bg-white cursor-pointer"
                    onClick={() => navigate("/student/application")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
                        <GraduationCap size={18} className="text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {app.target_university || "University Application"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {app.course || "Course not specified"} • Deadline:{" "}
                          {formatDate(app.deadline) || "TBD"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        app.status === "In Progress" || app.status === "pending"
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
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  My Documents
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {verifiedDocs} of {totalRequired} required documents verified
                </p>
              </div>
              <button
                onClick={() => navigate("/student/documents")}
                className="flex items-center gap-2 bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-teal-700 transition shadow-sm shadow-teal-200"
              >
                <Upload size={12} /> Upload
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50">
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

            {/* Doc list */}
            <div className="p-5 space-y-2.5">
              {docsLoading ? (
                <div className="text-center py-8">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : documents.length === 0 ? (
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
                    onClick={() => navigate("/student/documents")}
                    className="mt-3 bg-teal-600 text-white text-xs font-semibold px-5 py-2 rounded-xl hover:bg-teal-700 transition"
                  >
                    Upload Now
                  </button>
                </div>
              ) : (
                <>
                  {recentDocs.map((doc) => (
                    <DocCard key={doc.id} doc={doc} />
                  ))}
                  {documents.length > 5 && (
                    <button
                      onClick={() => navigate("/student/documents")}
                      className="w-full text-center text-xs text-teal-600 font-semibold py-2 hover:underline"
                    >
                      View all {documents.length} documents →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              <QuickAction
                icon={<Upload size={16} />}
                label="Upload Documents"
                color="#0d9488"
                bgColor="bg-teal-50"
                onClick={() => navigate("/student/documents")}
                badge={rejectedDocs}
              />
              <QuickAction
                icon={<MessageSquare size={16} />}
                label="Chat with Counsellor"
                color="#3b82f6"
                bgColor="bg-blue-50"
                onClick={() => navigate("/student/chat")}
              />
              <QuickAction
                icon={<FileText size={16} />}
                label="View Applications"
                color="#8b5cf6"
                bgColor="bg-violet-50"
                onClick={() => navigate("/student/application")}
                badge={applications.length}
              />
            </div>
          </div>

          {/* Document Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
                  count: reviewDocs + pendingDocs,
                  color: "#f59e0b",
                  bg: "bg-amber-50",
                },
                {
                  label: "Rejected",
                  count: rejectedDocs,
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
            <div className="mt-4 pt-3 border-t border-gray-100">
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
