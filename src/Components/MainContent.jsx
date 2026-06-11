import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  DollarSign,
  FileText,
  Plus,
  Briefcase,
} from "lucide-react";

import { BASE_URL } from "../Content/Url";
import { useSelector } from "react-redux";

// Custom hook for responsive breakpoints
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
};

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

  const [dateFilter, setDateFilter] = useState("daily");

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

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

  // Chart label formatter - now shows actual dates (MM/DD)
  const formatChartLabel = (date) => {
    return date.toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
    });
  };

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
        label: formatChartLabel(current),
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
  }, [getDateRange, payments]);

  const chartData = useMemo(() => getChartData(), [getChartData]);

  const maxRevenue = useMemo(() => {
    if (chartData.length === 0) return 1000;
    const max = Math.max(...chartData.map((d) => d.amount));
    return max === 0 ? 1000 : max;
  }, [chartData]);

  const hasNoData = periodTotalRevenue === 0;

  // Generate chart paths with y-axis and x-axis offset
  const generateChartPaths = useCallback(() => {
    // Chart dimensions inside viewBox (0 0 400 100)
    const chartXStart = 40; // space for y-axis labels
    const chartWidth = 340;
    const chartYStart = 5; // top padding
    const chartHeight = 90;

    if (chartData.length === 0) {
      return {
        linePath: "",
        areaPath: "",
        chartXStart,
        chartWidth,
        chartYStart,
        chartHeight,
        isSinglePoint: false,
      };
    }

    // Single data point: draw a circle instead of a line
    if (chartData.length === 1) {
      const x = chartXStart + chartWidth / 2;
      let y = chartYStart + chartHeight;
      if (maxRevenue > 0) {
        y =
          chartYStart +
          chartHeight -
          (chartData[0].amount / maxRevenue) * chartHeight;
      }
      return {
        linePath: "",
        areaPath: "",
        chartXStart,
        chartWidth,
        chartYStart,
        chartHeight,
        isSinglePoint: true,
        singleX: x,
        singleY: y,
      };
    }

    const step = chartWidth / (chartData.length - 1);
    let linePath = `M ${chartXStart} ${chartYStart + chartHeight - (chartData[0].amount / maxRevenue) * chartHeight}`;
    let areaPath = `M ${chartXStart} ${chartYStart + chartHeight} L ${chartXStart} ${chartYStart + chartHeight - (chartData[0].amount / maxRevenue) * chartHeight}`;

    for (let i = 1; i < chartData.length; i++) {
      const x = chartXStart + i * step;
      const y =
        chartYStart +
        chartHeight -
        (chartData[i].amount / maxRevenue) * chartHeight;
      linePath += ` L ${x} ${y}`;
      areaPath += ` L ${x} ${y}`;
    }
    areaPath += ` L ${chartXStart + chartWidth} ${chartYStart + chartHeight} Z`;

    return {
      linePath,
      areaPath,
      chartXStart,
      chartWidth,
      chartYStart,
      chartHeight,
      isSinglePoint: false,
    };
  }, [chartData, maxRevenue]);

  const chartPaths = generateChartPaths();

  // Generate y-axis ticks
  const yAxisTicks = useMemo(() => {
    const ticks = [];
    const numTicks = 4;
    for (let i = 0; i <= numTicks; i++) {
      const value = (maxRevenue / numTicks) * i;
      ticks.push(value);
    }
    return ticks;
  }, [maxRevenue]);

  // Map y value to pixel coordinate for axis
  const getYCoord = (value) => {
    const { chartYStart, chartHeight } = chartPaths;
    return chartYStart + chartHeight - (value / maxRevenue) * chartHeight;
  };

  // X-axis labels: show subset on mobile/tablet
  const getVisibleChartIndices = useCallback(() => {
    if (chartData.length <= 5) return chartData.map((_, idx) => idx);
    let maxLabels = isMobile ? 4 : isTablet ? 6 : chartData.length;
    if (maxLabels > chartData.length) maxLabels = chartData.length;
    const step = (chartData.length - 1) / (maxLabels - 1);
    const indices = [];
    for (let i = 0; i < maxLabels; i++) {
      indices.push(Math.round(i * step));
    }
    return indices;
  }, [chartData.length, isMobile, isTablet]);

  const visibleIndices = getVisibleChartIndices();

  // Derived stats
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

  const handleNavigateToLeads = () => navigate("/admin/leads");
  const handleNavigateToApplications = () => navigate("/admin/applications");
  const handleNavigateToActiveStudents = () => navigate("/admin/leads");
  const handleNavigateToCounsellorsList = () => navigate("/admin/counsellors");
  const handleNavigateToPaymentsList = () => navigate("/admin/payments");

  return (
    <main className="p-3 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Filter Selector - Responsive alignment */}
      <div className="flex justify-end items-center mb-3">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
        >
          <option value="daily">Today</option>
          <option value="weekly">This Week (Mon–Sun)</option>
          <option value="monthly">This Month</option>
        </select>
      </div>

      {/* Stat Cards Grid - 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3 ">
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

      {/* Two Column Layout: Lead Funnel & Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <div className="bg-white p-4 sm:p-5 md:p-7 rounded-xl shadow-lg border border-gray-100">
          <h3 className="font-semibold text-lg sm:text-xl text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
            <div className="w-3 h-3 bg-[#009E99] rounded-full"></div>Lead Funnel
          </h3>
          <div className="space-y-4 sm:space-y-6">
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
        <div className="bg-white p-4 sm:p-5 md:p-7 rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
            <h3 className="font-semibold text-lg sm:text-xl text-gray-800">
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
          <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-slate-50 via-white to-teal-50 rounded-xl p-2 sm:p-4">
            <svg
              className="w-full h-full"
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

              {/* Y-axis line */}
              <line
                x1={chartPaths.chartXStart - 5}
                y1={chartPaths.chartYStart}
                x2={chartPaths.chartXStart - 5}
                y2={chartPaths.chartYStart + chartPaths.chartHeight}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              {/* Y-axis ticks & labels */}
              {yAxisTicks.map((tick, idx) => {
                const y = getYCoord(tick);
                const formattedValue =
                  tick >= 1000
                    ? `${(tick / 1000).toFixed(0)}K`
                    : tick.toFixed(0);
                return (
                  <g key={idx}>
                    <line
                      x1={chartPaths.chartXStart - 8}
                      y1={y}
                      x2={chartPaths.chartXStart - 5}
                      y2={y}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    <text
                      x={chartPaths.chartXStart - 12}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[8px] sm:text-[9px] fill-gray-500"
                    >
                      {formattedValue}
                    </text>
                  </g>
                );
              })}

              {/* Chart area (line + gradient) */}
              {!hasNoData ? (
                <>
                  {chartPaths.areaPath && (
                    <path d={chartPaths.areaPath} fill="url(#revenueGrad)" />
                  )}
                  {chartPaths.isSinglePoint ? (
                    <circle
                      cx={chartPaths.singleX}
                      cy={chartPaths.singleY}
                      r="4"
                      fill="#009E99"
                    />
                  ) : (
                    chartPaths.linePath && (
                      <path
                        d={chartPaths.linePath}
                        stroke="#009E99"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                      />
                    )
                  )}
                </>
              ) : (
                // Baseline state when no data
                <>
                  <line
                    x1={chartPaths.chartXStart}
                    y1={chartPaths.chartYStart + chartPaths.chartHeight / 2}
                    x2={chartPaths.chartXStart + chartPaths.chartWidth}
                    y2={chartPaths.chartYStart + chartPaths.chartHeight / 2}
                    stroke="#009E99"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
          </div>
          {/* X-axis labels (dates) */}
          <div className="flex justify-around mt-2 sm:mt-3 px-1 sm:px-2 overflow-x-auto">
            {visibleIndices.map((idx) => {
              const data = chartData[idx];
              if (!data) return null;
              return (
                <div
                  key={idx}
                  className="text-center min-w-[30px] sm:min-w-[40px]"
                >
                  <div className="text-[10px] sm:text-xs font-medium text-gray-500 truncate">
                    {data.label}
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-gray-400 mt-1">
                    PKR {(data.amount / 1000).toFixed(1)}K
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Leads Table - Full Width (Live Activity removed) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b bg-gradient-to-r from-slate-50 to-white flex flex-row justify-between items-center gap-2">
          <h3 className="font-semibold text-lg sm:text-xl text-gray-800">
            Recent Leads
          </h3>
          <button
            onClick={handleNavigateToLeads}
            className="text-[#009E99] hover:text-teal-700 font-medium flex items-center gap-1 transition text-sm whitespace-nowrap"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-zinc-50 text-xs uppercase tracking-widest text-gray-500">
              <tr>
                <th className="p-3 sm:p-5 text-left">Name</th>
                <th className="p-3 sm:p-5 text-left">Country</th>
                <th className="p-3 sm:p-5 text-left hidden sm:table-cell">
                  Program
                </th>
                <th className="p-3 sm:p-5 text-left">Status</th>
                <th className="p-3 sm:p-5 text-left hidden md:table-cell">
                  Assigned To
                </th>
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
    className={`bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 transition-all duration-500 cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between`}
  >
    <div
      className={`absolute -right-4 -top-4 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br ${color} opacity-[0.08] rounded-full group-hover:scale-150 transition-transform duration-700`}
    />
    <div className="relative z-10">
      <div className="flex justify-between items-start">
        <div className="space-y-0.5 sm:space-y-1">
          <p className="text-gray-700 text-[10px] sm:text-xs font-bold tracking-wider">
            {title}
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">
            {value}
          </h2>
        </div>
        <div
          className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}
        >
          {React.cloneElement(icon, {
            size: 18,
            strokeWidth: 2.5,
            className: "sm:w-[22px] sm:h-[22px]",
          })}
        </div>
      </div>
      <div className="mt-3 sm:mt-6 flex flex-wrap items-center gap-1 sm:gap-2">
        <div
          className={`flex items-center px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold ${isNegative ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
        >
          {isNegative ? "↓" : "↑"} {change}
        </div>
        <span className="text-gray-400 text-[9px] sm:text-[11px] font-medium italic">
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
      <div className="flex flex-col xs:flex-row justify-between text-xs sm:text-sm mb-1 sm:mb-2 gap-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-400 font-medium">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
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
    <td className="p-3 sm:p-5">
      <p className="font-semibold text-gray-800 group-hover:text-[#009E99] text-sm sm:text-base">
        {name}
      </p>
      <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 truncate max-w-[120px] sm:max-w-none">
        {email}
      </p>
    </td>
    <td className="p-3 sm:p-5 text-gray-600 text-sm sm:text-base">{country}</td>
    <td className="p-3 sm:p-5 text-gray-600 font-medium text-sm sm:text-base hidden sm:table-cell">
      {program}
    </td>
    <td className="p-3 sm:p-5">
      <span
        className={`px-2 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-xl ${color}`}
      >
        {status}
      </span>
    </td>
    <td className="p-3 sm:p-5 text-gray-600 text-sm sm:text-base hidden md:table-cell">
      {assigned}
    </td>
  </tr>
);
