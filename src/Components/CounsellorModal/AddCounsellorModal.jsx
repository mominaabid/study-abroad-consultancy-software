import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";

const INITIAL_STATE = {
  name: "",
  email: "",
  phone: "",
  role: "",
  status: "active",
};

export const AddCounsellorModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/admin/addCounsellor`, formData);

      toast.success(res.data?.message || "Counsellor added successfully");

      setFormData(INITIAL_STATE);
      onClose();

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to add counsellor");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A78E]/20 focus:border-[#00A78E] transition-all placeholder:text-slate-400 text-slate-700";

  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Add New Counselor
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Create a new counselor account.
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
              className={inputClass}
              value={formData.name}
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
              className={inputClass}
              value={formData.email}
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
              className={inputClass}
              value={formData.phone}
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
              className={inputClass}
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-lg font-semibold text-white bg-[#00A78E] hover:bg-[#008f7a] shadow-lg shadow-teal-500/20 transition-all disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add Counselor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
