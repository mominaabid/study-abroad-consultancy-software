import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";
import { useDispatch } from "react-redux";
import { addNotification } from "../../redux/slices/notificationSlice";

import { InputField } from "../InputFields/InputField";
import { TextareaField } from "../InputFields/TextareaField";
import { AddButton } from "../CustomButtons/AddButton";
import { Title } from "../Title";
import PhoneInputWithCountry from "../InputFields/PhoneInputWithCountry";
import { User, Mail, MapPin, CreditCard } from "lucide-react";

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

// Validation rules
const validateForm = (formData) => {
  const errors = {};

  // Name (required)
  if (!formData.name.trim()) {
    errors.name = "Full Name is required";
  } else if (formData.name.trim().length < 3) {
    errors.name = "Full Name must be at least 3 characters";
  } else if (formData.name.length > 50) {
    errors.name = "Full Name cannot exceed 50 characters";
  } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
    errors.name = "Only letters and spaces allowed";
  }

  // Father Name (optional but validated if provided)
  if (formData.father_name.trim()) {
    if (formData.father_name.trim().length < 3) {
      errors.father_name =
        "Father's Name must be at least 3 characters if provided";
    } else if (formData.father_name.length > 50) {
      errors.father_name = "Father's Name cannot exceed 50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.father_name)) {
      errors.father_name = "Only letters and spaces allowed";
    }
  }

  // Email (required)
  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Enter a valid email address (e.g., name@example.com)";
  }

  // Phone (required)
  const phoneDigits = formData.phone.replace(/\D/g, "");
  if (!formData.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (phoneDigits.length < 9) {
    errors.phone = "Phone number must have at least 9 digits";
  }

  // CNIC (optional but must be valid if provided)
  if (formData.cnic.trim()) {
    const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicPattern.test(formData.cnic)) {
      errors.cnic = "CNIC must be in format 00000-0000000-0";
    }
  }

  // Address (optional but validated if provided)
  if (formData.address.trim()) {
    if (formData.address.trim().length < 3) {
      errors.address = "Address must be at least 3 characters if provided";
    } else if (formData.address.length > 250) {
      errors.address = "Address cannot exceed 250 characters";
    }
  }

  return errors;
};

export const AddCounsellorModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isOpen) {
      setFormData(INITIAL_STATE);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (value.startsWith(" ")) return;

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      return;
    }

    let formattedValue = value;

    if ((name === "name" || name === "father_name") && value.length > 50)
      return;
    if (name === "address" && value.length > 250) return;

    if (name === "name" || name === "father_name") {
      const alphaRegex = /^[a-zA-Z\s]*$/;
      if (!alphaRegex.test(formattedValue)) return;
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
    // Clear error for this field when user starts typing
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop submission
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(`${BASE_URL}/admin/addCounsellor`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Counsellor added successfully!", {
        toastId: "Konslar-add",
      });

      dispatch(
        addNotification({
          message: `Counsellor "${formData.name}" created & email sent`,
        }),
      );

      setFormData(INITIAL_STATE);
      setErrors({});
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to add counsellor",
        { toastId: "konslar-add-nhi-horha" },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <Title setModal={onClose}>Add New Counselor</Title>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputField
                labelName="Full Name *"
                name="name"
                type="text"
                icon={<User size={18} />}
                value={formData.name}
                handlerChange={handleChange}
                placeholder="Full Name (Min 3, Max 50)"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>
              )}
            </div>
            <div>
              <InputField
                labelName="Father Name"
                name="father_name"
                type="text"
                icon={<User size={18} />}
                value={formData.father_name}
                handlerChange={handleChange}
                placeholder="Father's Name (Min 3, Max 50)"
              />
              {errors.father_name && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.father_name}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputField
                labelName="Email Address *"
                name="email"
                type="email"
                icon={<Mail size={18} />}
                value={formData.email}
                handlerChange={handleChange}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
              )}
            </div>
            <div>
              <PhoneInputWithCountry
                value={formData.phone}
                onChange={handleChange}
                name="phone"
                labelName="Phone Number *"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField
                labelName="CNIC"
                name="cnic"
                type="text"
                icon={<CreditCard size={18} />}
                value={formData.cnic}
                handlerChange={handleChange}
                placeholder="34104-0000000-0"
              />
              {errors.cnic && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.cnic}</p>
              )}
            </div>
          </div>

          <div>
            <TextareaField
              labelName="Address"
              name="address"
              type="text"
              icon={<MapPin size={18} />}
              value={formData.address}
              handlerChange={handleChange}
              placeholder="Full Address (Min 3, Max 250)"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>
            )}
          </div>

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
