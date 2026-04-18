import React, { useState } from "react";
import { X } from "lucide-react";

const EditCounsellorModal = ({ isOpen, onClose, onUpdate, counselor }) => {
  const [formData, setFormData] = useState(counselor || {});

  if (!isOpen || !counselor) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A78E]/20 focus:border-[#00A78E] transition-all text-slate-700 placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Edit Counselor
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Update counselor details and account settings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              required
              placeholder="Enter full name"
              className={inputClass}
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              placeholder="Enter email address"
              className={inputClass}
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              required
              placeholder="Enter phone number"
              className={inputClass}
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <input
              type="text"
              required
              placeholder="e.g., Senior Counselor"
              className={inputClass}
              value={formData.role || ""}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-lg font-semibold text-white bg-[#00A78E] hover:bg-[#008f7a] shadow-lg shadow-teal-500/20 transition-all"
            >
              Update Counselor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCounsellorModal;
