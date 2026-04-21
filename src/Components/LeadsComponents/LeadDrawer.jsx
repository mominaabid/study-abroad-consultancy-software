// LeadsComponents/LeadDrawer.jsx
import { useState } from "react";
import { STAGES, formatDate } from "./LeadsConstants";
import { X, Mail, Phone, Globe, Hash, Calendar, UserCheck } from "lucide-react";

export default function LeadDrawer({
  lead,
  onClose,
  counsellors,
  onAssign,
  onStage,
}) {
  const [assigning, setAssigning] = useState(false);

  if (!lead) return null;

  async function handleAssign(counsellor_id) {
    setAssigning(true);
    await onAssign(lead.id, counsellor_id);
    setAssigning(false);
  }

  const currentStage = STAGES.find((s) => s.key === lead.status);

  const detailItem = (icon, label, value) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-teal-100 transition-colors">
      <div className="text-teal-600 bg-teal-50 p-2 rounded-lg">{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
          {label}
        </p>
        <p className="text-sm text-slate-800 font-medium truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* ── Header with Brand Color ── */}
        <div className="relative px-8 py-3 bg-[#00A78E] text-white">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                {lead.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight">
                  {lead.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {currentStage && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white"
                      style={{ color: "#00A78E" }}
                    >
                      {currentStage.label}
                    </span>
                  )}
                  <span className="text-teal-100 text-sm opacity-80">
                    | {lead.study_level || "Student"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            {/* Contact & Source Info */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Lead Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detailItem(<Mail size={18} />, "Email Address", lead.email)}
                {detailItem(<Phone size={18} />, "Phone Number", lead.phone)}
                {detailItem(
                  <Globe size={18} />,
                  "Preferred Country",
                  lead.preferred_country,
                )}
                {detailItem(<Hash size={18} />, "Source", lead.source)}
                <div className="sm:col-span-2">
                  {detailItem(
                    <Calendar size={18} />,
                    "Registration Date",
                    formatDate(lead.createdAt),
                  )}
                </div>
              </div>
            </section>

            {/* Pipeline Stage Management */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Update Pipeline Stage
              </h3>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => onStage(lead.id, s.key)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 border ${
                      lead.status === s.key
                        ? "text-white shadow-md scale-105"
                        : "bg-white text-slate-500 border-slate-200 hover:border-teal-400 hover:text-teal-600"
                    }`}
                    style={
                      lead.status === s.key
                        ? { background: s.color, borderColor: s.color }
                        : {}
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Assignment Section */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Assign Counsellor
              </h3>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600">
                  <UserCheck size={18} />
                </div>
                <select
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none
                             focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition appearance-none cursor-pointer"
                  value={lead.counsellor_id || ""}
                  onChange={(e) => handleAssign(e.target.value)}
                  disabled={assigning}
                >
                  <option value="">Select a Counsellor</option>
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X size={14} className="rotate-45" />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end items-center">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-slate-700 text-white rounded-lg  transition-all text-sm font-semibold shadow-lg shadow-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
