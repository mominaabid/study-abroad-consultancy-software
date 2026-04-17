import { useState, useEffect, useCallback } from "react";
import BASE_URL from "../../Content/Url";
import "./Leads.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGES = [
  { key: "new",        label: "New",        color: "#3b82f6" },
  { key: "contacted",  label: "Contacted",  color: "#f59e0b" },
  { key: "counseling", label: "Counseling", color: "#8b5cf6" },
  { key: "evaluated",  label: "Evaluated",  color: "#f97316" },
  { key: "applied",    label: "Applied",    color: "#06b6d4" },
  { key: "visa",       label: "Visa",       color: "#ec4899" },
  { key: "success",    label: "Success",    color: "#10b981" },
  { key: "lost",       label: "Lost",       color: "#6b7280" },
];

const STATUS_STYLES = {
  new:        { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  contacted:  { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  counseling: { bg: "#f5f3ff", color: "#5b21b6", border: "#ddd6fe" },
  evaluated:  { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
  applied:    { bg: "#ecfeff", color: "#155e75", border: "#a5f3fc" },
  visa:       { bg: "#fdf2f8", color: "#831843", border: "#fbcfe8" },
  success:    { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" },
  lost:       { bg: "#f9fafb", color: "#374151", border: "#e5e7eb" },
};

const COUNTRIES = ["All Countries","UK","USA","Canada","Australia","Germany","France","Japan","UAE","China","India","Brazil","Mexico"];

const SOURCES = ["website","walkin","whatsapp","email","facebook","referral","google_ads","linkedin","agent"];

const EMPTY_FORM = {
  name: "", email: "", phone: "",
  source: "website", preferred_country: "",
  study_level: "", counsellor_id: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function headersJSON() {
  return {
    "Content-Type": "application/json"
  };
}

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(name = "") {
  const colors = ["#0d9488","#7c3aed","#db2777","#ea580c","#2563eb","#16a34a","#dc2626","#9333ea"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, size = 36 }) {
  const bg = avatarColor(name);
  return (
    <div className="lead-avatar" style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}>
      {initials(name)}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.new;
  return (
    <span className="status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

// ─── Add / Edit Lead Modal ────────────────────────────────────────────────────

function LeadModal({ open, onClose, onSave, counsellors, editLead }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editLead) {
      setForm({
        name: editLead.name || "",
        email: editLead.email || "",
        phone: editLead.phone || "",
        source: editLead.source || "website",
        preferred_country: editLead.preferred_country || "",
        study_level: editLead.study_level || "",
        counsellor_id: editLead.counsellor_id || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editLead, open]);

  if (!open) return null;

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{editLead ? "Edit Lead" : "Add New Lead"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. John Smith" />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+92 300 1234567" />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>Source</label>
              <select value={form.source} onChange={e => setForm(p => ({...p, source: e.target.value}))}>
                {SOURCES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Preferred Country</label>
              <input value={form.preferred_country} onChange={e => setForm(p => ({...p, preferred_country: e.target.value}))} placeholder="e.g. UK, USA" />
            </div>
            <div className="form-group">
              <label>Study Level</label>
              <select value={form.study_level} onChange={e => setForm(p => ({...p, study_level: e.target.value}))}>
                <option value="">Select level</option>
                {["Bachelor","Master","PhD","Diploma","Short Course"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Assign Counsellor</label>
            <select value={form.counsellor_id} onChange={e => setForm(p => ({...p, counsellor_id: e.target.value}))}>
              <option value="">Unassigned</option>
              {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : editLead ? "Save Changes" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Lead Detail Drawer ───────────────────────────────────────────────────────

function LeadDrawer({ lead, onClose, onEdit, counsellors, onAssign, onStage }) {
  const [assigning, setAssigning] = useState(false);

  if (!lead) return null;

  async function handleAssign(counsellor_id) {
    setAssigning(true);
    await onAssign(lead.id, counsellor_id);
    setAssigning(false);
  }

  return (
    <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="drawer-box">
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar name={lead.name} size={48} />
            <div>
              <h2 className="drawer-name">{lead.name}</h2>
              <p className="drawer-sub">{lead.study_level} · {lead.preferred_country}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          <div className="drawer-section">
            <h4>Contact Info</h4>
            <div className="info-grid">
              <span className="info-label">Email</span><span>{lead.email || "—"}</span>
              <span className="info-label">Phone</span><span>{lead.phone || "—"}</span>
              <span className="info-label">Country</span><span>{lead.preferred_country || "—"}</span>
              <span className="info-label">Source</span><span style={{textTransform:"capitalize"}}>{lead.source || "—"}</span>
              <span className="info-label">Created</span><span>{formatDate(lead.createdAt)}</span>
            </div>
          </div>

          <div className="drawer-section">
            <h4>Status</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {STAGES.map(s => (
                <button key={s.key}
                  className={`stage-btn ${lead.status === s.key ? "stage-btn-active" : ""}`}
                  style={lead.status === s.key ? { background: s.color, borderColor: s.color } : {}}
                  onClick={() => onStage(lead.id, s.key)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="drawer-section">
            <h4>Assigned Counsellor</h4>
            <select className="drawer-select" value={lead.counsellor_id || ""} onChange={e => handleAssign(e.target.value)} disabled={assigning}>
              <option value="">Unassigned</option>
              {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn-outline" onClick={() => { onEdit(lead); onClose(); }}>Edit Lead</button>
        </div>
      </div>
    </div>
  );
}

// ─── Draggable Kanban Card ─────────────────────────────────────────────────────────────

function KanbanCard({ lead, onOpen, onMenuAction, onDragStart, onDragEnd, isDragging }) {
  const [menu, setMenu] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ id: lead.id, status: lead.status }));
    e.dataTransfer.effectAllowed = "move";
    if (onDragStart) onDragStart(lead.id);
  };

  const handleDragEnd = () => {
    if (onDragEnd) onDragEnd();
  };

  return (
    <div 
      className={`kanban-card ${isDragging ? "dragging" : ""}`}
      onClick={() => onOpen(lead)}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kcard-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={lead.name} size={34} />
          <div>
            <p className="kcard-name">{lead.name}</p>
            <p className="kcard-study">{lead.study_level || "—"}</p>
          </div>
        </div>
        <button className="kcard-menu-btn" onClick={e => { e.stopPropagation(); setMenu(v => !v); }}>···</button>
        {menu && (
          <div className="kcard-menu" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setMenu(false); onOpen(lead); }}>View Details</button>
            <button onClick={() => { setMenu(false); onMenuAction("edit", lead); }}>Edit</button>
            <button className="menu-danger" onClick={() => { setMenu(false); onMenuAction("delete", lead); }}>Delete</button>
          </div>
        )}
      </div>
      <div className="kcard-info">
        <span className="kcard-icon">📍</span>{lead.preferred_country || "—"}
      </div>
      <div className="kcard-info">
        <span className="kcard-icon">✉</span>
        <span className="kcard-truncate">{lead.email || "—"}</span>
      </div>
      <div className="kcard-info">
        <span className="kcard-icon">📞</span>{lead.phone || "—"}
      </div>
      <div className="kcard-footer">
        <span className="kcard-time">{timeAgo(lead.createdAt)}</span>
        {lead.counsellor
          ? <span className="kcard-assigned">{lead.counsellor.name}</span>
          : <span className="kcard-unassigned">Unassigned</span>}
      </div>
    </div>
  );
}

// ─── Kanban Column (Drop Zone) ─────────────────────────────────────────────

function KanbanColumn({ stage, leads, onOpen, onMenuAction, onDrop, draggingLeadId }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (onDrop && dragData.id && dragData.status !== stage.key) {
      onDrop(dragData.id, stage.key);
    }
  };

  return (
    <div 
      className={`kanban-col ${isDragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="kanban-col-header">
        <div className="kanban-col-title">
          <span className="stage-dot" style={{ background: stage.color }} />
          {stage.label}
          <span className="stage-count">{leads.length}</span>
        </div>
      </div>
      <div className="kanban-cards">
        {leads.length === 0
          ? <div className="kanban-empty">Drop here</div>
          : leads.map(lead => (
              <KanbanCard
                key={lead.id}
                lead={lead}
                onOpen={onOpen}
                onMenuAction={onMenuAction}
                isDragging={draggingLeadId === lead.id}
              />
            ))}
      </div>
    </div>
  );
}

// ─── Main Leads Page ──────────────────────────────────────────────────────────

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("All Countries");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [draggingLeadId, setDraggingLeadId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [drawerLead, setDrawerLead] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Fetch leads with filters ────────────────────────────────────────────────
 const fetchLeads = useCallback(async () => {
  setLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/admin/leads`);
    const data = await res.json();

    const leadsData = Array.isArray(data) ? data : (data.data || []);
    setLeads(leadsData);

    setPagination({
      page: 1,
      totalPages: 1,
      total: leadsData.length
    });

  } catch (err) {
    console.error("Failed to fetch leads:", err);
    setLeads([]);
  } finally {
    setLoading(false);
  }
}, []);
const filteredLeads = leads.filter((lead) => {
  const matchSearch =
    lead.name?.toLowerCase().includes(search.toLowerCase()) ||
    lead.email?.toLowerCase().includes(search.toLowerCase()) ||
    lead.phone?.toLowerCase().includes(search.toLowerCase());

  const matchCountry =
    filterCountry === "All Countries" ||
    lead.preferred_country === filterCountry;

  const matchStatus =
    filterStatus === "All Status" ||
    lead.status === filterStatus;

  return matchSearch && matchCountry && matchStatus;
});

  // ── Fetch counsellors ──────────────────────────────────────────
  const fetchCounsellors = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/users?role=counsellor`, { headers: headersJSON() });
      const data = await res.json();
      setCounsellors(data.data || []);
    } catch {
      // silently fail
    }
  }, []);

  // ── Auto-fetch when filters change ─────────────────────────────
 useEffect(() => {
  fetchLeads();
}, []);

  // ── Fetch counsellors on mount ─────────────────────────────────
  useEffect(() => {
    fetchCounsellors();
  }, [fetchCounsellors]);

  // ── Close action menu on outside click ─────────────────────────
  useEffect(() => {
    const handler = () => setActionMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ── Create / Update lead ───────────────────────────────────────
  async function handleSave(form) {
    const payload = {
      ...form,
      counsellor_id: form.counsellor_id ? Number(form.counsellor_id) : null,
    };

    if (editLead) {
      await fetch(`${BASE_URL}/admin/leads/${editLead.id}`, {
        method: "PUT",
        headers: headersJSON(),
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${BASE_URL}/admin/leads`, {
        method: "POST",
        headers: headersJSON(),
        body: JSON.stringify(payload),
      });
    }

    setEditLead(null);
    fetchLeads(currentPage);
  }

  // ── Assign counsellor ──────────────────────────────────────────
  async function handleAssign(leadId, counsellor_id) {
    if (!counsellor_id) return;
    await fetch(`${BASE_URL}/admin/leads/${leadId}/assign`, {
      method: "PUT",
      headers: headersJSON(),
      body: JSON.stringify({ counsellor_id: Number(counsellor_id) }),
    });
    fetchLeads(currentPage);
  }

  // ── Update stage (Drag & Drop) ─────────────────────────────────
  async function handleStage(leadId, status) {
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    if (drawerLead?.id === leadId) setDrawerLead(prev => ({ ...prev, status }));
    
    try {
      await fetch(`${BASE_URL}/admin/leads/${leadId}/stage`, {
        method: "PUT",
        headers: headersJSON(),
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      // Revert on error
      fetchLeads(currentPage);
    }
  }

  // ── Delete lead ────────────────────────────────────────────────
  async function handleDelete(lead) {
    await fetch(`${BASE_URL}/admin/leads/${lead.id}`, {
      method: "DELETE",
      headers: headersJSON(),
    });
    setDeleteConfirm(null);
    fetchLeads(currentPage);
  }

  // ── Export CSV ─────────────────────────────────────────────────
  function handleExport() {
    const headers = ["Name","Email","Phone","Country","Study Level","Status","Source","Counsellor","Created"];
   const rows = filteredLeads.map(l => [
      l.name, l.email, l.phone, l.preferred_country, l.study_level,
      l.status, l.source, l.counsellor?.name || "Unassigned", formatDate(l.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads.csv"; a.click();
  }

  // ── Group leads by stage for Kanban ───────────────────────────
const leadsByStage = STAGES.reduce((acc, s) => {
  acc[s.key] = filteredLeads.filter(l => l.status === s.key);
  return acc;
}, {});

  // ── Table action menu ─────────────────────────────────────────
  function openActionMenu(e, lead) {
    e.stopPropagation();
    setActionMenu({ lead, x: e.clientX, y: e.clientY });
  }

  // ── Drag handlers ─────────────────────────────────────────────
  const handleDragStart = (leadId) => {
    setDraggingLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggingLeadId(null);
  };

  const handleDrop = async (leadId, newStatus) => {
    setDraggingLeadId(null);
    await handleStage(leadId, newStatus);
  };

  // ── Handle page change ────────────────────────────────────────
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      fetchLeads(newPage);
    }
  };

  // ── Handle search with debounce ───────────────────────────────
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="leads-page">

      {/* ── Page Header ── */}
      <div className="leads-header">
        <h1 className="leads-title">Leads Management</h1>
        <div className="leads-header-actions">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              placeholder="Search leads..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <select className="filter-select" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>

          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option>All Status</option>
         {STAGES.map(s => (
  <option key={s.key} value={s.key}>
    {s.label}
  </option>
))}
          </select>

          <div className="view-toggle">
            <button className={view === "kanban" ? "view-btn active" : "view-btn"} onClick={() => setView("kanban")} title="Kanban">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/>
              </svg>
              Kanban
            </button>
            <button className={view === "table" ? "view-btn active" : "view-btn"} onClick={() => setView("table")} title="Table">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Table
            </button>
          </div>

          <button className="btn-export" onClick={handleExport}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>

          <button className="btn-primary" onClick={() => { setEditLead(null); setModalOpen(true); }}>
            + Add Lead
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="leads-loading">
          <div className="spinner" />
          <span>Loading leads...</span>
        </div>
      )}

      {/* ── Kanban View ── */}
      {!loading && view === "kanban" && (
        <div className="kanban-board">
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage.key}
              stage={stage}
              leads={leadsByStage[stage.key] || []}
              onOpen={setDrawerLead}
              onMenuAction={(action, l) => {
                if (action === "edit") { setEditLead(l); setModalOpen(true); }
                if (action === "delete") setDeleteConfirm(l);
              }}
              onDrop={handleDrop}
              draggingLeadId={draggingLeadId}
            />
          ))}
        </div>
      )}

      {/* ── Table View ── */}
      {!loading && view === "table" && (
        <div className="table-wrapper">
          <div className="table-container">
            <table className="leads-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Source</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr><td colSpan={9} className="table-empty">No leads found</td></tr>
                )}
              {filteredLeads.map(lead => (
                  <tr key={lead.id} onClick={() => setDrawerLead(lead)} className="table-row">
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                    <td>
                      <div className="table-lead-info">
                        <Avatar name={lead.name} size={34} />
                        <div>
                          <p className="table-lead-name">{lead.name}</p>
                          <p className="table-lead-country">{lead.preferred_country || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="table-contact-email">{lead.email || "—"}</p>
                      <p className="table-contact-phone">{lead.phone || "—"}</p>
                    </td>
                    <td>{lead.study_level || "—"}</td>
                    <td><StatusBadge status={lead.status} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="assign-select"
                        value={lead.counsellor_id || ""}
                        onChange={e => handleAssign(lead.id, e.target.value)}
                      >
                        <option value="">Assign...</option>
                        {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        {!counsellors.find(c => c.id === lead.counsellor_id) && lead.counsellor && (
                          <option value={lead.counsellor_id}>{lead.counsellor.name}</option>
                        )}
                      </select>
                    </td>
                    <td>
                      <span className="source-tag" style={{textTransform:"capitalize"}}>{lead.source || "—"}</span>
                    </td>
                    <td>{formatDate(lead.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="action-dots" onClick={e => openActionMenu(e, lead)}>···</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}>← Prev</button>
              <span>Page {currentPage} of {pagination.totalPages} · {pagination.total} leads</span>
              <button disabled={currentPage >= pagination.totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}

      {/* ── Table Action Floating Menu ── */}
      {actionMenu && (
        <div
          className="floating-menu"
          style={{ top: actionMenu.y, left: actionMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { setDrawerLead(actionMenu.lead); setActionMenu(null); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            View Details
          </button>
          <button onClick={() => { setEditLead(actionMenu.lead); setModalOpen(true); setActionMenu(null); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Lead
          </button>
          <button className="menu-danger" onClick={() => { setDeleteConfirm(actionMenu.lead); setActionMenu(null); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Delete
          </button>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="confirm-box">
            <div className="confirm-icon">🗑</div>
            <h3>Delete Lead?</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <LeadModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditLead(null); }}
        onSave={handleSave}
        counsellors={counsellors}
        editLead={editLead}
      />

      {/* ── Lead Detail Drawer ── */}
      <LeadDrawer
        lead={drawerLead}
        onClose={() => setDrawerLead(null)}
        onEdit={lead => { setEditLead(lead); setModalOpen(true); }}
        counsellors={counsellors}
        onAssign={handleAssign}
        onStage={handleStage}
      />
    </div>
  );
}