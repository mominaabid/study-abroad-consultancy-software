import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-y-auto mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white rounded-t-xl border-t-4 border-red-500">
          <h2 className="text-lg font-semibold text-black tracking-wide">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-black hover:bg-gray-100 transition-colors"
          >
            <RxCross2 size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-full mb-4">
              <FaExclamationTriangle size={34} className="text-red-600" />
            </div>

            <p className="text-black font-bold text-md leading-normal">
              Are you sure you want to delete?
              <br />
              This action cannot be undone.
            </p>

            {/* --- Increased content after the Exclamation Triangle --- */}
            <div className="mt-5 w-full bg-amber-50 rounded-md p-3 text-left border border-amber-200">
              <p className="text-sm font-medium text-amber-800">
                ⚠️ Important information:
              </p>
              <p className="text-xs text-amber-700 mt-1">
                This action is irreversible. All data related to this item will
                be permanently removed from the system. Please confirm that you
                have backed up any necessary information before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 bg-white rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-500 active:scale-95 transition-all shadow-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
