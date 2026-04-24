import { useState, useEffect } from "react";
import { STAGES, formatDate } from "./LeadsConstants";
import { BASE_URL } from "../../Content/Url";
import { toast } from "react-toastify";

import {
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaDatabase,
  FaCalendarAlt,
  FaUser,
  FaArrowRight,
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaExchangeAlt,
  FaStickyNote,
  FaInfoCircle,
  FaSave,
} from "react-icons/fa";

export default function LeadDrawer({ lead, onClose, onStage }) {
  const [localStage, setLocalStage] = useState(lead?.status || "");
  const [stageNotesMap, setStageNotesMap] = useState({});
  const [activeTab, setActiveTab] = useState("details");
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const stageOrder = STAGES.map((s) => s.key);

  // Load saved notes from localStorage when component mounts
  useEffect(() => {
    if (lead?.id) {
      const savedNotes = localStorage.getItem(`lead_notes_${lead.id}`);
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes);
          setStageNotesMap(parsedNotes);
        } catch (e) {
          console.error("Error loading saved notes:", e);
        }
      }
    }
  }, [lead?.id]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (lead?.id && Object.keys(stageNotesMap).length > 0) {
      localStorage.setItem(
        `lead_notes_${lead.id}`,
        JSON.stringify(stageNotesMap),
      );
    }
  }, [stageNotesMap, lead?.id]);

  const stageNote = stageNotesMap[localStage] || "";

  function canMoveStage(current, target) {
    const currentIndex = stageOrder.indexOf(current);
    const targetIndex = stageOrder.indexOf(target);

    if (targetIndex === currentIndex) return false;
    if (targetIndex === currentIndex + 1) return true;
    if (targetIndex < currentIndex) return true;
    return false;
  }

  function isMovingBackward(current, target) {
    return stageOrder.indexOf(target) < stageOrder.indexOf(current);
  }

  // Function to save note for current stage without moving
  const handleSaveNote = () => {
    if (stageNote.trim()) {
      setStageNotesMap((prev) => ({
        ...prev,
        [localStage]: stageNote,
      }));
      toast.success("📝 Note saved for this stage!");
    } else {
      toast.warning("Please add some content before saving");
    }
  };

  const handleStageChange = async (targetStage) => {
    const currentStage = localStage;

    if (!canMoveStage(currentStage, targetStage)) {
      toast.error(
        "🚫 Can only move forward one step or backward to any previous stage!",
      );
      return;
    }

    const isBackward = isMovingBackward(currentStage, targetStage);

    // IMPORTANT: Save the note for the CURRENT stage before moving
    if (stageNote.trim()) {
      setStageNotesMap((prev) => ({
        ...prev,
        [currentStage]: stageNote,
      }));
    }

    if (isBackward) {
      // When moving backward, just change the stage
      // The note for the target stage will be preserved from stageNotesMap
      setLocalStage(targetStage);
      toast.success(
        `Stage moved backward to ${STAGES.find((s) => s.key === targetStage)?.label}`,
      );
      return;
    }

    // Forward movement requires a note
    if (!stageNote.trim()) {
      toast.error("📝 Please add a note before moving forward!");
      return;
    }

    // Send the note to backend
    setIsSaving(true);
    try {
      await onStage(lead.id, targetStage, stageNote);
      setLocalStage(targetStage);

      // Don't clear the note for the new stage - keep whatever was there
      // Just ensure we don't overwrite existing notes
      setStageNotesMap((prev) => ({
        ...prev,
        // Keep the note for the current stage we just left
        [currentStage]: stageNote,
        // Don't clear the target stage's note, preserve it if exists
      }));

      toast.success(
        `Stage moved forward to ${STAGES.find((s) => s.key === targetStage)?.label}`,
      );
    } catch (error) {
      toast.error("Failed to move stage. Please try again.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchLogs = async () => {
    if (!lead?.id) return;

    try {
      setLogsLoading(true);
      const res = await fetch(`${BASE_URL}/admin/leads/${lead.id}/logs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setLogs(
        Array.isArray(data)
          ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          : [],
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "logs") fetchLogs();
  };

  if (!lead) return null;

  const detailItem = (icon, label, value) => (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
      <div className="text-teal-600 bg-gradient-to-br from-teal-50 to-teal-100 p-2.5 rounded-xl">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-700">{value || "—"}</p>
      </div>
    </div>
  );

  const getStageColor = (stageKey) => {
    const stage = STAGES.find((s) => s.key === stageKey);
    return stage?.color || "#00A78E";
  };

  const getStageLabel = (stageKey) => {
    const stage = STAGES.find((s) => s.key === stageKey);
    return stage?.label || stageKey;
  };

  const TimelineItem = ({ log, isLast }) => {
    const stageColor = getStageColor(log.new_stage || log.stage);
    const isStageChange =
      log.action === "stage_change" || log.new_stage || log.old_stage;

    let displayNote = log.note;
    let timestamp = log.created_at;

    const userMatch = log.note?.match(/by (.+)$/);
    const updatedBy = userMatch ? userMatch[1] : null;

    if (updatedBy && log.note) {
      displayNote = log.note.replace(` by ${updatedBy}`, "");
    }

    return (
      <div className="relative pl-8 pb-6 group">
        {!isLast && (
          <div
            className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-slate-200 to-slate-100"
            style={{ height: "calc(100% - 32px)" }}
          />
        )}

        <div className="absolute left-0 top-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110"
            style={{
              backgroundColor: isStageChange ? stageColor : "#64748B",
              boxShadow: `0 0 0 3px ${isStageChange ? stageColor + "20" : "#64748B20"}`,
            }}
          >
            {isStageChange ? (
              <FaExchangeAlt className="text-white text-xs" />
            ) : (
              <FaStickyNote className="text-white text-xs" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-all duration-200 group-hover:border-teal-200">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {isStageChange && (
                <div className="flex items-center gap-2 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-lg">
                  <span className="text-slate-600">
                    {getStageLabel(log.old_stage)}
                  </span>
                  <FaArrowRight className="text-slate-400 text-xs" />
                  <span className="font-bold" style={{ color: stageColor }}>
                    {getStageLabel(log.new_stage)}
                  </span>
                </div>
              )}
              {!isStageChange && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <FaClipboardList className="text-teal-500 text-sm" />
                  <span className="text-sm font-semibold text-slate-700">
                    Activity Logged
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
              <FaClock className="text-xs" />
              <span className="font-mono">{formatDate(timestamp)}</span>
            </div>
          </div>

          {displayNote && (
            <div className="mt-3 p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border-l-4 border-teal-400">
              <p className="text-sm text-slate-700 leading-relaxed">
                {displayNote}
              </p>
            </div>
          )}

          {updatedBy && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <FaUser className="text-white text-xs" />
              </div>
              <span className="text-xs font-medium text-slate-600">
                Updated by{" "}
                <span className="text-teal-600 font-semibold">{updatedBy}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const StageProgress = () => {
    const currentIndex = stageOrder.indexOf(localStage);

    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-slate-50 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Current Progress
          </h3>
          <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
            Stage {currentIndex + 1} of {STAGES.length}
          </span>
        </div>
        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / STAGES.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {STAGES.map((stage, idx) => (
            <div key={stage.key} className="text-center flex-1">
              <div
                className={`text-[9px] font-medium transition-all ${
                  idx <= currentIndex ? "text-teal-600" : "text-slate-400"
                }`}
              >
                {idx <= currentIndex && (
                  <FaCheckCircle className="inline mr-1 text-[8px]" />
                )}
                {stage.label.split(" ")[0]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl transform transition-all">
        {/* HEADER with gradient */}
        <div className="relative bg-gradient-to-r from-[#00A78E] to-[#00C9A8] text-white p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{lead.name}</h2>
              <p className="text-sm opacity-90 mt-1">
                Lead Management Dashboard
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* TABS with better design */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-2">
          {["details", "logs"].map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                activeTab === t
                  ? "text-[#00A78E]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "logs" ? "📋 Activity Timeline" : "ℹ️ Lead Details"}
              {t === "logs" && logs.length > 0 && (
                <span className="ml-2 bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {logs.length}
                </span>
              )}
              {activeTab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* BODY with improved scrolling */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {activeTab === "details" && (
            <>
              {/* Lead Information Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {detailItem(<FaEnvelope />, "Email", lead.email)}
                {detailItem(<FaPhone />, "Phone", lead.phone)}
                {detailItem(<FaGlobe />, "Country", lead.preferred_country)}
                {detailItem(<FaDatabase />, "Source", lead.source)}
                {detailItem(
                  <FaCalendarAlt />,
                  "Created Date",
                  formatDate(lead.createdAt),
                )}
              </div>

              {/* Stage Progress Visualization */}
              <StageProgress />

              {/* Stage Management */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Stage Management
                  </h3>
                  <div className="flex gap-2">
                    <FaInfoCircle className="text-slate-400 text-xs" />
                    <span className="text-[10px] text-slate-500">
                      Click buttons to change stage
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {STAGES.map((s) => {
                    const isCurrent = localStage === s.key;
                    const isBackward = isMovingBackward(localStage, s.key);
                    const canMove = canMoveStage(localStage, s.key);

                    return (
                      <button
                        key={s.key}
                        onClick={() => canMove && handleStageChange(s.key)}
                        disabled={!canMove || isSaving}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-all transform hover:scale-105 ${
                          isCurrent
                            ? "text-white shadow-lg"
                            : !canMove
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : isBackward
                                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                        }`}
                        style={isCurrent ? { background: s.color } : {}}
                      >
                        {isCurrent && (
                          <FaCheckCircle className="inline mr-1 text-[10px]" />
                        )}
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                {/* Notes Section with Save Button */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Stage Notes{" "}
                      {!isMovingBackward(localStage, localStage) &&
                        "(Required for forward movement)"}
                    </label>
                    <button
                      onClick={handleSaveNote}
                      className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg transition-all flex items-center gap-1"
                    >
                      <FaSave className="text-xs" />
                      Save Note
                    </button>
                  </div>
                  <textarea
                    value={stageNote}
                    onChange={(e) =>
                      setStageNotesMap((prev) => ({
                        ...prev,
                        [localStage]: e.target.value,
                      }))
                    }
                    placeholder="Write your notes here. These will be recorded in the activity log and saved for this stage..."
                    className="w-full border border-slate-200 p-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-slate-400">
                    {stageNote.length} characters
                  </div>
                </div>

                {/* Display saved notes for other stages */}
                {Object.keys(stageNotesMap).length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      📝 Saved Notes for Other Stages:
                    </p>
                    <div className="space-y-1">
                      {Object.entries(stageNotesMap)
                        .filter(([stage]) => stage !== localStage)
                        .map(([stage, note]) => (
                          <div key={stage} className="text-xs text-slate-600">
                            <span
                              className="font-semibold"
                              style={{ color: getStageColor(stage) }}
                            >
                              {getStageLabel(stage)}:
                            </span>{" "}
                            <span className="text-slate-500">
                              {note.substring(0, 50)}...
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "logs" && (
            <div className="timeline-container">
              {logsLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FaClipboardList className="text-slate-300 text-4xl" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No activities recorded yet
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Activities will appear here as you move through stages
                  </p>
                </div>
              ) : (
                <div className="timeline space-y-0">
                  {logs.map((log, idx) => (
                    <TimelineItem
                      key={log.id || idx}
                      log={log}
                      isLast={idx === logs.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-700 text-white px-6 py-2 rounded-xl hover:bg-slate-800 transition-all transform hover:scale-105 font-medium text-sm shadow-md"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
