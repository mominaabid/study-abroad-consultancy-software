import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";
import {
  Users, FileText, CheckCircle,
  Clock, MessageSquare, TrendingUp,
  ChevronRight, Calendar,
} from "lucide-react";
import { BASE_URL } from "../../Content/Url";

// ── helpers ───────────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("token") || "";
}
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_COLOR = {
  new:        "bg-blue-100 text-blue-700",
  contacted:  "bg-yellow-100 text-yellow-700",
  counseling: "bg-purple-100 text-purple-700",
  evaluated:  "bg-orange-100 text-orange-700",
  applied:    "bg-cyan-100 text-cyan-700",
  visa:       "bg-pink-100 text-pink-700",
  success:    "bg-green-100 text-green-700",
  rejected:       "bg-gray-100 text-gray-600",
};


// ── Main Component ─────────────────────────────────────────────────────────────
export const CounsellorDashboard = () => {
  const navigate = useNavigate();
  const user     = useSelector(selectUser);

  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyLeads() {
      try {
        const res = await fetch(`${BASE_URL}/counsellor/leads`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Counsellor leads fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyLeads();
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total      = leads.length;
  const active     = leads.filter(l => !["success","rejected"].includes(l.status)).length;
  const converted  = leads.filter(l => l.status === "success").length;
  const pending    = leads.filter(l => l.status === "new").length;

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const stageData = [
    { label: "New",        count: leads.filter(l => l.status === "new").length,        color: "#3b82f6" },
    { label: "Contacted",  count: leads.filter(l => l.status === "contacted").length,  color: "#f59e0b" },
    { label: "Counseling", count: leads.filter(l => l.status === "counseling").length, color: "#8b5cf6" },
    { label: "Applied",    count: leads.filter(l => l.status === "applied").length,    color: "#06b6d4" },
    { label: "Success",    count: leads.filter(l => l.status === "success").length,    color: "#10b981" },
  ];

  return (
    <main className="p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">

      {/* ── Welcome Banner ── */}
      <div className="mb-8">
        <div className="bg-blue-950 text-white rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-purple-200 text-sm font-medium mb-1">Counsellor Portal</p>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.name?.split(" ")[0] || "Counsellor"} 👋
              </h1>
              <p className="mt-2 text-purple-100 text-base">
                You have <strong>{active}</strong> active leads to manage today.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
              <Calendar size={18} className="text-purple-200" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="My Total Leads"
          value={loading ? "..." : total}
          icon={<Users size={22} />}
          color="from-violet-500 to-purple-600"
          sub="All assigned to me"
          onClick={() => navigate("/counsellor/leads")}
          clickable
        />
        <StatCard
          title="Active Leads"
          value={loading ? "..." : active}
          icon={<TrendingUp size={22} />}
          color="from-teal-500 to-cyan-500"
          sub="In progress"
        />
        <StatCard
          title="Converted"
          value={loading ? "..." : converted}
          icon={<CheckCircle size={22} />}
          color="from-emerald-500 to-green-500"
          sub="Reached success"
        />
        <StatCard
          title="New Inquiries"
          value={loading ? "..." : pending}
          icon={<Clock size={22} />}
          color="from-orange-500 to-amber-500"
          sub="Awaiting contact"
        />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Leads table */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800">My Recent Leads</h3>
            <button
              onClick={() => navigate("/counsellor/leads")}
              className="text-[#009E99] hover:text-teal-700 font-medium text-sm flex items-center gap-1 transition"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading leads...</div>
          ) : recentLeads.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No leads assigned yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 text-left">Student</th>
                  <th className="px-6 py-4 text-left">Country</th>
                  <th className="px-6 py-4 text-left">Program</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.map(lead => (
                  <tr
                    key={lead.id}
                    className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                    onClick={() => navigate("/counsellor/leads")}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {lead.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{lead.name}</p>
                          <p className="text-xs text-gray-400">{lead.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.preferred_country || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.study_level || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[lead.status] || "bg-gray-100 text-gray-600"}`}>
                        {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1) || "New"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">{timeAgo(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Pipeline stages */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="font-semibold text-lg text-gray-800 mb-5 flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
              My Pipeline
            </h3>
            <div className="space-y-4">
              {stageData.map(s => {
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{s.label}</span>
                      <span className="text-gray-400">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(4, pct)}%`, background: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <QuickAction
                icon={<Users size={18} />}
                label="View My Leads"
                color="text-violet-600 bg-violet-50"
                onClick={() => navigate("/counsellor/leads")}
              />
              <QuickAction
                icon={<FileText size={18} />}
                label="Applications"
                color="text-teal-600 bg-teal-50"
                onClick={() => navigate("/counsellor/applications")}
              />
              <QuickAction
                icon={<MessageSquare size={18} />}
                label="Open Chat"
                color="text-blue-600 bg-blue-50"
                onClick={() => navigate("/counsellor/chats")}
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

// ── Reusable sub-components ───────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color, sub, onClick, clickable }) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-3xl shadow-lg border border-gray-100 transition-all duration-300 relative overflow-hidden
      ${clickable ? "cursor-pointer hover:shadow-xl hover:-translate-y-1" : ""}`}
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full" />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h2 className="text-3xl font-bold text-gray-900 mt-2 tracking-tighter">{value}</h2>
      </div>
      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${color} text-white shadow-inner`}>
        {icon}
      </div>
    </div>
    {sub && <p className="mt-3 text-xs text-gray-400">{sub}</p>}
    {clickable && <p className="mt-1 text-xs text-[#009E99] font-medium">Click to manage →</p>}
  </div>
);

const QuickAction = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200 group"
  >
    <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
    <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-gray-600" />
  </button>
);

export default CounsellorDashboard;