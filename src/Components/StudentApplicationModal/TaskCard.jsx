import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

// const TaskCard = ({ task, onUpdateStatus, onUploadDocument }) => {
const TaskCard = ({ task, onUploadDocument }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      await onUploadDocument(task.id, file);
      setIsUploading(false);
    }
  };

  const isCompleted = task.status === "Verified" || task.status === "Completed";

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">{task.icon}</div>
          <div>
            <h5 className="font-bold text-slate-800">{task.title}</h5>
            <p className="text-xs text-slate-500">{task.desc}</p>
          </div>
        </div>
        {isCompleted && <CheckCircle2 className="text-green-500" size={20} />}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
            isCompleted
              ? "bg-green-100 text-green-700"
              : task.status === "Uploaded"
                ? "bg-purple-100 text-purple-700"
                : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {task.status}
        </span>
        {task.date && (
          <span className="text-[10px] text-slate-400">date: {task.date}</span>
        )}
      </div>

      {!isCompleted && (
        <div className="mt-3">
          <input
            type="file"
            id={`upload-${task.id}`}
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <button
            onClick={() => document.getElementById(`upload-${task.id}`).click()}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Document →"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
