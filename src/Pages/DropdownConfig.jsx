// src/pages/admin/DropdownConfig.jsx
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
  Edit, 
  Trash2, 
  Check, 
  X, 
  Search,
  RefreshCw,
  List,
  Settings
} from "lucide-react";

const getToken = () => localStorage.getItem("token") || "";

const authAxios = {
  get: (url) => {
    console.log("🔵 GET Request:", url);
    return axios.get(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  },
  post: (url, data) => {
    console.log("🟢 POST Request:", url, data);
    return axios.post(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },
  put: (url, data) => {
    console.log("🟡 PUT Request:", url, data);
    return axios.put(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },
  delete: (url) => {
    console.log("🔴 DELETE Request:", url);
    return axios.delete(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  },
};

const CONFIG_TYPES = [
  { value: "lead_source", label: "Lead Sources" },
  { value: "study_level", label: "Study Levels" },
  { value: "english_test_type", label: "English Test Types" },
  { value: "marital_status", label: "Marital Status" },
  { value: "degree_type", label: "Degree Types" },
  { value: "course", label: "Courses" },
  { value: "document_type", label: "Document Types" },
  { value: "visa_type", label: "Visa Types" },
  { value: "transaction_type", label: "Transaction Types" },
  { value: "gender", label: "Gender" },
];

const DropdownConfig = () => {
  const [configItems, setConfigItems] = useState([]);
  const [selectedType, setSelectedType] = useState("lead_source");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "lead_source",
    is_active: 1,
    sort_order: 0,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenu, setActionMenu] = useState(null);
  const pageSize = 10;

  // Fetch config items with proper error handling and data extraction
  const fetchConfigItems = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📥 Fetching config type:", selectedType);
      
      const res = await authAxios.get(`${BASE_URL}/config/${selectedType}`);
      console.log("📥 Full response:", res);
      console.log("📥 Response data:", res.data);
      
      if (res.data.success) {
        let items = res.data.data || [];
        console.log("📊 Raw items:", items);
        
        // Handle 2D array response
        if (Array.isArray(items) && items.length === 1 && Array.isArray(items[0])) {
          items = items[0];
          console.log("📊 Flattened 2D array:", items);
        }
        
        // Ensure items is always an array
        if (!Array.isArray(items)) {
          console.warn("⚠️ Items is not an array, converting to empty array");
          items = [];
        }
        
        console.log("✅ Final config items:", items);
        setConfigItems(items);
      } else {
        toast.error(res.data.message || "Failed to load items");
        setConfigItems([]);
      }
    } catch (error) {
      console.error("❌ Error fetching config items:", error);
      toast.error(error.response?.data?.message || "Failed to load configuration items");
      setConfigItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchConfigItems();
  }, [fetchConfigItems, selectedType]);

  // Reset to page 1 when search or type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        type: item.type || selectedType,
        is_active: item.is_active !== undefined ? item.is_active : 1,
        sort_order: item.sort_order || 0,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        type: selectedType,
        is_active: 1,
        sort_order: 0,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: "", type: selectedType, is_active: 1, sort_order: 0 });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 255) {
      newErrors.name = "Name must be at most 255 characters";
    }
    if (!formData.type) {
      newErrors.type = "Type is required";
    }
    if (formData.sort_order && (isNaN(formData.sort_order) || formData.sort_order < 0)) {
      newErrors.sort_order = "Sort order must be a positive number";
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
        type: formData.type,
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      let res;
      if (editingItem) {
        res = await authAxios.put(`${BASE_URL}/config/${editingItem.id}`, payload);
      } else {
        res = await authAxios.post(`${BASE_URL}/config`, payload);
      }

      if (res.data.success) {
        toast.success(
          editingItem ? "Item updated successfully" : "Item added successfully"
        );
        fetchConfigItems();
        handleCloseModal();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("❌ Error saving config item:", error);
      toast.error(error.response?.data?.message || "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await authAxios.delete(`${BASE_URL}/config/${id}`);
      if (res.data.success) {
        toast.success("Item deleted successfully");
        fetchConfigItems();
      } else {
        toast.error(res.data.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("❌ Error deleting item:", error);
      toast.error(error.response?.data?.message || "Failed to delete item");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const newStatus = item.is_active === 1 ? 0 : 1;
      const res = await authAxios.put(`${BASE_URL}/config/${item.id}`, {
        ...item,
        is_active: newStatus,
      });
      if (res.data.success) {
        toast.success(item.is_active === 1 ? "Item deactivated" : "Item activated");
        fetchConfigItems();
      } else {
        toast.error(res.data.message || "Failed to update item status");
      }
    } catch (error) {
      console.error("❌ Error toggling item status:", error);
      toast.error(error.response?.data?.message || "Failed to update item status");
    }
  };

  const typeOptions = CONFIG_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
  }));

  // Safe filtering - ensure configItems is an array
  const filteredItems = Array.isArray(configItems) 
    ? configItems.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Pagination
  const total = filteredItems.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  
  const displayStart = total === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, total);

  const thCls = "px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap bg-[#009E99]";
  const tdCls = "px-4 py-2.5 align-middle";

  const getTypeLabel = (type) => {
    const found = CONFIG_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  // Action menu handlers
  const openActionMenu = (e, item) => {
    e.stopPropagation();
    setActionMenu({
      item,
      x: e.clientX - 180,
      y: e.clientY + 4,
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dropdown Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage dropdown values used throughout the application
          </p>
        </div>
        <AddBtnInHeader
          label="Add Item"
          handleToggle={() => handleOpenModal()}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
              />
            </div>
            <div className="sm:w-64">
              <SearchableSelect
                name="config_type"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSearchTerm("");
                }}
                options={typeOptions}
                placeholder="Select type..."
              />
            </div>
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {total} item{total !== 1 ? "s" : ""}
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
                <th className={thCls}>Name</th>
                <th className={thCls}>Type</th>
                <th className={thCls}>Sort Order</th>
                <th className={thCls}>Status</th>
                <th className={`${thCls} w-16`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <RefreshCw size={24} className="animate-spin mx-auto text-teal-500" />
                    <p className="text-sm text-slate-400 mt-2">Loading items...</p>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <Settings size={40} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-sm">
                          {searchTerm ? "No items match your search" : `No items found for ${getTypeLabel(selectedType)}`}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {searchTerm ? "Try adjusting your search" : "Click 'Add Item' to create one"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const serialNumber = startIndex + idx + 1;
                  return (
                    <tr
                      key={item.id}
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
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-semibold text-xs ring-1 ring-gray-200 group-hover:ring-amber-300 transition-all duration-200">
                            {item.name?.charAt(0)?.toUpperCase() || "I"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm group-hover:text-amber-600 transition-colors duration-200">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className={tdCls}>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-lg text-xs font-medium text-purple-700">
                          <List size={12} className="text-purple-500" />
                          {getTypeLabel(item.type)}
                        </span>
                      </td>

                      <td className={tdCls}>
                        <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-mono font-medium text-gray-600 min-w-[40px]">
                          {item.sort_order || "0"}
                        </span>
                      </td>

                      <td className={tdCls}>
                        <div className="transform transition-all duration-200 group-hover:scale-105">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              item.is_active === 1
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.is_active === 1 ? "bg-green-500" : "bg-red-500"}`}></span>
                            {item.is_active === 1 ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      <td className={tdCls}>
                        <button
                          onClick={(e) => openActionMenu(e, item)}
                          className="w-7 h-7 rounded-md flex items-center justify-center 
                            bg-white border border-gray-300
                            text-gray-500 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50
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
                handleOpenModal(actionMenu.item);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              <Edit size={14} className="text-amber-500" />
              Edit Item
            </button>

            <button
              onClick={() => {
                handleToggleActive(actionMenu.item);
                setActionMenu(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 transition-all duration-150"
            >
              {actionMenu.item.is_active === 1 ? (
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
                handleDelete(actionMenu.item.id, actionMenu.item.name);
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
              {editingItem ? "Edit Item" : "Add Item"}
            </Title>

            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type *
                </label>
                <SearchableSelect
                  name="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  options={typeOptions}
                  placeholder="Select type..."
                  error={errors.type}
                  disabled={!!editingItem}
                />
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">{errors.type}</p>
                )}
              </div>

              <InputField
                labelName="Name *"
                name="name"
                value={formData.name}
                handlerChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                icon={<List size={18} />}
                placeholder="Enter option name..."
                error={errors.name}
              />

              <InputField
                labelName="Sort Order"
                name="sort_order"
                type="number"
                value={formData.sort_order}
                handlerChange={(e) =>
                  setFormData({ ...formData, sort_order: e.target.value })
                }
                placeholder="0"
                helperText="Lower numbers appear first"
                error={errors.sort_order}
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
                  label={editingItem ? "Update" : "Add"}
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

export default DropdownConfig;