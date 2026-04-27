import React from "react";

const ActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
  >
    {icon}
    {label}
  </button>
);

export default ActionButton;