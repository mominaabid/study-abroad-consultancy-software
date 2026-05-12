import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { 
  Clock, User, Mail, Phone, Building, BookOpen, 
  MapPin, Calendar, Award, FileText 
} from "lucide-react";
import { BASE_URL } from "../../Content/Url";
import SearchableSelect from "../SearchableSelect";
const getToken = () => localStorage.getItem("token") || "";

const authAxios = {
  put: (url, data) =>
    axios.put(url, data, { headers: { Authorization: `Bearer ${getToken()}` } }),
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
        <p className="text-sm font-medium text-slate-700 break-words">{value}</p>
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
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    setLoading(true);
    try {
      const res = await authAxios.put(
        `${BASE_URL}/counsellor/applications/${application.id}`,
        { status }
      );

      if (res.data.success) {
        toast.success("Status updated successfully");
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
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
        
        {/* Header */}
        <div className="p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock size={20} className="text-purple-600" />
            Change Application Status
          </h2>
          <p className="text-sm text-gray-500 mt-1">
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

            <InfoRow icon={<User size={16} />} label="Student Name" value={application.student_name || application.full_name} />
            <InfoRow icon={<Mail size={16} />} label="Email" value={application.email} />
            <InfoRow icon={<Phone size={16} />} label="Phone" value={application.phone} />
            <InfoRow icon={<Building size={16} />} label="University" value={application.target_university} />
            <InfoRow icon={<BookOpen size={16} />} label="Course" value={application.course} />
            <InfoRow icon={<MapPin size={16} />} label="Target Country" value={application.target_country} />
            <InfoRow icon={<Calendar size={16} />} label="Deadline" value={application.deadline ? new Date(application.deadline).toLocaleDateString() : "—"} />
            <InfoRow icon={<Award size={16} />} label="Last Degree" value={application.last_degree} />
            <InfoRow icon={<Award size={16} />} label="CGPA" value={application.cgpa} />
            <InfoRow icon={<FileText size={16} />} label="English Test" value={application.english_test} />
            <InfoRow icon={<Award size={16} />} label="Test Score" value={application.test_score} />
            
            {application.counselor_notes && (
              <InfoRow icon={<FileText size={16} />} label="Counselor Notes" value={application.counselor_notes} />
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
    options={STATUS_OPTIONS.map(opt => ({
      value: opt.value,
      label: opt.label,
      icon: opt.value === "inquiry" ? "" :
            opt.value === "evaluation" ? "" :
            opt.value === "application submitted" ? "" :
            opt.value === "offer letter received" ? "" :
            opt.value === "offer letter not received" ? "" :
            opt.value === "visa filed" ? "" :
            opt.value === "approved" ? "" : "",
    }))}
    placeholder="Search or select status..."
    required={true}
  />
</div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}