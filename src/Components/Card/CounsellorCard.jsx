import React from "react";
import {
  User,
  Mail,
  Phone,
  Edit2,
  TrendingUp,
  Users,
  Eye,
  Trash2,
} from "lucide-react";

export const CounselorCard = ({ counselor, onEdit, onView, onDelete }) => {
  const { name, role, email, phone, status, assigned_leads, conversion_rate } =
    counselor;

  const isActive = status === "active";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header Section */}
      <div className="p-5 pb-4 border-b border-slate-50">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">{name}</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                {role}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-5 py-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Mail size={14} className="text-slate-400" />
          <span className="truncate">{email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Phone size={14} className="text-slate-400" />
          <span>{phone}</span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-5 py-4 bg-slate-50 flex border-t border-slate-100">
        <div className="flex-1">
          <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
            <Users size={12} />
            <span>Leads</span>
          </div>
          <p className="font-bold text-slate-700">{assigned_leads || 0}</p>
        </div>
        <div className="w-[1px] bg-slate-200 mx-4"></div>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
            <TrendingUp size={12} />
            <span>Conversion</span>
          </div>
          <p className="font-bold text-slate-700">{conversion_rate || 0}%</p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
        >
          <Eye size={14} />
          View
        </button>

        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-teal-50"
        >
          <Edit2 size={14} />
          Edit
        </button>

        <button
          onClick={onDelete}
          className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all border border-transparent hover:border-red-100"
          title="Delete Counselor"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
