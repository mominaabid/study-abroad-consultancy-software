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
  MessageCircle,
} from "lucide-react";

import { BASE_URL } from "../Content/Url";
import { useSelector } from "react-redux";
import { selectNotifications } from "../redux/slices/notificationSlice";
import { selectUser } from "../redux/slices/authSlice";

export const MainContent = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentStats, setPaymentStats] = useState({
    monthlyRevenue: 0,
    revenueChange: "+0%",
  });

  // Dynamic stat footer data
  const [leadsChange, setLeadsChange] = useState("+0%");
  const [applicationsChange, setApplicationsChange] = useState("+0%");

  const notifications = useSelector(selectNotifications);
  const user = useSelector(selectUser);

  // Helper: calculate percentage change between two numbers
  const getPercentageChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? "+100%" : "0%";
    }
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

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

  // Compute dynamic change for Total Leads
  useEffect(() => {
    if (leads.length === 0) {
      setLeadsChange("0%");
      return;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // First day of current month
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    // Last day of previous month
    const endOfPreviousMonth = new Date(currentYear, currentMonth, 0);

    // Total leads up to now (current total)
    const totalNow = leads.length;

    // Total leads up to end of previous month (includes all leads created on or before that date)
    const totalPreviousMonth = leads.filter((lead) => {
      const createdAt = new Date(lead.createdAt);
      return createdAt <= endOfPreviousMonth;
    }).length;

    const change = getPercentageChange(totalNow, totalPreviousMonth);
    setLeadsChange(change);
  }, [leads]);

  // Fetch Payments for Revenue Stats
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${BASE_URL}/admin/payments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch payments");

        const data = await res.json();
        const paymentsData = data.payments || [];
        setPayments(paymentsData);

        // Calculate monthly revenue
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        // Current month revenue
        const monthlyRevenue = paymentsData
          .filter((p) => {
            const paidDate = new Date(p.paid_at);
            return (
              p.status === "completed" &&
              paidDate.getMonth() === thisMonth &&
              paidDate.getFullYear() === thisYear
            );
          })
          .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

        // Last month revenue for comparison
        const lastMonthRevenue = paymentsData
          .filter((p) => {
            const paidDate = new Date(p.paid_at);
            return (
              p.status === "completed" &&
              paidDate.getMonth() === lastMonth &&
              paidDate.getFullYear() === lastMonthYear
            );
          })
          .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

        // Calculate change percentage
        let revenueChange = "+0%";
        if (lastMonthRevenue > 0) {
          const change =
            ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
          revenueChange = `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
        } else if (monthlyRevenue > 0) {
          revenueChange = "+100%";
        }

        setPaymentStats({
          monthlyRevenue,
          revenueChange,
        });
      } catch (err) {
        console.error("Payments API error:", err);
      }
    };

    fetchPayments();
  }, []);

  // Fetch Counsellor Applications
  useEffect(() => {
    const fetchCounsellorApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${BASE_URL}/counsellor/applications/students`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch counsellor applications");

        const data = await res.json();
        if (data.success && data.students) {
          const allApps = [];
          data.students.forEach((student) => {
            if (student.applications && Array.isArray(student.applications)) {
              student.applications.forEach((app) => {
                allApps.push({
                  id: app.id || app._id,
                  ...app,
                  student_name: student.name,
                  student_email: student.email,
                  student_id: student.id,
                });
              });
            }
          });
          setApplications(allApps);
        } else {
          setApplications([]);
        }
      } catch (err) {
        console.error("Counsellor applications API error:", err);
        setApplications([]);
      }
    };

    fetchCounsellorApplications();
  }, []);

  // Compute dynamic change for Applications
  useEffect(() => {
    if (applications.length === 0) {
      setApplicationsChange("0%");
      return;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // End of previous month
    const endOfPreviousMonth = new Date(currentYear, currentMonth, 0);

    // Total applications now
    const totalNow = applications.length;

    // Total applications created on or before end of previous month
    const totalPreviousMonth = applications.filter((app) => {
      // Use createdAt or fallback to current date
      const createdDate = app.createdAt ? new Date(app.createdAt) : new Date();
      return createdDate <= endOfPreviousMonth;
    }).length;

    const change = getPercentageChange(totalNow, totalPreviousMonth);
    setApplicationsChange(change);
  }, [applications]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Calculate real counts for funnel
  const newCount = leads.filter(
    (l) => l.status?.toLowerCase() === "new",
  ).length;
  const contactedCount = leads.filter(
    (l) => l.status?.toLowerCase() === "contacted",
  ).length;
  const counselingCount = leads.filter(
    (l) => l.status?.toLowerCase() === "counseling",
  ).length;
  const evaluatedCount = leads.filter(
    (l) => l.status?.toLowerCase() === "evaluated",
  ).length;
  const convertedCount = leads.filter(
    (l) => l.status?.toLowerCase() === "success",
  ).length;

  // Total leads - fixed to actual total count
  const totalLeadsCount = leads.length;
  // const totalLeadsCount = leads.filter((l) => {
  //   const status = l.status?.toLowerCase();
  //   return status === "new" || status === "contacted";
  // }).length;

  // Active students = Counseling + Evaluated + Converted
  const activeStudentsCount = counselingCount + evaluatedCount + convertedCount;

  const getActiveStudentsChange = () => {
    if (totalLeadsCount === 0) return "0%";

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const currentMonthActive = leads.filter((l) => {
      const status = l.status?.toLowerCase();
      const d = new Date(l.createdAt);
      return (
        (status === "counseling" ||
          status === "evaluated" ||
          status === "success") &&
        d.getMonth() === thisMonth &&
        d.getFullYear() === thisYear
      );
    }).length;

    const lastMonthActive = leads.filter((l) => {
      const status = l.status?.toLowerCase();
      const d = new Date(l.createdAt);
      const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      return (
        (status === "counseling" ||
          status === "evaluated" ||
          status === "success") &&
        d.getMonth() === prevMonth &&
        d.getFullYear() === prevYear
      );
    }).length;

    if (lastMonthActive === 0) return currentMonthActive > 0 ? "+100%" : "0%";

    const diff =
      ((currentMonthActive - lastMonthActive) / lastMonthActive) * 100;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`;
  };

  const activeChange = getActiveStudentsChange();

  const handleNavigateToLeads = () => {
    navigate("/admin/leads");
  };
  const handleNavigateToCounseling = () => {
    navigate("/admin/counsellors");
  };
  const handleNavigateToChats = () => {
    navigate("/admin/chats");
  };
  const handleNavigateToPayments = () => {
    navigate("/admin/payments");
  };

  const handleNavigateToApplications = () => {
    navigate("/admin/applications");
  };

  const handleNavigateToActiveStudents = () => {
    navigate("/admin/leads");
  };

  // Recent Leads (latest 4)
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  // Prepare revenue chart data based on actual payments (last 6 months)
  const getMonthlyRevenueData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyTotals = new Array(12).fill(0);

    payments.forEach((payment) => {
      if (payment.status === "completed" && payment.amount > 0) {
        const date = new Date(payment.paid_at);
        const month = date.getMonth();
        monthlyTotals[month] += parseFloat(payment.amount);
      }
    });

    // Get last 6 months for better visualization
    const currentMonth = now.getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = currentMonth - i;
      const monthIdx = monthIndex < 0 ? 12 + monthIndex : monthIndex;
      last6Months.push({
        month: months[monthIdx],
        amount: monthlyTotals[monthIdx],
      });
    }

    return last6Months;
  };

  const revenueData = getMonthlyRevenueData();
  const maxRevenue = Math.max(...revenueData.map((d) => d.amount), 1000);

  // Generate SVG path for revenue chart
  const generateChartPath = () => {
    if (revenueData.length === 0) return "";

    const width = 400;
    const height = 90;
    const step = width / (revenueData.length - 1);

    let linePath = `M 0 ${height - (revenueData[0].amount / maxRevenue) * height}`;
    let areaPath = `M 0 ${height} L 0 ${height - (revenueData[0].amount / maxRevenue) * height}`;

    for (let i = 1; i < revenueData.length; i++) {
      const x = i * step;
      const y = height - (revenueData[i].amount / maxRevenue) * height;
      linePath += ` L ${x} ${y}`;
      areaPath += ` L ${x} ${y}`;
    }
    areaPath += ` L ${width} ${height} Z`;

    return { linePath, areaPath };
  };

  const chartPaths = generateChartPath();

  return (
    <main className="p-3 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      <div className="mb-3">
        <div className="bg-gradient-to-r from-[#009E99] via-teal-700 to-cyan-700 text-white rounded-xl p-3 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-teal-100 text-sm font-medium mb-1 tracking-wider">
                Management Portal
              </p>
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
              </h1>
              <p className="mt-2 text-white/90 text-lg">
                You have{" "}
                <strong className="text-yellow-300">
                  {activeStudentsCount}
                </strong>{" "}
                active students to manage today.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-5 py-1 border border-white/20 shadow-inner">
              <Calendar size={20} className="text-teal-100" />
              <div className="flex flex-col">
                <span className="text-xs text-teal-100 font-bold">Today</span>
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {/* Total Leads - Dynamic change */}
        {/* Total Leads */}
        <StatCard
          title="Total Leads"
          value={loading ? "..." : totalLeadsCount}
          change={leadsChange}
          icon={<Users />}
          color="from-cyan-500 to-blue-600"
          onClick={handleNavigateToLeads}
        />

        {/* Active Students */}
        <StatCard
          title="Active Students"
          value={loading ? "..." : activeStudentsCount}
          change={activeChange}
          isNegative={activeChange.startsWith("-")}
          icon={<UserCheck />}
          color="from-emerald-400 to-teal-500"
          onClick={handleNavigateToActiveStudents}
        />

        {/* Monthly Revenue */}
        <StatCard
          title="Monthly Revenue"
          value={`$${(paymentStats.monthlyRevenue / 1000).toFixed(1)}K`}
          change={paymentStats.revenueChange}
          isNegative={paymentStats.revenueChange.startsWith("-")}
          icon={<DollarSign />}
          color="from-violet-500 to-indigo-600"
          onClick={handleNavigateToPayments}
        />

        {/* Applications */}
        <StatCard
          title="Applications"
          value={loading ? "..." : applications.length}
          change={applicationsChange}
          isNegative={applicationsChange.startsWith("-")}
          icon={<FileText />}
          color="from-rose-500 to-pink-600"
          onClick={handleNavigateToApplications}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Dynamic Lead Funnel */}
        <div className="bg-white p-7 rounded-xl shadow-lg border border-gray-100">
          <h3 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-3 h-3 bg-[#009E99] rounded-full"></div>
            Lead Funnel
          </h3>
          <div className="space-y-6">
            <ProgressBar
              label="New"
              count={newCount}
              total={totalLeadsCount}
              color="#14b8a6"
            />
            <ProgressBar
              label="Contacted"
              count={contactedCount}
              total={totalLeadsCount}
              color="#22d3ee"
            />
            <ProgressBar
              label="Counseling"
              count={counselingCount}
              total={totalLeadsCount}
              color="#06b67f"
            />
            <ProgressBar
              label="Evaluated"
              count={evaluatedCount}
              total={totalLeadsCount}
              color="#eab308"
            />
            <ProgressBar
              label="Converted"
              count={convertedCount}
              total={totalLeadsCount}
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* Revenue Overview - Dynamic Chart */}
        <div className="bg-white p-7 rounded-xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-xl text-gray-800">
              Revenue Overview
            </h3>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">
                ${paymentStats.monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">This Month</p>
            </div>
          </div>
          <div className="h-64 bg-gradient-to-br from-slate-50 via-white to-teal-50 rounded-xl p-4">
            <svg
              className="w-full h-48"
              viewBox="0 0 400 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="revenueGrad"
                  x1="0%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#009E99" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.65" />
                </linearGradient>
              </defs>
              {chartPaths.areaPath && (
                <path d={chartPaths.areaPath} fill="url(#revenueGrad)" />
              )}
              {chartPaths.linePath && (
                <path
                  d={chartPaths.linePath}
                  stroke="#009E99"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          </div>
          {/* Month labels */}
          <div className="flex justify-around mt-3 px-2">
            {revenueData.map((data, index) => (
              <div key={index} className="text-center">
                <div className="text-xs font-medium text-gray-500">
                  {data.month}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  ${(data.amount / 1000).toFixed(0)}K
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* Recent Leads */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
            <h3 className="font-semibold text-xl text-gray-800">
              Recent Leads
            </h3>
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
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">
                    Loading recent leads...
                  </td>
                </tr>
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
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-7 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-semibold text-xl text-gray-800 mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton
                icon={<Plus size={22} />}
                label="Add Lead"
                color="from-teal-500 to-cyan-500"
                onClick={handleNavigateToLeads}
              />
              <ActionButton
                icon={<Briefcase size={22} />}
                label="Add Counselor"
                color="from-blue-500 to-indigo-500"
                onClick={handleNavigateToCounseling}
              />
              <ActionButton
                icon={<MessageCircle size={22} />}
                label=" Chats"
                color="from-orange-500 to-rose-500"
                onClick={handleNavigateToChats}
              />
              <ActionButton
                icon={<DollarSign size={22} />}
                label="Payments"
                color="from-emerald-500 to-teal-500"
                onClick={handleNavigateToPayments}
              />
            </div>
          </div>

          <div className="bg-white p-7 rounded-xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl text-gray-800">
                Live Activity
              </h3>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                LIVE
              </div>
            </div>

            <div className="space-y-6">
              {notifications.length > 0 ? (
                notifications
                  .slice(0, 5)
                  .map((n) => (
                    <ActivityItem
                      key={n.id}
                      title={n.message}
                      desc="System Update"
                      time={n.time}
                    />
                  ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

/* ====================== Reusable Components ====================== */

const StatCard = ({
  title,
  value,
  change,
  icon,
  isNegative = false,
  color,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-white px-6 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 
               hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 
               transition-all duration-500 cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between`}
  >
    <div
      className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${color} opacity-[0.08] rounded-full group-hover:scale-150 transition-transform duration-700`}
    />

    <div className="relative z-10">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-gray-700 text-xs font-bold tracking-wider">
            {title}
          </p>
          <h2 className="text-3xl font-semibold text-gray-800 tracking-tight">
            {value}
          </h2>
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}
        >
          {React.cloneElement(icon, { size: 22, strokeWidth: 2.5 })}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <div
          className={`flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${
            isNegative
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {isNegative ? "↓" : "↑"} {change}
        </div>
        <span className="text-gray-400 text-[11px] font-medium italic">
          vs last month
        </span>
      </div>
    </div>
  </div>
);

const ProgressBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-400 font-medium">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.max(8, percentage)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

const TableRow = ({
  name,
  email,
  country,
  program,
  status,
  color,
  assigned,
}) => (
  <tr className="hover:bg-teal-50/50 transition-all group">
    <td className="p-5">
      <p className="font-semibold text-gray-800 group-hover:text-[#009E99]">
        {name}
      </p>
      <p className="text-xs text-gray-400 mt-1">{email}</p>
    </td>
    <td className="p-5 text-gray-600">{country}</td>
    <td className="p-5 text-gray-600 font-medium">{program}</td>
    <td className="p-5">
      <span className={`px-4 py-1 text-xs font-semibold rounded-xl ${color}`}>
        {status}
      </span>
    </td>
    <td className="p-5 text-gray-600">{assigned}</td>
  </tr>
);

const ActionButton = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`bg-gradient-to-br ${color} text-white p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md`}
  >
    {icon}
    <span className="text-xs font-medium tracking-wider">{label}</span>
  </button>
);

const ActivityItem = ({ title, desc, time }) => (
  <div className="flex gap-3 group">
    <div className="w-10 h-10 bg-gradient-to-br from-[#009E99] to-teal-400 rounded-xl flex items-center justify-center shadow-inner">
      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-800 group-hover:text-teal-700 transition">
        {title}
      </p>
      <p className="text-sm text-gray-500 mt-1 leading-snug">{desc}</p>
      <p className="text-xs text-gray-400 mt-2">{time}</p>
    </div>
  </div>
);
