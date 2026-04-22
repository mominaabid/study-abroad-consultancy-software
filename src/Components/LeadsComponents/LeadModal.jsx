import { useState, useEffect } from "react";
import { SOURCES, STUDY_LEVELS, EMPTY_FORM } from "./LeadsConstants";
import { InputField } from "../InputFields/InputField"; // Adjust paths as needed
import { OptionField } from "../InputFields/OptionField";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelButton } from "../CustomButtons/CancelButton";
import { User, Phone, Mail, Database, Globe, BookOpen, UserCheck } from "lucide-react";

export default function LeadModal({
  open,
  onClose,
  onSave,
  counsellors,
  editLead,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
        counsellor_id: editLead.counsellor_id
          ? String(editLead.counsellor_id)
          : "",
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
    e?.preventDefault();
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

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Map your constants to the format required by OptionField
  const sourceOptions = SOURCES.map((s) => ({
    id: s,
    value: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  }));

  const studyLevelOptions = STUDY_LEVELS.map((l) => ({
    id: l,
    value: l,
    label: l,
  }));

  const counsellorOptions = counsellors.map((c) => ({
    id: c.id,
    value: c.id,
    label: c.name,
  }));

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {editLead ? "Edit Lead" : "Add New Lead"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {editLead
                ? "Update lead information"
                : "Fill in the details below"}
            </p>
          </div>
          <CancelButton handleCancel={onClose} />
        </div>

        {/* Form */}
        <form className="p-8 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <InputField
                labelName="Full Name *"
                name="name"
                value={form.name}
                handlerChange={handleCustomChange}
                icon={<User size={16} />}
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] ml-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <InputField
                labelName="Phone *"
                name="phone"
                value={form.phone}
                handlerChange={handleCustomChange}
                icon={<Phone size={16} />}
              />
              {errors.phone && (
                <p className="text-red-500 text-[10px] ml-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              labelName="Email *"
              type="email"
              name="email"
              value={form.email}
              handlerChange={handleCustomChange}
              icon={<Mail size={16} />}
            />

            <OptionField
              labelName="Source *"
              name="source"
              value={form.source}
              handlerChange={handleCustomChange}
              optionData={sourceOptions}
              inital="Select Source"
              icon={<Database size={16} />}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              labelName="Preferred Country *"
              name="preferred_country"
              value={form.preferred_country}
              handlerChange={handleCustomChange}
              icon={<Globe size={16} />}
            />

            <OptionField
              labelName="Study Level *"
              name="study_level"
              value={form.study_level}
              handlerChange={handleCustomChange}
              optionData={studyLevelOptions}
              inital="Select level"
              icon={<BookOpen size={16} />}
            />
          </div>

          <OptionField
            labelName="Assign Counsellor *"
            name="counsellor_id"
            value={form.counsellor_id}
            handlerChange={handleCustomChange}
            optionData={counsellorOptions}
            inital="Select Counsellor"
            icon={<UserCheck size={16} />}
          />

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-1.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <AddButton
              label={editLead ? "Update Lead" : "Save Lead"}
              loading={saving}
              handleClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
