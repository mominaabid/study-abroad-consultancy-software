import React from "react";
import { formatDate } from "./LeadsConstants";
import { Avatar, StatusBadge } from "./LeadAtoms";
import { Pagination } from "../Pagination";
import { ShowDataNumber } from "../ShowDataNumber";

export default function LeadsTable({
  filteredLeads,
  onRowClick,
  onEdit,
  onDelete,
  onAssignCounsellor,
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
      y: e.clientY + 4,
    });
  }

  // Compact padding classes
  const thCls =
    "px-4 py-2.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50/80";
  const tdCls = "px-4 py-2.5 align-middle";

  // Calculate display range for ShowDataNumber
  const pageSize = pagination.pageSize || 10;
  const total = pagination.total || 0;
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex-1 overflow-auto p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Main Container with Black Border */}
      <div className="bg-white border border-black rounded-lg overflow-hidden shadow-md">
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <th className={`${thCls} w-12`}>
                  <span>#</span>
                </th>
                <th className={thCls}>Lead</th>
                <th className={thCls}>Contact</th>
                <th className={thCls}>Program</th>
                <th className={thCls}>Status</th>
                <th className={thCls}>Source</th>
                <th className={thCls}>Created</th>
                <th className={`${thCls} w-16`}>Actions</th>
              </tr>
            </thead>
            
            <tbody>
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <span className="text-4xl">📋</span>
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-sm">No leads found</p>
                        <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {filteredLeads.map((lead, i) => (
                <tr
                  key={lead.id}
                  onClick={() => onRowClick(lead)}
                  className={`
                    border-b border-gray-100 cursor-pointer transition-all duration-150
                    hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-transparent
                    ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}
                    group
                  `}
                >
                  {/* Serial Number */}
                  <td className={tdCls} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition-colors duration-200">
                      {i + 1}
                    </div>
                  </td>

                  {/* Lead */}
                  <td className={tdCls}>
                    <div className="flex items-center gap-2">
                      <div className="ring-1 ring-gray-200 rounded-full group-hover:ring-blue-300 transition-all duration-200">
                        <Avatar name={lead.name} size={32} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-xs group-hover:text-blue-600 transition-colors duration-200">
                          {lead.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-[10px] text-gray-500">
                            {lead.preferred_country || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className={tdCls}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-[11px] text-gray-600 truncate max-w-[150px]">
                          {lead.email || "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <p className="text-[11px] text-gray-600">
                          {lead.phone || "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Program */}
                  <td className={tdCls}>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-[11px] font-medium text-blue-700">
                        {lead.study_level || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className={tdCls}>
                    <div className="transform transition-all duration-200 group-hover:scale-105">
                      <StatusBadge status={lead.status} />
                    </div>
                  </td>

                  {/* Source */}
                  <td className={tdCls}>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                      {lead.source || "Direct"}
                    </span>
                  </td>

                  {/* Created */}
                  <td className={tdCls}>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 whitespace-nowrap">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(lead.createdAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className={tdCls} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => openActionMenu(e, lead)}
                      className="w-7 h-7 rounded-md flex items-center justify-center 
                        bg-white border border-gray-300
                        text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50
                        transition-all duration-200"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                        <circle cx="5" cy="12" r="1.5" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {pagination.totalPages >= 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <ShowDataNumber start={start} end={end} total={total} />
            <Pagination
              handlePageClick={(page) => onPageChange(page)}
              pageNo={currentPage}
              totalNum={total}
              pageSize={pageSize}
            />
          </div>
        )}
      </div>

      {/* Floating Action Menu */}
      {actionMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[999] "
            onClick={() => setActionMenu(null)}
          />
          
          {/* Menu */}
          <div
            className="fixed bg-white border  rounded-lg shadow-xl z-[1000] min-w-[200px] py-1"
            style={{ top: actionMenu.y, left: actionMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onRowClick(actionMenu.lead);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>

            <button
              onClick={() => {
                onEdit(actionMenu.lead);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Lead
            </button>

            <button
              onClick={() => {
                onAssignCounsellor(actionMenu.lead);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Assign Counsellor
            </button>

            <div className="my-1 border-t border-gray-100" />

            <button
              onClick={() => {
                onDelete(actionMenu.lead);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}