import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  RefreshCw, 
  Bell, 
  LogOut, 
  Plus,
  KeyRound,
  ShieldCheck, 
  Settings, 
  ChevronDown, 
  CheckCircle2, 
  Sparkles,
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  Award,
  MessageSquare,
  Globe,
  FileText,
  Table as TableIcon,
  X,
  Menu
} from 'lucide-react';
import { fetchTableRows } from '../../services/adminSupabaseService';
import { getSupabaseClient } from '../../services/supabaseClient';

const getTableIcon = (tableId) => {
  if (tableId === 'dashboard') return <LayoutDashboard size={18} className="nav-header-icon" />;
  if (tableId === 'institutes' || tableId === 'business_info') return <Building2 size={18} className="nav-header-icon" />;
  if (tableId === 'programs') return <GraduationCap size={18} className="nav-header-icon" />;
  if (tableId === 'student_leads') return <Users size={18} className="nav-header-icon" />;
  if (tableId === 'chat_sessions' || tableId === 'chat_messages') return <MessageSquare size={18} className="nav-header-icon" />;
  if (tableId === 'scholarships') return <Award size={18} className="nav-header-icon" />;
  if (tableId === 'countries') return <Globe size={18} className="nav-header-icon" />;
  if (tableId === 'english_requirements' || tableId === 'required_docs') return <FileText size={18} className="nav-header-icon" />;
  return <TableIcon size={18} className="nav-header-icon" />;
};

