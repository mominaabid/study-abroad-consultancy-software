export default function DeleteConfirmModal({ lead, onConfirm, onCancel }) {
  if (!lead) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl animate-[slideUp_0.2s_ease]">
       
        <h3 className="text-[16px] font-bold text-gray-900 mb-2">Delete Lead?</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Are you sure you want to delete{" "}
          <strong className="text-gray-800">{lead.name}</strong>?{" "}
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(lead)}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition shadow-sm shadow-red-200"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}