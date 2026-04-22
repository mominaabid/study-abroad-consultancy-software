// LeadsComponents/LeadDrawer.jsx
import { useState, useEffect } from "react";
import { STAGES, formatDate } from "./LeadsConstants";
import { BASE_URL } from "../../Content/Url";

// React Icons
import {
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaHashtag,
  FaCalendarAlt,
  FaUserCheck,
} from "react-icons/fa";

// ── Activity Log Constants ──
const LOG_COLORS = {
  stage_changed: "bg-purple-500",
  note_added: "bg-teal-500",
  counsellor_assigned: "bg-amber-500",
  lead_created: "bg-blue-500",
  student_account_created: "bg-green-500",
  setup_email_sent: "bg-pink-500",
  lead_updated: "bg-gray-500",
  password_set: "bg-emerald-500",
};

const LOG_TITLES = {
  stage_changed: "Stage Changed",
  note_added: "Note Added",
  counsellor_assigned: "Counsellor Assigned",
  lead_created: "Lead Created",
  student_account_created: "Student Account Created",
  setup_email_sent: "Setup Email Sent",
  lead_updated: "Lead Updated",
  password_set: "Password Set",
};

const LOG_ICONS = {
  stage_changed: "⇄",
  note_added: "✎",
  counsellor_assigned: "👤",
  lead_created: "+",
  student_account_created: "★",
  setup_email_sent: "✉",
  password_set: "🔑",
};

// ── Time Ago Helper ──
function formatDateTime(date) {
  const d = new Date(date);

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function LeadDrawer({
  lead,
  onClose,
  counsellors,
  onAssign,
  onStage,
}) {
  // ── STATES ──
  const [assigning, setAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // ✅ FIXED: Hook always runs (no conditional hook issue)
  useEffect(() => {
    if (activeTab === "logs" && lead?.id) {
      setLogsLoading(true);

      fetch(`${BASE_URL}/admin/leads/${lead.id}/logs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((r) => r.json())
        .then((data) => setLogs(Array.isArray(data) ? data : []))
        .finally(() => setLogsLoading(false));
    }
  }, [activeTab, lead?.id]);

  // ❗ AFTER hooks (important fix)
  if (!lead) return null;

  async function handleAssign(counsellor_id) {
    setAssigning(true);
    await onAssign(lead.id, counsellor_id);
    setAssigning(false);
  }

  const currentStage = STAGES.find((s) => s.key === lead.status);

  const detailItem = (icon, label, value) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-teal-100 transition">
      <div className="text-teal-600 bg-teal-50 p-2 rounded-lg">{icon}</div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold">
          {label}
        </p>
        <p className="text-sm text-slate-800 font-medium">
          {value || "—"}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-[#00A78E] text-white">
          <h2 className="text-lg font-bold">{lead.name}</h2>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {["details", "logs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold ${
                activeTab === tab
                  ? "border-b-2 border-[#00A78E] text-[#00A78E]"
                  : "text-gray-400"
              }`}
            >
              {tab === "logs" ? "Activity Log" : "Details"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">

          {/* DETAILS TAB */}
          {activeTab === "details" && (
            <div className="space-y-4">

              <div className="grid grid-cols-2 gap-3">
                {detailItem(<FaEnvelope />, "Email", lead.email)}
                {detailItem(<FaPhone />, "Phone", lead.phone)}
                {detailItem(<FaGlobe />, "Country", lead.preferred_country)}
                {detailItem(<FaHashtag />, "Source", lead.source)}
                {detailItem(<FaCalendarAlt />, "Date", formatDate(lead.createdAt))}
              </div>

              {/* Stage */}
              <div>
                <h3 className="text-xs text-gray-500 mb-2">Stage</h3>
                <div className="flex gap-2 flex-wrap">
                  {STAGES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => onStage(lead.id, s.key)}
                      className={`px-3 py-1 rounded text-xs ${
                        lead.status === s.key
                          ? "text-white"
                          : "bg-gray-100"
                      }`}
                      style={
                        lead.status === s.key
                          ? { background: s.color }
                          : {}
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign */}
              <div>
                <h3 className="text-xs text-gray-500 mb-2">
                  Assign Counsellor
                </h3>
                <select
                  className="w-full border p-2 rounded"
                  value={lead.counsellor_id || ""}
                  onChange={(e) => handleAssign(e.target.value)}
                >
                  <option value="">Select</option>
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === "logs" && (
            <div>
              {logsLoading ? (
                <p className="text-center text-gray-400">Loading...</p>
              ) : logs.length === 0 ? (
                <p className="text-center text-gray-400">No activity</p>
              ) : (
                <div className="space-y-3">
                  {[...logs]
  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  .map((log) => (
                    <div key={log.id} className="flex gap-3">

                      <div
                        className={`w-10 h-10 flex items-center justify-center text-white rounded-full ${
                          LOG_COLORS[log.action_type] || "bg-gray-400"
                        }`}
                      >
                        {LOG_ICONS[log.action_type] || "•"}
                      </div>

                      <div className="flex-1 border p-3 rounded">
                        <p className="text-sm font-semibold">
                          {LOG_TITLES[log.action_type] || log.action_type}
                        </p>

                        {log.note && (
                          <p className="text-xs text-gray-500">
                            {log.note}
                          </p>
                        )}

                        {log.from_value && log.to_value && (
                          <p className="text-xs">
                            {log.from_value} → {log.to_value}
                          </p>
                        )}

                        <p className="text-xs text-gray-400 mt-1">
                     {log.performed_by_name} • {formatDateTime(log.created_at)}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}