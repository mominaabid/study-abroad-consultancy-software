import React from 'react';
import { Edit2, Trash2, Copy, Check, ChevronLeft, ChevronRight, FileText, MessageSquare } from 'lucide-react';
import { getHumanFieldName } from '../../services/adminSupabaseService';

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

  if (loading) {
    return (
      <div className="admin-grid-loading">
        <div className="loading-animation-container">
          <div className="animated-pulse-ring" />
          <div className="animated-spinner-core" />
        </div>
        <p className="loading-animated-text">Loading records...</p>
      </div>
    );
  }

  if (!filteredRows || filteredRows.length === 0) {
    return (
      <div className="admin-grid-empty">
        <FileText size={40} className="empty-icon" />
        <h4>No records found in '{tableConfig.label}'</h4>
        <p>{searchQuery ? `No records matched "${searchQuery}".` : 'The table is empty.'}</p>
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
      return <span className="null-cell">--</span>;
    }

    if (typeof val === 'boolean') {
      return (
        <span className={`status-pill ${val ? 'pill-active' : 'pill-inactive'}`}>
          {val ? 'YES' : 'NO'}
        </span>
      );
    }

    if (typeof val === 'object') {
      return (
        <span className="json-cell" title={JSON.stringify(val)}>
          {JSON.stringify(val).substring(0, 30)}...
        </span>
      );
    }

    const valStr = String(val);
    if (valStr.length > 60) {
      return <span title={valStr}>{valStr.substring(0, 60)}...</span>;
    }

    return valStr;
  };

  const isChatOrLeadTable = tableConfig.id === 'chat_sessions' || tableConfig.id === 'chat_messages' || tableConfig.id === 'student_leads';
  const isTranscriptTable = tableConfig.id === 'chat_sessions' || tableConfig.id === 'student_leads';

  const pageSize = Math.max(1, Math.round(totalCount / (totalPages || 1))) || 12;

  return (
    <div className="admin-grid-container">
      <div className="admin-table-scroll-wrapper">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th className="col-reg-num" style={{ width: '85px', textAlign: 'center' }}>SR#</th>
              {columns.map((col) => (
                <th key={col}>
                  {getHumanFieldName(col)}
                </th>
              ))}
              {tableConfig.canModify && <th className="col-actions" style={{ textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => {
              const pKeyValue = row[primaryKey] || idx;
              const regNum = (page - 1) * pageSize + idx + 1;

              return (
                <tr key={pKeyValue || idx}>
                  <td className="col-reg-num" style={{ textAlign: 'center', fontWeight: '700', color: '#2563eb', fontSize: '0.82rem' }}>
                    {regNum}
                  </td>
                  {columns.map((col) => (
                    <td key={col} className={col === primaryKey ? 'col-pk' : ''}>
                      {renderCellValue(col, row[col], row)}
                    </td>
                  ))}
                  {tableConfig.canModify && (
                    <td className="col-actions">
                      <div className="action-buttons-group">
                        {isTranscriptTable && onViewTranscript && (
                          <button
                            className="action-btn view-chat-btn"
                            onClick={() => onViewTranscript(row)}
                            title="View Chat Transcript"
                            style={{ background: '#2563eb', color: '#fff', border: 'none' }}
                          >
                            <MessageSquare size={14} />
                          </button>
                        )}
                        {!isChatOrLeadTable && (
                          <button
                            className="action-btn edit-btn"
                            onClick={() => onEditRecord(row)}
                            title="Edit Record"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        <button
                          className="action-btn delete-btn"
                          onClick={() => onDeleteRecord(row)}
                          title="Remove Record"
                        >
                          <Trash2 size={14} />
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

      {/* Pagination Footer */}
      <div className="admin-pagination-bar">
        <div className="pagination-info">
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total records)
        </div>
        <div className="pagination-controls">
          <button
            className="paginate-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <span className="page-indicator">{page} / {totalPages}</span>
          <button
            className="paginate-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
