// LeadsComponents/LeadModal.jsx
import { useState, useEffect } from "react";
import { SOURCES, STUDY_LEVELS, EMPTY_FORM } from "./LeadsConstants";

export default function LeadModal({ open, onClose, onSave, counsellors, editLead }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens or editLead changes
  useEffect(() => {
    if (!open) return;

    if (editLead) {
      setForm({
        name: editLead.name || "",
        email: editLead.email || "",
        phone: editLead.phone || "",
        source: editLead.source || "website",
        preferred_country: editLead.preferred_country || "",
        study_level: editLead.study_level || "",
        counsellor_id: editLead.counsellor_id ? String(editLead.counsellor_id) : "",
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setErrors({});
  }, [open, editLead]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Name is required";
    if (!form.phone?.trim()) e.phone = "Phone is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const inputCls = 
    "h-11 px-4 border border-gray-200 rounded-2xl text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none w-full transition";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {editLead ? "Edit Lead" : "Add New Lead"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {editLead ? "Update lead information" : "Fill in the details below"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-2xl hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Full Name *</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={handleChange("name")}
                placeholder="John Smith"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Phone *</label>
              <input
                className={inputCls}
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="+92 300 1234567"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Email</label>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={handleChange("email")}
                placeholder="student@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Source</label>
              <select
                className={inputCls}
                value={form.source}
                onChange={handleChange("source")}
              >
                {SOURCES.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Preferred Country</label>
              <input
                className={inputCls}
                value={form.preferred_country}
                onChange={handleChange("preferred_country")}
                placeholder="UK, USA, Canada"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Study Level</label>
              <select
                className={inputCls}
                value={form.study_level}
                onChange={handleChange("study_level")}
              >
                <option value="">Select level</option>
                {STUDY_LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Assign Counsellor</label>
            <select
              className={inputCls}
              value={form.counsellor_id || ""}
              onChange={handleChange("counsellor_id")}
            >
              <option value="">Unassigned</option>
              {counsellors.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 text-sm font-semibold text-white bg-teal-600 rounded-2xl hover:bg-teal-700 disabled:opacity-70 transition"
            >
              {saving ? "Saving..." : editLead ? "Save Changes" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}