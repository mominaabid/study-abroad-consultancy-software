// LeadsComponents/LeadDrawer.jsx
import { useState } from "react";
import { STAGES, formatDate } from "./LeadsConstants";
import { Avatar } from "./LeadAtoms";

export default function LeadDrawer({ lead, onClose, onEdit, counsellors, onAssign, onStage }) {
  const [assigning, setAssigning] = useState(false);

  if (!lead) return null;

  async function handleAssign(counsellor_id) {
    setAssigning(true);
    await onAssign(lead.id, counsellor_id);
    setAssigning(false);
  }

  const currentStage = STAGES.find(s => s.key === lead.status);

  const InfoRow = ({ label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[10.5px] text-gray-400 uppercase tracking-wider w-20 flex-shrink-0 pt-0.5 font-semibold">
        {label}
      </span>
      <span className="text-sm text-gray-700">{value || "—"}</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[1500] flex justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-[420px] max-w-full bg-white h-full flex flex-col shadow-2xl animate-[slideLeft_0.22s_ease]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={lead.name} size={46} />
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">{lead.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {currentStage && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ background: currentStage.color }}
                  >
                    {currentStage.label}
                  </span>
                )}
                {lead.study_level && (
                  <span className="text-xs text-gray-400">{lead.study_level}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Contact Info */}
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Contact Info
            </h4>
            <div className="bg-gray-50 rounded-xl px-4 py-1">
              <InfoRow label="Email"   value={lead.email} />
              <InfoRow label="Phone"   value={lead.phone} />
              <InfoRow label="Country" value={lead.preferred_country} />
              <InfoRow label="Source"  value={lead.source} />
              <InfoRow label="Created" value={formatDate(lead.createdAt)} />
            </div>
          </section>

          {/* Pipeline Stage */}
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Move Stage
            </h4>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => onStage(lead.id, s.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                    lead.status === s.key
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                  }`}
                  style={lead.status === s.key ? { background: s.color, borderColor: s.color } : {}}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Assigned Counsellor */}
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Counsellor
            </h4>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white outline-none
                           focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition appearance-none"
                value={lead.counsellor_id || ""}
                onChange={(e) => handleAssign(e.target.value)}
                disabled={assigning}
              >
                <option value="">Unassigned</option>
                {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={() => { onEdit(lead); onClose(); }}
            className="w-full py-2.5 border border-teal-600 text-teal-600 rounded-xl text-sm font-semibold hover:bg-teal-50 transition"
          >
            Edit Lead
          </button>
        </div>
      </div>
    </div>
  );
}