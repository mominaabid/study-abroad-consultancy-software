import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";

import { InputField } from "../InputFields/InputField";
import { OptionField } from "../InputFields/OptionField";
import { TextareaField } from "../InputFields/TextareaField";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelButton } from "../CustomButtons/CancelButton";
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  CreditCard,
  Eye,
  EyeOff,
} from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
            "Hello!": formData.name,
            "Account Message": "Your account has been successfully created.",
            "Login Email": formData.email,
            "Temporary Password": formData.password,
          },
          { headers: { "Content-Type": "application/json" } },
        );
        console.log(res);
      } catch (emailError) {
        console.error("Email failed:", emailError);
      }

      toast.success("Counsellor added successfully!");
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
              icon={<User size={18} />} // 2. Pass the icon prop here
              value={formData.name}
              handlerChange={handleChange}
            />
            <InputField
              labelName="Father Name *"
              name="father_name"
              type="text"
              icon={<User size={18} />}
              value={formData.father_name}
              handlerChange={handleChange}
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
            />
            <InputField
              labelName="Phone Number *"
              name="phone"
              type="tel"
              icon={<Phone size={18} />}
              value={formData.phone}
              handlerChange={handleChange}
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
            />
            <OptionField
              labelName="Status"
              name="status"
              value={formData.status}
              handlerChange={handleChange}
              optionData={[
                { id: 1, label: "Active", value: "active" },
                { id: 2, label: "Inactive", value: "inactive" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <InputField
                labelName="Password *"
                name="password"
                // 3. Dynamic type based on state
                type={showPassword ? "text" : "password"}
                icon={<Lock size={18} />}
                value={formData.password}
                handlerChange={handleChange}
              />
              {/* 4. The Toggle Icon */}
              <button
                type="button"
                className="absolute right-3 top-[30px] text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="relative">
              <InputField
                labelName="Confirm Password *"
                name="confirm_password"
                type={showPassword ? "text" : "password"}
                icon={<Lock size={18} />}
                value={formData.confirm_password}
                handlerChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-[30px] text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <TextareaField
            labelName="Address *"
            name="address"
            type="text"
            icon={<MapPin size={18} />}
            value={formData.address}
            handlerChange={handleChange}
          />

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-1.5 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
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
