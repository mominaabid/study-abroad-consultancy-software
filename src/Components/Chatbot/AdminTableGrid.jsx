import React from 'react';
import { Edit2, Trash2, Copy, Check, FileText, MessageSquare } from 'lucide-react';
import { getHumanFieldName } from '../../services/adminSupabaseService';
import { Pagination } from '../Pagination';
import { ShowDataNumber } from '../ShowDataNumber';

export default function AdminTableGrid({
  tableConfig,
  rows = [],
  totalCount = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
  onEditRecord,
  onDeleteRecord,
  onViewTranscript,
  loading = false,
  searchQuery = ''
}) {
  const [copiedId, setCopiedId] = React.useState(null);

  // Client-side real-time filter across all columns for instant response
  const filteredRows = React.useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter(row => 
      Object.values(row || {}).some(val => String(val || '').toLowerCase().includes(q))
    );
  }, [rows, searchQuery]);

  const pageSize = Math.max(1, Math.round(totalCount / (totalPages || 1))) || 12;
  const displayStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const displayEnd = Math.min(page * pageSize, totalCount);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[calc(100vh-220px)] flex flex-col items-center justify-center py-16">
        <div className="loading-animation-container">
          <div className="animated-pulse-ring" />
          <div className="w-8 h-8 border-3 border-gray-200 border-t-[#009E99] rounded-full animate-spin mx-auto" />
        </div>
        <p className="loading-animated-text text-sm text-slate-500 mt-3 text-center">Loading records...</p>
      </div>
    );
  }

  if (!filteredRows || filteredRows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[calc(100vh-220px)] flex flex-col justify-between overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#009E99]">
            <FileText size={32} />
          </div>
          <h4 className="text-gray-800 font-bold text-base mb-1">No records found in '{tableConfig.label}'</h4>
          <p className="text-slate-400 text-xs">{searchQuery ? `No records matched "${searchQuery}".` : 'The table is empty.'}</p>
        </div>

        {/* Standardized Application Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white gap-3">
          <ShowDataNumber
            start={0}
            end={0}
            total={totalCount}
          />
          <Pagination
            handlePageClick={(p) => onPageChange(p)}
            pageNo={page}
            totalNum={totalCount}
            pageSize={pageSize}
          />
        </div>
      </div>
    );
  }

  // Detect columns from first row and filter out raw ID fields for clean presentation
  const allColumns = Object.keys(filteredRows[0] || {});
  const primaryKey = tableConfig.primaryKey || 'id';

  // Filter out 'id', '*_id', 'created_at', 'updated_at', and IP / device info fields from visible display columns
  const visibleColumns = allColumns.filter(col => 
    col !== 'id' && 
    !col.endsWith('_id') && 
    col !== 'created_at' && 
    col !== 'updated_at' &&
    col !== 'user_ip' &&
    col !== 'ip_address' &&
    col !== 'ip' &&
    col !== 'user_agent' &&
    col !== 'device_info' &&
    col !== 'user_device'
  );
  // Fallback to allColumns only if every single column happens to be an ID
  const columns = visibleColumns.length > 0 ? visibleColumns : allColumns;

  const copyToClipboard = (val, id) => {
    navigator.clipboard.writeText(String(val));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderCellValue = (col, val, row) => {
    if (val === null || val === undefined) {
      return <span className="text-slate-300 italic text-xs">--</span>;
    }

    if (typeof val === 'boolean') {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          val 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${val ? 'bg-green-500' : 'bg-red-500'}`} />
          {val ? 'YES' : 'NO'}
        </span>
      );
    }

    if (typeof val === 'object') {
      return (
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded" title={JSON.stringify(val)}>
          {JSON.stringify(val).substring(0, 30)}...
        </span>
      );
    }

    const valStr = String(val);
    if (valStr.length > 60) {
      return <span title={valStr} className="text-slate-700 text-xs">{valStr.substring(0, 60)}...</span>;
    }

    return <span className="text-slate-700 text-xs font-medium">{valStr}</span>;
  };

  const getColumnAlignmentClass = (col) => {
    if (col.includes('active') || col.includes('available') || col.includes('spouse') || col.includes('mandatory') || col.includes('foundation') || col === 'currency' || col === 'code') {
      return 'text-center';
    }
    if (col.includes('score') || col.includes('ratio') || col.includes('ranking') || col.includes('days') || col.includes('fee') || col.includes('deposit') || col.includes('min') || col.includes('max')) {
      return 'text-center';
    }
    return 'text-left';
  };

  const isChatOrLeadTable = tableConfig.id === 'chat_sessions' || tableConfig.id === 'chat_messages' || tableConfig.id === 'student_leads';
  const isTranscriptTable = tableConfig.id === 'chat_sessions' || tableConfig.id === 'student_leads';

  const thCls = "px-4 py-3 text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap bg-[#009E99]";
  const tdCls = "px-4 py-3 align-middle text-xs";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200 min-h-[calc(100vh-220px)] flex flex-col justify-between">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#009E99] border-b border-[#009E99]">
              <th className={`${thCls} w-14 text-center`}>SR#</th>
              {columns.map((col) => (
                <th key={col} className={`${thCls} ${getColumnAlignmentClass(col)}`}>
                  {getHumanFieldName(col)}
                </th>
              ))}
              {tableConfig.canModify && <th className={`${thCls} w-28 text-center`}>Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRows.map((row, idx) => {
              const pKeyValue = row[primaryKey] || idx;
              const regNum = (page - 1) * pageSize + idx + 1;

              return (
                <tr 
                  key={pKeyValue || idx}
                  className={`
                    border-b border-gray-100 transition-all duration-150
                    hover:bg-gradient-to-r hover:from-teal-50/40 hover:to-transparent
                    ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}
                    group
                  `}
                >
                  <td className={`${tdCls} text-center font-bold text-[#009E99]`}>
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-teal-50 text-xs font-bold text-[#009E99]">
                      {regNum}
                    </div>
                  </td>
                  {columns.map((col) => (
                    <td key={col} className={`${tdCls} ${getColumnAlignmentClass(col)}`}>
                      {renderCellValue(col, row[col], row)}
                    </td>
                  ))}
                  {tableConfig.canModify && (
                    <td className={`${tdCls} text-center`}>
                      <div className="flex items-center justify-center gap-1.5">
                        {isTranscriptTable && onViewTranscript && (
                          <button
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-[#009E99] text-white hover:bg-[#008783] shadow-sm transition-all duration-150"
                            onClick={() => onViewTranscript(row)}
                            title="View Chat Transcript"
                          >
                            <MessageSquare size={13} />
                          </button>
                        )}
                        {!isChatOrLeadTable && (
                          <button
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:text-[#009E99] hover:border-[#009E99] hover:bg-teal-50 transition-all duration-150"
                            onClick={() => onEditRecord(row)}
                            title="Edit Record"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        <button
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-400 hover:bg-red-50 transition-all duration-150"
                          onClick={() => onDeleteRecord(row)}
                          title="Remove Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Standardized Application Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white gap-3">
        <ShowDataNumber
          start={displayStart}
          end={displayEnd}
          total={totalCount}
        />
        <Pagination
          handlePageClick={(p) => onPageChange(p)}
          pageNo={page}
          totalNum={totalCount}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}

