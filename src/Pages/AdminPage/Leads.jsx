// Leads.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../Content/Url";
import "./Leads.css";
import { FiUsers, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
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

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-400 shadow-sm px-5 py-4 
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
      lead.preferred_country
        ?.split(",")
        .map((c) => c.trim())
        .includes(filterCountry);

    const matchStatus =
      filterStatus === "All Status" || lead.status === filterStatus;

    const matchCounsellor =
      filterCounsellor === "All Counsellors" ||
      (filterCounsellor === "Unassigned" && !lead.counsellor_id) ||
      (filterCounsellor !== "Unassigned" &&
        lead.counsellor?.name === filterCounsellor);

    return matchSearch && matchCountry && matchStatus && matchCounsellor;
  });

  const handleAddNoteOnly = async (leadId, note) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not logged in.");
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

      toast.success("Note added successfully!");

      if (drawerLead?.id === leadId) {
        fetchLeads(currentPage);
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error(error.message || "Failed to add note");
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
      value: leads.filter(
        (l) => !["new", "success", "rejected"].includes(l.status),
      ).length,
      icon: <FiTrendingUp />,
      color: "#f59e0b",
    },
    {
      label: "Conversions",
      value: leads.filter((l) => l.status !== "new" && l.status !== "contacted")
        .length,
      icon: <FiCheckCircle />,
      color: "#10b981",
    },
    {
      label: "Case Close Successfully",
      value: leads.filter((l) => l.status === "success").length,
      icon: <FiCheckCircle />,
      color: "#10b981",
    },
    {
      label: "Rejected",
      value: leads.filter((l) => l.status === "rejected").length,
      icon: <FiCheckCircle />,
      color: "#10b981",
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

  // Get unique counsellors for filter
  const counsellorOptions = [
    "All Counsellors",
    "Unassigned",
    ...counsellors.map((c) => c.name),
  ];

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-hidden">
      {/* ── Stats Bar ── */}
      {!loading && (
        <div className="flex-shrink-0 grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 sm:px-6">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      <div className="flex-shrink-0 px-6 py-4 relative z-[60]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
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

            {/* Counsellor Filter */}
            <div className="relative" ref={counsellorFilterRef}>
              <button
                onClick={() => {
                  setCounsellorFilterOpen((p) => !p);
                  setCounsellorSearch("");
                }}
                className="h-9 pl-3 pr-8 border border-gray-200 rounded-xl bg-white text-[13px] text-gray-600 outline-none hover:border-teal-500 appearance-none cursor-pointer flex items-center gap-1 min-w-[150px]"
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
                    : filterCounsellor === "Unassigned"
                      ? "Unassigned"
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
                <div className="absolute z-50 top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
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
                          {opt === "Unassigned" && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                          )}
                          {opt !== "All Counsellors" &&
                            opt !== "Unassigned" && (
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

            {/* Country filter */}
            <div className="relative" ref={countryFilterRef}>
              <button
                onClick={() => {
                  setCountryFilterOpen((p) => !p);
                  setCountrySearch("");
                }}
                className="h-9 pl-3 pr-8 border border-gray-200 rounded-xl bg-white text-[13px] text-gray-600 outline-none hover:border-teal-500 appearance-none cursor-pointer flex items-center gap-1 min-w-[130px]"
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
                <div className="absolute z-50 top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
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

            {/* Add Lead - Navigate to new lead page */}
            <button
              onClick={() => navigate("/admin/leads/new")}
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
              // <KanbanColumn
              //   key={stage.key}
              //   stage={stage}
              //   leads={leadsByStage[stage.key] || []}
              //   onOpen={setDrawerLead}
              //   onMenuAction={(action, l) => {
              //     if (action === "edit") navigate(`/admin/leads/${l.id}/edit`);
              //     if (action === "delete") setDeleteConfirm(l);
              //     if (action === "assign") navigate(`/admin/leads/${l.id}/assign`);
              //   }}
              //   onDrop={async (leadId, newStatus) => {
              //     setDraggingLeadId(null);
              //     await handleStage(leadId, newStatus);
              //   }}
              //   draggingLeadId={draggingLeadId}
              //   userRole={userRole}
              // />

              <KanbanColumn
                key={stage.key}
                stage={stage}
                stages={STAGES}
                leads={leadsByStage[stage.key] || []}
                onOpen={setDrawerLead}
                onMenuAction={(action, l) => {
                  if (action === "edit") navigate(`/admin/leads/${l.id}/edit`);

                  if (action === "delete") {
                    setDeleteConfirm(l);
                  }

                  if (action === "assign") {
                    navigate(`/admin/leads/${l.id}/assign`);
                  }
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
