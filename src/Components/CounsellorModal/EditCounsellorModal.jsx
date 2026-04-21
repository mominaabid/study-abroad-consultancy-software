import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";
import { User, Mail, Phone, IdCard, MapPin, Users } from "lucide-react";

import { InputField } from "../InputFields/InputField";
import { TextareaField } from "../InputFields/TextareaField";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelButton } from "../CustomButtons/CancelButton";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.put(
        `${BASE_URL}/admin/updateCounsellor/${counselor.id || counselor._id}`,
        formData,
      );

      toast.success(res.data?.message || "Counselor updated successfully");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to update counselor",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Edit Counselor
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Modify the details for this counselor account.
            </p>
          </div>
          {/* Using your Custom CancelButton for the close icon */}
          <CancelButton handleCancel={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
          {/* Row 1: Name and Father Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              labelName="Full Name *"
              name="name"
              type="text"
              icon={<User size={18} />}
              value={formData.name || ""}
              handlerChange={handleChange}
            />
            <InputField
              labelName="Father Name *"
              name="father_name"
              type="text"
              icon={<Users size={18} />}
              value={formData.father_name || ""}
              handlerChange={handleChange}
            />
          </div>

          {/* Row 2: Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              labelName="Email Address *"
              name="email"
              type="email"
              icon={<Mail size={18} />}
              value={formData.email || ""}
              handlerChange={handleChange}
            />
            <InputField
              labelName="Phone Number *"
              name="phone"
              type="tel"
              icon={<Phone size={18} />}
              value={formData.phone || ""}
              handlerChange={handleChange}
            />
          </div>

          {/* Row 3: CNIC and Address */}
          <InputField
            labelName="CNIC *"
            name="cnic"
            type="text"
            icon={<IdCard size={18} />}
            value={formData.cnic || ""}
            handlerChange={handleChange}
          />

          <TextareaField
            labelName="Address *"
            name="address"
            type="text"
            icon={<MapPin size={18} />}
            value={formData.address || ""}
            handlerChange={handleChange}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-1.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <AddButton
              label="Update Counselor"
              loading={loading}
              handleClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