export default function AdminNavbar({
  adminUser = { full_name: 'Admin', username: 'admin', role: 'Super Admin', email: '' },
  selectedTable = 'dashboard',
  currentTableConfig = { label: 'Dashboard', description: 'Real-time analytics and management' },
  searchQuery = '',
  setSearchQuery = () => {},
  onLockAdmin = () => {},
  isSidebarCollapsed = false,
  setIsSidebarCollapsed = () => {},
  onRefresh = () => {},
  loading = false,
  onNavigateTable = () => {},
  onOpenCreateModal = () => {},
  onOpenEditProfile = () => {},
  onOpenResetPassword = () => {}
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Load live student leads as notifications and listen for real-time inserts
  useEffect(() => {
    let channel = null;

    async function loadLiveLeadNotifs() {
      try {
        const seenIds = JSON.parse(localStorage.getItem('educatia_seen_notif_ids') || '[]');
        const res = await fetchTableRows('student_leads', { page: 1, limit: 10 });
        if (res && res.data && res.data.length > 0) {
          const liveItems = res.data.map((lead, idx) => ({
            id: lead.lead_id || `lead-${idx}`,
            title: 'New Live Lead Captured',
            student_name: lead.student_name || 'Prospective Student',
            country: lead.interested_country || 'General Study Abroad',
            time: lead.created_at ? new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            desc: lead.last_message_snippet ? `${lead.last_message_snippet.substring(0, 50)}...` : 'Inquired on Educatia AI Bot.'
          }));
          const unseen = liveItems.filter(n => !seenIds.includes(String(n.id)));
          setNotifications(unseen);
          setHasUnreadNotifs(unseen.length > 0);
        } else {
          setNotifications([]);
          setHasUnreadNotifs(false);
        }
      } catch (_e) {
        const seenIds = JSON.parse(localStorage.getItem('educatia_seen_notif_ids') || '[]');
        setNotifications(prev => prev.filter(n => !seenIds.includes(String(n.id))));
      }
    }
    loadLiveLeadNotifs();

    // Supabase Realtime channel for live navbar notifications
    const client = getSupabaseClient();
    if (client) {
      channel = client
        .channel('admin_navbar_leads_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'student_leads' }, (payload) => {
          const newLead = payload.new;
          if (!newLead) return;

          const seenIds = JSON.parse(localStorage.getItem('educatia_seen_notif_ids') || '[]');
          const newNotifItem = {
            id: newLead.lead_id || `lead-${Date.now()}`,
            title: 'New Live Lead Captured',
            student_name: newLead.student_name || 'Prospective Student',
            country: newLead.interested_country || 'General Study Abroad',
            time: newLead.created_at ? new Date(newLead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            desc: newLead.last_message_snippet ? `${newLead.last_message_snippet.substring(0, 50)}...` : 'Inquired on Educatia AI Bot.'
          };

          if (!seenIds.includes(String(newNotifItem.id))) {
            setNotifications(prev => [newNotifItem, ...prev.filter(n => n.id !== newNotifItem.id)]);
            setHasUnreadNotifs(true);
          }
        })
        .subscribe();
    }

    return () => {
      if (channel && client) {
        client.removeChannel(channel);
      }
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setIsNotificationsOpen(prev => !prev);
    setHasUnreadNotifs(false);
  };

  const handleRemoveNotification = (id, e) => {
    if (e) e.stopPropagation();
    try {
      const seenIds = JSON.parse(localStorage.getItem('educatia_seen_notif_ids') || '[]');
      const updated = [...new Set([...seenIds, String(id)])];
      localStorage.setItem('educatia_seen_notif_ids', JSON.stringify(updated));
    } catch (_err) {
      // ignore
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifs = () => {
    try {
      const currentIds = notifications.map(n => String(n.id));
      const seenIds = JSON.parse(localStorage.getItem('educatia_seen_notif_ids') || '[]');
      const updated = [...new Set([...seenIds, ...currentIds])];
      localStorage.setItem('educatia_seen_notif_ids', JSON.stringify(updated));
    } catch (_err) {
      // ignore
    }
    setNotifications([]);
    setHasUnreadNotifs(false);
  };

  return (
    <header className="admin-top-navbar">
      {/* Left Section: Title & Global Search */}
      <div className="admin-navbar-left">
        <div className="admin-navbar-title-badge">
          <div className="navbar-icon-wrapper">
            {getTableIcon(selectedTable)}
          </div>
          <div className="navbar-title-text">
            <h2>{selectedTable === 'dashboard' ? `Welcome, ${adminUser?.full_name || 'Admin'}` : (currentTableConfig?.label || 'Database Management')}</h2>
            {selectedTable === 'dashboard' && (
              <span className="navbar-subtitle">Educatia Control Center</span>
            )}
          </div>
        </div>

        {/* Table Search Input - Hidden on Dashboard */}
        {selectedTable !== 'dashboard' && setSearchQuery && (
          <div className="admin-navbar-search">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentTableConfig?.label || 'records'}...`}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Section: Add Record, Refresh, Notifications, Profile Logo */}
      <div className="admin-navbar-right">
        {/* Add Record Action Button for Editable Tables */}
        {selectedTable !== 'dashboard' && currentTableConfig?.canModify && currentTableConfig?.canAdd !== false && (
          <button 
            type="button" 
            className="admin-create-btn" 
            onClick={onOpenCreateModal}
            title={`Add New ${currentTableConfig?.label || 'Record'}`}
          >
            <Plus size={15} />
            <span>Add Record</span>
          </button>
        )}


        {/* Refresh Action Button */}
        <button 
          type="button" 
          className="admin-navbar-icon-btn" 
          onClick={onRefresh} 
          title="Refresh Data"
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>

        {/* Notifications Bell */}
        <div className="admin-notif-container" ref={notifRef}>
          <button 
            type="button" 
            className={`admin-navbar-icon-btn ${isNotificationsOpen ? 'active' : ''}`}
            onClick={handleNotificationClick}
            title="Live Lead Notifications"
          >
            <Bell size={16} />
            {hasUnreadNotifs && notifications.length > 0 && <span className="notif-unread-dot"></span>}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="admin-notif-dropdown">
              <div className="notif-dropdown-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={15} style={{ color: '#009E99' }} />
                  <h4>Live Chatbot Leads</h4>
                </div>
                <span className="notif-count-tag">{notifications.length} New</span>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                    No new live lead notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className="notif-item unread"
                      onClick={(e) => {
                        handleRemoveNotification(n.id, e);
                        onNavigateTable('student_leads');
                        setIsNotificationsOpen(false);
                      }}
                      title="Click to view lead and mark as seen"
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      <div className="notif-icon-circle">
                        <Users size={14} />
                      </div>
                      <div className="notif-content">
                        <div className="notif-title-row">
                          <span className="notif-title">{n.student_name}</span>
                          <span className="notif-time">{n.time}</span>
                        </div>
                        <p className="notif-desc">
                          <strong style={{ color: '#009E99' }}>{n.country}:</strong> {n.desc}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveNotification(n.id, e)}
                        title="Mark seen and remove"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="notif-dropdown-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem' }}>
                  <button 
                    type="button" 
                    className="notif-footer-btn"
                    onClick={handleClearAllNotifs}
                    style={{ color: '#dc2626' }}
                  >
                    Clear All Seen
                  </button>
                  <button 
                    type="button" 
                    className="notif-footer-btn"
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      onNavigateTable('student_leads');
                    }}
                  >
                    View All Chatbot Leads →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar-divider"></div>

        {/* PROFILE LOGO & AVATAR MENU CONTAINER */}
        <div className="admin-profile-menu-wrapper" ref={profileRef}>
          <button 
            type="button"
            className={`admin-profile-pill-btn icon-only-pill ${isProfileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsProfileMenuOpen(prev => !prev)}
            title="Admin Profile Menu (Click to Edit Profile)"
          >
            {/* Circular Admin Profile Logo Avatar Icon Only */}
            <div className="profile-logo-avatar-container">
              <img 
                src="/admin-profile-avatar.png" 
                alt="Admin Profile Logo" 
                className="profile-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="profile-logo-fallback" style={{ display: 'none' }}>
                {(adminUser?.full_name || 'Admin').charAt(0)}
              </div>
              <span className="profile-online-dot" title="Online & Authenticated"></span>
            </div>

            <ChevronDown size={14} className={`profile-chevron ${isProfileMenuOpen ? 'open' : ''}`} />
          </button>

          {/* PROFILE DROPDOWN POPOVER MENU */}
          {isProfileMenuOpen && (
            <div className="admin-profile-dropdown-card">
              {/* Card Header with Profile Logo Avatar & Details */}
              <div className="profile-card-header">
                <div className="profile-header-avatar-ring">
                  <img 
                    src="/admin-profile-avatar.png" 
                    alt="Admin Avatar Logo Large" 
                    className="profile-header-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="profile-header-online"></span>
                </div>
                <div className="profile-header-meta">
                  <h3>{adminUser?.full_name || 'Admin'}</h3>
                  <span className="profile-email">@{adminUser?.username || 'admin'}{adminUser?.email ? ` • ${adminUser.email}` : ''}</span>
                  <div className="profile-role-badge">
                    <ShieldCheck size={13} />
                    <span>{adminUser?.role || 'Super Admin'}</span>
                  </div>
                </div>
              </div>

              <div className="profile-menu-divider"></div>

              {/* Profile Menu Options: Edit Profile, Reset Password & Logout */}
              <div className="profile-menu-options">
                <button 
                  type="button" 
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onOpenEditProfile) onOpenEditProfile();
                  }}
                >
                  <Settings size={16} className="text-primary" />
                  <span>Edit Profile</span>
                </button>

                <button 
                  type="button" 
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onOpenResetPassword) onOpenResetPassword();
                  }}
                >
                  <KeyRound size={16} style={{ color: '#d97706' }} />
                  <span>Change Password</span>
                </button>

                <button 
                  type="button" 
                  className="profile-menu-item profile-logout-item"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLockAdmin();
                  }}
                >
                  <LogOut size={16} className="text-danger" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
