import React from "react";
import { X, Mail, Phone, Briefcase, Award, TrendingUp, Users } from "lucide-react";

export const ViewCounsellorModal = ({ isOpen, onClose, counselor }) => {
  if (!isOpen || !counselor) return null;

  const detailItem = (icon, label, value) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <div className="text-teal-600 bg-teal-50 p-2 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase font-semibold">{label}</p>
        <p className="text-sm text-slate-800 font-medium">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Counsellor Profile</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Section */}
            <div className="flex flex-col items-center text-center space-y-3 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
              <div className="w-24 h-24 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-sm">
                {counselor.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{counselor.name}</h3>
                <span className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-semibold ${
                  counselor.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {counselor.status?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {detailItem(<Briefcase size={18} />, "Role", counselor.role)}
                {detailItem(<Mail size={18} />, "Email", counselor.email)}
                {detailItem(<Phone size={18} />, "Contact", counselor.phone)}
                {detailItem(<Award size={18} />, "Experience", counselor.experience ? `${counselor.experience} Years` : "N/A")}
              </div>

              {/* Stats Section */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="border border-slate-100 rounded-xl p-4 bg-gradient-to-br from-white to-slate-50">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Users size={16} />
                    <span className="text-sm font-medium">Assigned Leads</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{counselor.assigned_leads || 0}</p>
                </div>
                <div className="border border-slate-100 rounded-xl p-4 bg-gradient-to-br from-white to-slate-50">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <TrendingUp size={16} />
                    <span className="text-sm font-medium">Conversion Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-teal-600">{counselor.conversion_rate || 0}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};