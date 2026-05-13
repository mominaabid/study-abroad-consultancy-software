import { useState, useEffect, useCallback, useRef } from "react";
import { BASE_URL } from "../../Content/Url";
import "../AdminPage/Leads.css";
import {
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiPlus,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addNotification } from "../../redux/slices/notificationSlice";

import {
  STAGES,
  COUNTRIES,
  formatDate,
} from "../../Components/LeadsComponents/LeadsConstants";
import LeadDrawer from "../../Components/LeadsComponents/LeadDrawer";
import { KanbanColumn } from "../../Components/LeadsComponents/KanbanBoard";
import LeadsTable from "../../Components/LeadsComponents/LeadsTable";
import LeadModal from "../../Components/LeadsComponents/LeadModal";

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-400 shadow-sm px-5 py-4
                    flex items-center justify-between transition-all duration-200
                    hover:shadow-md hover:-translate-y-0.5"
    >
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl border"
        style={{ color, borderColor: color, backgroundColor: `${color}10` }}
      >
        {icon}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CounsellorLeads() {
  const dispatch = useDispatch();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
 const [filterCountry, setFilterCountry] = useState("All Countries");
const [countrySearch, setCountrySearch] = useState("");
const [countryFilterOpen, setCountryFilterOpen] = useState(false);
const countryFilterRef = useRef(null);
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [draggingLeadId, setDraggingLeadId] = useState(null);
  const [drawerLead, setDrawerLead] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);

  // Add Lead Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  // ❌ Removed counsellors state and fetchCounsellors – not needed for counsellor

  // ── Fetch MY leads only ────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/counsellor/leads?page=${page}`, {
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
      console.error("Failed to fetch counsellor leads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ❌ Removed fetchCounsellors function

  useEffect(() => {
    fetchLeads(1);
    // ❌ Removed fetchCounsellors()
  }, [fetchLeads]);
  useEffect(() => {
  const handler = (e) => {
    if (countryFilterRef.current && !countryFilterRef.current.contains(e.target)) {
      setCountryFilterOpen(false);
      setCountrySearch("");
    }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);

  useEffect(() => {
    const handler = () => setActionMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ─── Save Lead (Add/Edit) - Auto-assign to current counsellor ──────────────
  async function handleSave(form) {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not logged in.");
      return;
    }

    // Get the current logged-in user from localStorage or Redux
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const counsellorId = user.id; // This should be the logged-in counsellor's ID

    // Prepare payload - FORCE assign to current counsellor
    const payload = {
      ...form,
      counsellor_id: counsellorId, // Always set to current counsellor's ID
    };

    // Remove any fields that might be undefined
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    try {
      const url = editLead
        ? `${BASE_URL}/admin/leads/${editLead.id}`
        : `${BASE_URL}/admin/leads`;

      const method = editLead ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

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

      setEditLead(null);
      setModalOpen(false);
      fetchLeads(currentPage);
    } catch (err) {
      console.error("Save lead error:", err);
      toast.error("Failed to save lead: " + err.message);
    }
  }

  // ─── Update stage (counsellor can change stage of their leads) ──────────────
  async function handleStage(leadId, status, note = "") {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l)),
    );
    if (drawerLead?.id === leadId)
      setDrawerLead((prev) => ({ ...prev, status }));

    try {
      const res = await fetch(`${BASE_URL}/counsellor/leads/${leadId}/stage`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Lead moved to ${status} stage`);
    } catch {
      toast.error("Failed to update lead status");
      fetchLeads();
    }
  }

  // ─── Delete Lead (counsellor can delete their leads) ────────────────────────
  async function handleDelete(lead) {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm(`Are you sure you want to delete ${lead.name}?`))
      return;

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
      fetchLeads(currentPage);
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  // ─── Export CSV ─────────────────────────────────────────────────────────────
  function handleExport() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Country",
      "Study Level",
      "Status",
      "Source",
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
      formatDate(l.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v || ""}"`).join(","))
      .join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: "my-leads.csv",
    });
    a.click();
    toast.info("Exporting leads...");
  }

  // ─── Filtered & grouped data ────────────────────────────────────────────────
  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      !search ||
      lead.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.includes(search);
  const matchCountry =
  filterCountry === "All Countries" ||
  lead.preferred_country
    ?.split(",")
    .map((c) => c.trim())
    .includes(filterCountry);
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
      label: "My Total Leads",
      value: leads.length,
      icon: <FiUsers />,
      color: "#8b5cf6",
    },
    {
      label: "In Progress",
      value: leads.filter(
        (l) => !["new", "success", "rejected"].includes(l.status),
      ).length,
      icon: <FiTrendingUp />,
      color: "#f59e0b",
    },
    {
      label: "Conversions",
      value: leads.filter((l) => l.status === "success").length,
      icon: <FiCheckCircle />,
      color: "#10b981",
    },
    {
      label: "New Inquiries",
      value: leads.filter((l) => l.status === "new").length,
      icon: <FiClock />,
      color: "#3b82f6",
    },
  ];

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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-hidden">
         {/* ── Stats Bar ── */}
      {!loading && (
        <div className="flex-shrink-0 grid grid-cols-4 gap-4 px-6 py-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}
      {/* ── Header ── */}
      <div className="flex-shrink-0  backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-gray-800">My Leads</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {leads.length} leads assigned to you
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl min-w-[200px] transition-all focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100">
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
      {/* Country filter */}
<div className="relative" ref={countryFilterRef}>
  <button
    onClick={() => { setCountryFilterOpen((p) => !p); setCountrySearch(""); }}
    className="h-9 pl-3 pr-8 border border-gray-200 rounded-xl bg-white text-[13px] text-gray-600 outline-none hover:border-teal-500 appearance-none cursor-pointer flex items-center gap-1 min-w-[130px]"
  >
    <span className="truncate max-w-[100px]">
      {filterCountry === "All Countries" ? "All Countries" : filterCountry}
    </span>
  </button>
  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 9l6 6 6-6" />
    </svg>
  </div>

  {countryFilterOpen && (
    <div className="absolute z-50 top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
      {/* Search */}
      <div className="p-2 border-b border-gray-100">
        <input
          autoFocus
          type="text"
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
          placeholder="Search country..."
          className="w-full px-3 py-1.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-teal-400"
        />
      </div>

      {/* List */}
      <div className="max-h-52 overflow-y-auto py-1">
        {/* All Countries option */}
        <div
          onClick={() => { setFilterCountry("All Countries"); setCountryFilterOpen(false); setCountrySearch(""); }}
          className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-gray-50 transition-colors
            ${filterCountry === "All Countries" ? "text-teal-600 font-medium bg-teal-50" : "text-gray-600"}`}
        >
          All Countries
        </div>

        {/* Filtered country list — use COUNTRIES from constants */}
     {/* Filtered country list — built from actual lead data */}
{[...new Set(
  leads.flatMap((l) =>
    l.preferred_country
      ? l.preferred_country.split(",").map((c) => c.trim()).filter(Boolean)
      : []
  )
)]
  .filter((c) => c.toLowerCase().includes(countrySearch.toLowerCase()))
  .map((c) => (
    <div
      key={c}
      onClick={() => { setFilterCountry(c); setCountryFilterOpen(false); setCountrySearch(""); }}
      className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-gray-50 transition-colors
        ${filterCountry === c ? "text-teal-600 font-medium bg-teal-50" : "text-gray-600"}`}
    >
      {c}
    </div>
  ))
}

