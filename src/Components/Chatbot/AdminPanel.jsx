import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  SUPABASE_TABLES, 
  getTableConfig, 
  fetchTableRows, 
  deleteTableRow,
  updateTableRow,
  fetchSessionMessages,
  formatUserFriendlyError,
  getSingularLabel
} from '../../services/adminSupabaseService';
import AdminTableGrid from './AdminTableGrid';
import AdminRecordModal from './AdminRecordModal';
import AdminDashboard from './AdminDashboard';
import AdminNavbar from './AdminNavbar';
import { 
  Database, 
  Search, 
  RefreshCw, 
  Plus, 
  LogOut, 
  Lock, 
  Layers, 
  CheckCircle, 
  AlertTriangle,
  Table as TableIcon,
  MessageSquare,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  ClipboardCheck,
  Globe,
  Award,
  FileText,
  Menu
} from 'lucide-react';

const getCategoryIcon = (categoryName) => {
  if (categoryName.includes('Business')) return <Building2 size={15} className="cat-icon" />;
  if (categoryName.includes('Lead') || categoryName.includes('User')) return <Users size={15} className="cat-icon" />;
  if (categoryName.includes('Institutes') || categoryName.includes('Academics')) return <GraduationCap size={15} className="cat-icon" />;
  if (categoryName.includes('Admissions') || categoryName.includes('Requirements')) return <ClipboardCheck size={15} className="cat-icon" />;
  if (categoryName.includes('Locations') || categoryName.includes('System')) return <Globe size={15} className="cat-icon" />;
  return <Layers size={15} className="cat-icon" />;
};

const getTableItemIcon = (tableId) => {
  if (tableId === 'dashboard') return <LayoutDashboard size={14} />;
  if (tableId === 'institutes' || tableId === 'business_info') return <Building2 size={14} />;
  if (tableId === 'programs') return <GraduationCap size={14} />;
  if (tableId === 'student_leads') return <Users size={14} />;
  if (tableId === 'chat_sessions' || tableId === 'chat_messages') return <MessageSquare size={14} />;
  if (tableId === 'scholarships') return <Award size={14} />;
  if (tableId === 'countries') return <Globe size={14} />;
  if (tableId === 'english_requirements' || tableId === 'required_docs') return <FileText size={14} />;
  return <TableIcon size={14} />;
};

