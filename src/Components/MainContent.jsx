import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  DollarSign,
  FileText,
  Briefcase,
  Plane,
  Globe,
} from "lucide-react";
import { BASE_URL } from "../Content/Url";

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
  const [applicationsWithOfferCount, setApplicationsWithOfferCount] = useState(0);

  const [counsellorsChange, setCounsellorsChange] = useState("0%");
  const [paymentsCountChange, setPaymentsCountChange] = useState("0%");
  const [applicationsOfferChange, setApplicationsOfferChange] = useState("0%");
  const [leadsChange, setLeadsChange] = useState("+0%");
  const [applicationsChange, setApplicationsChange] = useState("+0%");

  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  const getToken = () => localStorage.getItem("token") || "";

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  // --- FETCH ALL DATA (NO FILTERS) ---
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      
      const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // ✅ Fetch ALL Leads (no filters)
      const leadsRes = await fetch(`${BASE_URL}/admin/leads?page=1&limit=1000`, { headers: authHeaders });
      const leadsData = await leadsRes.json();
      let leadsArray = [];
      if (leadsData.success && leadsData.data) {
        if (leadsData.data.leads && Array.isArray(leadsData.data.leads)) {
          leadsArray = leadsData.data.leads;
        } else if (Array.isArray(leadsData.data)) {
          leadsArray = leadsData.data;
        }
      } else if (Array.isArray(leadsData)) {
        leadsArray = leadsData;
      }
      setLeads(leadsArray);

      // ✅ Fetch ALL Payments/Transactions
      const paymentsRes = await fetch(`${BASE_URL}/accounts/all-transactions`, { headers: authHeaders });
      const paymentsData = await paymentsRes.json();
      let paymentsArray = [];
      if (paymentsData.success && paymentsData.transactions) {
        paymentsArray = paymentsData.transactions || [];
      }
      setPayments(paymentsArray);
      setPaymentsCount(paymentsArray.length);

      // ✅ Fetch ALL Applications
      const appsRes = await fetch(`${BASE_URL}/counsellor/applications/students`, { headers: authHeaders });
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
                created_at: app.created_at || app.createdAt,
              });
            });
          }
        });
      }
      setApplications(allApps);

      // ✅ Fetch Counsellors
      const counsellorsRes = await fetch(`${BASE_URL}/admin/getCounsellors`, { headers: authHeaders });
      const counsellorsData = await counsellorsRes.json();
      let counsellorsList = [];
      if (counsellorsData.success && counsellorsData.data) {
        if (counsellorsData.data.counsellors) {
          if (Array.isArray(counsellorsData.data.counsellors) && counsellorsData.data.counsellors.length > 0) {
            if (Array.isArray(counsellorsData.data.counsellors[0])) {
              counsellorsList = counsellorsData.data.counsellors[0] || [];
            } else {
              counsellorsList = counsellorsData.data.counsellors;
            }
          }
        } else if (Array.isArray(counsellorsData.data)) {
          counsellorsList = counsellorsData.data;
        }
      } else if (Array.isArray(counsellorsData)) {
        counsellorsList = counsellorsData;
      }
      setCounsellorsCount(counsellorsList.length);
    } catch (err) {
      console.error("Dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- PERCENTAGE CHANGE CALCULATIONS ---
  useEffect(() => {
    const leadsArr = Array.isArray(leads) ? leads : [];
    if (leadsArr.length === 0) {
      setLeadsChange("0%");
      return;
    }
    const now = new Date();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const totalNow = leadsArr.length;
    const totalPreviousMonth = leadsArr.filter((lead) => new Date(lead.created_at || lead.createdAt) <= endOfPreviousMonth).length;
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
    const totalPreviousMonth = payments.filter((p) => new Date(p.date || p.created_at) <= endOfPreviousMonth).length;
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
        const paidDate = new Date(p.date || p.created_at);
        return paidDate.getMonth() === thisMonth && paidDate.getFullYear() === thisYear;
      })
      .reduce((sum, p) => sum + (parseFloat(p.credit || p.debit) || 0), 0);

    const lastMonthRevenue = payments
      .filter((p) => {
        const paidDate = new Date(p.date || p.created_at);
        return paidDate.getMonth() === lastMonth && paidDate.getFullYear() === lastMonthYear;
      })
      .reduce((sum, p) => sum + (parseFloat(p.credit || p.debit) || 0), 0);

    let revenueChange = "+0%";
    if (lastMonthRevenue > 0) {
      const change = ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
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
    const totalPreviousMonth = applications.filter((app) => new Date(app.created_at || app.createdAt) <= endOfPreviousMonth).length;
    setApplicationsChange(getPercentageChange(totalNow, totalPreviousMonth));
  }, [applications]);

  useEffect(() => {
    const offerApps = applications.filter((app) => app.status === "offer letter received").length;
    setApplicationsWithOfferCount(offerApps);
  }, [applications]);

  useEffect(() => {
    if (applicationsWithOfferCount === 0) {
      setApplicationsOfferChange("0%");
      return;
    }
    const now = new Date();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const totalPreviousMonth = applications.filter(
      (app) => app.status === "offer letter received" && new Date(app.created_at || app.createdAt) <= endOfPreviousMonth
    ).length;
    setApplicationsOfferChange(getPercentageChange(applicationsWithOfferCount, totalPreviousMonth));
  }, [applicationsWithOfferCount, applications]);

  useEffect(() => {
    if (counsellorsCount === 0) {
      setCounsellorsChange("0%");
      return;
    }
    setCounsellorsChange("N/A");
  }, [counsellorsCount]);

  const formatChartLabel = (date) => date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });

  const periodTotalRevenue = useMemo(() => payments.reduce((sum, p) => sum + (parseFloat(p.credit || p.debit) || 0), 0), [payments]);

  const getChartData = useCallback(() => {
    // Show last 30 days of data
    const now = new Date();
    const endDate = new Date(now);
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 30);
    
    const days = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      days.push({ date: new Date(current), label: formatChartLabel(current), amount: 0 });
      current.setDate(current.getDate() + 1);
    }
    
    const paymentsByDay = {};
    payments.forEach((p) => {
      const paidDate = new Date(p.date || p.created_at);
      const dayKey = paidDate.toISOString().split("T")[0];
      paymentsByDay[dayKey] = (paymentsByDay[dayKey] || 0) + parseFloat(p.credit || p.debit || 0);
    });
    
    days.forEach((day) => {
      const dayKey = day.date.toISOString().split("T")[0];
      if (paymentsByDay[dayKey]) day.amount = paymentsByDay[dayKey];
    });
    
    return days;
  }, [payments]);

  const chartData = useMemo(() => getChartData(), [getChartData]);
  const maxRevenue = useMemo(() => {
    if (chartData.length === 0) return 1000;
    const max = Math.max(...chartData.map((d) => d.amount));
    return max === 0 ? 1000 : max;
  }, [chartData]);

  const hasNoData = periodTotalRevenue === 0;

  const generateChartPaths = useCallback(() => {
    const chartXStart = 40;
    const chartWidth = 340;
    const chartYStart = 5;
    const chartHeight = 90;

    if (chartData.length === 0) return { linePath: "", areaPath: "", chartXStart, chartWidth, chartYStart, chartHeight, isSinglePoint: false };

    if (chartData.length === 1) {
      const x = chartXStart + chartWidth / 2;
      let y = chartYStart + chartHeight;
      if (maxRevenue > 0) y = chartYStart + chartHeight - (chartData[0].amount / maxRevenue) * chartHeight;
      return { linePath: "", areaPath: "", chartXStart, chartWidth, chartYStart, chartHeight, isSinglePoint: true, singleX: x, singleY: y };
    }

    const step = chartWidth / (chartData.length - 1);
    let linePath = `M ${chartXStart} ${chartYStart + chartHeight - (chartData[0].amount / maxRevenue) * chartHeight}`;
    let areaPath = `M ${chartXStart} ${chartYStart + chartHeight} L ${chartXStart} ${chartYStart + chartHeight - (chartData[0].amount / maxRevenue) * chartHeight}`;

    for (let i = 1; i < chartData.length; i++) {
      const x = chartXStart + i * step;
      const y = chartYStart + chartHeight - (chartData[i].amount / maxRevenue) * chartHeight;
      linePath += ` L ${x} ${y}`;
      areaPath += ` L ${x} ${y}`;
    }
    areaPath += ` L ${chartXStart + chartWidth} ${chartYStart + chartHeight} Z`;

    return { linePath, areaPath, chartXStart, chartWidth, chartYStart, chartHeight, isSinglePoint: false };
  }, [chartData, maxRevenue]);

  const chartPaths = generateChartPaths();

  const yAxisTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 4; i++) ticks.push((maxRevenue / 4) * i);
    return ticks;
  }, [maxRevenue]);

  const getYCoord = (value) => {
    const { chartYStart, chartHeight } = chartPaths;
    return chartYStart + chartHeight - (value / maxRevenue) * chartHeight;
  };

  const getVisibleChartIndices = useCallback(() => {
    if (chartData.length <= 5) return chartData.map((_, idx) => idx);
    let maxLabels = isMobile ? 4 : isTablet ? 6 : chartData.length;
    if (maxLabels > chartData.length) maxLabels = chartData.length;
    const step = (chartData.length - 1) / (maxLabels - 1);
    const indices = [];
    for (let i = 0; i < maxLabels; i++) indices.push(Math.round(i * step));
    return indices;
  }, [chartData.length, isMobile, isTablet]);

  const visibleIndices = getVisibleChartIndices();

  // ✅ Derived stats from leads
  const leadsArray = Array.isArray(leads) ? leads : [];
  const totalLeadsCount = leadsArray.length;
  
  // ✅ Active Students: counseling + evaluated + applied + visa + success
  const activeStudents = leadsArray.filter((l) => {
    const status = l.status?.toLowerCase();
    return status === "counseling" || status === "evaluated" || status === "applied" || status === "visa" || status === "success";
  });
  const activeStudentsCount = activeStudents.length;

  // ✅ Lead Funnel Counts
  const newCount = leadsArray.filter((l) => l.status?.toLowerCase() === "new").length;
  const contactedCount = leadsArray.filter((l) => l.status?.toLowerCase() === "contacted").length;
  const counselingCount = leadsArray.filter((l) => l.status?.toLowerCase() === "counseling").length;
  const evaluatedCount = leadsArray.filter((l) => l.status?.toLowerCase() === "evaluated").length;
  const appliedCount = leadsArray.filter((l) => l.status?.toLowerCase() === "applied").length;
  const visaCount = leadsArray.filter((l) => l.status?.toLowerCase() === "visa").length;
  const successCount = leadsArray.filter((l) => l.status?.toLowerCase() === "success").length;
  const rejectedCount = leadsArray.filter((l) => l.status?.toLowerCase() === "rejected").length;

  const getActiveStudentsChange = () => {
    if (totalLeadsCount === 0) return "0%";
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const currentMonthActive = leadsArray.filter((l) => {
      const status = l.status?.toLowerCase();
      const d = new Date(l.created_at || l.createdAt);
      return (status === "counseling" || status === "evaluated" || status === "applied" || status === "visa" || status === "success") &&
        d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const lastMonthActive = leadsArray.filter((l) => {
      const status = l.status?.toLowerCase();
      const d = new Date(l.created_at || l.createdAt);
      const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      return (status === "counseling" || status === "evaluated" || status === "applied" || status === "visa" || status === "success") &&
        d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    }).length;
    if (lastMonthActive === 0) return currentMonthActive > 0 ? "+100%" : "0%";
    const diff = ((currentMonthActive - lastMonthActive) / lastMonthActive) * 100;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`;
  };

  const activeChange = getActiveStudentsChange();

  // Recent leads (sorted by created_at)
  const recentLeads = [...leadsArray]
    .sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))
    .slice(0, 4);

  // ✅ Get counsellor name helper
  const getCounsellorName = (lead) => {
    if (lead.counsellor?.name) return lead.counsellor.name;
    if (lead.counsellor_name) return lead.counsellor_name;
    return "Unassigned";
  };

  // Navigation handlers
  const handleNavigateToLeads = () => navigate("/admin/leads");
  const handleNavigateToApplications = () => navigate("/counsellor/applications");
  const handleNavigateToActiveStudents = () => navigate("/admin/leads");
  const handleNavigateToCounsellorsList = () => navigate("/admin/counsellors");
  const handleNavigateToPaymentsList = () => navigate("/admin/accounts");

  return (
    <main className="p-2 sm:p-3 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen relative overflow-hidden">
      {/* Decorative Globe */}
      <Globe className="absolute top-12 right-12 w-72 h-72 text-teal-200 opacity-10 pointer-events-none animate-spin-slow" />

      {/* Stat Cards - COMPACT */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard title="Total Leads" value={loading ? "..." : totalLeadsCount} change={leadsChange} icon={<Users />} color="from-cyan-500 to-blue-600" onClick={handleNavigateToLeads} />
        <StatCard title="Active Students" value={loading ? "..." : activeStudentsCount} change={activeChange} isNegative={activeChange.startsWith("-")} icon={<UserCheck />} color="from-emerald-400 to-teal-500" onClick={handleNavigateToActiveStudents} />
        <StatCard title="Total Revenue" value={loading ? "..." : periodTotalRevenue >= 1000 ? `PKR ${(periodTotalRevenue / 1000).toFixed(1)}K` : `PKR ${periodTotalRevenue.toLocaleString()}`} change={paymentStats.revenueChange} icon={<DollarSign />} color="from-violet-500 to-indigo-600" onClick={handleNavigateToPaymentsList} showPlane />
        <StatCard title="Applications" value={loading ? "..." : applications.length} change={applicationsChange} isNegative={applicationsChange.startsWith("-")} icon={<FileText />} color="from-rose-500 to-pink-600" onClick={handleNavigateToApplications} />
        <StatCard title="Counsellors" value={counsellorsCount} change={counsellorsChange} icon={<Briefcase />} color="from-blue-500 to-indigo-500" onClick={handleNavigateToCounsellorsList} />
      </div>

      {/* Lead Funnel + Revenue Chart - COMPACT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
          <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#009E99] rounded-full animate-pulse" /> Lead Funnel
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <ProgressBar label="New" count={newCount} total={totalLeadsCount} color="#14b8a6" />
            <ProgressBar label="Contacted" count={contactedCount} total={totalLeadsCount} color="#22d3ee" />
            <ProgressBar label="Counseling" count={counselingCount} total={totalLeadsCount} color="#06b67f" />
            <ProgressBar label="Evaluated" count={evaluatedCount} total={totalLeadsCount} color="#eab308" />
            <ProgressBar label="Applied" count={appliedCount} total={totalLeadsCount} color="#8b5cf6" />
            <ProgressBar label="Visa" count={visaCount} total={totalLeadsCount} color="#f472b6" />
            <ProgressBar label="Success" count={successCount} total={totalLeadsCount} color="#34d399" />
            <ProgressBar label="Rejected" count={rejectedCount} total={totalLeadsCount} color="#ef4444" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-base sm:text-lg text-gray-800">Revenue Overview</h3>
            <div className="text-right">
              <p className="text-base font-bold text-gray-800">PKR {periodTotalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="h-48 sm:h-52 bg-gradient-to-br from-slate-50 via-white to-teal-50 rounded-xl p-3 relative">
            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revenueGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#009E99" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.65" />
                </linearGradient>
              </defs>
              <line x1={chartPaths.chartXStart - 5} y1={chartPaths.chartYStart} x2={chartPaths.chartXStart - 5} y2={chartPaths.chartYStart + chartPaths.chartHeight} stroke="#cbd5e1" strokeWidth="1" />
              {yAxisTicks.map((tick, idx) => {
                const y = getYCoord(tick);
                const formattedValue = tick >= 1000 ? `${(tick / 1000).toFixed(0)}K` : tick.toFixed(0);
                return (
                  <g key={idx}>
                    <line x1={chartPaths.chartXStart - 8} y1={y} x2={chartPaths.chartXStart - 5} y2={y} stroke="#cbd5e1" strokeWidth="1" />
                    <text x={chartPaths.chartXStart - 12} y={y + 3} textAnchor="end" className="text-[8px] sm:text-[9px] fill-gray-500">{formattedValue}</text>
                  </g>
                );
              })}
              {!hasNoData && (
                <>
                  {chartPaths.areaPath && <path d={chartPaths.areaPath} fill="url(#revenueGrad)" />}
                  {chartPaths.isSinglePoint ? (
                    <circle cx={chartPaths.singleX} cy={chartPaths.singleY} r="4" fill="#009E99" />
                  ) : (
                    chartPaths.linePath && <path d={chartPaths.linePath} stroke="#009E99" strokeWidth="3" strokeLinecap="round" fill="none" />
                  )}
                </>
              )}
            </svg>

            {/* Flying Plane on Hover */}
            <Plane className="absolute -bottom-4 right-8 w-12 h-12 text-[#009E99] transition-all duration-700 group-hover:-translate-x-96 group-hover:rotate-12 opacity-30 group-hover:opacity-70" />
          </div>
        </div>
      </div>

      {/* Recent Leads - COMPACT */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
          <h3 className="font-semibold text-base sm:text-lg text-gray-800">Recent Leads</h3>
          <button onClick={handleNavigateToLeads} className="text-[#009E99] hover:text-teal-700 font-medium text-sm flex items-center gap-1 transition">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-zinc-50 text-xs uppercase tracking-widest text-gray-500">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Country</th>
                <th className="p-3 text-left hidden sm:table-cell">Program</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left hidden md:table-cell">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-400">Loading recent leads...</td></tr>
              ) : recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    name={lead.name || "—"}
                    email={lead.email || "—"}
                    country={lead.preferred_country || "—"}
                    program={lead.education?.[0]?.degree || "—"}
                    status={lead.status || "New"}
                    color={getStatusColor(lead.status)}
                    assigned={getCounsellorName(lead)}
                  />
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-8 text-gray-400">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

// ✅ Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    new: "bg-cyan-100 text-cyan-700",
    contacted: "bg-blue-100 text-blue-700",
    counseling: "bg-emerald-100 text-emerald-700",
    evaluated: "bg-amber-100 text-amber-700",
    applied: "bg-indigo-100 text-indigo-700",
    visa: "bg-purple-100 text-purple-700",
    success: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
};

/* ====================== COMPACT Reusable Components ====================== */
const StatCard = ({ title, value, change, icon, isNegative = false, color, onClick, showPlane = false }) => (
  <div
    onClick={onClick}
    className="group bg-white px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
  >
    <div className={`absolute -right-8 -top-8 w-28 h-28 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 rounded-full transition-all duration-700 group-hover:scale-150`} />

    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-gray-600 text-[10px] sm:text-xs font-bold tracking-widest">{title}</p>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 tracking-tight">{value}</h2>
      </div>
      <div className={`p-2 rounded-xl bg-gradient-to-br ${color} text-white shadow-md group-hover:scale-110 transition-transform duration-500`}>
        {React.cloneElement(icon, { size: 18, strokeWidth: 2.5 })}
      </div>
    </div>

    {showPlane && <Plane className="absolute bottom-3 right-3 w-6 h-6 text-amber-500 transition-all group-hover:rotate-45" />}

    <div className="mt-2 flex items-center gap-1.5">
      <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${isNegative ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
        {isNegative ? "↓" : "↑"} {change}
      </div>
      <span className="text-gray-400 text-[10px]">vs last month</span>
    </div>
  </div>
);

const ProgressBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="group">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 text-[10px]">{count} ({percentage}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 group-hover:scale-x-105 origin-left"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const TableRow = ({ name, email, country, program, status, color, assigned }) => (
  <tr className="hover:bg-teal-50/70 transition-all group">
    <td className="p-3">
      <p className="font-semibold text-sm text-gray-800 group-hover:text-[#009E99] transition-colors">{name}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{email}</p>
    </td>
    <td className="p-3 text-sm text-gray-600">{country}</td>
    <td className="p-3 text-sm text-gray-600 hidden sm:table-cell">{program}</td>
    <td className="p-3">
      <span className={`px-3 py-0.5 text-[10px] font-semibold rounded-full ${color}`}>{status}</span>
    </td>
    <td className="p-3 text-sm text-gray-600 hidden md:table-cell">{assigned}</td>
  </tr>
);