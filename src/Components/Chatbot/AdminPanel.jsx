import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  SUPABASE_TABLES, 
  getTableConfig, 
  fetchTableRows, 
  deleteTableRow,
  fetchSessionMessages,
  formatUserFriendlyError
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

  // Chat Transcript Viewer state
  const [transcriptSessionId, setTranscriptSessionId] = useState(null);
  const [transcriptMessages, setTranscriptMessages] = useState([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const currentTableConfig = getTableConfig(selectedTable);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
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
      if (parentCat) {
        setOpenCategories({ [parentCat.category]: true });
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

  const handleOpenTranscript = async (record) => {
    // For student_leads: use session_id field (the linked chat session)
    // For chat_sessions: use the id field directly
    const sid = record.session_id || record.id || record.lead_id;
    if (!sid) {
      showToast('No session linked to this record', 'warning');
      return;
    }
    setTranscriptSessionId(sid);
    setLoadingTranscript(true);
    setTranscriptMessages([]);
    try {
      const msgs = await fetchSessionMessages(sid);
      if (!msgs || msgs.length === 0) {
        // Show last_message_snippet as a fallback preview
        if (record.last_message_snippet || record.content) {
          setTranscriptMessages([{
            id: 'fallback-1',
            session_id: sid,
            role: 'user',
            content: record.last_message_snippet || record.content || 'Student Inquiry',
            created_at: record.created_at || new Date().toISOString()
          }]);
        } else {
          setTranscriptMessages([]);
        }
      } else {
        setTranscriptMessages(msgs);
      }
    } catch (err) {
      console.error('Error fetching transcript:', err);
      showToast('Failed to load chat transcript', 'error');
    } finally {
      setLoadingTranscript(false);
    }
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

  // Collapsible Sidebar Navigation State (Starts collapsed; hover opens/closes automatically)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

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
                    title={`Add New ${currentTableConfig?.label || 'Record'}`}
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
                    <span>Add {currentTableConfig?.label ? currentTableConfig.label.replace(/s$/, '') : 'Record'}</span>
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
              loading={loading}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </main>

      {/* Chat Transcript Viewer Modal */}
      {transcriptSessionId && (
        <div className="admin-modal-overlay">
          <div className="admin-auth-card" style={{ maxWidth: '650px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="admin-auth-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="admin-lock-badge" style={{ background: '#009E99', color: '#fff' }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Session Transcript</h3>
                </div>
              </div>
              <button
                className="admin-icon-action-btn"
                onClick={() => setTranscriptSessionId(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f8fafc', borderRadius: '8px', margin: '12px 0', border: '1px solid #e2e8f0', minHeight: '250px' }}>
              {loadingTranscript ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <RefreshCw className="spin" size={24} style={{ marginBottom: '8px' }} />
                  <p>Loading session message transcript...</p>
                </div>
              ) : transcriptMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <MessageSquare size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p>No messages recorded for this session.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {transcriptMessages.map((m, idx) => (
                    <div key={m.id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px', fontWeight: '600' }}>
                        {m.role === 'user' ? 'Student' : 'Educatia AI Advisor'} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        background: m.role === 'user' ? '#009E99' : '#ffffff',
                        color: m.role === 'user' ? '#ffffff' : '#1e293b',
                        border: m.role === 'user' ? 'none' : '1px solid #cbd5e1',
                        whiteSpace: 'pre-wrap',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-auth-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="admin-btn-secondary" onClick={() => setTranscriptSessionId(null)}>
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
