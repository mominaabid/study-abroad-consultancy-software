// LeadsComponents/LeadsTable.jsx
import { formatDate } from "./LeadsConstants";
import { Avatar, StatusBadge } from "./LeadAtoms";

export default function LeadsTable({
  filteredLeads,
  counsellors,
  onRowClick,
  onEdit,
  onDelete,
  onAssign,
  actionMenu,
  setActionMenu,
  pagination,
  currentPage,
  onPageChange,
}) {

  function openActionMenu(e, lead) {
    e.stopPropagation();
    setActionMenu({
      lead,
      x: e.clientX - 180,
      y: e.clientY + 4
    });
  }

  const thCls = "px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap";
  const tdCls = "px-4 py-3.5 align-middle";

  return (
    <div className="flex-1 overflow-auto px-6 py-4">

      {/* Container */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <table className="w-full text-sm border-collapse">

          {/* Header */}
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-200">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 accent-teal-600" />
              </th>

              {["Lead", "Contact", "Program", "Status", "Source", "Created", ""].map(h => (
                <th key={h} className={thCls}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-20 text-gray-400 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">🔍</span>
                    <span>No leads found</span>
                  </div>
                </td>
              </tr>
            )}

            {filteredLeads.map((lead, i) => (
              <tr
                key={lead.id}
                onClick={() => onRowClick(lead)}
                className={`border-b border-gray-100 cursor-pointer transition-all duration-200 
                hover:bg-teal-50/30 hover:ring-1 hover:ring-teal-100 group
                ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
              >

                {/* Checkbox */}
                <td className={tdCls} onClick={e => e.stopPropagation()}>
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 accent-teal-600" />
                </td>

                {/* Lead */}
                <td className={tdCls}>
                  <div className="flex items-center gap-3">
                    <Avatar name={lead.name} size={34} />
                    <div>
                      <p className="font-semibold text-gray-900 text-[13px]">{lead.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{lead.preferred_country || "—"}</p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className={tdCls}>
                  <p className="text-[12.5px] text-gray-700">{lead.email || "—"}</p>
                  <p className="text-[11.5px] text-gray-400 mt-0.5">{lead.phone || "—"}</p>
                </td>

                {/* Program */}
                <td className={tdCls}>
                  <span className="text-[12.5px] text-gray-700">{lead.study_level || "—"}</span>
                </td>

                {/* Status */}
                <td className={tdCls}>
                  <StatusBadge status={lead.status} />
                </td>

           

                {/* Source */}
                <td className={tdCls}>
                  <span className="text-[11.5px] text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-md">
                    {lead.source || "—"}
                  </span>
                </td>

                {/* Created */}
                <td className={`${tdCls} text-[12px] text-gray-400 whitespace-nowrap`}>
                  {formatDate(lead.createdAt)}
                </td>

                {/* Actions */}
                <td className={tdCls} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => openActionMenu(e, lead)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center 
                    text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.5"/>
                      <circle cx="12" cy="12" r="1.5"/>
                      <circle cx="12" cy="19" r="1.5"/>
                    </svg>
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200 bg-gray-50/50">
            <span className="text-xs text-gray-500">
              Page <strong>{currentPage}</strong> of <strong>{pagination.totalPages}</strong> · {pagination.total} leads
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition disabled:opacity-40"
              >
                ← Prev
              </button>

              <button
                disabled={currentPage >= pagination.totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Menu */}
      {actionMenu && (
        <div
          className="fixed bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg z-[1000] min-w-[180px] py-1"
          style={{ top: actionMenu.y, left: actionMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => { onRowClick(actionMenu.lead); setActionMenu(null); }}
            className="w-full px-4 py-2.5 text-[13px] text-gray-600 hover:bg-gray-100 text-left"
          >
            View Details
          </button>

          <button
            onClick={() => { onEdit(actionMenu.lead); setActionMenu(null); }}
            className="w-full px-4 py-2.5 text-[13px] text-gray-600 hover:bg-gray-100 text-left"
          >
            Edit Lead
          </button>

          <div className="h-px bg-gray-200 my-1" />

          <button
            onClick={() => { onDelete(actionMenu.lead); setActionMenu(null); }}
            className="w-full px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 text-left"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}