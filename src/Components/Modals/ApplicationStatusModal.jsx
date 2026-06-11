import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Clock,
  User,
  Mail,
  Phone,
  Building,
  BookOpen,
  MapPin,
  Calendar,
  Award,
  FileText,
} from "lucide-react";
import { BASE_URL } from "../../Content/Url";
import SearchableSelect from "../SearchableSelect";
import { EditButton } from "../../Components/CustomButtons/EditButton"; // ✅ custom EditButton
import { CancelButton } from "../../Components/CustomButtons/CancelButton";
import { Title } from "../../Components/Title";

const getToken = () => localStorage.getItem("token") || "";

const authAxios = {
  put: (url, data) =>
    axios.put(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};

const STATUS_OPTIONS = [
  { value: "inquiry", label: "Inquiry" },
  { value: "evaluation", label: "Evaluation" },
  { value: "application submitted", label: "Application Submitted" },
  { value: "offer letter received", label: "Offer Letter Received" },
  { value: "offer letter not received", label: "Offer Letter Not Received" },
  { value: "visa filed", label: "Visa Filed" },
  { value: "approved", label: "Approved" },
  { value: "reject", label: "Reject" },
];

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-700 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ApplicationStatusModal({
  isOpen,
  onClose,
  application,
  onSuccess,
}) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (application) {
      setStatus(application.status || "inquiry");
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const handleSubmit = async () => {
    if (loading) return; // prevent double submission
    if (!status) {
      toast.error("Please select a status", { toastId: "get-status" });
      return;
    }

    setLoading(true);
    try {
      const res = await authAxios.put(
        `${BASE_URL}/counsellor/applications/${application.id}`,
        { status },
      );

      if (res.data.success) {
        toast.success("Status updated successfully", {
          toastId: "status-edit-suc",
        });
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status", {
        toastId: "edit-stat",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* ✅ Title component with close icon */}
        <Title setModal={onClose} className="rounded-t-2xl">
          Change Application Status
        </Title>

        {/* Subheading (preserved from original) */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-sm text-gray-500">
            {application.target_university} — {application.course}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Full Application Details Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Application Details
            </p>

            <InfoRow
              icon={<User size={16} />}
              label="Student Name"
              value={application.student_name || application.full_name}
            />
            <InfoRow
              icon={<Mail size={16} />}
              label="Email"
              value={application.email}
            />
            <InfoRow
              icon={<Phone size={16} />}
              label="Phone"
              value={application.phone}
            />
            <InfoRow
              icon={<Building size={16} />}
              label="University"
              value={application.target_university}
            />
            <InfoRow
              icon={<BookOpen size={16} />}
              label="Course"
              value={application.course}
            />
            <InfoRow
              icon={<MapPin size={16} />}
              label="Target Country"
              value={application.target_country}
            />
            <InfoRow
              icon={<Calendar size={16} />}
              label="Deadline"
              value={
                application.deadline
                  ? new Date(application.deadline).toLocaleDateString()
                  : "—"
              }
            />
            <InfoRow
              icon={<Award size={16} />}
              label="Last Degree"
              value={application.study_level}
            />
            <InfoRow
              icon={<Award size={16} />}
              label="CGPA"
              value={application.grades_cgpa}
            />
            <InfoRow
              icon={<FileText size={16} />}
              label="English Test"
              value={application.english_proficiency_test}
            />
            <InfoRow
              icon={<Award size={16} />}
              label="Test Score"
              value={application.english_test_overall_score}
            />

            {application.counselor_notes && (
              <InfoRow
                icon={<FileText size={16} />}
                label="Counselor Notes"
                value={application.counselor_notes}
              />
            )}
          </div>

          {/* Status Change Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={STATUS_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
                icon: "", // kept original logic
              }))}
              placeholder="Search or select status..."
              required={true}
            />
          </div>
        </div>

        {/* ✅ Footer with buttons at bottom-right corner */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
          <CancelButton handleCancel={onClose} />
          <EditButton handleUpdate={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
