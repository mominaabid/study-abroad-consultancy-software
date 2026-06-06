import { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Search } from "lucide-react";
import { BASE_URL } from "../../Content/Url";

import { CounselorCard } from "../../Components/Card/CounsellorCard";
import { CounsellorStatCard } from "../../Components/Card/CounsellorStatCard";
import { AddCounsellorModal } from "../../Components/CounsellorModal/AddCounsellorModal";
import { EditCounsellorModal } from "../../Components/CounsellorModal/EditCounsellorModal";
import { ViewCounsellorModal } from "../../Components/CounsellorModal/ViewCounsellorModal";
import { DeleteConfirmationModal } from "../../Components/DeleteConfirmationModal";

const isLeadInCounsellingStage = (lead) => {
  const stageField =
    lead.stage || lead.lead_stage || lead.current_stage || lead.status;

  if (typeof stageField === "string") {
    const normalized = stageField.toLowerCase();
    if (normalized === "new" || normalized === "contacted") {
      return false;
    }
    return true;
  }

  if (lead.is_counselling_stage === true) return true;

  return false;
};

export const Counsellor = () => {
  const [allCounsellors, setAllCounsellors] = useState([]);
  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);

  const getAllCounsellors = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/admin/getCounsellors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  const fetchCounsellors = useCallback(async () => {
    try {
      const data = await getAllCounsellors();
      setAllCounsellors(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load counsellors", {
        toastId: "counsellor-load-error",
      });
    }
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/admin/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setLeads(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCounsellors(), fetchLeads()]);
      setLoading(false);
    };
    init();
  }, [fetchCounsellors]);

  const handleAddSuccess = async () => {
    await fetchCounsellors();
  };

  const handleUpdateSuccess = async () => {
    await fetchCounsellors();
  };

  const handleEditClick = (counsellor) => {
    setSelectedCounsellor(counsellor);
    setIsEditOpen(true);
  };

  const handleViewClick = (counsellor) => {
    setSelectedCounsellor(counsellor);
    setIsViewOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const id = selectedCounsellor.id || selectedCounsellor._id;
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/admin/deleteCounsellor/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Counsellor deleted successfully", {
        toastId: "counsellor-delete-success",
      });

      await fetchCounsellors();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete counsellor", {
        toastId: "counsellor-delete-error",
      });
    }
  };

  const handleDeleteClick = (counsellor) => {
    setSelectedCounsellor(counsellor);
    setIsDeleteOpen(true);
  };

  // Build counsellor list with lead-based stats
  const counsellorsWithLeads = useMemo(() => {
    return allCounsellors.map((c) => {
      const counselorLeads = leads.filter((l) => l.counsellor_id === c.user_id);
      const assignedCount = counselorLeads.length;
      const counsellingCount = counselorLeads.filter(
        isLeadInCounsellingStage,
      ).length;
      const conversionRate =
        assignedCount > 0 ? (counsellingCount / assignedCount) * 100 : 0;

      return {
        ...c,
        assigned_leads: assignedCount,
        counsellingStageCount: counsellingCount,
        counsellingConversionRate: conversionRate,
      };
    });
  }, [allCounsellors, leads]);

  // Overall statistics based on the new fields
  const stats = useMemo(() => {
    const totalAssignedLeads = counsellorsWithLeads.reduce(
      (sum, c) => sum + (c.assigned_leads || 0),
      0,
    );
    const totalCounsellingStudents = counsellorsWithLeads.reduce(
      (sum, c) => sum + (c.counsellingStageCount || 0),
      0,
    );
    const overallCounsellingConv =
      totalAssignedLeads > 0
        ? ((totalCounsellingStudents / totalAssignedLeads) * 100).toFixed(0)
        : 0;

    return {
      total: allCounsellors.length,
      active: allCounsellors.filter((c) => c.status === "active").length,
      totalCounsellingStudents,
      overallCounsellingConv,
    };
  }, [counsellorsWithLeads, allCounsellors]);

  const filteredCounsellors = useMemo(() => {
    return counsellorsWithLeads.filter((c) => {
      const name = c.name?.toLowerCase() || "";
      const role = c.role?.toLowerCase() || "";
      const q = search.toLowerCase();
      return name.includes(q) || role.includes(q);
    });
  }, [counsellorsWithLeads, search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-teal-600 font-medium px-4 text-center">
        Loading Counsellors...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-x-hidden overflow-y-auto font-sans text-slate-700">
      {/* ── Stats Section ── */}
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
        <CounsellorStatCard label="Total Counselors" value={stats.total} />
        <CounsellorStatCard label="Active" value={stats.active} />
        <CounsellorStatCard
          label="Converted Students"
          value={stats.totalCounsellingStudents}
        />
        <CounsellorStatCard
          label="Student Conv.%"
          value={`${stats.overallCounsellingConv}%`}
        />
      </div>

      {/* ── Top Header ── */}
      <div className="flex-shrink-0 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left: Count info */}
          <div>
            <p className="text-xs text-gray-400 mt-0.5">
              {filteredCounsellors.length} total counsellors
            </p>
          </div>

          {/* Right: Search + Add button — optimized for mobile stacking */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search input - full width on mobile, auto on larger screens */}
            <div className="flex items-center gap-2 h-10 sm:h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 w-full sm:min-w-[240px] md:min-w-[280px]">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                placeholder="Search counsellors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-[13px] sm:text-sm text-gray-700 placeholder-gray-400 w-full"
                aria-label="Search counsellors"
              />
            </div>

            {/* Add button - increased touch target on mobile */}
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[36px] h-auto sm:h-9 px-4 bg-teal-600 text-white rounded-xl text-[12.5px] font-semibold hover:bg-teal-700 transition shadow-md shadow-teal-200 whitespace-nowrap w-full sm:w-auto"
            >
              <span className="text-base sm:text-sm leading-5">+</span>
              Add Counsellor
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredCounsellors.map((c) => (
            // Wrapper div ensures card doesn't cause horizontal overflow
            <div key={c.id || c._id} className="min-w-0 w-full">
              <CounselorCard
                counselor={c}
                onEdit={() => handleEditClick(c)}
                onView={() => handleViewClick(c)}
                onDelete={() => handleDeleteClick(c)}
              />
            </div>
          ))}
        </div>

        {filteredCounsellors.length === 0 && (
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-dashed border-slate-300 mt-6 mx-0">
            <p className="text-slate-500 italic px-4">
              No counsellors found matching your search
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddCounsellorModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <EditCounsellorModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        counselor={selectedCounsellor}
        onSuccess={handleUpdateSuccess}
      />

      <ViewCounsellorModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        counselor={selectedCounsellor}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Counsellor"
        message={`Are you sure you want to delete ${selectedCounsellor?.name}? This action cannot be undone.`}
      />
    </div>
  );
};
