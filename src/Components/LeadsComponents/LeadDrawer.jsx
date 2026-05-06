import { useState, useEffect } from "react";
import { STAGES, formatDate } from "./LeadsConstants";
import { BASE_URL } from "../../Content/Url";
import { toast } from "react-toastify";

import {
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaHashtag,
  FaCalendarAlt,
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

function formatDateTime(date) {
  return new Date(date).toLocaleString("en-GB", {
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
  onStage,
  onAddNoteOnly,
}) {
  const [stageNote, setStageNote] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedHistoryStage, setSelectedHistoryStage] = useState(null);
  const [historicalNote, setHistoricalNote] = useState("");
  const [stageNotes, setStageNotes] = useState({});

  const stageOrder = STAGES.map((s) => s.key);

  function canMoveStage(current, target) {
    const currentIndex = stageOrder.indexOf(current);
    const targetIndex = stageOrder.indexOf(target);
    return targetIndex === currentIndex || targetIndex === currentIndex + 1;
  }

  // Fetch historical notes
  const fetchHistoricalNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/admin/leads/${lead.id}/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Group notes by stage
        const notesByStage = {};
        data.forEach(log => {
          if (log.action_type === "note_added" || log.action_type === "stage_changed") {
            let stage = log.metadata?.stage || log.from_value || log.to_value || lead.status;
            if (!notesByStage[stage]) {
              notesByStage[stage] = [];
            }
            notesByStage[stage].push({
              content: log.note || `Stage changed from ${log.from_value} to ${log.to_value}`,
              author: log.performed_by_name,
              createdAt: log.created_at,
              type: log.action_type
            });
          }
        });
        setStageNotes(notesByStage);
      }
    } catch (error) {
      console.error("Error fetching stage notes:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "logs" && lead?.id) {
      setLogsLoading(true);
      fetch(`${BASE_URL}/admin/leads/${lead.id}/logs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((r) => r.json())
        .then((data) =>
          setLogs(
            Array.isArray(data)
              ? data.sort(
                  (a, b) => new Date(a.created_at) - new Date(b.created_at),
                )
              : [],
          ),
        )
        .finally(() => setLogsLoading(false));
    }
    
    // Fetch historical notes when component mounts
    if (lead?.id) {
      fetchHistoricalNotes();
    }
  }, [activeTab, lead?.id]);

  const handleAddHistoricalNote = async (stageKey) => {
    if (!historicalNote.trim()) return;
    
    if (onAddNoteOnly) {
      await onAddNoteOnly(lead.id, `[${STAGES.find(s => s.key === stageKey)?.label}] ${historicalNote}`);
      setHistoricalNote("");
      setSelectedHistoryStage(null);
      fetchHistoricalNotes(); // Refresh notes
      toast.success(`Note added to ${STAGES.find(s => s.key === stageKey)?.label} stage`);
    }
  };

  if (!lead) return null;

  const detailItem = (icon, label, value) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
      <div className="text-teal-600 bg-teal-50 p-2 rounded-lg">{icon}</div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold">
          {label}
        </p>
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 bg-[#00A78E] text-white">
          <h2 className="font-bold">{lead.name}</h2>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b">
          {["details", "logs"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm ${
                activeTab === t
                  ? "border-b-2 border-[#00A78E] text-[#00A78E]"
                  : "text-gray-400"
              }`}
            >
              {t === "logs" ? "Activity Log" : "Details"}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {activeTab === "details" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {detailItem(<FaEnvelope />, "Email", lead.email)}
                {detailItem(<FaPhone />, "Phone", lead.phone)}
                {detailItem(<FaGlobe />, "Country", lead.preferred_country)}
                {detailItem(<FaHashtag />, "Source", lead.source)}
                {detailItem(
                  <FaCalendarAlt />,
                  "Date",
                  formatDate(lead.createdAt),
                )}
              </div>

              {/* STAGE SECTION */}
              <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Pipeline Stage
                </p>

                {/* Stepper */}
                <div className="flex items-start mb-5 overflow-x-auto pb-1">
                  {STAGES.map((s, i) => {
                    const currentIndex = stageOrder.indexOf(lead.status);
                    const isDone = i < currentIndex;
                    const isActive = i === currentIndex;

                    return (
                      <div key={s.key} className="flex flex-col items-center flex-1 min-w-[60px] relative">
                        {i < STAGES.length - 1 && (
                          <div
                            className="absolute top-4 left-1/2 right-[-50%] h-0.5 z-0"
                            style={{ background: isDone ? "#00A78E" : "#e2e8f0" }}
                          />
                        )}

                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 relative border-2 transition-all duration-200"
                          style={
                            isDone
                              ? { background: "#00A78E", color: "#fff", borderColor: "#00A78E" }
                              : isActive
                              ? { background: "#fff", color: "#00A78E", borderColor: "#00A78E", boxShadow: "0 0 0 4px #00A78E22" }
                              : { background: "#f1f5f9", color: "#94a3b8", borderColor: "#e2e8f0" }
                          }
                        >
                          {isDone ? "✓" : i + 1}
                        </div>

                        <span
                          className="text-[9px] font-semibold mt-1.5 text-center leading-tight"
                          style={{ color: isActive ? "#00A78E" : isDone ? "#00A78E" : "#94a3b8", opacity: isDone ? 0.7 : 1 }}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Stage Change Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {STAGES.map((s) => {
                    const currentIndex = stageOrder.indexOf(lead.status);
                    const targetIndex = stageOrder.indexOf(s.key);
                    const isBackward = targetIndex < currentIndex;
                    const isSameStage = lead.status === s.key;
                    
                    return (
                      <button
                        key={s.key}
                        onClick={() => {
                          if (!stageNote.trim()) {
                            toast.error("📝 Please add a note first!");
                            return;
                          }
                          
                          if (isBackward || isSameStage) {
                            // Moving backward or same stage - add note only
                            if (onAddNoteOnly) {
                              onAddNoteOnly(lead.id, stageNote);
                              toast.success("📝 Note added successfully!");
                              setStageNote("");
                            } else {
                              toast.error("Cannot add note. Please contact support.");
                            }
                          } else {
                            // Moving forward - change stage
                            onStage(lead.id, s.key, stageNote);
                            setStageNote("");
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold border-[1.5px] transition-all duration-150"
                        style={
                          isSameStage
                            ? { background: "#00A78E", color: "#fff", borderColor: "#00A78E", boxShadow: "0 0 0 3px #00A78E22" }
                            : { background: "transparent", color: "#64748b", borderColor: "#e2e8f0" }
                        }
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                {/* Current Note Input */}
                <div className="relative mb-6">
                  <textarea
                    value={stageNote}
                    onChange={(e) => setStageNote(e.target.value)}
                    placeholder="Add a note before moving stage..."
                    rows={3}
                    className="w-full border-[1.5px] border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:border-[#00A78E] transition-colors bg-white"
                  />
                  {stageNote && (
                    <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-400">
                      {stageNote.length} chars
                    </span>
                  )}
                </div>

                {/* DIVIDER */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-slate-50 text-slate-400"> Notes</span>
                  </div>
                </div>

                {/* HISTORICAL NOTES SECTION */}
                <div className="mt-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Add Notes to Previous Stages
                  </p>
                  
                  <div className="space-y-3">
                    {STAGES.map((stage) => {
                      const notes = stageNotes[stage.key] || [];
                      const isCurrentStage = lead.status === stage.key;
                      const isPastStage = stageOrder.indexOf(stage.key) < stageOrder.indexOf(lead.status);
                      
                      // Only show past stages and current stage
                      if (!isPastStage && !isCurrentStage) return null;
                      
                      return (
                        <div key={stage.key} className="border rounded-lg overflow-hidden">
                          <div 
                            className={`px-3 py-2 flex justify-between items-center cursor-pointer transition-colors ${
                              isCurrentStage ? 'bg-teal-50 border-l-4 border-teal-500' : 
                              isPastStage ? 'bg-amber-50 border-l-4 border-amber-400' : 'bg-gray-50'
                            }`}
                            onClick={() => setSelectedHistoryStage(selectedHistoryStage === stage.key ? null : stage.key)}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold ${
                                isCurrentStage ? 'text-teal-700' : 
                                isPastStage ? 'text-amber-700' : 'text-gray-600'
                              }`}>
                                {stage.label}
                              </span>
                              {isCurrentStage && (
                                <span className="text-[10px] bg-teal-200 text-teal-800 px-1.5 py-0.5 rounded">
                                  Current
                                </span>
                              )}
                              {isPastStage && (
                                <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                                  Completed
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400">
                                ({notes.length} notes)
                              </span>
                            </div>
                            <svg 
                              className={`w-4 h-4 transition-transform ${selectedHistoryStage === stage.key ? 'rotate-180' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          
                          {selectedHistoryStage === stage.key && (
                            <div className="p-3 bg-white">
                              {/* Existing Notes */}
                              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                                {notes.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic p-2 text-center">No notes for this stage</p>
                                ) : (
                                  notes.map((note, idx) => (
                                    <div key={idx} className="bg-gray-50 p-2 rounded text-xs">
                                      <p className="text-gray-700">{note.content}</p>
                                      <p className="text-gray-400 text-[10px] mt-1">
                                        {note.author} • {formatDateTime(note.createdAt)}
                                      </p>
                                    </div>
                                  ))
                                )}
                              </div>
                              
                              {/* Add Note Input */}
                              <div className="mt-2">
                                <textarea
                                  value={selectedHistoryStage === stage.key ? historicalNote : ""}
                                  onChange={(e) => setHistoricalNote(e.target.value)}
                                  placeholder={`Add a note to ${stage.label} stage...`}
                                  rows="2"
                                  className="w-full text-xs border rounded-lg p-2 resize-none focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => handleAddHistoricalNote(stage.key)}
                                    disabled={!historicalNote.trim()}
                                    className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Add Note to {stage.label}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* LOGS - Show all notes */}
          {activeTab === "logs" && (
            <div>
              {logsLoading ? (
                <p className="text-center text-gray-400">Loading...</p>
              ) : logs.length === 0 ? (
                <p className="text-center text-gray-400">No activity</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex gap-3 mb-3">
                    <div
                      className={`w-10 h-10 flex items-center justify-center text-white rounded-full ${
                        LOG_COLORS[log.action_type] || "bg-gray-400"
                      }`}
                    >
                      {LOG_ICONS[log.action_type] || "•"}
                    </div>

                    <div className="flex-1 border p-3 rounded">
                      <p className="font-semibold">
                        {LOG_TITLES[log.action_type] || log.action_type}
                      </p>

                      {log.note && (
                        <p className="text-xs text-gray-500">{log.note}</p>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        {log.performed_by_name} •{" "}
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t text-right">
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}