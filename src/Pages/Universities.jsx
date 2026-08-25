// src/pages/admin/Universities.jsx
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
  Building2, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Search,
  RefreshCw,
  Globe,
  MapPin,
  Link2,
  Award
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

const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    country_id: "",
    city_id: "",
    website: "",
    ranking: "",
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
      const [unisRes, countriesRes] = await Promise.all([
        authAxios.get(`${BASE_URL}/universities`),
        authAxios.get(`${BASE_URL}/countries`),
      ]);

      console.log("📥 Universities API Response:", unisRes.data);
      console.log("📥 Countries API Response:", countriesRes.data);

      if (unisRes.data.success) {
        let unisData = unisRes.data.data || [];
        // Handle 2D array
        if (Array.isArray(unisData) && unisData.length === 1 && Array.isArray(unisData[0])) {
          unisData = unisData[0];
        }
        setUniversities(unisData);
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

  // Load cities when country changes
  useEffect(() => {
    if (formData.country_id) {
      const fetchCities = async () => {
        try {
          const res = await authAxios.get(
            `${BASE_URL}/countries/${formData.country_id}/cities`
          );
          if (res.data.success) {
            let citiesData = res.data.data || [];
            if (Array.isArray(citiesData) && citiesData.length === 1 && Array.isArray(citiesData[0])) {
              citiesData = citiesData[0];
            }
            setCities(citiesData);
          }
        } catch (error) {
          console.error("❌ Error fetching cities:", error);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [formData.country_id]);

  const handleOpenModal = (university = null) => {
    if (university) {
      setEditingUniversity(university);
      setFormData({
        name: university.name || "",
        country_id: university.country_id || "",
        city_id: university.city_id || "",
        website: university.website || "",
        ranking: university.ranking || "",
        is_active: university.is_active !== undefined ? university.is_active : 1,
      });
    } else {
      setEditingUniversity(null);
      setFormData({
        name: "",
        country_id: "",
        city_id: "",
        website: "",
        ranking: "",
        is_active: 1,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUniversity(null);
    setFormData({
      name: "",
      country_id: "",
      city_id: "",
      website: "",
      ranking: "",
      is_active: 1,
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Institute name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Institute name must be at least 2 characters";
    } else if (formData.name.trim().length > 255) {
      newErrors.name = "Institute name must be at most 255 characters";
    }
    if (!formData.country_id) {
      newErrors.country_id = "Please select a country";
    }
    if (!formData.city_id) {
      newErrors.city_id = "Please select a city";
    }
    if (formData.ranking && (isNaN(formData.ranking) || formData.ranking < 0)) {
      newErrors.ranking = "Ranking must be a positive number";
    }
    if (formData.website && !formData.website.match(/^https?:\/\/.+\..+/)) {
      newErrors.website = "Please enter a valid URL (e.g., https://example.com)";
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
        city_id: parseInt(formData.city_id),
        website: formData.website.trim() || null,
        ranking: formData.ranking ? parseInt(formData.ranking) : null,
        is_active: formData.is_active,
      };

      let res;
      if (editingUniversity) {
        res = await authAxios.put(
          `${BASE_URL}/universities/${editingUniversity.id}`,
          payload
        );
      } else {
        res = await authAxios.post(`${BASE_URL}/universities`, payload);
      }

      if (res.data.success) {
        toast.success(
          editingUniversity
            ? "Institute updated successfully"
            : "Institute added successfully"
        );
        fetchData();
        handleCloseModal();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("❌ Error saving institute:", error);
      toast.error(error.response?.data?.message || "Failed to save institute");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await authAxios.delete(`${BASE_URL}/universities/${id}`);
      if (res.data.success) {
        toast.success("University deleted successfully");
        fetchData();
      } else {
        toast.error(res.data.message || "Failed to delete university");
      }
    } catch (error) {
      console.error("❌ Error deleting university:", error);
      toast.error(error.response?.data?.message || "Failed to delete university");
    }
  };

  const handleToggleActive = async (university) => {
    try {
      const newStatus = university.is_active === 1 ? 0 : 1;
      const res = await authAxios.put(`${BASE_URL}/universities/${university.id}`, {
        name: university.name,
        country_id: university.country_id,
        city_id: university.city_id,
        website: university.website,
        ranking: university.ranking,
        is_active: newStatus,
      });
      if (res.data.success) {
        toast.success(university.is_active === 1 ? "University deactivated" : "University activated");
        fetchData();
      } else {
        toast.error(res.data.message || "Failed to update university status");
      }
    } catch (error) {
      console.error("❌ Error toggling university status:", error);
      toast.error(error.response?.data?.message || "Failed to update university status");
    }
  };

  const countryOptions = countries.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const cityOptions = cities.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // Filter universities based on search
  const filteredUniversities = universities.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.country_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.city_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const total = filteredUniversities.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUniversities = filteredUniversities.slice(startIndex, endIndex);
  
  const displayStart = total === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, total);

  const thCls = "px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap bg-[#009E99]";
  const tdCls = "px-4 py-2.5 align-middle";

  // Action menu handlers
  const openActionMenu = (e, university) => {
    e.stopPropagation();
    setActionMenu({
      university,
      x: e.clientX - 180,
      y: e.clientY + 4,
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Institutes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage institutes for student applications
          </p>
        </div>
        <AddBtnInHeader
          label="Add Institute"
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
              placeholder="Search institutes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {total} institute{total !== 1 ? "s" : ""}
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
                <th className={thCls}>Institute Name</th>
                <th className={thCls}>Country</th>
                <th className={thCls}>City</th>
                <th className={thCls}>Ranking</th>
                <th className={`${thCls} text-center`}>Active</th>
                <th className={`${thCls} w-16 text-center`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <RefreshCw size={24} className="animate-spin mx-auto text-teal-500" />
                    <p className="text-sm text-slate-400 mt-2">Loading institutes...</p>
                  </td>
                </tr>
              ) : paginatedUniversities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <Building2 size={40} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-sm">
                          {searchTerm ? "No institutes match your search" : "No institutes added yet"}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {searchTerm ? "Try adjusting your search" : "Click 'Add Institute' to create one"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUniversities.map((university, idx) => {
                  const serialNumber = startIndex + idx + 1;
                  return (
                    <tr
                      key={university.id}
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
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-700 font-semibold text-xs ring-1 ring-gray-200 group-hover:ring-purple-300 transition-all duration-200">
                            {university.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm group-hover:text-purple-600 transition-colors duration-200">
                              {university.name}
                            </p>
                            {university.website && (
                              <a
                                href={university.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-purple-500 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Link2 size={10} />
                                {university.website.replace(/^https?:\/\//, '').slice(0, 30)}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className={tdCls}>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg text-xs font-medium text-blue-700">
                          <Globe size={12} className="text-blue-500" />
                          {university.country_name || "—"}
                        </div>
                      </td>

                      <td className={tdCls}>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-lg text-xs font-medium text-indigo-700">
                          <MapPin size={12} className="text-indigo-500" />
                          {university.city_name || "—"}
                        </div>
                      </td>

                      <td className={tdCls}>
                        {university.ranking ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg text-xs font-semibold text-amber-700">
                            <Award size={12} className="text-amber-500" />
                            #{university.ranking}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      <td className={tdCls}>
                        <div className="transform transition-all duration-200 group-hover:scale-105">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              university.is_active === 1
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${university.is_active === 1 ? "bg-green-500" : "bg-red-500"}`}></span>
                            {university.is_active === 1 ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      <td className={tdCls}>
                        <button
                          onClick={(e) => openActionMenu(e, university)}
                          className="w-7 h-7 rounded-md flex items-center justify-center 
                            bg-white border border-gray-300
                            text-gray-500 hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50
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
                handleOpenModal(actionMenu.university);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              <Edit size={14} className="text-amber-500" />
              Edit University
            </button>

            <button
              onClick={() => {
                handleToggleActive(actionMenu.university);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              {actionMenu.university.is_active === 1 ? (
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
                handleDelete(actionMenu.university.id, actionMenu.university.name);
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
              {editingUniversity ? "Edit Institute" : "Add Institute"}
            </Title>

            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
              <InputField
                labelName="Institute Name *"
                name="name"
                value={formData.name}
                handlerChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                icon={<Building2 size={18} />}
                placeholder="e.g., Oxford Institute / University"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City *
                </label>
                <SearchableSelect
                  name="city_id"
                  value={formData.city_id}
                  onChange={(e) =>
                    setFormData({ ...formData, city_id: e.target.value })
                  }
                  options={cityOptions}
                  placeholder={formData.country_id ? "Select city..." : "Select country first"}
                  disabled={!formData.country_id}
                  error={errors.city_id}
                />
                {errors.city_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.city_id}</p>
                )}
              </div>

              <InputField
                labelName="Website"
                name="website"
                value={formData.website}
                handlerChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                icon={<Link2 size={18} />}
                placeholder="https://example.com"
                error={errors.website}
              />

              <InputField
                labelName="World Ranking"
                name="ranking"
                type="number"
                value={formData.ranking}
                handlerChange={(e) =>
                  setFormData({ ...formData, ranking: e.target.value })
                }
                icon={<Award size={18} />}
                placeholder="e.g., 1"
                error={errors.ranking}
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
                  label={editingUniversity ? "Update" : "Add"}
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

export default Universities;