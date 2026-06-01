import { useState, useEffect } from "react";
import { STAGES, formatDate } from "./LeadsConstants";
import { BASE_URL } from "../../Content/Url";
import { toast } from "react-toastify";

import {
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaHashtag,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  X,
  AlertTriangle,
  Clock,
  History,
  ArrowRightCircle,
} from "lucide-react";

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

function groupLogs(logs) {
  const groups = [];
  let i = 0;
  while (i < logs.length) {
    const log = logs[i];
    if (log.action_type === "stage_changed") {
      const next = logs[i + 1];
      const paired =
        next &&
        next.action_type === "note_added" &&
        next.performed_by_name === log.performed_by_name &&
        Math.abs(new Date(next.created_at) - new Date(log.created_at)) < 60000;
      groups.push({
        type: "stage_with_note",
        stage: log,
        note: paired ? next : null,
      });
      i += paired ? 2 : 1;
    } else {
      groups.push({ type: "note_only", note: log });
      i++;
    }
  }
  return groups;
}

function cleanNote(note) {
  if (!note) return "";
  return note.replace(/^\[.+?\]\s*/g, "").trim();
}

export default function LeadDrawer({ lead, onClose, onStage }) {
  const [stageNote, setStageNote] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [stageNotes, setStageNotes] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [targetStage, setTargetStage] = useState(null);
  const [isBackward, setIsBackward] = useState(false);

  if (!lead || !lead.id) {
    return (
      <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-xl">
          <div className="animate-spin h-10 w-10 border-4 border-[#00A78E] border-t-transparent rounded-full" />
          <p className="mt-5 text-base font-medium text-slate-600">
            Loading lead...
          </p>
        </div>
      </div>
    );
  }

  const stageOrder = STAGES.map((s) => s.key);
  const currentIndex = stageOrder.indexOf(lead.status);
  const currentStageLabel =
    STAGES.find((s) => s.key === lead.status)?.label || lead.status;

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/admin/leads/${lead.id}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const grouped = {};
        data.forEach((log) => {
          if (!log.note && !log.stage_to) return;
          let stageKey = null;
          if (log.stage_to) {
            const found = STAGES.find(
              (s) =>
                s.key === log.stage_to ||
                s.label.toLowerCase() === log.stage_to.toLowerCase(),
            );
            if (found) stageKey = found.key;
          }
          if (!stageKey && log.note) {
            const match = log.note.match(/^\[(.+?)\]/);
            if (match) {
              const extracted = match[1].trim();
              const found = STAGES.find(
                (s) =>
                  s.label.toLowerCase() === extracted.toLowerCase() ||
                  s.key.toLowerCase() === extracted.toLowerCase(),
              );
              if (found) stageKey = found.key;
            }
          }
          if (!stageKey) stageKey = lead.status;
          if (!grouped[stageKey]) grouped[stageKey] = [];
          grouped[stageKey].push({
            content: log.note?.replace(/^\[.+?\]\s*/, "") || "",
            author: log.performed_by_name || "System",
            createdAt: log.created_at,
          });
        });
        setStageNotes(grouped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [lead.id]);

  useEffect(() => {
    if (activeTab === "logs" && lead.id) {
      setLogsLoading(true);
      fetch(`${BASE_URL}/admin/leads/${lead.id}/logs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((r) => r.json())
        .then((data) =>
          setLogs(
            Array.isArray(data)
              ? data.sort(
                  (a, b) => new Date(b.created_at) - new Date(a.created_at),
                )
              : [],
          ),
        )
        .finally(() => setLogsLoading(false));
    }
  }, [activeTab, lead.id]);

  const openStageModal = (stage) => {
    const ti = stageOrder.indexOf(stage.key);
    if (
      (stage.key === "success" || stage.key === "rejected") &&
      lead.status !== "visa"
    ) {
      toast.error(`Must reach "Visa" stage before marking as ${stage.label}.` , { toastId: "reach-vsa" });
      return;
    }
    const SEQUENTIAL = [
      "new",
      "contacted",
      "counseling",
      "evaluated",
      "applied",
      "visa",
    ];
    if (ti > currentIndex + 1 && SEQUENTIAL.includes(stage.key)) {
      toast.error(
        `Complete "${STAGES[currentIndex + 1]?.label}" first before skipping ahead.`,  { toastId: "full-first" }
      );
      return;
    }
    setTargetStage(stage);
    setIsBackward(ti < currentIndex);
    setShowStageModal(true);
  };

  const handleStageConfirm = () => {
    if (!stageNote.trim()) return toast.error("Note is required!" , { toastId: "note-chahiye" });
    const finalNote = `[${targetStage.label}] ${stageNote}`;
    onStage(lead.id, targetStage.key, finalNote);
    setStageNote("");
    setShowStageModal(false);
    toast.success(`Moved to ${targetStage.label}` , { toastId: "moved" });
    setTimeout(fetchNotes, 700);
  };

  // Source badge color
  const sourceColors = {
    website: "bg-blue-50 text-blue-700",
    walkin: "bg-teal-50 text-teal-700",
    whatsapp: "bg-green-50 text-green-700",
    email: "bg-violet-50 text-violet-700",
    facebook: "bg-indigo-50 text-indigo-700",
    referral: "bg-orange-50 text-orange-700",
    google_ads: "bg-red-50 text-red-600",
    linkedin: "bg-sky-50 text-sky-700",
    agent: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#00A78E] px-5 py-4 flex justify-between items-center">
          <div>
            <p className="text-teal-100 text-xs mb-0.5">Lead details</p>
            <h2 className="text-white text-lg font-semibold">{lead.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-all"
          >
            <X size={30} className="text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {["details", "logs"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === t
                  ? "border-[#00A78E] text-[#00A78E]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t === "details" ? "Details & Notes" : "Activity Log"}
            </button>
          ))}
        </div>

        <div className="p-5 max-h-[74vh] overflow-y-auto">
          {activeTab === "details" && (
            <>
              {/* ── Lead Info Card ── */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5">
                {/* Top row: source + study level + date */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {lead.source && (
                    <span
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${sourceColors[lead.source] || "bg-slate-100 text-slate-600"}`}
                    >
                      {lead.source.replace("_", " ")}
                    </span>
                  )}
                  {lead.study_level && (
                    <span className="text-[11px] font-medium bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full">
                      {lead.study_level}
                    </span>
                  )}
                  {lead.created_at && (
                    <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
                      <FaCalendarAlt size={10} />
                      {formatDate(lead.created_at)}
                    </span>
                  )}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2">
                  {lead.email && (
                    <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-2">
                      <FaEnvelope
                        size={11}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="text-[12px] text-slate-600 truncate">
                        {lead.email}
                      </span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-2">
                      <FaPhone
                        size={11}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="text-[12px] text-slate-600 truncate">
                        {lead.phone}
                      </span>
                    </div>
                  )}
                  {lead.preferred_country && (
                    <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-2">
                      <FaGlobe
                        size={11}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="text-[12px] text-slate-600 truncate">
                        {lead.preferred_country}
                      </span>
                    </div>
                  )}
                  {lead.counsellor?.name && (
                    <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-2">
                      <FaHashtag
                        size={11}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="text-[12px] text-slate-600 truncate">
                        {lead.counsellor.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Pipeline Stepper ── */}
              <div className="mb-6">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-4">
                  Pipeline stages
                </p>
                <div className="flex flex-col">
                  {STAGES.map((s, i) => {
                    const ti = stageOrder.indexOf(s.key);
                    const isDone = ti < currentIndex;
                    const isCurrent = ti === currentIndex;

                    const canMove = (() => {
                      if (isCurrent) return { ok: false };
                      if (ti < currentIndex)
                        return {
                          ok: true,
                          warn: true,
                          msg: "You're reverting to a previous stage.",
                        };
                      if (
                        (s.key === "success" || s.key === "rejected") &&
                        lead.status !== "visa"
                      ) {
                        return {
                          ok: false,
                          msg: `Must reach "Visa" before marking as ${s.label}.`,
                        };
                      }
                      const SEQUENTIAL = [
                        "new",
                        "contacted",
                        "counseling",
                        "evaluated",
                        "applied",
                        "visa",
                      ];
                      if (ti > currentIndex + 1 && SEQUENTIAL.includes(s.key)) {
                        return {
                          ok: false,
                          msg: `Complete "${STAGES[currentIndex + 1]?.label}" first.`,
                        };
                      }
                      return { ok: true, warn: false };
                    })();

                    const isLocked = !isCurrent && !canMove.ok;
                    const isBack = ti < currentIndex;
                    const isNext = ti === currentIndex + 1;
                    const isLast = i === STAGES.length - 1;

                    return (
                      <div key={s.key} className="flex items-stretch gap-3">
                        <div className="flex flex-col items-center w-8 flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium border-2 transition-all flex-shrink-0 z-10
                            ${isDone ? "bg-[#00A78E] border-[#00A78E] text-white" : ""}
                            ${isCurrent ? "bg-white border-[#00A78E] text-[#00A78E]" : ""}
                            ${isLocked ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed" : ""}
                            ${!isDone && !isCurrent && !isLocked ? "bg-white border-slate-200 text-slate-400 cursor-pointer hover:border-[#00A78E] hover:text-[#00A78E]" : ""}
                          `}
                          >
                            {isDone ? (
                              <span className="text-[13px]">✓</span>
                            ) : (
                              <span className="text-[11px] font-semibold">
                                {i + 1}
                              </span>
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 flex-1 min-h-[12px] my-1 ${isDone ? "bg-[#00A78E]" : "bg-slate-200"}`}
                            />
                          )}
                        </div>

                        <div
                          className={`flex-1 pb-4 min-w-0 ${isLast ? "pb-0" : ""}`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span
                              className={`text-[13px] font-medium ${isLocked ? "text-slate-300" : "text-slate-800"}`}
                            >
                              {s.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-medium bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                            {isLocked && (
                              <span className="text-[10px] font-medium bg-red-50 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                🔒 Locked
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-[11px] mb-1.5 ${isLocked ? "text-red-400" : "text-slate-400"}`}
                          >
                            {isCurrent
                              ? "Lead is currently at this stage"
                              : isDone
                                ? "Completed"
                                : isLocked
                                  ? canMove.msg
                                  : isNext
                                    ? "Next stage — ready to advance"
                                    : isBack
                                      ? "Revert to this stage"
                                      : "Advance to this stage"}
                          </p>

                          {!isCurrent && !isLocked && (
                            <button
                              onClick={() => openStageModal(s)}
                              className={`text-[11px] font-medium px-3 py-1 rounded-full border transition-all
                                ${
                                  isBack
                                    ? "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-400 hover:text-white hover:border-amber-400"
                                    : "border-teal-300 text-teal-700 bg-teal-50 hover:bg-[#00A78E] hover:text-white hover:border-[#00A78E]"
                                }`}
                            >
                              {isBack ? "Revert here" : "Move here"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Stage Notes ── */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-[#00A78E]" />
                    <span className="text-[13px] font-medium text-slate-600">
                      Stage notes
                    </span>
                  </div>
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-[#00A78E] hover:underline flex items-center gap-1 text-xs"
                  >
                    <History size={14} /> Full history
                  </button>
                </div>

                {(stageNotes[lead.status] || []).length > 0 ? (
                  <div className="space-y-3">
                    {stageNotes[lead.status].map((note, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 border border-slate-100 rounded-xl p-4"
                      >
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          {note.content}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-2">
                          {note.author} · {formatDateTime(note.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <p className="text-[13px] text-slate-400">
                      No notes yet for this stage
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "logs" && (
            <div>
              {logsLoading ? (
                <p className="text-center py-12 text-slate-400 text-sm">
                  Loading activity...
                </p>
              ) : logs.length === 0 ? (
                <p className="text-center py-12 text-slate-400 text-sm">
                  No activity yet
                </p>
              ) : (
                <div className="flex flex-col">
                  {groupLogs(logs).map((g, gi) => {
                    const isLast = gi === groupLogs(logs).length - 1;

                    if (g.type === "stage_with_note") {
                      const s = g.stage;
                      const n = g.note;
                      const STAGE_ORDER = [
                        "new",
                        "contacted",
                        "counseling",
                        "evaluated",
                        "applied",
                        "visa",
                        "success",
                        "rejected",
                      ];
                      const isBack =
                        s.stage_from &&
                        s.stage_to &&
                        STAGE_ORDER.indexOf(s.stage_to) <
                          STAGE_ORDER.indexOf(s.stage_from);

                      return (
                        <div key={s.id} className="flex gap-3">
                          <div className="flex flex-col items-center w-8 flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 z-10">
                              <ArrowRightCircle
                                size={15}
                                className="text-teal-600"
                              />
                            </div>
                            {!isLast && (
                              <div className="w-px flex-1 bg-slate-100 my-1 min-h-[12px]" />
                            )}
                          </div>

                          <div
                            className={`flex-1 min-w-0 ${!isLast ? "pb-4" : ""}`}
                          >
                            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                              <div className="flex items-center gap-2 px-4 py-3">
                                <span className="text-[10px] font-medium bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">
                                  Stage changed
                                </span>
                                <span className="text-[11px] text-slate-400 ml-auto">
                                  {formatDateTime(s.created_at)}
                                </span>
                              </div>

                              {s.stage_from && s.stage_to && (
                                <div className="flex items-center gap-2 px-4 pb-3">
                                  <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-3 py-1 rounded-full capitalize">
                                    {s.stage_from}
                                  </span>
                                  <span className="text-slate-300 text-xs">
                                    →
                                  </span>
                                  <span
                                    className={`text-[11px] font-medium px-3 py-1 rounded-full capitalize ${
                                      isBack
                                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                                        : "bg-teal-50 text-teal-700 border border-teal-100"
                                    }`}
                                  >
                                    {s.stage_to}
                                  </span>
                                </div>
                              )}

                              {/* ✅ Display the system-generated note (e.g., "Moved from new to counseling") */}
                              {s.note && (
                                <div className="border-t border-slate-100 px-4 py-3 flex gap-2.5">
                                  <div className="w-0.5 rounded-full bg-slate-300 flex-shrink-0 self-stretch min-h-[16px]" />
                                  <p className="text-[12px] text-slate-500 italic leading-relaxed">
                                    {s.note}
                                  </p>
                                </div>
                              )}

                              {n && cleanNote(n.note) && (
                                <div className="border-t border-slate-100 px-4 py-3 flex gap-2.5">
                                  <div className="w-0.5 rounded-full bg-[#00A78E] flex-shrink-0 self-stretch min-h-[16px]" />
                                  <p className="text-[12px] text-slate-600 leading-relaxed">
                                    {cleanNote(n.note)}
                                  </p>
                                </div>
                              )}

                              <div className="border-t border-slate-100 px-4 py-2 flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center text-[9px] font-medium text-teal-700">
                                  {s.performed_by_name
                                    ?.split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  {s.performed_by_name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const n = g.note;
                    return (
                      <div key={n.id} className="flex gap-3">
                        <div className="flex flex-col items-center w-8 flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0 z-10">
                            <Clock size={14} className="text-violet-500" />
                          </div>
                          {!isLast && (
                            <div className="w-px flex-1 bg-slate-100 my-1 min-h-[12px]" />
                          )}
                        </div>

                        <div
                          className={`flex-1 min-w-0 ${!isLast ? "pb-4" : ""}`}
                        >
                          <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                            <div className="flex items-center gap-2 px-4 py-3">
                              <span className="text-[10px] font-medium bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full">
                                Note added
                              </span>
                              {n.stage_to && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize">
                                  {n.stage_to}
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 ml-auto">
                                {formatDateTime(n.created_at)}
                              </span>
                            </div>

                            <div className="px-4 pb-3 flex gap-2.5">
                              <div className="w-0.5 rounded-full bg-violet-400 flex-shrink-0 self-stretch min-h-[16px]" />
                              <p className="text-[12px] text-slate-600 leading-relaxed">
                                {cleanNote(n.note)}
                              </p>
                            </div>

                            <div className="border-t border-slate-100 px-4 py-2 flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-violet-50 flex items-center justify-center text-[9px] font-medium text-violet-700">
                                {n.performed_by_name
                                  ?.split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {n.performed_by_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stage Change Modal */}
      {showStageModal && targetStage && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <p className="text-[15px] font-semibold text-slate-800 mb-3">
                Move lead to stage
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {currentStageLabel}
                </span>
                <span className="text-slate-300 text-sm">→</span>
                <span
                  className={`text-[12px] font-medium px-3 py-1 rounded-full ${
                    isBackward
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-teal-50 text-teal-700 border border-teal-200"
                  }`}
                >
                  {targetStage.label}
                </span>
              </div>
            </div>

            {isBackward && (
              <div className="mx-4 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs px-3 py-2.5 rounded-lg">
                <AlertTriangle size={14} className="flex-shrink-0" />
                You're moving this lead to a previous stage.
              </div>
            )}

            <div className="p-4">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Note{" "}
                <span className="text-slate-300 font-normal">(required)</span>
              </p>
              <textarea
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                placeholder="Describe the reason for this stage change…"
                rows={4}
                className="w-full border border-slate-200 rounded-xl p-3 text-[13px] text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#00A78E] resize-none transition-all"
              />
            </div>

            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() => {
                  setShowStageModal(false);
                  setStageNote("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStageConfirm}
                disabled={!stageNote.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#00A78E] text-white text-[13px] font-medium hover:bg-[#00865F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Confirm move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-800">
                All stage history
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 transition-all"
              >
                <XCircleIcon size={20} />
              </button>
            </div>
            <div className="p-5 overflow-auto max-h-[65vh] space-y-5">
              {STAGES.map((s) => (
                <div key={s.key}>
                  <p className="text-[12px] font-semibold text-slate-500 border-l-2 border-[#00A78E] pl-3 mb-2 uppercase tracking-wide">
                    {s.label}
                  </p>
                  {(stageNotes[s.key] || []).length > 0 ? (
                    stageNotes[s.key].map((n, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl mb-2"
                      >
                        <p className="text-[13px] text-slate-700">
                          {n.content}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1.5">
                          {n.author} · {formatDateTime(n.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[12px] text-slate-300 pl-3">No notes</p>
                  )}
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-100">
              <button
                onClick={() => setShowHistory(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-medium rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
