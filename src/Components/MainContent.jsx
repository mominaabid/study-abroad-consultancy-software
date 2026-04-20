import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  DollarSign,
  FileText,
  Plus,
  Mail,
  Calendar,
  Briefcase,
} from "lucide-react";

import { BASE_URL } from "../Content/Url";

export const MainContent = () => {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/admin/leads`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch leads");

        const data = await res.json();
        const leadsData = Array.isArray(data) ? data : data.data || [];

        setLeads(leadsData);
      } catch (err) {
        console.error("Dashboard API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const totalLeads = leads.length;

  // Calculate real counts for funnel
  const newCount = leads.filter(l => l.status?.toLowerCase() === "new").length;
  const contactedCount = leads.filter(l => l.status?.toLowerCase() === "contacted").length;
  const counselingCount = leads.filter(l => l.status?.toLowerCase() === "counseling").length;
  const evaluatedCount = leads.filter(l => l.status?.toLowerCase() === "evaluated").length;
  const convertedCount = leads.filter(l => l.status?.toLowerCase() === "success").length;

  const handleNavigateToLeads = () => {
  navigate("/admin/leads");
  };

  // Recent Leads (latest 4)
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  return (
    <main className="p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-[#009E99] via-teal-600 to-cyan-600 text-white rounded-3xl p-8 shadow-xl">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="mt-2 text-teal-100 text-lg">
            Welcome back! Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Clickable Total Leads Card */}
        <div
          onClick={handleNavigateToLeads}
          className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-teal-500/10 rounded-full" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Leads</p>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 tracking-tighter">
                {loading ? "..." : totalLeads}
              </h2>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-inner">
              <Users className="w-7 h-7" />
            </div>
          </div>
          <p className="mt-4 text-xs text-emerald-600 font-medium">Click to manage leads →</p>
        </div>

        <StatCard 
          title="Active Students" 
          value={loading ? "..." : totalLeads} 
          change="+8.2%" 
          icon={<UserCheck className="w-6 h-6" />} 
          color="from-emerald-500 to-teal-500" 
        />
        <StatCard 
          title="Monthly Revenue" 
          value="$127,500" 
          change="+23.1%" 
          icon={<DollarSign className="w-6 h-6" />} 
          color="from-violet-500 to-purple-600" 
        />
        <StatCard 
          title="Applications" 
          value={loading ? "..." : totalLeads} 
          change="-3.2%" 
          isNegative 
          icon={<FileText className="w-6 h-6" />} 
          color="from-rose-500 to-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Dynamic Lead Funnel */}
        <div className="bg-white p-7 rounded-3xl shadow-lg border border-gray-100">
          <h3 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-3 h-3 bg-[#009E99] rounded-full"></div>
            Lead Funnel
          </h3>
          <div className="space-y-6">
            <ProgressBar label="New" count={newCount} total={totalLeads} color="#14b8a6" />
            <ProgressBar label="Contacted" count={contactedCount} total={totalLeads} color="#22d3ee" />
            <ProgressBar label="Counseling" count={counselingCount} total={totalLeads} color="#06b67f" />
            <ProgressBar label="Evaluated" count={evaluatedCount} total={totalLeads} color="#eab308" />
            <ProgressBar label="Converted" count={convertedCount} total={totalLeads} color="#8b5cf6" />
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white p-7 rounded-3xl shadow-lg border border-gray-100">
          <h3 className="font-semibold text-xl text-gray-800 mb-6">Revenue Overview</h3>
          <div className="h-64 bg-gradient-to-br from-slate-50 via-white to-teal-50 rounded-2xl p-4 flex items-end">
            <svg className="w-full h-52" viewBox="0 0 400 120" fill="none">
              <defs>
                <linearGradient id="revenueGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#009E99" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.65" />
                </linearGradient>
              </defs>
              <path d="M0 100 Q50 80 100 75 T200 45 T300 35 T400 20 V120 H0 Z" fill="url(#revenueGrad)" />
              <path d="M0 100 Q50 80 100 75 T200 45 T300 35 T400 20" stroke="#009E99" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
            <h3 className="font-semibold text-xl text-gray-800">Recent Leads</h3>
            <button 
              onClick={handleNavigateToLeads}
              className="text-[#009E99] hover:text-teal-700 font-medium flex items-center gap-1 transition"
            >
              View All →
            </button>
          </div>

          <table className="w-full">
            <thead className="bg-zinc-50 text-xs uppercase tracking-widest text-gray-500">
              <tr>
                <th className="p-5 text-left">Name</th>
                <th className="p-5 text-left">Country</th>
                <th className="p-5 text-left">Program</th>
                <th className="p-5 text-left">Status</th>
                <th className="p-5 text-left">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-400">Loading recent leads...</td></tr>
              ) : recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    name={lead.name || "—"}
                    email={lead.email || "—"}
                    country={lead.preferred_country || "—"}
                    program={lead.study_level || "—"}
                    status={lead.status || "New"}
                    color="bg-cyan-100 text-cyan-700"
                    assigned={lead.counsellor?.name || "Unassigned"}
                  />
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-12 text-gray-400">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-7 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="font-semibold text-xl text-gray-800 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <ActionButton 
                icon={<Plus size={22} />} 
                label="Add Lead" 
                color="from-teal-500 to-cyan-500" 
                onClick={handleNavigateToLeads}
              />
              <ActionButton icon={<Briefcase size={22} />} label="Create App" color="from-blue-500 to-indigo-500" />
              <ActionButton icon={<Mail size={22} />} label="Bulk Email" color="from-orange-500 to-rose-500" />
              <ActionButton icon={<Calendar size={22} />} label="Schedule" color="from-emerald-500 to-teal-500" />
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl text-gray-800">Live Activity</h3>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                LIVE
              </div>
            </div>
            <div className="space-y-6">
              <ActivityItem title="New lead received" desc="Maria Santos submitted inquiry" time="2 min ago" />
              <ActivityItem title="Application approved" desc="James moved to Visa Processing" time="15 min ago" />
              <ActivityItem title="Payment received" desc="$3,500 tuition from Chen Wei" time="1 hour ago" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

/* ====================== Reusable Components ====================== */

const StatCard = ({ title, value, change, icon, isNegative = false, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-full -translate-y-10 translate-x-10" />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h2 className="text-3xl font-bold text-gray-900 mt-3 tracking-tighter">{value}</h2>
      </div>
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-inner`}>
        {icon}
      </div>
    </div>
    <p className={`mt-6 text-sm font-semibold flex items-center gap-1 ${isNegative ? "text-red-500" : "text-emerald-600"}`}>
      {isNegative ? "↓" : "↑"} {change} 
      <span className="text-gray-400 font-normal text-xs">this month</span>
    </p>
  </div>
);

const ProgressBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-400 font-medium">{count} leads ({percentage}%)</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(8, percentage)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const TableRow = ({ name, email, country, program, status, color, assigned }) => (
  <tr className="hover:bg-teal-50/50 transition-all group">
    <td className="p-5">
      <p className="font-semibold text-gray-800 group-hover:text-[#009E99]">{name}</p>
      <p className="text-xs text-gray-400 mt-1">{email}</p>
    </td>
    <td className="p-5 text-gray-600">{country}</td>
    <td className="p-5 text-gray-600 font-medium">{program}</td>
    <td className="p-5">
      <span className={`px-4 py-1 text-xs font-semibold rounded-2xl ${color}`}>
        {status}
      </span>
    </td>
    <td className="p-5 text-gray-600">{assigned}</td>
  </tr>
);

const ActionButton = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`bg-gradient-to-br ${color} text-white p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md`}
  >
    {icon}
    <span className="text-xs font-medium tracking-wider">{label}</span>
  </button>
);

const ActivityItem = ({ title, desc, time }) => (
  <div className="flex gap-4 group">
    <div className="w-10 h-10 bg-gradient-to-br from-[#009E99] to-teal-400 rounded-2xl flex items-center justify-center shadow-inner">
      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-800 group-hover:text-teal-700 transition">{title}</p>
      <p className="text-sm text-gray-500 mt-1 leading-snug">{desc}</p>
      <p className="text-xs text-gray-400 mt-2">{time}</p>
    </div>
  </div>
);