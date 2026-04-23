// Leads.jsx
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";
import "./Leads.css";
import { FiUsers, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { addNotification } from "../../redux/slices/notificationSlice";
// ── Component imports from Components/LeadsComponents ──────────────────────────
import {
  STAGES,
  COUNTRIES,
  formatDate,
} from "../../Components/LeadsComponents/LeadsConstants";
import LeadModal from "../../Components/LeadsComponents/LeadModal";
import LeadDrawer from "../../Components/LeadsComponents/LeadDrawer";
import { KanbanColumn } from "../../Components/LeadsComponents/KanbanBoard";
import LeadsTable from "../../Components/LeadsComponents/LeadsTable";
import { DeleteConfirmationModal } from "../../Components/DeleteConfirmationModal";

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 
                    flex items-center justify-between transition-all duration-200 
                    hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Left Content */}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>

      {/* Icon Box */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl border"
        style={{
          color: color,
          borderColor: color,
          backgroundColor: `${color}10`,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Leads() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [leads, setLeads] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("All Countries");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [draggingLeadId, setDraggingLeadId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [drawerLead, setDrawerLead] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const dispatch = useDispatch();

  // ── Fetch Leads ────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${BASE_URL}/admin/leads?page=${page}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const leadsData = Array.isArray(data) ? data : data.data || [];
      setLeads(leadsData);
      setPagination({
        page,
        totalPages: data.totalPages || 1,
        total: data.total || leadsData.length,
      });
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch Counsellors ──────────────────────────────────────────────────────
  const fetchCounsellors = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/getCounsellors`, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setCounsellors(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to fetch counsellors:", err);
      setCounsellors([]);
    }
  }, []);

  useEffect(() => {
    fetchLeads(1);
  }, [fetchLeads]);
  useEffect(() => {
    fetchCounsellors();
  }, [fetchCounsellors]);

  // Close action menu on outside click
  useEffect(() => {
    const handler = () => setActionMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  async function handleSave(form) {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not logged in.");
      return;
    }
    const payload = {
      ...form,
      counsellor_id: form.counsellor_id ? Number(form.counsellor_id) : null,
    };
    try {
      const res = await fetch(
        editLead
          ? `${BASE_URL}/admin/leads/${editLead.id}`
          : `${BASE_URL}/admin/leads`,
        {
          method: editLead ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message || `HTTP ${res.status}`,
        );

      toast.success(
        editLead ? "Lead updated successfully" : "Lead added successfully",
      );

      if (!editLead) {
        dispatch(
          addNotification({
            message: `New Lead added: ${form.name}`,
          }),
        );
      }

      if (editLead) {
        dispatch(
          addNotification({
            message: `Lead Data Edited: ${form.name}`,
          }),
        );
      }

      setEditLead(null);
      setModalOpen(false);
      fetchLeads();
    } catch (err) {
      toast.error("Failed to save lead: " + err.message);
    }
  }

  async function handleAssign(leadId, counsellor_id) {
    if (!counsellor_id) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/leads/${leadId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ counsellor_id: Number(counsellor_id) }),
      });
      if (!res.ok) throw new Error();
      toast.success("Counsellor assigned");
      fetchLeads();
    } catch {
      toast.error("Failed to assign counsellor");
      fetchLeads();
    }
  }

async function handleStage(leadId, status, note = "") {
  const token = localStorage.getItem("token");
  if (!token) return;

  setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  if (drawerLead?.id === leadId) setDrawerLead(prev => ({ ...prev, status }));

  try {
    const res = await fetch(`${BASE_URL}/admin/leads/${leadId}/stage`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, note }),  // ✅ send note
    });
    if (!res.ok) throw new Error();
  } catch {
    alert("Failed to update lead status");
    fetchLeads();
  }
}

  async function handleDelete(lead) {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/leads/${lead.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      toast.success("Lead deleted successfully");
      setDeleteConfirm(null);
      fetchLeads();
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  function handleExport() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Country",
      "Study Level",
      "Status",
      "Source",
      "Counsellor",
      "Created",
    ];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.email,
      l.phone,
      l.preferred_country,
      l.study_level,
      l.status,
      l.source,
      l.counsellor?.name || "Unassigned",
      formatDate(l.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v || ""}"`).join(","))
      .join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: "leads.csv",
    });
    a.click();
    toast.info("Exporting leads...");
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      !search ||
      lead.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.includes(search);
    const matchCountry =
      filterCountry === "All Countries" ||
      lead.preferred_country === filterCountry;
    const matchStatus =
      filterStatus === "All Status" || lead.status === filterStatus;
    return matchSearch && matchCountry && matchStatus;
  });

  const leadsByStage = STAGES.reduce((acc, s) => {
    acc[s.key] = filteredLeads.filter((l) => l.status === s.key);
    return acc;
  }, {});

  const stats = [
    {
      label: "Total Leads",
      value: leads.filter((l) => l.status === "new").length,
      icon: <FiUsers />,
      color: "#3b82f6", // blue
    },
    {
      label: "In Progress",
      value: leads.filter(
        (l) => !["new", "success", "rejected"].includes(l.status),
      ).length,
      icon: <FiTrendingUp />,
      color: "#f59e0b", // orange
    },
    {
      label: "Conversions",
      value: leads.filter((l) => l.status === "success").length,
      icon: <FiCheckCircle />,
      color: "#10b981", // green
    },
  ];
  // ── View buttons config ────────────────────────────────────────────────────
  const viewButtons = [
    {
      key: "kanban",
      label: "Kanban",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="18" rx="1" />
          <rect x="14" y="3" width="7" height="11" rx="1" />
        </svg>
      ),
    },
    {
      key: "table",
      label: "Table",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-hidden">
      {/* ── Top Header ── */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Title */}
          <div>
            <p className="text-xs text-gray-400 mt-0.5">
              {leads.length} total leads in pipeline
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl min-w-[200px] transition-all focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-[13px] text-gray-700 placeholder-gray-400 w-full"
              />
            </div>

            {/* Country filter */}
            <div className="relative">
              <select
                className="h-9 pl-3 pr-8 border border-gray-200 rounded-xl bg-white text-[13px] text-gray-600 outline-none focus:border-teal-500 appearance-none cursor-pointer"
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                className="h-9 pl-3 pr-8 border border-gray-200 rounded-xl bg-white text-[13px] text-gray-600 outline-none focus:border-teal-500 appearance-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All Status">All Status</option>
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex h-9 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {viewButtons.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`flex items-center gap-1.5 px-3.5 text-[12.5px] font-medium transition-all border-r last:border-0 border-gray-200
                    ${view === v.key ? "bg-teal-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                  {v.icon}
                  {v.label}
                </button>
              ))}
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 h-9 px-4 border border-gray-200 rounded-xl text-[12.5px] text-gray-600 bg-white hover:bg-gray-50 transition shadow-sm"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>

            {/* Add Lead */}
            <button
              onClick={() => {
                setEditLead(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 h-9 px-4 bg-teal-600 text-white rounded-xl text-[12.5px] font-semibold hover:bg-teal-700 transition shadow-md shadow-teal-200 whitespace-nowrap"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Lead
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      {!loading && (
        <div className="flex-shrink-0 grid grid-cols-4 gap-4 px-6 py-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          <span className="text-sm">Loading leads...</span>
        </div>
      )}

      {/* ── Kanban View ── */}
      {!loading && view === "kanban" && (
        <div className="flex-1 min-h-0 overflow-x-auto pb-4">
          <div
            className="flex gap-3 h-full px-6 pt-1"
            style={{ minWidth: "max-content" }}
          >
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.key}
                stage={stage}
                leads={leadsByStage[stage.key] || []}
                onOpen={setDrawerLead}
                onMenuAction={(action, l) => {
                  if (action === "edit") {
                    setEditLead(l);
                    setModalOpen(true);
                  }
                  if (action === "delete") setDeleteConfirm(l);
                }}
                onDrop={async (leadId, newStatus) => {
                  setDraggingLeadId(null);
                  await handleStage(leadId, newStatus);
                }}
                draggingLeadId={draggingLeadId}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Table View ── */}
      {!loading && view === "table" && (
        <LeadsTable
          filteredLeads={filteredLeads}
          counsellors={counsellors}
          onRowClick={setDrawerLead}
          onEdit={(l) => {
            setEditLead(l);
            setModalOpen(true);
          }}
          onDelete={setDeleteConfirm}
          onAssign={handleAssign}
          actionMenu={actionMenu}
          setActionMenu={setActionMenu}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            fetchLeads(page);
          }}
        />
      )}

      {/* ── Modals & Overlays ── */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
      />

      <LeadModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditLead(null);
        }}
        onSave={handleSave}
        counsellors={counsellors}
        editLead={editLead}
      />

      <LeadDrawer
        lead={drawerLead}
        onClose={() => setDrawerLead(null)}
        onEdit={(l) => {
          setEditLead(l);
          setModalOpen(true);
        }}
        counsellors={counsellors}
        onAssign={handleAssign}
        onStage={handleStage}
      />
    </div>
  );
}
