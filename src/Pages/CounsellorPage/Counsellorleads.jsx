// CounsellorLeads.jsx – responsive toolbar with uniform sizing matching Add Lead button
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../Content/Url";
import "../AdminPage/Leads.css";
import {
  FiUsers,
  FiClock,
  FiPhoneCall,
  FiCheckCircle,
  FiXCircle,
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
import { AddBtnInHeader } from "../../Components/CustomButtons/AddBtnInHeader";

// ─── Stat Card (responsive) ─────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div
      className="bg-white rounded-lg md:rounded-2xl border border-gray-200 shadow-sm px-3 md:px-5 py-3 md:py-4
                    flex items-center justify-between transition-all duration-200
                    hover:shadow-md hover:-translate-y-0.5"
    >
      <div>
        <p className="text-[11px] md:text-xs text-gray-400">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-900 mt-0.5 md:mt-1">
          {value}
        </p>
      </div>
      <div
        className="w-9 h-9 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-base md:text-xl border"
        style={{ color, borderColor: color, backgroundColor: `${color}10` }}
      >
        {icon}
      </div>
    </div>
  );
}

// ─── Helper to keep dropdown inside viewport ──────────────────────────────
function getAdjustedDropdownPosition(buttonRect) {
  const { top, left, width } = buttonRect;
  const dropdownWidth = 256; // w-56 = 14rem = 224px, but we use 256 as safe margin
  const viewportWidth = window.innerWidth;
  let adjustedLeft = left;
  if (left + dropdownWidth > viewportWidth) {
    adjustedLeft = viewportWidth - dropdownWidth - 8;
  }
  if (adjustedLeft < 8) adjustedLeft = 8;
  return {
    top: top + window.scrollY + buttonRect.height + 4,
    left: adjustedLeft + window.scrollX,
  };
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function CounsellorLeads() {
  const navigate = useNavigate();
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
  const [countryFilterPosition, setCountryFilterPosition] = useState({
    top: 0,
    left: 0,
  });

  // ── Fetch MY leads only ─────────────────────────────────────────────────
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

  useEffect(() => {
    fetchLeads(1);
  }, [fetchLeads]);

  useEffect(() => {
    const handler = (e) => {
      if (
        countryFilterRef.current &&
        !countryFilterRef.current.contains(e.target)
      ) {
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

  // Open country filter with viewport‑aware positioning
  const openCountryFilter = () => {
    if (countryFilterRef.current) {
      const rect = countryFilterRef.current.getBoundingClientRect();
      const adjusted = getAdjustedDropdownPosition(rect);
      setCountryFilterPosition(adjusted);
    }
    setCountryFilterOpen(true);
    setCountrySearch("");
  };

  // ─── Update stage (counsellor can change stage of their leads) ──────────
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
      toast.success(`Lead moved to ${status} stage`, { toastId: "lead-moved" });
    } catch {
      toast.error("Failed to update lead status", {
        toastId: "filed-edit-lead-status",
      });
      fetchLeads();
    }
  }

  // ─── Delete Lead (counsellor can delete their leads) ────────────────────
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
      toast.success("Lead deleted successfully", {
        toastId: "lead-remove-success",
      });
      fetchLeads(currentPage);
    } catch {
      toast.error("Failed to delete lead", { toastId: "failed-remove-lead" });
    }
  }

  // ─── Export CSV ─────────────────────────────────────────────────────────
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
    toast.info("Exporting leads...", { toastId: "lead-export" });
  }

  // ─── Filtered & grouped data ────────────────────────────────────────────
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
      value: leads.filter((l) => ["new"].includes(l.status)).length,
      icon: <FiClock />,
      color: "#f59e0b",
    },
    {
      label: "Contacted",
      value: leads.filter(
        (l) => !["new", "success", "rejected"].includes(l.status),
      ).length,
      icon: <FiPhoneCall />,
      color: "#10b981",
    },
    {
      label: "Success Case",
      value: leads.filter((l) => ["success"].includes(l.status)).length,
      icon: <FiCheckCircle />,
      color: "#22c55e",
    },
    {
      label: "Rejected",
      value: leads.filter((l) => ["rejected"].includes(l.status)).length,
      icon: <FiXCircle />,
      color: "#ef4444",
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

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-hidden">
      {/* ── Mobile/Tablet Add Lead Button (above stat cards, aligned right) ── */}
      <div className="block lg:hidden px-4 md:px-6 pt-3 pb-2 flex justify-end">
        <AddBtnInHeader
          label="Add Lead"
          handleToggle={() => navigate("/counsellor/leads/new")}
          className="shadow-md shadow-[#009E99]"
        />
      </div>

      {/* ── Responsive Stats Bar ── */}
      {!loading && (
        <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* ── Responsive Header – uniform toolbar ── */}
      <div className="flex-shrink-0 backdrop-blur-sm border-b border-gray-100 px-4 md:px-6 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-base md:text-lg font-bold text-gray-800">
              My Leads
            </h1>
            <p className="text-[11px] md:text-xs text-gray-400 mt-0.5">
              {leads.length} leads assigned to you
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
            {/* Search Bar – matches Add Lead dimensions */}
            <div className="flex items-center gap-2 py-3 px-2 sm:px-4 bg-gray-50 border border-gray-200 rounded-lg w-full sm:w-auto md:min-w-[200px] transition-all focus-within:border-[#009E99] focus-within:ring-2 focus-within:ring-[#009E99]">
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
                className="bg-transparent outline-none text-[15px] sm:text-sm text-gray-700 placeholder-gray-400 w-full"
              />
            </div>

            {/* Country filter – matches Add Lead dimensions */}
            <div className="relative" ref={countryFilterRef}>
              <button
                onClick={openCountryFilter}
                className="py-3 pl-2 sm:pl-4 pr-8 border border-gray-200 rounded-lg bg-white text-[15px] sm:text-sm text-gray-600 outline-none hover:border-teal-500 appearance-none cursor-pointer flex items-center gap-1 min-w-[110px] sm:min-w-[130px]"
              >
                <span className="truncate max-w-[80px] sm:max-w-[100px]">
                  {filterCountry === "All Countries"
                    ? "All Countries"
                    : filterCountry}
                </span>
              </button>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {countryFilterOpen &&
                createPortal(
                  <div
                    className="fixed z-[9999] w-56 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
                    style={{
                      top: countryFilterPosition.top,
                      left: countryFilterPosition.left,
                    }}
                  >
                    <div className="p-2 border-b border-gray-100">
                      <input
                        autoFocus
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country..."
                        className="w-full px-3 py-1.5 text-xs md:text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto py-1">
                      <div
                        onClick={() => {
                          setFilterCountry("All Countries");
                          setCountryFilterOpen(false);
                          setCountrySearch("");
                        }}
                        className={`px-4 py-2 text-xs md:text-[13px] cursor-pointer hover:bg-gray-50 transition-colors
                          ${filterCountry === "All Countries" ? "text-teal-600 font-medium bg-teal-50" : "text-gray-600"}`}
                      >
                        All Countries
                      </div>
                      {[
                        ...new Set(
                          leads.flatMap((l) =>
                            l.preferred_country
                              ? l.preferred_country
                                  .split(",")
                                  .map((c) => c.trim())
                                  .filter(Boolean)
                              : [],
                          ),
                        ),
                      ]
                        .filter((c) =>
                          c.toLowerCase().includes(countrySearch.toLowerCase()),
                        )
                        .map((c) => (
                          <div
                            key={c}
                            onClick={() => {
                              setFilterCountry(c);
                              setCountryFilterOpen(false);
                              setCountrySearch("");
                            }}
                            className={`px-4 py-2 text-xs md:text-[13px] cursor-pointer hover:bg-gray-50 transition-colors
                              ${filterCountry === c ? "text-teal-600 font-medium bg-teal-50" : "text-gray-600"}`}
                          >
                            {c}
                          </div>
                        ))}
                      {[
                        ...new Set(
                          leads.flatMap((l) =>
                            l.preferred_country
                              ? l.preferred_country
                                  .split(",")
                                  .map((c) => c.trim())
                                  .filter(Boolean)
                              : [],
                          ),
                        ),
                      ].filter((c) =>
                        c.toLowerCase().includes(countrySearch.toLowerCase()),
                      ).length === 0 &&
                        countrySearch && (
                          <div className="px-4 py-3 text-xs md:text-[13px] text-gray-400 text-center">
                            No countries found
                          </div>
                        )}
                    </div>
                  </div>,
                  document.body,
                )}
            </div>

            {/* Status filter – matches Add Lead dimensions */}
            <div className="relative">
              <select
                className="py-3 pl-2 sm:pl-4 pr-8 border border-gray-200 rounded-lg bg-white text-[15px] sm:text-sm text-gray-600 outline-none focus:border-[#009E99] appearance-none cursor-pointer"
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
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* View Toggle (Kanban/Table) – matches Add Lead dimensions */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {viewButtons.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`flex items-center gap-2 py-3 px-2 sm:px-4 text-[15px] sm:text-sm font-medium transition-all border-r last:border-0 border-gray-200
                    ${
                      view === v.key
                        ? "bg-[#009E99] text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  {v.icon}
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>

            {/* Export Button – matches Add Lead dimensions */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 py-3 px-2 sm:px-4 border border-gray-200 rounded-lg text-[15px] sm:text-sm text-gray-600 bg-white hover:bg-gray-50 transition shadow-sm"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
            </button>

            {/* Add Lead Button – visible only on desktop (lg and up) */}
            <AddBtnInHeader
              label="Add Lead"
              handleToggle={() => navigate("/counsellor/leads/new")}
              className="hidden lg:flex"
            />
          </div>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#009E99] rounded-full animate-spin" />
          <span className="text-sm">Loading your leads...</span>
        </div>
      )}

      {/* ── Kanban View (responsive horizontal scroll) ── */}
      {!loading && view === "kanban" && (
        <div className="flex-1 min-h-0 overflow-x-auto pb-4">
          <div
            className="flex gap-3 h-full px-4 md:px-6 pt-1"
            style={{ minWidth: "max-content" }}
          >
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.key}
                stage={stage}
                stages={STAGES}
                leads={leadsByStage[stage.key] || []}
                onOpen={setDrawerLead}
                onMenuAction={(action, l) => {
                  if (action === "edit") {
                    navigate(`/counsellor/leads/${l.id}/edit`);
                  }
                  if (action === "delete") {
                    handleDelete(l);
                  }
                }}
                onDrop={async (leadId, newStatus) => {
                  setDraggingLeadId(null);
                  await handleStage(leadId, newStatus);
                }}
                draggingLeadId={draggingLeadId}
                userRole="counsellor"
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Table View (responsive wrapper with horizontal scroll) ── */}
      {!loading && view === "table" && (
        <div className="flex-1 overflow-x-auto px-4 md:px-6 pb-4">
          <div className="min-w-[640px] md:min-w-0">
            <LeadsTable
              filteredLeads={filteredLeads}
              counsellors={[]}
              onRowClick={setDrawerLead}
              onEdit={(l) => navigate(`/counsellor/leads/${l.id}/edit`)}
              onDelete={handleDelete}
              onAssignCounsellor={null}
              actionMenu={actionMenu}
              setActionMenu={setActionMenu}
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchLeads(page);
              }}
              userRole="counsellor"
            />
          </div>
        </div>
      )}

      {/* ── Lead Drawer (assumes component is responsive) ── */}
      {drawerLead && (
        <LeadDrawer
          lead={drawerLead}
          onClose={() => setDrawerLead(null)}
          onStage={handleStage}
        />
      )}
    </div>
  );
}