export default function AdminPanel({ onLockAdmin }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('educatia_admin_user');
      return saved ? JSON.parse(saved) : { full_name: 'Admin', username: 'admin', role: 'Super Admin', email: '' };
    } catch (_e) {
      return { full_name: 'Admin', username: 'admin', role: 'Super Admin', email: '' };
    }
  });

  const [selectedTable, setSelectedTable] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('table') || 'dashboard';
  });
  const [tableData, setTableData] = useState({ data: [], totalCount: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Dropdown Accordion Categories state (closed by default)
  const [openCategories, setOpenCategories] = useState({});

  const toggleCategory = (catName) => {
    setOpenCategories(prev => {
      const isAlreadyOpen = !!prev[catName];
      return isAlreadyOpen ? {} : { [catName]: true };
    });
  };
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    full_name: adminUser.full_name || 'Admin',
    username: adminUser.username || 'admin',
    email: adminUser.email || ''
  });

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  });

  // Collapsible Sidebar Navigation State (Starts collapsed; hover opens/closes automatically)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Chat Transcript & Student Lead Viewer state
  const [transcriptSessionId, setTranscriptSessionId] = useState(null);
  const [transcriptRecord, setTranscriptRecord] = useState(null);
  const [transcriptMessages, setTranscriptMessages] = useState([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [updatingLeadStatus, setUpdatingLeadStatus] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Read Leads Tracking (un-highlights once clicked like opened email)
  const [readLeadIds, setReadLeadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('educatia_read_lead_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (_e) {
      return [];
    }
  });

  const currentTableConfig = getTableConfig(selectedTable);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const copyText = (val, fieldKey) => {
    if (!val) return;
    navigator.clipboard.writeText(String(val));
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUpdateLeadStatus = async (newStatus) => {
    if (!transcriptRecord) return;
    const pkVal = transcriptRecord.lead_id !== undefined ? transcriptRecord.lead_id : (transcriptRecord.id !== undefined ? transcriptRecord.id : null);
    if (!pkVal) return;

    setUpdatingLeadStatus(true);
    try {
      await updateTableRow('student_leads', 'lead_id', pkVal, { status: newStatus });
      setTranscriptRecord(prev => ({ ...prev, status: newStatus }));
      showToast(`Lead status updated to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
      loadData();
    } catch (err) {
      console.error('Failed to update lead status:', err);
      showToast(formatUserFriendlyError(err), 'error');
    } finally {
      setUpdatingLeadStatus(false);
    }
  };

  const handleOpenTranscript = async (record) => {
    // 1. Mark lead as read in local storage and state immediately (removes bold unread highlight)
    const leadKey = String(record.lead_id || record.id || record.session_id || '');
    if (leadKey) {
      setReadLeadIds(prev => {
        if (!prev.includes(leadKey)) {
          const next = [...prev, leadKey];
          try {
            localStorage.setItem('educatia_read_lead_ids', JSON.stringify(next));
          } catch (_e) {}
          return next;
        }
        return prev;
      });
    }

    // 2. If lead is currently 'new', update status in database to 'contacted'
    if (record.lead_id && String(record.status || '').toLowerCase() === 'new') {
      try {
        await updateTableRow('student_leads', 'lead_id', record.lead_id, { status: 'contacted' });
        record.status = 'contacted';
        loadData();
      } catch (_e) {}
    }

    setTranscriptRecord(record);
    const sid = record.session_id || record.id || record.lead_id;
    setTranscriptSessionId(sid || 'active_lead');
    setLoadingTranscript(true);
    setTranscriptMessages([]);

    try {
      let resolvedMessages = [];

      // A. FIRST: Parse JSON transcript from last_message_snippet (most reliable source)
      //    This is written on every lead capture with the full conversation array
      if (record.last_message_snippet) {
        const rawSnippet = String(record.last_message_snippet).trim();
        if (rawSnippet.startsWith('[') || rawSnippet.startsWith('{')) {
          try {
            const parsed = JSON.parse(rawSnippet);
            if (Array.isArray(parsed) && parsed.length > 0) {
              resolvedMessages = parsed.map((p, idx) => ({
                id: `snippet-${idx}`,
                role: p.role || (idx % 2 === 0 ? 'user' : 'bot'),
                content: p.content || String(p),
                created_at: p.created_at || p.timestamp || record.created_at || new Date().toISOString()
              }));
            } else if (parsed && parsed.history && Array.isArray(parsed.history)) {
              resolvedMessages = parsed.history.map((p, idx) => ({
                id: `snippet-h-${idx}`,
                role: p.role || 'user',
                content: p.content || String(p),
                created_at: p.created_at || p.timestamp || record.created_at || new Date().toISOString()
              }));
            }
          } catch (_e) {}
        }
      }

      // B. Check localStorage saved transcripts (admin-side backup from widget)
      if (resolvedMessages.length === 0) {
        try {
          const savedTranscripts = JSON.parse(localStorage.getItem('educatia_saved_transcripts') || '{}');
          const sidKey = String(sid);
          const phoneKey = String(record.phone_number || '');
          const localMatch = savedTranscripts[sidKey] || (phoneKey ? savedTranscripts[phoneKey] : null);

          if (localMatch && Array.isArray(localMatch) && localMatch.length > 0) {
            resolvedMessages = localMatch.map((m, idx) => ({
              id: `local-${idx}`,
              role: m.role || 'user',
              content: m.content || '',
              created_at: m.timestamp || record.created_at || new Date().toISOString()
            }));
          }
        } catch (_e) {}
      }

      // C. Try Supabase chat_messages table as a fallback (pass phone for phone-keyed lookup)
      if (resolvedMessages.length === 0) {
        const msgs = await fetchSessionMessages(sid, record.phone_number);
        if (msgs && msgs.length > 0) {
          resolvedMessages = msgs;
        }
      }

      // D. Final fallback: display the student's initial inquiry snippet as plain text
      if (resolvedMessages.length === 0 && (record.last_message_snippet || record.content)) {
        const rawText = String(record.last_message_snippet || record.content || '').trim();
        resolvedMessages = [{
          id: 'lead-fallback-1',
          session_id: sid,
          role: 'user',
          content: rawText.startsWith('[') || rawText.startsWith('{') ? 'Student Inquiry' : rawText,
          created_at: record.created_at || new Date().toISOString()
        }];
      }

      setTranscriptMessages(resolvedMessages);
    } catch (err) {
      console.error('Error fetching transcript:', err);
      showToast('Failed to load chat transcript', 'error');
    } finally {
      setLoadingTranscript(false);
    }
  };

  const loadData = useCallback(async () => {
    if (selectedTable === 'dashboard') return;
    setLoading(true);
    try {
      const res = await fetchTableRows(selectedTable, { page, limit: 12, searchQuery });
      setTableData(res);
    } catch (err) {
      console.error('Failed to load table:', err);
      showToast(formatUserFriendlyError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedTable, page, searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tbl = params.get('table') || 'dashboard';
    setSelectedTable(tbl);
    setPage(1);
    setSearchQuery('');
  }, [location.search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedTable === 'student_leads' && tableData?.data?.length > 0) {
      try {
        const seenIds = JSON.parse(localStorage.getItem('educatia_seen_notif_ids') || '[]');
        const currentLeadIds = tableData.data.map(l => String(l.lead_id || l.id));
        const updated = [...new Set([...seenIds, ...currentLeadIds])];
        localStorage.setItem('educatia_seen_notif_ids', JSON.stringify(updated));
      } catch (_e) {}
    }
  }, [selectedTable, tableData]);

  const userRole = (adminUser?.role || '').toLowerCase();
  const userUsername = (adminUser?.username || '').toLowerCase();
  const isSuperAdmin = userRole.includes('super') || userUsername === 'admin' || userUsername === 'superadmin';

  const visibleCategories = SUPABASE_TABLES.map((cat) => {
    const filteredTables = cat.tables.filter((t) => {
      if (t.id === 'users' && !isSuperAdmin) return false;
      return true;
    });
    return { ...cat, tables: filteredTables };
  }).filter((cat) => cat.tables.length > 0);

  const handleTableChange = (newTableId) => {
    if (newTableId === 'users' && !isSuperAdmin) {
      showToast('Access restricted: Only Super Admins can manage user accounts.', 'error');
      setSelectedTable('dashboard');
      return;
    }
    if (newTableId === 'dashboard') {
      navigate(location.pathname);
      setOpenCategories({});
    } else {
      navigate(`${location.pathname}?table=${newTableId}`);
      const parentCat = visibleCategories.find(cat => cat.tables.some(t => t.id === newTableId));
      if (parentCat && parentCat.tables.length > 1) {
        setOpenCategories({ [parentCat.category]: true });
      } else {
        setOpenCategories({});
      }
    }
    setSelectedTable(newTableId);
    setPage(1);
    setSearchQuery('');
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingRecord(null);
    setIsRecordModalOpen(true);
  };


  const handleOpenEditModal = (record) => {
    setModalMode('edit');
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleDeletePrompt = (record) => {
    setDeleteConfirmRecord(record);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmRecord) return;
    const pkCol = currentTableConfig.primaryKey || 'id';
    const pkVal = deleteConfirmRecord[pkCol];

    try {
      await deleteTableRow(selectedTable, pkCol, pkVal);
      showToast(`Successfully deleted record [${pkVal}]`, 'success');
      setDeleteConfirmRecord(null);
      loadData();
    } catch (err) {
      showToast(formatUserFriendlyError(err), 'error');
    }
  };

  return (
    <div className={`admin-dashboard-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Toast Banner */}
      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Sidebar with Hover Auto-Open and Auto-Close */}
      <aside 
        className="admin-sidebar"
        onMouseEnter={() => setIsSidebarCollapsed(false)}
        onMouseLeave={() => setIsSidebarCollapsed(true)}
      >
        {/* Sidebar Brand Header — Logo when expanded, E badge when collapsed */}
        <div className="admin-sidebar-brand" style={{ 
          padding: '0.75rem 1rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid #e2e8f0',
          gap: '8px',
          minHeight: '58px'
        }}>
          {isSidebarCollapsed ? (
            /* Collapsed: E badge */
            <div 
              style={{ 
                width: '34px', 
                height: '34px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #009E99 0%, #008783 100%)', 
                color: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '900', 
                fontSize: '19px',
                fontFamily: 'Outfit, sans-serif',
                lineHeight: 1,
                boxShadow: '0 2px 8px rgba(0, 158, 153, 0.3)',
                flexShrink: 0 
              }}
              title="Educatia"
            >
              E
            </div>
          ) : (
            /* Expanded: Full logo */
            <img 
              src="/educatia-logo.png" 
              alt="Educatia" 
              style={{ 
                height: '36px', 
                maxWidth: '160px',
                objectFit: 'contain',
                objectPosition: 'left center'
              }} 
            />
          )}
        </div>

        <div className="admin-nav-categories">
          {/* Top-Level Main Module: Dashboard */}
          <div className="main-module-section">
            <button
              type="button"
              className={`main-module-btn ${selectedTable === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTableChange('dashboard')}
              title="Dashboard"
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>
          </div>

          <div className="sidebar-divider" />

          {/* Table Category Dropdowns */}
          {visibleCategories.map((cat) => {
            if (cat.tables.length === 1) {
              const singleTable = cat.tables[0];
              const isActive = selectedTable === singleTable.id;
              return (
                <div key={cat.category} className={`nav-category-group ${isActive ? 'has-active' : ''}`}>
                  <button
                    type="button"
                    className={`category-dropdown-btn ${isActive ? 'active-parent' : ''}`}
                    onClick={() => handleTableChange(singleTable.id)}
                    title={singleTable.label}
                    style={isActive ? { background: '#009E99', color: '#ffffff', borderColor: '#008783' } : {}}
                  >
                    {getTableItemIcon(singleTable.id)}
                    <span className="category-label-text">{singleTable.label}</span>
                    {!singleTable.canModify && <span className="view-only-tag">View</span>}
                  </button>
                </div>
              );
            }

            const isOpen = !!openCategories[cat.category];
            const hasActiveChild = cat.tables.some((t) => t.id === selectedTable);

            return (
              <div key={cat.category} className={`nav-category-group ${hasActiveChild ? 'has-active' : ''}`}>
                <button
                  type="button"
                  className={`category-dropdown-btn ${isOpen ? 'is-open' : ''} ${hasActiveChild ? 'active-parent' : ''}`}
                  onClick={() => toggleCategory(cat.category)}
                  title={cat.category}
                >
                  {getCategoryIcon(cat.category)}
                  <span className="category-label-text">{cat.category}</span>
                </button>

                {isOpen && (
                  <ul className="category-table-list">
                    {cat.tables.map((t) => (
                      <li key={t.id}>
                        <button
                          className={`table-nav-btn ${selectedTable === t.id ? 'active' : ''}`}
                          onClick={() => handleTableChange(t.id)}
                          title={t.label}
                        >
                          <span style={{ color: '#94a3b8', fontSize: '10px', flexShrink: 0, marginRight: '2px' }}>•</span>
                          <span className="table-nav-label">{t.label}</span>
                          {!t.canModify && <span className="view-only-tag">View</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="admin-sidebar-footer" style={{ padding: '0.85rem 1rem', fontSize: '11px', textAlign: 'center', color: '#64748b', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          {!isSidebarCollapsed ? (
            <span>
              Developed with ❤️ by <a href="https://technicmentors.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#009E99', fontWeight: '700', textDecoration: 'none' }}>Technic Mentors</a>
            </span>
          ) : (
            <a href="https://technicmentors.com/" target="_blank" rel="noopener noreferrer" title="Developed with ❤️ by Technic Mentors" style={{ color: '#009E99', fontWeight: '800', textDecoration: 'none', fontSize: '13px' }}>
              TM
            </a>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">

        {selectedTable === 'dashboard' ? (
          <AdminDashboard
            onNavigateTable={handleTableChange}
            onOpenCreateModal={(tblId) => {
              setSelectedTable(tblId);
              handleOpenCreateModal();
            }}
            searchQuery={searchQuery}
          />
        ) : (
          /* Data Grid Section */
          <div className="admin-grid-section">
            {/* Table Control Header Action Bar */}
            <div className="table-header-action-bar" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              {/* Left: Table Title & Count Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#ccfbf1',
                  color: '#009E99',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Database size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
                    {currentTableConfig?.label || 'Records'}
                  </h2>
                </div>
              </div>

              {/* Right: Search Input, Refresh, and Add Record Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Search Bar Input */}
                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder={`Search ${currentTableConfig?.label || 'records'}...`}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 30px 8px 34px',
                      fontSize: '13px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={loadData}
                  title="Refresh Table Data"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  <RefreshCw size={15} className={loading ? 'spin' : ''} />
                </button>

                {/* Add Record Action Button */}
                {currentTableConfig?.canModify && currentTableConfig?.canAdd !== false && (
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    title={`Add New ${getSingularLabel(currentTableConfig)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#009E99',
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0, 158, 153, 0.25)'
                    }}
                  >
                    <Plus size={16} />
                    <span>Add {getSingularLabel(currentTableConfig)}</span>
                  </button>
                )}
              </div>
            </div>

            <AdminTableGrid
              tableConfig={currentTableConfig}
              rows={tableData.data}
              totalCount={tableData.totalCount}
              page={page}
              totalPages={tableData.totalPages}
              onPageChange={(p) => setPage(p)}
              onEditRecord={handleOpenEditModal}
              onDeleteRecord={handleDeletePrompt}
              onViewTranscript={handleOpenTranscript}
              readLeadIds={readLeadIds}
              loading={loading}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </main>

      {/* Student Lead Details & Chat Transcript Modal */}
      {transcriptSessionId && (
        <div className="admin-modal-overlay">
          <div className="admin-auth-card" style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '24px' }}>
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#009E99] text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-inner">
                  {transcriptRecord?.student_name ? <Users size={20} /> : <MessageSquare size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white m-0 tracking-tight">
                      {transcriptRecord?.student_name || 'Chatbot Lead & Transcript'}
                    </h3>
                    {transcriptRecord && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        String(transcriptRecord.status || '').toLowerCase() === 'new'
                          ? 'bg-teal-400 text-slate-950 animate-pulse'
                          : 'bg-white/20 text-white'
                      }`}>
                        {String(transcriptRecord.status || 'Active').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 m-0 font-medium flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} className="text-teal-300" />
                    <span>
                      {transcriptRecord?.created_at
                        ? new Date(transcriptRecord.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                        : 'Live Chatbot Inquiry'}
                    </span>
                    {transcriptRecord?.lead_source && (
                      <>
                        <span>•</span>
                        <span className="text-teal-200">Source: {transcriptRecord.lead_source}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {transcriptRecord?.lead_id && (
                  <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl border border-white/20">
                    <span className="text-[11px] font-bold text-teal-200">Status:</span>
                    <select
                      value={transcriptRecord.status || 'new'}
                      disabled={updatingLeadStatus}
                      onChange={(e) => handleUpdateLeadStatus(e.target.value)}
                      className="text-xs bg-slate-900 text-white border border-white/30 rounded-lg px-2 py-1 font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-400"
                    >
                      <option value="new">🟢 New Lead</option>
                      <option value="contacted">🔵 Contacted</option>
                      <option value="in_progress">🟡 In Progress</option>
                      <option value="enrolled">🟢 Enrolled</option>
                      <option value="closed">⚪ Closed</option>
                    </select>
                  </div>
                )}
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => {
                    setTranscriptSessionId(null);
                    setTranscriptRecord(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {/* Student Overview Cards (if viewing a lead) */}
              {transcriptRecord && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={13} className="text-[#009E99]" />
                      Student Information & Preferences
                    </span>
                    {transcriptRecord.phone_number && (
                      <span className="text-[11px] text-slate-400">
                        Session: <code className="text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{String(transcriptSessionId || '').substring(0, 16)}...</code>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {/* Phone */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-slate-800">{transcriptRecord.phone_number || 'Not provided'}</span>
                        {transcriptRecord.phone_number && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => copyText(transcriptRecord.phone_number, 'phone')}
                              className="p-1 text-slate-400 hover:text-[#009E99] rounded transition"
                              title="Copy Phone"
                            >
                              {copiedField === 'phone' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                            <a
                              href={`https://wa.me/${String(transcriptRecord.phone_number).replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                              title="Message on WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-slate-800 truncate" title={transcriptRecord.email}>
                          {transcriptRecord.email || 'Not provided'}
                        </span>
                        {transcriptRecord.email && (
                          <button
                            type="button"
                            onClick={() => copyText(transcriptRecord.email, 'email')}
                            className="p-1 text-slate-400 hover:text-[#009E99] rounded transition"
                            title="Copy Email"
                          >
                            {copiedField === 'email' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Target Country */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Target Country</span>
                      <div className="mt-1">
                        <span className="text-xs font-bold text-[#009E99]">
                          {transcriptRecord.interested_country || 'Any Destination'}
                        </span>
                      </div>
                    </div>

                    {/* Target Institute */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Target University</span>
                      <div className="mt-1">
                        <span className="text-xs font-bold text-slate-800 truncate" title={transcriptRecord.interested_institute}>
                          {transcriptRecord.interested_institute || 'Open / General'}
                        </span>
                      </div>
                    </div>

                    {/* Program & Level */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Program & Level</span>
                      <div className="mt-1">
                        <span className="text-xs font-bold text-slate-800">
                          {transcriptRecord.interested_program || 'Any Program'} {transcriptRecord.degree_level ? `(${transcriptRecord.degree_level})` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Lead Status */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Current Pipeline</span>
                      <div className="mt-1">
                        <span className="text-xs font-black uppercase text-slate-700 tracking-wide">
                          {transcriptRecord.status || 'New'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Initial Query Snippet Highlight */}
                  {transcriptRecord.last_message_snippet && (
                    <div className="bg-teal-50/60 p-2.5 rounded-xl border border-teal-200/80 flex items-start gap-2 text-xs">
                      <span className="font-bold text-[#009E99] whitespace-nowrap">Initial Inquiry:</span>
                      <span className="text-slate-700 font-medium italic">"{transcriptRecord.last_message_snippet}"</span>
                    </div>
                  )}
                </div>
              )}

              {/* Complete Chatbot Conversation Box */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 text-[#009E99] flex items-center justify-center">
                      <MessageSquare size={13} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Complete Chatbot Conversation History
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#009E99] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    {transcriptMessages.length} Messages
                  </span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {loadingTranscript ? (
                    <div className="text-center py-12 text-slate-400">
                      <RefreshCw className="spin mx-auto text-[#009E99] mb-2" size={24} />
                      <p className="text-xs font-semibold">Loading full conversation transcript...</p>
                    </div>
                  ) : transcriptMessages.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                      <MessageSquare size={28} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600 m-0">No live message rows found for this session ID.</p>
                      {transcriptRecord?.last_message_snippet && (
                        <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                          Inquiry was captured directly from student interaction: "{transcriptRecord.last_message_snippet}"
                        </p>
                      )}
                    </div>
                  ) : (
                    transcriptMessages.map((m, idx) => {
                      const isUser = m.role === 'user';
                      const msgTime = m.created_at 
                        ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';

                      return (
                        <div key={m.id || idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-1 text-[10.5px] font-bold text-slate-400 mb-1 px-1">
                            {isUser ? (
                              <>
                                <span className="text-slate-600 font-bold">👤 Student ({transcriptRecord?.student_name || 'Visitor'})</span>
                                {msgTime && <span>• {msgTime}</span>}
                              </>
                            ) : (
                              <>
                                <span className="text-[#009E99] font-bold">🤖 Educatia AI Advisor</span>
                                {msgTime && <span>• {msgTime}</span>}
                              </>
                            )}
                          </div>

                          <div className={`
                            max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs
                            ${isUser 
                              ? 'bg-gradient-to-r from-[#009E99] to-[#008783] text-white font-medium rounded-tr-xs' 
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                            }
                          `}>
                            <p className="m-0 whitespace-pre-wrap">{m.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-white border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                {transcriptRecord?.phone_number && (
                  <a
                    href={`https://wa.me/${String(transcriptRecord.phone_number).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${transcriptRecord.student_name || 'Student'}, thank you for contacting Educatia Study Abroad. How can we assist you with your study plans today?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp Student</span>
                  </a>
                )}
                {transcriptRecord?.status === 'new' && (
                  <button
                    type="button"
                    disabled={updatingLeadStatus}
                    onClick={() => handleUpdateLeadStatus('contacted')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle size={14} />
                    <span>Mark as Contacted</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                onClick={() => {
                  setTranscriptSessionId(null);
                  setTranscriptRecord(null);
                }}
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Record Modal */}
      {isRecordModalOpen && (
        <AdminRecordModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          mode={modalMode}
          tableConfig={currentTableConfig}
          recordData={editingRecord}
          sampleRow={tableData.data?.[0]}
          onSaved={() => {
            showToast(`Record ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, 'success');
            loadData();
          }}
        />
      )}

      {/* Edit Admin Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-auth-card" style={{ maxWidth: '480px', width: '90%' }}>
            <div className="admin-auth-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="admin-lock-badge" style={{ background: '#009E99', color: '#fff' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Edit Admin Profile</h3>
                </div>
              </div>
              <button
                className="admin-icon-action-btn"
                onClick={() => setIsEditProfileModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const updatedUser = {
                  ...adminUser,
                  full_name: profileFormData.full_name,
                  username: profileFormData.username,
                  email: profileFormData.email
                };

                setAdminUser(updatedUser);
                sessionStorage.setItem('educatia_admin_user', JSON.stringify(updatedUser));
                showToast('Admin Profile updated successfully!', 'success');
                setIsEditProfileModalOpen(false);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  value={profileFormData.full_name}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Username</label>
                <input
                  type="text"
                  value={profileFormData.username}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  value={profileFormData.email}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div className="admin-auth-actions" style={{ marginTop: '10px', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setIsEditProfileModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-create-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Separate Reset Password Modal */}
      {isResetPasswordModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-auth-card" style={{ maxWidth: '440px', width: '90%' }}>
            <div className="admin-auth-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="admin-lock-badge" style={{ background: '#009E99', color: '#fff' }}>
                  <Lock size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Change Admin Password</h3>
                </div>
              </div>
              <button
                className="admin-icon-action-btn"
                onClick={() => setIsResetPasswordModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!resetPasswordData.new_password) {
                  showToast('Please enter a new password!', 'error');
                  return;
                }
                if (resetPasswordData.new_password !== resetPasswordData.confirm_password) {
                  showToast('Passwords do not match!', 'error');
                  return;
                }
                sessionStorage.setItem('educatia_admin_passcode', resetPasswordData.new_password);
                showToast('Admin password updated successfully!', 'success');
                setIsResetPasswordModalOpen(false);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '16px 0' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>New Password</label>
                <input
                  type="password"
                  value={resetPasswordData.new_password}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  required
                  placeholder="Enter new password"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Confirm New Password</label>
                <input
                  type="password"
                  value={resetPasswordData.confirm_password}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  required
                  placeholder="Confirm new password"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div className="admin-auth-actions" style={{ marginTop: '10px', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setIsResetPasswordModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-create-btn" style={{ background: '#009E99', color: '#fff' }}>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmRecord && (
        <div className="admin-modal-overlay">
          <div className="admin-auth-card">
            <div className="admin-auth-header">
              <div className="admin-lock-badge danger-badge">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this record?</p>
              </div>
            </div>
            <div className="admin-auth-actions">
              <button className="admin-btn-secondary" onClick={() => setDeleteConfirmRecord(null)}>
                Cancel
              </button>
              <button className="admin-btn-danger" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