{[...new Set(
  leads.flatMap((l) =>
    l.preferred_country
      ? l.preferred_country.split(",").map((c) => c.trim()).filter(Boolean)
      : []
  )
)].filter((c) => c.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && countrySearch && (
  <div className="px-4 py-3 text-[13px] text-gray-400">No countries found</div>
)}
      </div>
    </div>
  )}
</div>

            {/* Status filter */}
            <div className="relative">
              <select
                className="h-9 pl-3 pr-8 border border-gray-200 rounded-xl bg-white text-[13px] text-gray-600 outline-none focus:border-purple-500 appearance-none cursor-pointer"
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
                    ${
                      view === v.key
                        ? "bg-purple-600 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
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

            {/* ── ADD LEAD BUTTON FOR COUNSELLOR ── */}
            <button
              onClick={() => {
                setEditLead(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 h-9 px-4 bg-purple-600 text-white rounded-xl text-[12.5px] font-semibold hover:bg-purple-700 transition shadow-md shadow-purple-200 whitespace-nowrap"
            >
              <FiPlus size={14} />
              Add Lead
            </button>
          </div>
        </div>
      </div>

   

      {/* ── Loading ── */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-sm">Loading your leads...</span>
        </div>
      )}

      {/* ── Kanban View ── */}
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
            if (action === "delete") handleDelete(l);
            // Remove assign action for counsellor
          }}
          onDrop={async (leadId, newStatus) => {
            setDraggingLeadId(null);
            await handleStage(leadId, newStatus);
          }}
          draggingLeadId={draggingLeadId}
          userRole="counsellor" // Pass counsellor role
        />
      ))}
    </div>
  </div>
)}

      {/* ── Table View ── */}
  {/* ── Table View ── */}
{!loading && view === "table" && (
  <LeadsTable
    filteredLeads={filteredLeads}
    counsellors={[]}
    onRowClick={setDrawerLead}
    onEdit={(l) => {
      setEditLead(l);
      setModalOpen(true);
    }}
    onDelete={handleDelete}
    onAssignCounsellor={null} // Set to null - no assign functionality for counsellor
    actionMenu={actionMenu}
    setActionMenu={setActionMenu}
    pagination={pagination}
    currentPage={currentPage}
    onPageChange={(page) => {
      setCurrentPage(page);
      fetchLeads(page);
    }}
    userRole="counsellor" // Pass the role explicitly
  />
)}

      {/* ── Lead Drawer ── */}
      <LeadDrawer
        lead={drawerLead}
        onClose={() => setDrawerLead(null)}
        onEdit={(l) => {
          setEditLead(l);
          setModalOpen(true);
        }}
        counsellors={[]}
        onAssign={null}
        onStage={handleStage}
      />

      {/* ── Add/Edit Lead Modal ── */}
      <LeadModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditLead(null);
        }}
        onSave={handleSave}
        counsellors={[]} // Empty array – no counsellor dropdown needed
        editLead={editLead}
      />
    </div>
  );
}
