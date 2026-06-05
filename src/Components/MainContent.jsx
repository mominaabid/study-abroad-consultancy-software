import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  const [counsellorsCount, setCounsellorsCount] = useState(0);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [applicationsWithOfferCount, setApplicationsWithOfferCount] =
    useState(0);

  const [counsellorsChange, setCounsellorsChange] = useState("0%");
  const [paymentsCountChange, setPaymentsCountChange] = useState("0%");
  const [applicationsOfferChange, setApplicationsOfferChange] = useState("0%");

  const [leadsChange, setLeadsChange] = useState("+0%");
  const [applicationsChange, setApplicationsChange] = useState("+0%");

  const notifications = useSelector(selectNotifications);
  const user = useSelector(selectUser);

  const [dateFilter, setDateFilter] = useState("daily");

  const getDateRange = useCallback(() => {
    const now = new Date();
    let start, end;
    switch (dateFilter) {
      case "daily":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "weekly":
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + diffToMonday,
        );
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 7);
        break;
      case "monthly":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        return { start: null, end: null };
    }
    return { start: start.toISOString(), end: end.toISOString() };
  }, [dateFilter]);

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  // --- FETCH ALL DATA WITH DATE RANGE ---
  const fetchAllFilteredData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const { start, end } = getDateRange();
      const query = start && end ? `?start=${start}&end=${end}` : "";
      const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const leadsRes = await fetch(`${BASE_URL}/admin/leads${query}`, {
        headers: authHeaders,
      });
      if (!leadsRes.ok) throw new Error("Failed to fetch leads");
      const leadsData = await leadsRes.json();
      const leadsArray = Array.isArray(leadsData)
        ? leadsData
        : leadsData.data || [];
      setLeads(leadsArray);

      const paymentsRes = await fetch(`${BASE_URL}/admin/payments${query}`, {
        headers: authHeaders,
      });
      if (!paymentsRes.ok) throw new Error("Failed to fetch payments");
      const paymentsData = await paymentsRes.json();
      const paymentsArray = paymentsData.payments || [];
      setPayments(paymentsArray);
      setPaymentsCount(paymentsArray.length);

      const appsRes = await fetch(
        `${BASE_URL}/counsellor/applications/students${query}`,
        { headers: authHeaders },
      );
      if (!appsRes.ok) throw new Error("Failed to fetch applications");
      const appsData = await appsRes.json();
      let allApps = [];
      if (appsData.success && appsData.students) {
        appsData.students.forEach((student) => {
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
      }
      setApplications(allApps);

      const counsellorsRes = await fetch(
        `${BASE_URL}/admin/getCounsellors${query}`,
        { headers: authHeaders },
      );
      if (!counsellorsRes.ok) throw new Error("Failed to fetch counsellors");
      const counsellorsData = await counsellorsRes.json();
      const counsellorsList = Array.isArray(counsellorsData)
        ? counsellorsData
        : counsellorsData.counsellors || [];
      setCounsellorsCount(counsellorsList.length);
    } catch (err) {
      console.error("Dashboard filtered data error:", err);
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchAllFilteredData();
  }, [fetchAllFilteredData]);

  // --- PERCENTAGE CHANGE CALCULATIONS ---
  useEffect(() => {
    if (leads.length === 0) {
      setLeadsChange("0%");
      return;
    }
    const now = new Date();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const totalNow = leads.length;
    const totalPreviousMonth = leads.filter(
      (lead) => new Date(lead.created_at) <= endOfPreviousMonth,
    ).length;
    setLeadsChange(getPercentageChange(totalNow, totalPreviousMonth));
  }, [leads]);

  useEffect(() => {
    if (payments.length === 0) {
      setPaymentsCountChange("0%");
      return;
    }
    const now = new Date();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const totalNow = payments.length;
    const totalPreviousMonth = payments.filter(
      (p) => new Date(p.paid_at) <= endOfPreviousMonth,
    ).length;
    setPaymentsCountChange(getPercentageChange(totalNow, totalPreviousMonth));
  }, [payments]);

  useEffect(() => {
    if (payments.length === 0) {
      setPaymentStats({ monthlyRevenue: 0, revenueChange: "+0%" });
      return;
    }
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const monthlyRevenue = payments
      .filter((p) => {
        const paidDate = new Date(p.paid_at);
        return (
          p.status === "completed" &&
          paidDate.getMonth() === thisMonth &&
          paidDate.getFullYear() === thisYear
        );
      })
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const lastMonthRevenue = payments
      .filter((p) => {
        const paidDate = new Date(p.paid_at);
        return (
          p.status === "completed" &&
          paidDate.getMonth() === lastMonth &&
          paidDate.getFullYear() === lastMonthYear
        );
      })
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    let revenueChange = "+0%";
    if (lastMonthRevenue > 0) {
      const change =
        ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      revenueChange = `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
    } else if (monthlyRevenue > 0) {
      revenueChange = "+100%";
    }
    setPaymentStats({ monthlyRevenue, revenueChange });
  }, [payments]);

  useEffect(() => {
    if (applications.length === 0) {
      setApplicationsChange("0%");
      return;
    }
    const now = new Date();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const totalNow = applications.length;
    const totalPreviousMonth = applications.filter(
      (app) => new Date(app.createdAt) <= endOfPreviousMonth,
    ).length;
    setApplicationsChange(getPercentageChange(totalNow, totalPreviousMonth));
  }, [applications]);

  useEffect(() => {
    const offerApps = applications.filter(
      (app) => app.status === "offer letter received",
    ).length;
    setApplicationsWithOfferCount(offerApps);
  }, [applications]);

  useEffect(() => {
    if (applicationsWithOfferCount === 0) {
      setApplicationsOfferChange("0%");
      return;
    }
    const now = new Date();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const totalNow = applicationsWithOfferCount;
    const totalPreviousMonth = applications.filter(
      (app) =>
        app.status === "offer letter received" &&
        new Date(app.createdAt) <= endOfPreviousMonth,
    ).length;
    setApplicationsOfferChange(
      getPercentageChange(totalNow, totalPreviousMonth),
    );
  }, [applicationsWithOfferCount, applications]);

  useEffect(() => {
    if (counsellorsCount === 0) {
      setCounsellorsChange("0%");
      return;
    }
    setCounsellorsChange("N/A");
  }, [counsellorsCount]);

  // -----------------------------------------------------------------
  // Helper for chart labels – must be defined BEFORE getChartData
  const formatChartLabel = (date, filter) => {
    if (filter === "daily" || filter === "weekly") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.getDate().toString();
    }
  };
  // -----------------------------------------------------------------

  const periodTotalRevenue = useMemo(() => {
    return payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  }, [payments]);

  const getChartData = useCallback(() => {
    const { start, end } = getDateRange();
    if (!start || !end) return [];

    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = [];
    let current = new Date(startDate);
    while (current < endDate) {
      days.push({
        date: new Date(current),
        label: formatChartLabel(current, dateFilter),
        amount: 0,
      });
      current.setDate(current.getDate() + 1);
    }

    const paymentsByDay = {};
    payments.forEach((p) => {
      if (p.status !== "completed") return;
      const paidDate = new Date(p.paid_at);
      const dayKey = paidDate.toISOString().split("T")[0];
      paymentsByDay[dayKey] =
        (paymentsByDay[dayKey] || 0) + parseFloat(p.amount);
    });

    days.forEach((day) => {
      const dayKey = day.date.toISOString().split("T")[0];
      if (paymentsByDay[dayKey]) {
        day.amount = paymentsByDay[dayKey];
      }
    });

    return days;
  }, [getDateRange, payments, dateFilter]);

  const chartData = useMemo(() => getChartData(), [getChartData]);

  const maxRevenue = useMemo(() => {
    if (chartData.length === 0) return 1000;
    return Math.max(...chartData.map((d) => d.amount), 1000);
  }, [chartData]);

  const generateChartPaths = useCallback(() => {
    if (chartData.length === 0) return { linePath: "", areaPath: "" };
    const width = 400;
    const height = 90;
    const step = width / (chartData.length - 1);
    let linePath = `M 0 ${height - (chartData[0].amount / maxRevenue) * height}`;
    let areaPath = `M 0 ${height} L 0 ${height - (chartData[0].amount / maxRevenue) * height}`;
    for (let i = 1; i < chartData.length; i++) {
      const x = i * step;
      const y = height - (chartData[i].amount / maxRevenue) * height;
      linePath += ` L ${x} ${y}`;
      areaPath += ` L ${x} ${y}`;
    }
    areaPath += ` L ${width} ${height} Z`;
    return { linePath, areaPath };
  }, [chartData, maxRevenue]);

  const chartPaths = generateChartPaths();

  // --- Derived stats for funnel and active students ---
  const now = new Date();
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
  const totalLeadsCount = leads.length;
  const activeStudentsCount = counselingCount + evaluatedCount + convertedCount;

  const getActiveStudentsChange = () => {
    if (totalLeadsCount === 0) return "0%";
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

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  const getNotificationDescription = (notification) => {
    const { type, metadata } = notification;
    switch (type) {
      case "lead_assigned":
        return `Lead "${metadata.leadName}" was assigned to you.`;
      case "status_change":
        return `Application status changed from ${metadata.oldStatusLabel} to ${metadata.newStatusLabel}.`;
      case "chat_message":
        return `New message from ${metadata.senderName} (${metadata.senderRole}): "${metadata.preview}"`;
      case "lead_created":
        return `Lead "${metadata.leadName}" was created by ${metadata.counsellorName}.`;
      case "counsellor_added_lead":
        return `Counsellor ${metadata.counsellorName} added lead "${metadata.leadName}".`;
      case "payment_awaiting_verification":
        return `Payment of $${metadata.amount} requires verification.`;
      case "payment_verified":
        return `Payment of $${metadata.amount} was verified.`;
      case "payment_rejected":
        return `Payment of $${metadata.amount} was rejected.`;
      case "payment_added_by_admin":
        return `Payment of $${metadata.amount} was added by admin.`;
      case "application_created":
        return `New application submitted.`;
      case "application_updated":
        return `Application #${metadata.applicationId} was updated.`;
      case "document_shared":
        return `Document shared for application #${metadata.applicationId}.`;
      case "document_verified":
        return `Document verified.`;
      case "document_rejected":
        return `Document rejected.`;
      default:
        return "System update";
    }
  };

  const handleNavigateToLeads = () => navigate("/admin/leads");
  const handleNavigateToPayments = () => navigate("/admin/payments");
  const handleNavigateToApplications = () => navigate("/admin/applications");
  const handleNavigateToActiveStudents = () => navigate("/admin/leads");
  const handleNavigateToCounsellorsList = () => navigate("/admin/counsellors");
  const handleNavigateToPaymentsList = () => navigate("/admin/payments");
  const handleNavigateToOfferLetterApps = () =>
    navigate("/admin/applications?filter=offer_letter");

  return (
    <main className="p-3 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      <div className="flex justify-end items-center mb-4">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
        >
          <option value="daily">Today</option>
          <option value="weekly">This Week (Mon–Sun)</option>
          <option value="monthly">This Month</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard
          title="Total Leads"
          value={loading ? "..." : totalLeadsCount}
          change={leadsChange}
          icon={<Users />}
          color="from-cyan-500 to-blue-600"
          onClick={handleNavigateToLeads}
        />
        <StatCard
          title="Active Students"
          value={loading ? "..." : activeStudentsCount}
          change={activeChange}
          isNegative={activeChange.startsWith("-")}
          icon={<UserCheck />}
          color="from-emerald-400 to-teal-500"
          onClick={handleNavigateToActiveStudents}
        />
        <StatCard
          title="Total Revenue"
          value={
            loading
              ? "..."
              : periodTotalRevenue >= 1000
                ? `PKR ${(periodTotalRevenue / 1000).toFixed(1)}K`
                : `PKR ${periodTotalRevenue.toLocaleString()}`
          }
          change="this period"
          isNegative={false}
          icon={<DollarSign />}
          color="from-violet-500 to-indigo-600"
          onClick={handleNavigateToPayments}
        />
        <StatCard
          title="Applications"
          value={loading ? "..." : applications.length}
          change={applicationsChange}
          isNegative={applicationsChange.startsWith("-")}
          icon={<FileText />}
          color="from-rose-500 to-pink-600"
          onClick={handleNavigateToApplications}
        />
        <StatCard
          title="Counsellors"
          value={counsellorsCount}
          change={counsellorsChange}
          icon={<Briefcase />}
          color="from-blue-500 to-indigo-500"
          onClick={handleNavigateToCounsellorsList}
        />
        <StatCard
          title="Payments"
          value={paymentsCount}
          change={paymentsCountChange}
          isNegative={paymentsCountChange.startsWith("-")}
          icon={<DollarSign />}
          color="from-emerald-500 to-teal-500"
          onClick={handleNavigateToPaymentsList}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <div className="bg-white p-7 rounded-xl shadow-lg border border-gray-100">
          <h3 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-3 h-3 bg-[#009E99] rounded-full"></div>Lead Funnel
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
        <div className="bg-white p-7 rounded-xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-xl text-gray-800">
              Total Revenue Overview
            </h3>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">
                PKR {periodTotalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                Total this{" "}
                {dateFilter === "daily"
                  ? "day"
                  : dateFilter === "weekly"
                    ? "week"
                    : "month"}
              </p>
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
          <div className="flex justify-around mt-3 px-2">
            {chartData.map((data, idx) => (
              <div key={idx} className="text-center">
                <div className="text-xs font-medium text-gray-500">
                  {data.label}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  PKR {(data.amount / 1000).toFixed(1)}K
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
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
                    program={lead.education?.[0]?.degree || "—"}
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
        <div className="space-y-6">
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
                      desc={getNotificationDescription(n)}
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
    className={`bg-white px-6 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 transition-all duration-500 cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between`}
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
          className={`flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${isNegative ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
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
        {percentage > 0 && (
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        )}
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
