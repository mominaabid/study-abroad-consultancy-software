import React from "react";
import { X, Mail, Phone, Briefcase, User, CreditCard, MapPin, TrendingUp, Users } from "lucide-react";

export const ViewCounsellorModal = ({ isOpen, onClose, counselor }) => {
  if (!isOpen || !counselor) return null;

  const detailItem = (icon, label, value) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-teal-100 transition-colors">
      <div className="text-teal-600 bg-teal-50 p-2 rounded-lg">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{label}</p>
        <p className="text-sm text-slate-800 font-medium truncate">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header with Background Pattern */}
        <div className="relative px-8 py-6 bg-[#00A78E] text-white">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                {counselor.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight">{counselor.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                    counselor.status === "active" ? "bg-white text-[#00A78E]" : "bg-red-500 text-white"
                  }`}>
                    {counselor.status || "active"}
                  </span>
                  <span className="text-teal-100 text-sm opacity-80">| {counselor.role || "Counsellor"}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-6">
            
            {/* Primary Info Grid */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detailItem(<User size={18} />, "Father Name", counselor.father_name)}
                {detailItem(<CreditCard size={18} />, "CNIC", counselor.cnic)}
                {detailItem(<Mail size={18} />, "Email Address", counselor.email)}
                {detailItem(<Phone size={18} />, "Phone Number", counselor.phone)}
                <div className="sm:col-span-2">
                  {detailItem(<MapPin size={18} />, "Residential Address", counselor.address)}
                </div>
              </div>
            </section>

            {/* Performance Stats */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Performance Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 flex flex-col items-center justify-center text-center">
                  <Users className="text-teal-600 mb-2" size={24} />
                  <p className="text-2xl font-bold text-slate-800">{counselor.assigned_leads || 0}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Assigned Leads</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex flex-col items-center justify-center text-center">
                  <TrendingUp className="text-orange-600 mb-2" size={24} />
                  <p className="text-2xl font-bold text-slate-800">{counselor.conversion_rate || 0}%</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Conversion Rate</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all text-sm font-semibold shadow-lg shadow-slate-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};