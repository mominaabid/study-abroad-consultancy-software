// Counsellor.jsx
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
import { AddBtnInHeader } from "../../Components/CustomButtons/AddBtnInHeader";

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

  // ✅ FIX: Get counsellors with proper data extraction
// Counsellor.jsx - Replace getAllCounsellors

const getAllCounsellors = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/admin/getCounsellors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("📥 Counsellors API response:", res.data);
    
    let counsellorsData = [];
    
    if (res.data.success && res.data.data) {
      if (res.data.data.counsellors) {
        let counsellors = res.data.data.counsellors;
        
        // ✅ Check if it's a 2D array
        if (Array.isArray(counsellors) && counsellors.length > 0) {
          // If first element is an array, flatten it
          if (Array.isArray(counsellors[0])) {
            counsellors = counsellors[0];
          }
          
          // ✅ Remove numeric keys and clean the data
          counsellorsData = counsellors
            .filter(c => c && typeof c === 'object') // ✅ Filter out null/undefined
            .map(c => {
              // If the object has numeric keys like "0", "1", extract the actual data
              if (c && typeof c === 'object' && !Array.isArray(c)) {
                const keys = Object.keys(c);
                if (keys.length === 1 && !isNaN(keys[0])) {
                  const extracted = c[keys[0]];
                  // ✅ Only return if extracted has a counsellor_id or id
                  if (extracted && (extracted.counsellor_id || extracted.id)) {
                    return extracted;
                  }
                  return null;
                }
                return c;
              }
              return c;
            })
            .filter(c => c && (c.counsellor_id || c.id || c.user_id)); // ✅ Filter out invalid entries
        } else if (Array.isArray(counsellors)) {
          counsellorsData = counsellors.filter(c => c && (c.counsellor_id || c.id || c.user_id));
        }
      } else if (Array.isArray(res.data.data)) {
        counsellorsData = res.data.data.filter(c => c && (c.counsellor_id || c.id || c.user_id));
      }
    } else if (Array.isArray(res.data)) {
      counsellorsData = res.data.filter(c => c && (c.counsellor_id || c.id || c.user_id));
    }
    
    console.log("📊 Processed counsellors:", counsellorsData);
    return counsellorsData;
  } catch (error) {
    console.error("❌ Error fetching counsellors:", error);
    return [];
  }
};

  const fetchCounsellors = useCallback(async () => {
    try {
      const data = await getAllCounsellors();
      setAllCounsellors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load counsellors", {
        toastId: "counsellor-load-error",
      });
      setAllCounsellors([]);
    }
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/admin/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let leadsData = [];
      if (res.data.success && res.data.data) {
        if (res.data.data.leads && Array.isArray(res.data.data.leads)) {
          leadsData = res.data.data.leads;
        } else if (Array.isArray(res.data.data)) {
          leadsData = res.data.data;
        }
      } else if (Array.isArray(res.data)) {
        leadsData = res.data;
      }
      
      setLeads(leadsData);
    } catch (err) {
      console.error("❌ Error fetching leads:", err);
      setLeads([]);
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
      const id = selectedCounsellor.id || selectedCounsellor._id || selectedCounsellor.counsellor_id;
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

  // ✅ Build counsellor list with lead-based stats
  const counsellorsWithLeads = useMemo(() => {
    const counsellorsArray = Array.isArray(allCounsellors) ? allCounsellors : [];
    const leadsArray = Array.isArray(leads) ? leads : [];
    
    return counsellorsArray.map((c) => {
      const counsellorId = c.user_id || c.counsellor_id || c.id;
      const counselorLeads = leadsArray.filter((l) => l.counsellor_id === counsellorId);
      
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

  // ✅ Overall statistics
  const stats = useMemo(() => {
    const counsellorsArray = Array.isArray(allCounsellors) ? allCounsellors : [];
    const counsellorsWithLeadsArray = Array.isArray(counsellorsWithLeads) ? counsellorsWithLeads : [];
    
    const totalAssignedLeads = counsellorsWithLeadsArray.reduce(
      (sum, c) => sum + (c.assigned_leads || 0),
      0,
    );
    const totalCounsellingStudents = counsellorsWithLeadsArray.reduce(
      (sum, c) => sum + (c.counsellingStageCount || 0),
      0,
    );
    const overallCounsellingConv =
      totalAssignedLeads > 0
        ? ((totalCounsellingStudents / totalAssignedLeads) * 100).toFixed(0)
        : 0;

    return {
      total: counsellorsArray.length,
      active: counsellorsArray.filter((c) => c.status === "active").length,
      totalCounsellingStudents,
      overallCounsellingConv,
    };
  }, [counsellorsWithLeads, allCounsellors]);

  const filteredCounsellors = useMemo(() => {
    const counsellorsArray = Array.isArray(counsellorsWithLeads) ? counsellorsWithLeads : [];
    return counsellorsArray.filter((c) => {
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
      {/* ── Mobile top bar ── */}
      <div className="flex justify-end items-center px-4 pt-3 sm:hidden">
        <AddBtnInHeader
          label="Add Counsellor"
          handleToggle={() => setIsAddOpen(true)}
        />
      </div>

      {/* ── Stats Section ── */}
      <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
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

      {/* ── Mobile search ── */}
      <div className="sm:hidden px-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 w-full">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            placeholder="Search counsellors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-[13px] text-gray-700 placeholder-gray-400 w-full"
            aria-label="Search counsellors"
          />
        </div>
      </div>

      {/* ── Desktop header ── */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4">
        <div>
          <p className="text-xs text-gray-400 mt-0.5">
            {filteredCounsellors.length} total counsellors
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 w-full sm:min-w-[240px] md:min-w-[280px]">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              placeholder="Search counsellors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-[13px] sm:text-sm text-gray-700 placeholder-gray-400 w-full"
              aria-label="Search counsellors"
            />
          </div>
          <AddBtnInHeader
            label="Add Counsellor"
            handleToggle={() => setIsAddOpen(true)}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredCounsellors.map((c, index) => (
            <div key={c.counsellor_id || c.id || index} className="min-w-0 w-full">
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
          <div className="text-center py-12 sm:py-20  rounded-lg border border-dashed border-slate-300 mt-6 mx-0">
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