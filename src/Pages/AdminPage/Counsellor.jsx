import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Mail,
  Phone,
  Users,
  TrendingUp,
  Star,
  MoreHorizontal,
} from "lucide-react";

import AddCounsellorModal from "../../Components/CounsellorModal/AddCounsellorModal";
import EditCounsellorModal from "../../Components/CounsellorModal/EditCounsellorModal";

const fetchCounselors = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Sarah Johnson",
          email: "sarah.j@educatia.com",
          phone: "+1 555 123 4567",
          role: "Senior Counselor",
          status: "active",
          rating: 4.8,
          assignedLeads: 45,
          conversionRate: 71,
          avatar: "SJ",
        },
        {
          id: 2,
          name: "Michael Chen",
          email: "michael.c@educatia.com",
          phone: "+1 555 234 5678",
          role: "Senior Counselor",
          status: "active",
          rating: 4.6,
          assignedLeads: 38,
          conversionRate: 66,
          avatar: "MC",
        },
        {
          id: 3,
          name: "Emily Davis",
          email: "emily.d@educatia.com",
          phone: "+1 555 345 6789",
          role: "Counselor",
          status: "active",
          rating: 4.3,
          assignedLeads: 28,
          conversionRate: 54,
          avatar: "ED",
        },
        {
          id: 4,
          name: "David Kim",
          email: "david.k@educatia.com",
          phone: "+1 555 456 7890",
          role: "Junior Counselor",
          status: "active",
          rating: 4.1,
          assignedLeads: 22,
          conversionRate: 48,
          avatar: "DK",
        },
        {
          id: 5,
          name: "Lisa Wang",
          email: "lisa.w@educatia.com",
          phone: "+1 555 567 8901",
          role: "Counselor",
          status: "inactive",
          rating: 4.0,
          assignedLeads: 15,
          conversionRate: 42,
          avatar: "LW",
        },
      ]);
    }, 500);
  });
};

const Counsellor = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchCounselors();
      setCounselors(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const stats = {
    total: counselors.length,
    active: counselors.filter((c) => c.status === "active").length,
    leads: counselors.reduce((sum, c) => sum + (c.assignedLeads || 0), 0),
    avgRate:
      counselors.length > 0
        ? (
            counselors.reduce((sum, c) => sum + (c.conversionRate || 0), 0) /
            counselors.length
          ).toFixed(0)
        : 0,
  };

  const filteredCounselors = counselors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEditClick = (counselor) => {
    setEditingCounselor(counselor);
    setIsEditModalOpen(true);
  };

  const handleSaveNew = (formData) => {
    const newEntry = {
      ...formData,
      id: Date.now(),
      rating: 0,
      assignedLeads: 0,
      conversionRate: 0,
      avatar: formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2),
    };
    setCounselors((prev) => [newEntry, ...prev]);
  };

  const handleUpdateExisting = (formData) => {
    setCounselors((prev) =>
      prev.map((c) =>
        c.id === editingCounselor.id ? { ...c, ...formData } : c,
      ),
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-teal-600 font-medium tracking-wide">
        Loading Counsellor Page...
      </div>
    );

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-700">
      <div className="">
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-10">
            <StatCard label="Total Counselors" value={stats.total} />
            <StatCard
              label="Active"
              value={stats.active}
              color="text-green-500"
            />
            <StatCard label="Total Assigned Leads" value={stats.leads} />
            <StatCard
              label="Avg. Conversion Rate"
              value={`${stats.avgRate}%`}
              color="text-teal-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 md:mb-8">
            <div className="relative w-full sm:w-80 md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                placeholder="Search counselors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#00A78E] hover:bg-[#008f7a] text-white px-4 md:px-6 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-teal-500/10 whitespace-nowrap"
            >
              <Plus size={18} /> Add Counselor
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredCounselors.map((c) => (
              <CounselorCard
                key={c.id}
                counselor={c}
                onEdit={() => handleEditClick(c)}
              />
            ))}
          </div>

          {filteredCounselors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No counselors found</p>
            </div>
          )}
        </div>
      </div>

      <AddCounsellorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNew}
      />

      <EditCounsellorModal
        key={editingCounselor?.id || "edit-modal"}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCounselor(null);
        }}
        onUpdate={handleUpdateExisting}
        counselor={editingCounselor}
      />
    </div>
  );
};

const StatCard = ({ label, value, color = "text-slate-800" }) => (
  <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-slate-500 text-xs md:text-sm font-medium mb-1">
      {label}
    </p>
    <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const CounselorCard = ({ counselor, onEdit }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow relative group">
    <button
      onClick={onEdit}
      className="absolute top-3 right-3 md:top-4 md:right-4 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
    >
      <MoreHorizontal size={18} className="md:w-5 md:h-5" />
    </button>

    <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-base md:text-xl font-bold border border-teal-100">
        {counselor.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base md:text-lg text-slate-800 leading-tight truncate">
          {counselor.name}
        </h3>
        <p className="text-slate-500 text-xs md:text-sm mb-2">
          {counselor.role}
        </p>
        <span
          className={`px-2 md:px-3 py-0.5 rounded-full text-xs font-semibold capitalize inline-block ${
            counselor.status === "active"
              ? "bg-green-100 text-green-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {counselor.status}
        </span>
      </div>
    </div>

    <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 border-b border-slate-50 pb-4 md:pb-6">
      <div className="flex items-center gap-2 md:gap-3 text-slate-600 text-xs md:text-sm truncate">
        <Mail
          size={14}
          className="md:w-4 md:h-4 text-slate-400 flex-shrink-0"
        />
        <span className="truncate">{counselor.email}</span>
      </div>
      <div className="flex items-center gap-2 md:gap-3 text-slate-600 text-xs md:text-sm">
        <Phone
          size={14}
          className="md:w-4 md:h-4 text-slate-400 flex-shrink-0"
        />
        {counselor.phone}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 md:gap-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-slate-800 font-bold text-sm md:text-base">
          <Users size={14} className="md:w-4 md:h-4 text-teal-500" />{" "}
          {counselor.assignedLeads}
        </div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">
          Assigned Leads
        </p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-slate-800 font-bold text-sm md:text-base">
          <TrendingUp size={14} className="md:w-4 md:h-4 text-green-500" />{" "}
          {counselor.conversionRate}%
        </div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">
          Conversion Rate
        </p>
      </div>
    </div>

    <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-50 flex justify-center">
      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm md:text-base">
        <Star size={14} className="md:w-4 md:h-4" fill="currentColor" />
        {counselor.rating || "0.0"}{" "}
        <span className="text-slate-300 font-normal text-xs">/ 5.0</span>
      </div>
    </div>
  </div>
);

export default Counsellor;
