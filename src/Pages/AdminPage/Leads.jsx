// Leads.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../Content/Url";
import "./Leads.css";
import {
  FiUsers,
  FiTrendingUp,
  FiPhoneCall,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useDispatch } from "react-redux";
import { addNotification } from "../../redux/slices/notificationSlice";
import { useSelector } from "react-redux";
import { selectRole } from "../../redux/slices/authSlice";
// ── Component imports from Components/LeadsComponents ──────────────────────────
import {
  STAGES,
  COUNTRIES,
  formatDate,
} from "../../Components/LeadsComponents/LeadsConstants";
import LeadDrawer from "../../Components/LeadsComponents/LeadDrawer";
import { KanbanColumn } from "../../Components/LeadsComponents/KanbanBoard";
import LeadsTable from "../../Components/LeadsComponents/LeadsTable";
import { DeleteConfirmationModal } from "../../Components/DeleteConfirmationModal";
import { AddBtnInHeader } from "../../Components/CustomButtons/AddBtnInHeader";




// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-400 shadow-sm px-4 py-3 sm:px-5 sm:py-4 
                  flex items-center justify-between transition-all duration-200 
                  hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Left Content */}
      <div>
        <p className="text-[11px] sm:text-xs text-gray-400">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
          {value}
        </p>
      </div>

      {/* Icon Box */}
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-base sm:text-xl border"
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
  const navigate = useNavigate();
  const userRole = useSelector(selectRole);
  // ── State ──────────────────────────────────────────────────────────────────
  const [leads, setLeads] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("All Countries");
  const [filterCounsellor, setFilterCounsellor] = useState("All Counsellors");
  const [countrySearch, setCountrySearch] = useState("");
  const [counsellorSearch, setCounsellorSearch] = useState("");
  const [countryFilterOpen, setCountryFilterOpen] = useState(false);
  const [counsellorFilterOpen, setCounsellorFilterOpen] = useState(false);
  const countryFilterRef = useRef(null);
  const counsellorFilterRef = useRef(null);
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
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found for fetching counsellors");
        return;
      }

      const res = await fetch(`${BASE_URL}/admin/getCounsellors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

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
    const handler = (e) => {
      if (
        counsellorFilterRef.current &&
        !counsellorFilterRef.current.contains(e.target)
      ) {
        setCounsellorFilterOpen(false);
        setCounsellorSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
  async function handleStage(leadId, status, note = "") {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l)),
    );
    if (drawerLead?.id === leadId)
      setDrawerLead((prev) => ({ ...prev, status }));

    try {
      const res = await fetch(`${BASE_URL}/admin/leads/${leadId}/stage`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) throw new Error();
    } catch {
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

      toast.success("Lead deleted successfully", {
        toastId: "lead-delete-success",
      });

      setDeleteConfirm(null);
      fetchLeads();
    } catch {
      toast.error("Failed to delete lead", { toastId: "lead-delete-error" });
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

    toast.info("Exporting leads...", { toastId: "lead-export-info" });
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
      lead.preferred_country
        ?.split(",")
        .map((c) => c.trim())
        .includes(filterCountry);

    const matchStatus =
      filterStatus === "All Status" || lead.status === filterStatus;

    const matchCounsellor =
      filterCounsellor === "All Counsellors" ||
      lead.counsellor?.name === filterCounsellor;

    return matchSearch && matchCountry && matchStatus && matchCounsellor;
  });

  const handleAddNoteOnly = async (leadId, note) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not logged in.", { toastId: "lead-note-error" });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/admin/leads/${leadId}/note`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add note");
      }

      toast.success("Note added successfully!", {
        toastId: "lead-note-success",
      });

      if (drawerLead?.id === leadId) {
        fetchLeads(currentPage);
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error(error.message || "Failed to add note", {
        toastId: "lead-note-error",
      });
    }
  };

  const leadsByStage = STAGES.reduce((acc, s) => {
    acc[s.key] = filteredLeads.filter((l) => l.status === s.key);
    return acc;
  }, {});

  const stats = [
    {
      label: "Total Leads",
      value: leads.length,
      icon: <FiUsers />,
      color: "#3b82f6",
    },
    {
      label: "In Progress",
      value: leads.filter((l) => l.status === "new").length,
      icon: <FiTrendingUp />,
      color: "#f59e0b",
    },
    {
      label: "Contacted",
      value: leads.filter(
        (l) =>
          l.status !== "new" &&
          l.status !== "success" &&
          l.status !== "rejected",
      ).length,
      icon: <FiPhoneCall />,
      color: "#8b5cf6",
    },
    {
      label: "Success Cases",
      value: leads.filter((l) => l.status === "success").length,
      icon: <FiCheckCircle />,
      color: "#10b981",
    },
    {
      label: "Rejected",
      value: leads.filter((l) => l.status === "rejected").length,
      icon: <FiXCircle />,
      color: "#ef4444",
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

  // Get unique counsellors for filter (without "Unassigned")
  const counsellorOptions = [
    "All Counsellors",
    ...counsellors.map((c) => c.name),
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-hidden relative p-4 gap-4">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800"></h1>
        <AddBtnInHeader
          label="Add Lead"
          handleToggle={() => navigate("/admin/leads/new")}
        />
      </div>

      {/* ── Stats Bar ── */}
      {!loading && (
        <div className="flex-shrink-0 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* ── Filters & Actions Bar (Responsive Stack) ── */}

      <div className="flex-shrink-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Actions Group - wraps responsively */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Search - matches Add Lead dimensions */}
            <div className="flex-1 sm:flex-initial min-w-[160px] sm:min-w-[200px]">
              <div className="flex items-center gap-2 py-3 px-2 sm:px-4 bg-gray-50 border border-gray-200 rounded-lg w-full transition-all focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100">
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
            </div>

            {/* Counsellor Filter - matches Add Lead dimensions */}
            <div
              className="relative flex-1 sm:flex-initial"
              ref={counsellorFilterRef}
            >
              <button
                onClick={() => {
                  setCounsellorFilterOpen((p) => !p);
                  setCounsellorSearch("");
                }}
                className="w-full sm:w-auto py-3 pl-2 sm:pl-4 pr-8 border border-gray-200 rounded-lg bg-white text-[15px] sm:text-sm text-gray-600 outline-none hover:border-teal-500 cursor-pointer flex items-center gap-1 min-w-[130px] sm:min-w-[150px]"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                >
                  <path d="M12 6v6l4 2" />
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                </svg>
                <span className="truncate max-w-[100px]">
                  {filterCounsellor === "All Counsellors"
                    ? "All Counsellors"
                    : filterCounsellor}
                </span>
              </button>
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

              {counsellorFilterOpen && (
                <div className="absolute z-50 top-full left-0 mt-1 w-56 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      autoFocus
                      type="text"
                      value={counsellorSearch}
                      onChange={(e) => setCounsellorSearch(e.target.value)}
                      placeholder="Search counsellor..."
                      className="w-full px-3 py-1.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto py-1">
                    {counsellorOptions
                      .filter((opt) =>
                        opt
                          .toLowerCase()
                          .includes(counsellorSearch.toLowerCase()),
                      )
                      .map((opt) => (
                        <div
                          key={opt}
                          onClick={() => {
                            setFilterCounsellor(opt);
                            setCounsellorFilterOpen(false);
                            setCounsellorSearch("");
                          }}
                          className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2
                            ${filterCounsellor === opt ? "text-teal-600 font-medium bg-teal-50" : "text-gray-600"}`}
                        >
                          {opt !== "All Counsellors" && (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                              {opt.charAt(0)}
                            </div>
                          )}
                          <span>{opt}</span>
                          {filterCounsellor === opt && (
                            <span className="ml-auto text-teal-500 text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                      ))}
                    {counsellorOptions.filter((opt) =>
                      opt
                        .toLowerCase()
                        .includes(counsellorSearch.toLowerCase()),
                    ).length === 0 &&
                      counsellorSearch && (
                        <div className="px-4 py-3 text-[13px] text-gray-400">
                          No counsellors found
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Status filter - matches Add Lead dimensions */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                className="w-full sm:w-auto py-3 pl-2 sm:pl-4 pr-8 border border-gray-200 rounded-lg bg-white text-[15px] sm:text-sm text-gray-600 outline-none focus:border-teal-500 appearance-none cursor-pointer"
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

            {/* Country filter - matches Add Lead dimensions */}
            <div
              className="relative flex-1 sm:flex-initial"
              ref={countryFilterRef}
            >
              <button
                onClick={() => {
                  setCountryFilterOpen((p) => !p);
                  setCountrySearch("");
                }}
                className="w-full sm:w-auto py-3 pl-2 sm:pl-4 pr-8 border border-gray-200 rounded-lg bg-white text-[15px] sm:text-sm text-gray-600 outline-none hover:border-teal-500 cursor-pointer flex items-center gap-1 min-w-[120px] sm:min-w-[130px]"
              >
                <span className="truncate max-w-[100px]">
                  {filterCountry === "All Countries"
                    ? "All Countries"
                    : filterCountry}
                </span>
              </button>
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

              {countryFilterOpen && (
                <div className="absolute z-50 top-full left-0 mt-1 w-56 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
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
                  <div className="max-h-52 overflow-y-auto py-1">
                    <div
                      onClick={() => {
                        setFilterCountry("All Countries");
                        setCountryFilterOpen(false);
                        setCountrySearch("");
                      }}
                      className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-gray-50 transition-colors
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
                          className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-gray-50 transition-colors
                            ${filterCountry === c ? "text-teal-600 font-medium bg-teal-50" : "text-gray-600"}`}
                        >
                          {c}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* View Toggle - matches Add Lead dimensions */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {viewButtons.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`flex items-center gap-1.5 py-3 px-2 sm:px-4 text-[15px] sm:text-sm font-medium transition-all border-r last:border-0 border-gray-200
                    ${view === v.key ? "bg-teal-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                  {v.icon}
                  <span className="hidden xs:inline">{v.label}</span>
                </button>
              ))}
            </div>

            {/* Export - matches Add Lead dimensions */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 py-3 px-2 sm:px-4 border border-gray-200 rounded-lg text-[15px] sm:text-sm text-gray-600 bg-white hover:bg-gray-50 transition shadow-sm"
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

            {/* Add Lead - Hidden on mobile, visible on desktop */}
            <AddBtnInHeader
              label="Add Lead"
              handleToggle={() => navigate("/admin/leads/new")}
              className="hidden md:flex"
            />
          </div>
        </div>
      </div>

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
          <div className="flex gap-3 h-full pt-1">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.key}
                stage={stage}
                stages={STAGES}
                leads={leadsByStage[stage.key] || []}
                onOpen={setDrawerLead}
                onMenuAction={(action, l) => {
                  if (action === "edit") navigate(`/admin/leads/${l.id}/edit`);
                  if (action === "delete") setDeleteConfirm(l);
                  if (action === "assign")
                    navigate(`/admin/leads/${l.id}/assign`);
                }}
                onDrop={async (leadId, newStatus) => {
                  setDraggingLeadId(null);
                  await handleStage(leadId, newStatus);
                }}
                draggingLeadId={draggingLeadId}
                userRole={userRole}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Table View ── */}
      {!loading && view === "table" && (
        <div className="flex-1 min-h-0 overflow-auto">
          <LeadsTable
            filteredLeads={filteredLeads}
            counsellors={counsellors}
            onRowClick={setDrawerLead}
            onEdit={(l) => navigate(`/admin/leads/${l.id}/edit`)}
            onDelete={setDeleteConfirm}
            onAssignCounsellor={(l) => navigate(`/admin/leads/${l.id}/assign`)}
            actionMenu={actionMenu}
            setActionMenu={setActionMenu}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              fetchLeads(page);
            }}
            userRole={userRole}
          />
        </div>
      )}

      {/* ── Modals & Overlays ── */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
      />

      {/* Only render drawer when there is a lead */}
      {drawerLead && (
        <LeadDrawer
          lead={drawerLead}
          onClose={() => setDrawerLead(null)}
          onStage={handleStage}
          onAddNoteOnly={handleAddNoteOnly}
        />
      )}
    </div>
  );
}
