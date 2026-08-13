// src/pages/Countries.jsx
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "../Content/Url";
import { AddBtnInHeader } from "../Components/CustomButtons/AddBtnInHeader";
import { InputField } from "../Components/InputFields/InputField";
import { AddButton } from "../Components/CustomButtons/AddButton";
import { CancelButton } from "../Components/CustomButtons/CancelButton";
import { Title } from "../Components/Title";
import { Pagination } from "../Components/Pagination";
import { ShowDataNumber } from "../Components/ShowDataNumber";
import { 
  Globe, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Search,
  RefreshCw,
  Plus
} from "lucide-react";

const getToken = () => localStorage.getItem("token") || "";

const authAxios = {
  get: (url) =>
    axios.get(url, { headers: { Authorization: `Bearer ${getToken()}` } }),
  post: (url, data) =>
    axios.post(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
  put: (url, data) =>
    axios.put(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
  delete: (url) =>
    axios.delete(url, { headers: { Authorization: `Bearer ${getToken()}` } }),
};

const Countries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    is_active: 1,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenu, setActionMenu] = useState(null);
  const pageSize = 10;

  // ✅ GET - Fetch all countries
  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authAxios.get(`${BASE_URL}/countries`);
      console.log("📥 Countries API Response:", res.data);
      
      if (res.data.success) {
        let countriesData = res.data.data || [];
        
        // Handle 2D array
        if (Array.isArray(countriesData) && countriesData.length === 1 && Array.isArray(countriesData[0])) {
          countriesData = countriesData[0];
        }
        
        console.log("📊 Final countries data:", countriesData);
        setCountries(countriesData);
      } else {
        toast.error(res.data.message || "Failed to load countries");
      }
    } catch (error) {
      console.error("❌ Error fetching countries:", error);
      toast.error(error.response?.data?.message || "Failed to load countries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenModal = (country = null) => {
    if (country) {
      setEditingCountry(country);
      setFormData({
        name: country.name || "",
        code: country.code || "",
        is_active: country.is_active !== undefined ? country.is_active : 1,
      });
    } else {
      setEditingCountry(null);
      setFormData({ name: "", code: "", is_active: 1 });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCountry(null);
    setFormData({ name: "", code: "", is_active: 1 });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Country name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Country name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Country name must be at most 100 characters";
    }
    if (!formData.code.trim()) {
      newErrors.code = "Country code is required";
    } else if (formData.code.trim().length > 5) {
      newErrors.code = "Country code must be at most 5 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCountry = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        is_active: formData.is_active,
      };

      console.log("📤 Adding country:", payload);
      
      const res = await authAxios.post(`${BASE_URL}/countries`, payload);
      console.log("📥 Add country response:", res.data);
      
      if (res.data.success) {
        toast.success("Country added successfully");
        fetchCountries();
        handleCloseModal();
      } else {
        toast.error(res.data.message || "Failed to add country");
      }
    } catch (error) {
      console.error("❌ Error adding country:", error);
      toast.error(error.response?.data?.message || "Failed to add country");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCountry = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        is_active: formData.is_active,
      };

      console.log("📤 Updating country:", editingCountry.id, payload);
      
      const res = await authAxios.put(
        `${BASE_URL}/countries/${editingCountry.id}`,
        payload
      );
      console.log("📥 Update country response:", res.data);
      
      if (res.data.success) {
        toast.success("Country updated successfully");
        fetchCountries();
        handleCloseModal();
      } else {
        toast.error(res.data.message || "Failed to update country");
      }
    } catch (error) {
      console.error("❌ Error updating country:", error);
      toast.error(error.response?.data?.message || "Failed to update country");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = editingCountry ? handleUpdateCountry : handleAddCountry;

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      console.log("📤 Deleting country:", id);
      
      const res = await authAxios.delete(`${BASE_URL}/countries/${id}`);
      console.log("📥 Delete country response:", res.data);
      
      if (res.data.success) {
        toast.success("Country deleted successfully");
        fetchCountries();
      } else {
        toast.error(res.data.message || "Failed to delete country");
      }
    } catch (error) {
      console.error("❌ Error deleting country:", error);
      toast.error(error.response?.data?.message || "Failed to delete country");
    }
  };

  const handleToggleActive = async (country) => {
    try {
      const newStatus = country.is_active === 1 ? 0 : 1;
      console.log("📤 Toggling country status:", country.id, "to", newStatus);
      
      const res = await authAxios.put(
        `${BASE_URL}/countries/${country.id}`,
        {
          name: country.name,
          code: country.code,
          is_active: newStatus,
        }
      );
      console.log("📥 Toggle status response:", res.data);
      
      if (res.data.success) {
        toast.success(
          country.is_active === 1
            ? "Country deactivated"
            : "Country activated"
        );
        fetchCountries();
      } else {
        toast.error(res.data.message || "Failed to update country status");
      }
    } catch (error) {
      console.error("❌ Error toggling country status:", error);
      toast.error(error.response?.data?.message || "Failed to update country status");
    }
  };

  // Filter countries based on search
  const filteredCountries = countries.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const total = filteredCountries.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCountries = filteredCountries.slice(startIndex, endIndex);
  
  const displayStart = total === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, total);

  const thCls = "px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap bg-[#009E99]";
  const tdCls = "px-4 py-2.5 align-middle";

  // Action menu handlers
  const openActionMenu = (e, country) => {
    e.stopPropagation();
    setActionMenu({
      country,
      x: e.clientX - 180,
      y: e.clientY + 4,
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Countries</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage countries for student applications
          </p>
        </div>
        <AddBtnInHeader
          label="Add Country"
          handleToggle={() => handleOpenModal()}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {total} country{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#009E99] border-b border-[#009E99]">
                <th className={`${thCls} w-12`}>
                  <span>Sr#</span>
                </th>
                <th className={thCls}>Country Name</th>
                <th className={thCls}>Code</th>
                <th className={thCls}>Status</th>
                <th className={thCls}>Created</th>
                <th className={`${thCls} w-16`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <RefreshCw size={24} className="animate-spin mx-auto text-teal-500" />
                    <p className="text-sm text-slate-400 mt-2">Loading countries...</p>
                  </td>
                </tr>
              ) : paginatedCountries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <Globe size={40} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-sm">
                          {searchTerm ? "No countries match your search" : "No countries added yet"}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {searchTerm ? "Try adjusting your search" : "Click 'Add Country' to create one"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCountries.map((country, idx) => {
                  const serialNumber = startIndex + idx + 1;
                  return (
                    <tr
                      key={country.id}
                      className={`
                        border-b border-gray-100 transition-all duration-150
                        hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-transparent
                        ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}
                        group
                      `}
                    >
                      <td className={tdCls}>
                        <div className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition-colors duration-200">
                          {serialNumber}
                        </div>
                      </td>

                      <td className={tdCls}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-semibold text-xs ring-1 ring-gray-200 group-hover:ring-teal-300 transition-all duration-200">
                            {country.name?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm group-hover:text-teal-600 transition-colors duration-200">
                              {country.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className={tdCls}>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-mono font-medium text-slate-600">
                          {country.code || "—"}
                        </span>
                      </td>

                      <td className={tdCls}>
                        <div className="transform transition-all duration-200 group-hover:scale-105">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              country.is_active === 1
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${country.is_active === 1 ? "bg-green-500" : "bg-red-500"}`}></span>
                            {country.is_active === 1 ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      <td className={tdCls}>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 whitespace-nowrap">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {country.created_at ? new Date(country.created_at).toLocaleDateString() : "—"}
                        </div>
                      </td>

                      <td className={tdCls}>
                        <button
                          onClick={(e) => openActionMenu(e, country)}
                          className="w-7 h-7 rounded-md flex items-center justify-center 
                            bg-white border border-gray-300
                            text-gray-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50
                            transition-all duration-200"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="19" cy="12" r="1.5" />
                            <circle cx="5" cy="12" r="1.5" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 10 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <ShowDataNumber
              start={displayStart}
              end={displayEnd}
              total={total}
            />
            <Pagination
              handlePageClick={(page) => setCurrentPage(page)}
              pageNo={currentPage}
              totalNum={total}
              pageSize={pageSize}
            />
          </div>
        )}
      </div>

      {/* Action Menu */}
      {actionMenu && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setActionMenu(null)} />
          <div
            className="fixed bg-white border rounded-lg shadow-xl z-[1000] min-w-[200px] py-1"
            style={{ top: actionMenu.y, left: actionMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                handleOpenModal(actionMenu.country);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              <Edit size={14} className="text-amber-500" />
              Edit Country
            </button>

            <button
              onClick={() => {
                handleToggleActive(actionMenu.country);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              {actionMenu.country.is_active === 1 ? (
                <>
                  <X size={14} className="text-red-500" />
                  Deactivate
                </>
              ) : (
                <>
                  <Check size={14} className="text-green-500" />
                  Activate
                </>
              )}
            </button>

            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={() => {
                handleDelete(actionMenu.country.id, actionMenu.country.name);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              <Trash2 size={14} className="text-red-500" />
              Delete
            </button>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <Title setModal={handleCloseModal}>
              {editingCountry ? "Edit Country" : "Add Country"}
            </Title>

            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
              <InputField
                labelName="Country Name *"
                name="name"
                value={formData.name}
                handlerChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                icon={<Globe size={18} />}
                placeholder="e.g., United States"
                error={errors.name}
              />

              <InputField
                labelName="Country Code *"
                name="code"
                value={formData.code}
                handlerChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                icon={<Globe size={18} />}
                placeholder="e.g., US"
                error={errors.code}
                helperText="ISO country code (max 5 characters)"
              />

              <div className="flex items-center gap-3 pt-2">
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="is_active"
                      value={1}
                      checked={formData.is_active === 1}
                      onChange={() =>
                        setFormData({ ...formData, is_active: 1 })
                      }
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="is_active"
                      value={0}
                      checked={formData.is_active === 0}
                      onChange={() =>
                        setFormData({ ...formData, is_active: 0 })
                      }
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    Inactive
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <CancelButton handleCancel={handleCloseModal} />
                <AddButton
                  label={editingCountry ? "Update" : "Add"}
                  loading={submitting}
                  handleClick={handleSubmit}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Countries;