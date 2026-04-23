import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";
import { useDispatch } from "react-redux";
import { addNotification } from "../../redux/slices/notificationSlice";

import { InputField } from "../InputFields/InputField";
import { OptionField } from "../InputFields/OptionField";
import { TextareaField } from "../InputFields/TextareaField";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelButton } from "../CustomButtons/CancelButton";
import { User, Mail, Phone, MapPin, CreditCard } from "lucide-react";

const INITIAL_STATE = {
  name: "",
  father_name: "",
  email: "",
  phone: "",
  cnic: "",
  address: "",
  role: "counsellor",
  status: "active",
};

export const AddCounsellorModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (formattedValue.startsWith(" ")) return;

    if ((name === "name" || name === "father_name") && value.length > 50)
      return;
    if (name === "address" && value.length > 250) return;

    if (name === "name" || name === "father_name") {
      const alphaRegex = /^[a-zA-Z\s]*$/;
      if (!alphaRegex.test(formattedValue)) return;
    }

    if (name === "phone") {
      const numValue = value.replace(/\D/g, "");
      if (numValue.length > 11) return;
      formattedValue = numValue;
    }

    if (name === "cnic") {
      const nums = value.replace(/\D/g, "");
      if (nums.length > 13) return;
      let masked = nums;
      if (nums.length > 5 && nums.length <= 12) {
        masked = `${nums.slice(0, 5)}-${nums.slice(5)}`;
      } else if (nums.length > 12) {
        masked = `${nums.slice(0, 5)}-${nums.slice(5, 12)}-${nums.slice(12)}`;
      }
      formattedValue = masked;
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.name.trim().length < 3) {
      return toast.error("Full Name must be at least 3 characters");
    }
    if (formData.father_name.trim().length < 3) {
      return toast.error("Father's Name must be at least 3 characters");
    }
    if (formData.address.trim().length < 3) {
      return toast.error("Address must be at least 3 characters");
    }

    if (formData.phone.length !== 11) {
      return toast.error("Phone number must be exactly 11 digits");
    }
    if (formData.cnic.length !== 15) {
      return toast.error("CNIC must be in format: 00000-0000000-0");
    }

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/admin/addCounsellor`, formData);

      toast.success("Counsellor added successfully!");

      dispatch(
        addNotification({
          message: `Counsellor "${formData.name}" created & email sent`,
        }),
      );

      setFormData(INITIAL_STATE);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add counsellor");
    } finally {
      setLoading(false);
    }
  };

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
          <CancelButton handleCancel={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              labelName="Full Name *"
              name="name"
              type="text"
              icon={<User size={18} />}
              value={formData.name}
              handlerChange={handleChange}
              placeholder="Full Name (Min 3, Max 50)"
            />
            <InputField
              labelName="Father Name *"
              name="father_name"
              type="text"
              icon={<User size={18} />}
              value={formData.father_name}
              handlerChange={handleChange}
              placeholder="Father's Name (Min 3, Max 50)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              labelName="Email Address *"
              name="email"
              type="email"
              icon={<Mail size={18} />}
              value={formData.email}
              handlerChange={handleChange}
              placeholder="email@example.com"
            />
            <InputField
              labelName="Phone Number *"
              name="phone"
              type="text"
              icon={<Phone size={18} />}
              value={formData.phone}
              handlerChange={handleChange}
              placeholder="03001234567"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              labelName="CNIC *"
              name="cnic"
              type="text"
              icon={<CreditCard size={18} />}
              value={formData.cnic}
              handlerChange={handleChange}
              placeholder="34104-0000000-0"
            />

            {/* <OptionField
              labelName="Status"
              name="status"
              value={formData.status}
              handlerChange={handleChange}
              optionData={[
                { id: 1, label: "✅ Active", value: "active" },
                { id: 2, label: "🚫 Inactive", value: "inactive" },
              ]}
              inital="Select Status"
            /> */}
          </div>

          <TextareaField
            labelName="Address *"
            name="address"
            type="text"
            icon={<MapPin size={18} />}
            value={formData.address}
            handlerChange={handleChange}
            placeholder="Full Address (Min 3, Max 250)"
          />

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>

            <AddButton
              label="Add Counselor"
              loading={loading}
              handleClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
