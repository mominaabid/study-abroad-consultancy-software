import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";

const INITIAL_STATE = {
  name: "",
  father_name: "",
  email: "",
  phone: "",
  cnic: "",
  password: "",
  confirm_password: "",
  address: "",
  role: "counsellor",
  status: "active",
};

export const AddCounsellorModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      return toast.error("Passwords do not match!");
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/admin/addCounsellor`, formData);

      try {
        await axios.post(
          `https://formsubmit.co/ajax/${formData.email}`,
          {
            _subject: "Welcome! Your Counsellor Account is Ready",
            _template: "table", 
            _captcha: "false",
            _next: "http://localhost:5173/login",

            "Hello!": formData.name,
            "Account Message":
              "Your account has been successfully created by the administrator.",
            "Login Email": formData.email,
            "Temporary Password": formData.password,
            "Login Portal": "http://localhost:5173/login",
          },
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        console.log("Email sent successfully");
        console.log(res);
      } catch (emailError) {
        console.error("Email failed:", emailError);
      }

      toast.success("Counsellor added and welcome email sent!");
      setFormData(INITIAL_STATE);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add counsellor");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A78E]/20 focus:border-[#00A78E] transition-all placeholder:text-slate-400 text-slate-700";

  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Add New Counselor
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Fill in the details to create a new account.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className={labelClass}>Father Name</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.father_name}
                onChange={(e) =>
                  setFormData({ ...formData, father_name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>CNIC</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.cnic}
                onChange={(e) =>
                  setFormData({ ...formData, cnic: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                required
                className={inputClass}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                type="password"
                required
                className={inputClass}
                value={formData.confirm_password}
                onChange={(e) =>
                  setFormData({ ...formData, confirm_password: e.target.value })
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
              {loading ? "Adding..." : "Add Counselor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
