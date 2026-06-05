// Accounts.jsx - Corrected version with single transaction modal

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../Content/Url";
import {
  DollarSign,
  Plus,
  Eye,
  RefreshCw,
  Search,
  FileText,
  User,
  University,
  Calendar,
  CreditCard,
  AlertCircle,
  X,
} from "lucide-react";

const getToken = () => localStorage.getItem("token") || "";
const authAxios = {
  get: (url) =>
    axios.get(url, { headers: { Authorization: `Bearer ${getToken()}` } }),
  post: (url, data) =>
    axios.post(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
  }).format(amount);
};

// ---------- Payment Modal (full original implementation) ----------
const PaymentModal = ({
  isOpen,
  onClose,
  applications,
  selectedAppId,
  onSuccess,
}) => {
  const [selectedApplicationId, setSelectedApplicationId] = useState(
    selectedAppId || "",
  );
  const [paidAmount, setPaidAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const getAppDisplayText = (app) =>
    `${app.studentName} - ${app.university} (${app.course})`;

  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const lowerQuery = searchQuery.toLowerCase();
    return applications.filter(
      (app) =>
        app.studentName.toLowerCase().includes(lowerQuery) ||
        app.university.toLowerCase().includes(lowerQuery) ||
        app.course.toLowerCase().includes(lowerQuery),
    );
  }, [applications, searchQuery]);

  const findAppById = (id) =>
    applications.find((a) => a.applicationId === id) || null;

  useEffect(() => {
    if (selectedApplicationId) {
      const app = findAppById(selectedApplicationId);
      setSelectedApp(app);
      if (app) setSearchQuery(getAppDisplayText(app));
      else setSearchQuery("");
    } else {
      setSelectedApp(null);
      setSearchQuery("");
    }
  }, [selectedApplicationId, applications]);

  useEffect(() => {
    if (isOpen) {
      setPaidAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setError("");
      setSelectedApplicationId(selectedAppId || "");
      if (selectedAppId) {
        const app = findAppById(selectedAppId);
        setSelectedApp(app);
        setSearchQuery(app ? getAppDisplayText(app) : "");
      } else {
        setSelectedApp(null);
        setSearchQuery("");
      }
      setShowDropdown(false);
    }
  }, [isOpen, selectedAppId, applications]);

  const handleSelectApp = (app) => {
    setSelectedApplicationId(app.applicationId);
    setSearchQuery(getAppDisplayText(app));
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);
    if (value === "") {
      setSelectedApplicationId("");
      setSelectedApp(null);
    } else {
      const exactMatch = applications.find(
        (app) => getAppDisplayText(app) === value,
      );
      if (exactMatch) setSelectedApplicationId(exactMatch.applicationId);
      else {
        setSelectedApplicationId("");
        setSelectedApp(null);
      }
    }
  };

  const handleInputBlur = () => setTimeout(() => setShowDropdown(false), 150);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) {
      setError("Please select an application");
      return;
    }
    if (!paidAmount || parseFloat(paidAmount) <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }
    if (parseFloat(paidAmount) > selectedApp.balance) {
      setError(
        `Amount cannot exceed remaining balance (${formatCurrency(
          selectedApp.balance,
        )})`,
      );
      return;
    }
    setLoading(true);
    try {
      await authAxios.post(`${BASE_URL}/accounts/transactions`, {
        application_id: selectedApp.applicationId,
        paid_amount: parseFloat(paidAmount),
        date,
        description: description.trim() || undefined,
      });
      toast.success("Payment recorded successfully");
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to record payment";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Record Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!selectedAppId && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Student/Application
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                onBlur={handleInputBlur}
                placeholder="Type to search..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 outline-none"
                autoComplete="off"
              />
              {showDropdown && filteredApplications.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {filteredApplications.map((app) => (
                    <li
                      key={app.applicationId}
                      onClick={() => handleSelectApp(app)}
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-sm text-gray-700"
                    >
                      {getAppDisplayText(app)}
                    </li>
                  ))}
                </ul>
              )}
              {showDropdown && filteredApplications.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-center text-gray-500 text-sm">
                  No matching applications
                </div>
              )}
            </div>
          )}
          {selectedApp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payable Amount
                </label>
                <input
                  type="text"
                  readOnly
                  value={formatCurrency(selectedApp.payableAmount)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remaining Balance
                </label>
                <input
                  type="text"
                  readOnly
                  value={formatCurrency(selectedApp.balance)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-amber-50 text-amber-700 font-semibold"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Amount (PKR) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 outline-none resize-none"
              placeholder="e.g., First installment"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransactionDetailModal = ({
  isOpen,
  onClose,
  transaction,
  studentName,
  program,
}) => {
  if (!isOpen || !transaction) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isDebitEntry = transaction.debit > 0;
  const isCreditEntry = transaction.credit > 0;

  const debitAmount = isDebitEntry ? transaction.debit : null;
  const creditAmount = isCreditEntry ? transaction.credit : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText size={22} className="text-teal-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Transaction Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Vertical Details */}
        <div className="flex-1 overflow-auto p-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="grid grid-cols-1">
              <div>
                <p className="text-xs text-gray-500">Invoice No</p>
                <p className="font-medium text-gray-800">
                  {transaction.invoiceNo || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-gray-800">
                  {formatDate(transaction.date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Student</p>
                <p className="font-medium text-gray-800">
                  {studentName || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Program</p>
                <p className="font-medium text-gray-800">{program || "0"}</p>
              </div>

              <div>
                <p className="text-xs text-red-500">Debit</p>
                <p className="font-semibold text-red-600">
                  {debitAmount ? formatCurrency(debitAmount) : "0"}
                </p>
              </div>

              <div>
                <p className="text-xs text-green-500">Credit</p>
                <p className="font-semibold text-green-600">
                  {creditAmount ? formatCurrency(creditAmount) : "0"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Previous Balance</p>
                <p className="font-medium text-gray-800">
                  {formatCurrency(transaction.previousBalance || 0)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Current Balance</p>
                <p className="font-medium text-gray-800">
                  {formatCurrency(transaction.balance || 0)}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-amber-600">Net Balance</p>
                <p className="text-lg font-bold text-amber-700">
                  {formatCurrency(
                    transaction.netBalance || transaction.balance || 0,
                  )}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  {transaction.description || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Accounts Component (Role‑Aware) ----------
export const Accounts = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentSearchInput, setStudentSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [applicationsList, setApplicationsList] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppForPayment, setSelectedAppForPayment] = useState(null);

  // New states for single transaction modal
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");

  const user = useSelector((state) => state.auth.user);
  const isStudent = user?.role === "student";

  const uniqueStudentNames = useMemo(() => {
    const names = applicationsList.map((app) => app.studentName);
    return [...new Set(names)].sort();
  }, [applicationsList]);

  const studentSummary = useMemo(() => {
    let totalPayable = 0;
    let totalPaid = 0;
    applicationsList.forEach((app) => {
      totalPayable += app.payableAmount;
      totalPaid += app.totalPaid;
    });
    const totalBalance = totalPayable - totalPaid;
    return { totalPayable, totalPaid, totalBalance };
  }, [applicationsList]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const txRes = await authAxios.get(
        `${BASE_URL}/accounts/all-transactions`,
      );
      if (txRes.data.success) {
        setAllTransactions(txRes.data.transactions);
      }
      const appsRes = await authAxios.get(`${BASE_URL}/accounts/applications`);
      if (appsRes.data.success) {
        setApplicationsList(appsRes.data.applications);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
      toast.error("Failed to load accounts data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isStudent && !selectedStudent) {
      setFilteredTransactions([]);
      return;
    }
    let filtered = [...allTransactions];
    if (fromDate && toDate) {
      filtered = filtered.filter((tx) => {
        if (!tx.date) return false;
        const txDate = tx.date.split("T")[0];
        return txDate >= fromDate && txDate <= toDate;
      });
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          (tx.studentName && tx.studentName.toLowerCase().includes(term)) ||
          (tx.invoiceNo && tx.invoiceNo.toLowerCase().includes(term)) ||
          (tx.description && tx.description.toLowerCase().includes(term)),
      );
    }
    if (!isStudent && selectedStudent) {
      filtered = filtered.filter((tx) => tx.studentName === selectedStudent);
    }
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [
    allTransactions,
    fromDate,
    toDate,
    searchTerm,
    selectedStudent,
    isStudent,
  ]);

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const globalSummary = useMemo(() => {
    let totalCredit = 0;
    filteredTransactions.forEach((tx) => {
      totalCredit += tx.credit || 0;
    });
    return { totalCredit };
  }, [filteredTransactions]);

  const handleViewTransaction = (tx) => {
    const app = applicationsList.find(
      (a) => a.applicationId === tx.applicationId,
    );
    setSelectedTransaction(tx);
    setSelectedStudentName(app?.studentName || tx.studentName || "—");
    setSelectedProgram(app ? `${app.university} (${app.course})` : "—");
    setShowTransactionModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchData();
  };

  const openGlobalPaymentModal = () => {
    setSelectedAppForPayment(null);
    setShowPaymentModal(true);
  };

  const handleStudentSelect = (e) => {
    const value = e.target.value;
    setStudentSearchInput(value);
    if (uniqueStudentNames.includes(value)) {
      setSelectedStudent(value);
    } else {
      setSelectedStudent("");
    }
  };

  const clearStudentFilter = () => {
    setSelectedStudent("");
    setStudentSearchInput("");
  };

  return (
    <div className="p-4 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Header Section with Filters */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Date Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Student Filter – hidden for students, mandatory for others */}
          {!isStudent && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Student *
              </label>
              <div className="flex gap-2">
                <input
                  list="studentList"
                  value={studentSearchInput}
                  onChange={handleStudentSelect}
                  placeholder="Type or select student..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:ring-teal-500 focus:border-teal-500"
                />
                {selectedStudent && (
                  <button
                    onClick={clearStudentFilter}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                    title="Clear student filter"
                  >
                    Clear
                  </button>
                )}
              </div>
              <datalist id="studentList">
                {uniqueStudentNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {!isStudent && (
            <button
              onClick={openGlobalPaymentModal}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl shadow-sm transition"
            >
              <Plus size={18} /> Add Payment
            </button>
          )}
          <div className="relative w-full md:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by Student, Invoice, Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Student Summary Card (only for students) */}
      {isStudent && (
        <div className="mb-6 bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Your Account Summary
          </h3>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-gray-500">Total Payable</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(studentSummary.totalPayable)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-xl font-bold text-teal-600">
                {formatCurrency(studentSummary.totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining Balance</p>
              <p className="text-xl font-bold text-amber-700">
                {formatCurrency(studentSummary.totalBalance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="animate-spin mx-auto text-teal-600" size={32} />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          {!isStudent && !selectedStudent ? (
            <p className="text-gray-500">
              Please select a student from the dropdown to view transactions.
            </p>
          ) : (
            <p className="text-gray-500">No transactions found</p>
          )}
        </div>
      ) : (
        <>
          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sr#
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice No
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous Balance
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Balance
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTransactions.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {(currentPage - 1) * rowsPerPage + idx + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {tx.invoiceNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">
                        {tx.debit ? formatCurrency(tx.debit) : "0"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-teal-600">
                        {tx.credit ? formatCurrency(tx.credit) : "0"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-800">
                        {formatCurrency(tx.balance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">
                        {formatCurrency(tx.previousBalance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-amber-700">
                        {formatCurrency(tx.netBalance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <button
                          onClick={() => handleViewTransaction(tx)}
                          className="text-gray-600 hover:text-gray-800"
                          title="View Invoice Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredTransactions.length)}{" "}
              of {filteredTransactions.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 border rounded-md px-2"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>

          {/* Global Summary – only for admins/counsellors */}
          {!isStudent && filteredTransactions.length > 0 && (
            <div className="mt-6 flex justify-end">
              <div className="bg-white rounded-lg shadow p-4 w-full md:w-80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Fees Received:</span>
                  <span className="font-semibold text-teal-600">
                    {formatCurrency(globalSummary.totalCredit)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        applications={applicationsList}
        selectedAppId={selectedAppForPayment}
        onSuccess={handlePaymentSuccess}
      />

      <TransactionDetailModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        transaction={selectedTransaction}
        studentName={selectedStudentName}
        program={selectedProgram}
      />
    </div>
  );
};

export default Accounts;
