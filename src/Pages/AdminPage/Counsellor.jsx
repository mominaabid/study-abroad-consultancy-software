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
    const res = await axios.get(`${BASE_URL}/admin/getCounsellors`);
    return res.data;
  };

  const fetchCounsellors = useCallback(async () => {
    try {
      const data = await getAllCounsellors();
      setAllCounsellors(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load counsellors");
    }
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/admin/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      await axios.delete(`${BASE_URL}/admin/deleteCounsellor/${id}`);
      toast.success("Counsellor deleted successfully");
      await fetchCounsellors(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete counsellor");
    }
  };

  const handleDeleteClick = (counsellor) => {
    setSelectedCounsellor(counsellor);
    setIsDeleteOpen(true);
  };

  const stats = useMemo(() => {
    return {
      total: allCounsellors.length,
      active: allCounsellors.filter((c) => c.status === "active").length,
      leads: allCounsellors.reduce(
        (sum, c) => sum + (c.assigned_leads || 0),
        0,
      ),
      avgRate:
        allCounsellors.length > 0
          ? (
              allCounsellors.reduce(
                (sum, c) => sum + (c.conversion_rate || 0),
                0,
              ) / allCounsellors.length
            ).toFixed(0)
          : 0,
    };
  }, [allCounsellors]);

  const counsellorsWithLeads = useMemo(() => {
    return allCounsellors.map((c) => {
      const count = leads.filter(
        (l) => l.counsellor_id === (c.id || c._id),
      ).length;

      return {
        ...c,
        assigned_leads: count,
      };
    });
  }, [allCounsellors, leads]);

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
      <div className="flex justify-center items-center h-screen text-teal-600 font-medium">
        Loading Counsellors...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-hidden font-sans text-slate-700">
      {/* ── Top Header ── */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Title / Info */}
          <div>
            <p className="text-xs text-gray-400 mt-0.5">
              {filteredCounsellors.length} total counsellors
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl min-w-[200px] focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100">
              <Search size={14} className="text-gray-400" />
              <input
                placeholder="Search counsellors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-[13px] text-gray-700 placeholder-gray-400 w-full"
              />
            </div>

            {/* Add Counsellor */}
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 h-9 px-4 bg-teal-600 text-white rounded-xl text-[12.5px] font-semibold hover:bg-teal-700 transition shadow-md shadow-teal-200 whitespace-nowrap"
            >
              <span className="text-sm">+</span>
              Add Counsellor
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Section ── */}
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4">
        <CounsellorStatCard label="Total Counselors" value={stats.total} />
        <CounsellorStatCard label="Active" value={stats.active} />
        <CounsellorStatCard
          label="Avg Conversion"
          value={`${stats.avgRate}%`}
        />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCounsellors.map((c) => (
            <CounselorCard
              key={c.id || c._id}
              counselor={c}
              onEdit={() => handleEditClick(c)}
              onView={() => handleViewClick(c)}
              onDelete={() => handleDeleteClick(c)}
            />
          ))}
        </div>

        {filteredCounsellors.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 mt-4">
            <p className="text-slate-500 italic">
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
