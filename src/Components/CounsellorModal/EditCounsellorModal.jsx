import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";

export const EditCounsellorModal = ({
  isOpen,
  onClose,
  onSuccess,
  counselor,
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (counselor) {
      setFormData(counselor);
    }
  }, [counselor]);

  if (!isOpen || !counselor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.put(
        `${BASE_URL}/admin/updateCounsellor/${counselor.id || counselor._id}`,
        formData
      );

      toast.success(res.data?.message || "Counselor updated successfully");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to update counselor"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A78E]/20 focus:border-[#00A78E] transition-all text-slate-700 placeholder:text-slate-400";

  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      {/* Modal Width barha di hai symmetry ke liye */}
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Edit Counselor</h2>
            <p className="text-slate-500 text-sm mt-1">
              Modify the details for this counselor account.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
          
          {/* Row 1: Name and Father Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Father Name</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.father_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, father_name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Row 2: Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                required
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
                className={inputClass}
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          {/* Row 3: CNIC and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>CNIC</label>
              <input
                type="text"
                className={inputClass}
                value={formData.cnic || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cnic: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                className={inputClass}
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg font-semibold text-white bg-[#00A78E] hover:bg-[#008f7a] shadow-lg shadow-teal-500/20 transition-all disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Counselor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};