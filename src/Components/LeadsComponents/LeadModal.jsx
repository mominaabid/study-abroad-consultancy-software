import { useState, useEffect } from "react";
import { SOURCES, STUDY_LEVELS, EMPTY_FORM } from "./LeadsConstants";
import { InputField } from "../InputFields/InputField";
import { OptionField } from "../InputFields/OptionField";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelButton } from "../CustomButtons/CancelButton";
import { User, Phone, Mail, Globe, BookOpen, UserCheck } from "lucide-react";

// Mapping sources to emojis for dropdown visibility
const SOURCE_ICONS = {
  website: "🌐",
  walkin: "🚶",
  whatsapp: "💬",
  email: "📧",
  facebook: "🔵",
  referral: "🤝",
  google_ads: "🔍",
  linkedin: "💼",
  agent: "🏢",
};

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
    if (!form.preferred_country?.trim())
      e.preferred_country = "Preferred country is required";
    if (!form.phone || form.phone.length !== 11)
      e.phone = "Phone number must be exactly 11 digits";
    if (!form.email?.trim()) e.email = "Email is required";
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
    if (value.startsWith(" ")) return;
    if ((name === "name" || name === "preferred_country") && /\d/.test(value))
      return;
    if (name === "phone" && (/[^0-9]/.test(value) || value.length > 11)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  // Modified sourceOptions to include iconss
  const sourceOptions = SOURCES.map((s) => {
    const icon = SOURCE_ICONS[s.toLowerCase()] || "📍";
    return {
      id: s,
      value: s,
      label: `${icon} ${s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}`,
    };
  });

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

        <form className="p-8 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <InputField
                labelName="Full Name *"
                name="name"
                value={form.name}
                handlerChange={handleCustomChange}
                icon={<User size={16} />}
                maxLength={50}
                minLength={3}
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] ml-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <InputField
                labelName="Phone (11 digits) *"
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
            <div className="space-y-1">
              <InputField
                labelName="Email *"
                type="email"
                name="email"
                value={form.email}
                handlerChange={handleCustomChange}
                icon={<Mail size={16} />}
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] ml-1">{errors.email}</p>
              )}
            </div>

            <OptionField
              labelName="Source *"
              name="source"
              value={form.source}
              handlerChange={handleCustomChange}
              optionData={sourceOptions}
              inital="Select Source"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              labelName="Preferred Country *"
              name="preferred_country"
              value={form.preferred_country}
              handlerChange={handleCustomChange}
              icon={<Globe size={16} />}
              maxLength={50}
              minLength={3}
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
          {editLead && (
            <OptionField
              labelName="Assign Counsellor *"
              name="counsellor_id"
              value={form.counsellor_id}
              handlerChange={handleCustomChange}
              optionData={counsellorOptions}
              inital="Select Counsellor"
              icon={<UserCheck size={16} />}
            />
          )}
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
