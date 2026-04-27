import React from "react";
import { X } from "lucide-react";

const ApplicationDetailModal = ({ application, onClose, onUpdate }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            Application Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">
              University
            </label>
            <p className="text-gray-800">{application.target_university}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Course
            </label>
            <p className="text-gray-800">{application.course}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Status
            </label>
            <p className="text-gray-800">
              {application.status || "In Progress"}
            </p>
          </div>
          {application.deadline && (
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Deadline
              </label>
              <p className="text-gray-800">{application.deadline}</p>
            </div>
          )}
          {application.round && (
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Round
              </label>
              <p className="text-gray-800">{application.round}</p>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            {application.status !== "Submitted" && (
              <button
                onClick={() => {
                  onUpdate(application.id, "Submitted");
                  onClose();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Submit Application
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;