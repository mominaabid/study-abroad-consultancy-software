// LeadsComponents/LeadModal.jsx
import { useState, useEffect } from "react";
import { SOURCES, STUDY_LEVELS, EMPTY_FORM } from "./LeadsConstants";

export default function LeadModal({ open, onClose, onSave, counsellors, editLead }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editLead) {
      setForm({
        name:              editLead.name              || "",
        email:             editLead.email             || "",
        phone:             editLead.phone             || "",
        source:            editLead.source            || "website",
        preferred_country: editLead.preferred_country || "",
        study_level:       editLead.study_level       || "",
        counsellor_id:     editLead.counsellor_id     || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editLead, open]);

  if (!open) return null;

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try { await onSave(form); onClose(); } finally { setSaving(false); }
  }

  const inputCls =
    "h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none bg-white transition " +
    "focus:border-teal-500 focus:ring-2 focus:ring-teal-100 w-full";

  const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-[slideUp_0.22s_ease]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">
              {editLead ? "Edit Lead" : "Add New Lead"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {editLead ? "Update lead information" : "Fill in the details below"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name *" error={errors.name}>
              <input className={inputCls} value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="John Smith" />
            </Field>
            <Field label="Phone *" error={errors.phone}>
              <input className={inputCls} value={form.phone}
                onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+92 300 0000000" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <input type="email" className={inputCls} value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com" />
            </Field>
            <Field label="Source">
              <select className={inputCls} value={form.source}
                onChange={(e) => setForm(p => ({ ...p, source: e.target.value }))}>
                {SOURCES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Preferred Country">
              <input className={inputCls} value={form.preferred_country}
                onChange={(e) => setForm(p => ({ ...p, preferred_country: e.target.value }))}
                placeholder="e.g. UK, USA" />
            </Field>
            <Field label="Study Level">
              <select className={inputCls} value={form.study_level}
                onChange={(e) => setForm(p => ({ ...p, study_level: e.target.value }))}>
                <option value="">Select level</option>
                {STUDY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Assign Counsellor">
            <select className={inputCls} value={form.counsellor_id || ""}
              onChange={(e) => setForm(p => ({ ...p, counsellor_id: e.target.value }))}>
              <option value="">Unassigned</option>
              {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm shadow-teal-200">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editLead ? "Save Changes" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}