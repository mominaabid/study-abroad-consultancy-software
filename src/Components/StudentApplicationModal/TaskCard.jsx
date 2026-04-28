import React from "react";
import { CheckCircle2, XCircle, Clock, Eye, AlertTriangle } from "lucide-react";

export const TaskCard = ({ task }) => {
  const getStatusConfig = () => {
    switch (task.status) {
      case "Verified":
        return {
          icon: <CheckCircle2 size={14} className="text-green-500" />,
          bg: "bg-green-100",
          text: "text-green-700",
          label: "Verified",
        };
      case "Rejected":
        return {
          icon: <XCircle size={14} className="text-red-500" />,
          bg: "bg-red-100",
          text: "text-red-700",
          label: "Rejected",
        };
      case "In Review":
        return {
          icon: <Clock size={14} className="text-yellow-500" />,
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          label: "In Review",
        };
      default:
        return {
          icon: <Clock size={14} className="text-gray-400" />,
          bg: "bg-gray-100",
          text: "text-gray-600",
          label: "Pending",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isVerified = task.status === "Verified";
  const isRejected = task.status === "Rejected";

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">{task.icon}</div>
          <div>
            <h5 className="font-bold text-slate-800">{task.title}</h5>
            <p className="text-xs text-slate-500">{task.desc}</p>
            {task.required && (
              <span className="text-[10px] text-red-500 font-medium mt-1 inline-block">
                * Required
              </span>
            )}
          </div>
        </div>
        {isVerified && <CheckCircle2 className="text-green-500" size={20} />}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </span>
        {task.submittedAt && (
          <span className="text-[10px] text-slate-400">
            Submitted: {new Date(task.submittedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {isRejected && task.rejectionReason && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-start gap-1.5">
            <AlertTriangle
              size={12}
              className="text-red-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-xs font-semibold text-red-700">
                Rejection Reason:
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {task.rejectionReason}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        {isVerified && task.document?.file_url && (
          <a
            href={task.document.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            <Eye size={14} />
            View Document →
          </a>
        )}
      </div>

      {task.document && !isVerified && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 truncate">
            Current file: {task.document.original_name}
          </p>
        </div>
      )}
    </div>
  );
};
