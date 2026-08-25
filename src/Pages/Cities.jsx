// src/pages/admin/Cities.jsx
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
import SearchableSelect from "../Components/SearchableSelect";
import { 
  MapPin, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Search,
  RefreshCw,
  Globe
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

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    country_id: "",
    is_active: 1,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenu, setActionMenu] = useState(null);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [citiesRes, countriesRes] = await Promise.all([
        authAxios.get(`${BASE_URL}/cities`),
        authAxios.get(`${BASE_URL}/countries`),
      ]);

      console.log("📥 Cities API Response:", citiesRes.data);
      console.log("📥 Countries API Response:", countriesRes.data);

      if (citiesRes.data.success) {
        let citiesData = citiesRes.data.data || [];
        // Handle 2D array
        if (Array.isArray(citiesData) && citiesData.length === 1 && Array.isArray(citiesData[0])) {
          citiesData = citiesData[0];
        }
        setCities(citiesData);
      }
      if (countriesRes.data.success) {
        let countriesData = countriesRes.data.data || [];
        if (Array.isArray(countriesData) && countriesData.length === 1 && Array.isArray(countriesData[0])) {
          countriesData = countriesData[0];
        }
        setCountries(countriesData);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenModal = (city = null) => {
    if (city) {
      setEditingCity(city);
      setFormData({
        name: city.name || "",
        country_id: city.country_id || "",
        is_active: city.is_active !== undefined ? city.is_active : 1,
      });
    } else {
      setEditingCity(null);
      setFormData({ name: "", country_id: "", is_active: 1 });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCity(null);
    setFormData({ name: "", country_id: "", is_active: 1 });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "City name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "City name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "City name must be at most 100 characters";
    }
    if (!formData.country_id) {
      newErrors.country_id = "Please select a country";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        country_id: parseInt(formData.country_id),
        is_active: formData.is_active,
      };

      let res;
      if (editingCity) {
        res = await authAxios.put(`${BASE_URL}/cities/${editingCity.id}`, payload);
      } else {
        res = await authAxios.post(`${BASE_URL}/cities`, payload);
      }

      if (res.data.success) {
        toast.success(
          editingCity ? "City updated successfully" : "City added successfully"
        );
        fetchData();
        handleCloseModal();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("❌ Error saving city:", error);
      toast.error(error.response?.data?.message || "Failed to save city");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await authAxios.delete(`${BASE_URL}/cities/${id}`);
      if (res.data.success) {
        toast.success("City deleted successfully");
        fetchData();
      } else {
        toast.error(res.data.message || "Failed to delete city");
      }
    } catch (error) {
      console.error("❌ Error deleting city:", error);
      toast.error(error.response?.data?.message || "Failed to delete city");
    }
  };

  const handleToggleActive = async (city) => {
    try {
      const newStatus = city.is_active === 1 ? 0 : 1;
      const res = await authAxios.put(`${BASE_URL}/cities/${city.id}`, {
        name: city.name,
        country_id: city.country_id,
        is_active: newStatus,
      });
      if (res.data.success) {
        toast.success(city.is_active === 1 ? "City deactivated" : "City activated");
        fetchData();
      } else {
        toast.error(res.data.message || "Failed to update city status");
      }
    } catch (error) {
      console.error("❌ Error toggling city status:", error);
      toast.error(error.response?.data?.message || "Failed to update city status");
    }
  };

  const countryOptions = countries.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // Filter cities based on search
  const filteredCities = cities.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.country_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const total = filteredCities.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCities = filteredCities.slice(startIndex, endIndex);
  
  const displayStart = total === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, total);

  const thCls = "px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap bg-[#009E99]";
  const tdCls = "px-4 py-2.5 align-middle";

  // Action menu handlers
  const openActionMenu = (e, city) => {
    e.stopPropagation();
    setActionMenu({
      city,
      x: e.clientX - 180,
      y: e.clientY + 4,
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cities</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage cities for student applications
          </p>
        </div>
        <AddBtnInHeader label="Add City" handleToggle={() => handleOpenModal()} />
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
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {total} city{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#009E99] border-b border-[#009E99]">
                <th className={`${thCls} w-12 text-center`}>
                  <span>Sr#</span>
                </th>
                <th className={thCls}>Country</th>
                <th className={thCls}>State</th>
                <th className={thCls}>City Name</th>
                <th className={`${thCls} text-center`}>Active</th>
                <th className={`${thCls} w-16 text-center`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <RefreshCw size={24} className="animate-spin mx-auto text-teal-500" />
                    <p className="text-sm text-slate-400 mt-2">Loading cities...</p>
                  </td>
                </tr>
              ) : paginatedCities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <MapPin size={40} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-sm">
                          {searchTerm ? "No cities match your search" : "No cities added yet"}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {searchTerm ? "Try adjusting your search" : "Click 'Add City' to create one"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCities.map((city, idx) => {
                  const serialNumber = startIndex + idx + 1;
                  return (
                    <tr
                      key={city.id}
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
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg text-xs font-medium text-blue-700">
                          <Globe size={12} className="text-blue-500" />
                          {city.country_name || "—"}
                        </div>
                      </td>

                      <td className={tdCls}>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-lg text-xs font-medium text-purple-700">
                          {city.state_name || city.state || "—"}
                        </div>
                      </td>

                      <td className={tdCls}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-xs ring-1 ring-gray-200 group-hover:ring-indigo-300 transition-all duration-200">
                            {city.name?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors duration-200">
                              {city.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className={tdCls}>
                        <div className="flex justify-center transform transition-all duration-200 group-hover:scale-105">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              city.is_active === 1
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${city.is_active === 1 ? "bg-green-500" : "bg-red-500"}`}></span>
                            {city.is_active === 1 ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                

                      <td className={tdCls}>
                        <button
                          onClick={(e) => openActionMenu(e, city)}
                          className="w-7 h-7 rounded-md flex items-center justify-center 
                            bg-white border border-gray-300
                            text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50
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
                handleOpenModal(actionMenu.city);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              <Edit size={14} className="text-amber-500" />
              Edit City
            </button>

            <button
              onClick={() => {
                handleToggleActive(actionMenu.city);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              {actionMenu.city.is_active === 1 ? (
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
                handleDelete(actionMenu.city.id, actionMenu.city.name);
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
              {editingCity ? "Edit City" : "Add City"}
            </Title>

            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
              <InputField
                labelName="City Name *"
                name="name"
                value={formData.name}
                handlerChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                icon={<MapPin size={18} />}
                placeholder="e.g., New York"
                error={errors.name}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country *
                </label>
                <SearchableSelect
                  name="country_id"
                  value={formData.country_id}
                  onChange={(e) =>
                    setFormData({ ...formData, country_id: e.target.value })
                  }
                  options={countryOptions}
                  placeholder="Select country..."
                  error={errors.country_id}
                />
                {errors.country_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.country_id}</p>
                )}
              </div>

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
                      onChange={() => setFormData({ ...formData, is_active: 1 })}
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
                      onChange={() => setFormData({ ...formData, is_active: 0 })}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    Inactive
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <CancelButton handleCancel={handleCloseModal} />
                <AddButton
                  label={editingCity ? "Update" : "Add"}
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

export default Cities;