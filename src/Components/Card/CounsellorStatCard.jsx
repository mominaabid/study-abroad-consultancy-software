import React from "react";
import { Users, UserCheck, Target, BarChart3 } from "lucide-react";

export const CounsellorStatCard = ({ label, value }) => {
  const getIcon = (label) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("total"))
      return <Users className="text-blue-600" size={20} />;
    if (lowerLabel.includes("active"))
      return <UserCheck className="text-emerald-600" size={20} />;
    if (lowerLabel.includes("leads"))
      return <Target className="text-orange-600" size={20} />;
    if (lowerLabel.includes("conversion") || lowerLabel.includes("rate"))
      return <BarChart3 className="text-purple-600" size={20} />;
    return <Users className="text-teal-600" size={20} />;
  };

  const getBgColor = (label) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("total")) return "bg-blue-50";
    if (lowerLabel.includes("active")) return "bg-emerald-50";
    if (lowerLabel.includes("leads")) return "bg-orange-50";
    return "bg-purple-50";
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${getBgColor(label)}`}>
        {getIcon(label)}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
};
