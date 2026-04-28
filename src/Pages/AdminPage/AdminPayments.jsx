// src/components/admin/AdminPayments.jsx
import { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "../../Content/Url";
import {
  DollarSign, Plus, Eye, CheckCircle, XCircle, 
  Trash2, Search, Calendar, CreditCard, 
  Banknote, Receipt, AlertCircle, Loader,
  User, Building2, BookOpen, MapPin, RefreshCw,
  Wallet, Clock, Award, FileText, Upload,
  Download, Filter, TrendingUp
} from "lucide-react";
import { toast } from "react-toastify";

function getToken() { return localStorage.getItem("token") || ""; }
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

// ─── SET FEES MODAL ────────────────────────────────────────────────────────
function SetFeesModal({ isOpen, onClose, onSuccess, student }) {
  const [totalFees, setTotalFees] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/payments/set-fees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          application_id: student.id,
          total_fees: totalFees,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Total fees set successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to set fees");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Set Total Fees</h2>
          <p className="text-sm text-gray-500 mt-1">
            Student: <span className="font-semibold">{student?.student_name}</span>
          </p>
          <p className="text-xs text-gray-400">{student?.university_name}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees Amount *</label>
            <input
              type="number"
              step="0.01"
              required
              value={totalFees}
              onChange={(e) => setTotalFees(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-400"
              placeholder="Enter total fees"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50">
              {loading ? <Loader size={18} className="animate-spin mx-auto" /> : "Set Fees"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── ADD PAYMENT MODAL ──────────────────────────────────────────────────────
function AddPaymentModal({ isOpen, onClose, onSuccess, student }) {
  const [formData, setFormData] = useState({
    amount: "",
    payment_type: "consultancy_fee",
    mode: "cash",
    reference_no: "",
    transaction_id: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          user_id: student.user_id,
          application_id: student.id,
          ...formData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Payment added successfully!");
      onSuccess();
      onClose();
      setFormData({ 
        amount: "", 
        payment_type: "consultancy_fee", 
        mode: "cash", 
        reference_no: "", 
        transaction_id: "", 
        notes: "" 
      });
    } catch (err) {
      toast.error(err.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Add Payment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Student: <span className="font-semibold">{student?.student_name}</span>
          </p>
          <p className="text-xs text-gray-400">University: {student?.university_name}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-400"
              placeholder="Enter amount"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
            <select
              value={formData.payment_type}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-400"
            >
              <option value="application_fee">Application Fee</option>
              <option value="tuition_deposit">Tuition Deposit</option>
              <option value="visa_fee">Visa Fee</option>
              <option value="consultancy_fee">Consultancy Fee</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
            <select
              required
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-400"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="online">Online Payment</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference No</label>
            <input
              type="text"
              value={formData.reference_no}
              onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-400"
              placeholder="Reference number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
            <input
              type="text"
              value={formData.transaction_id}
              onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-400"
              placeholder="Transaction ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-400 resize-none"
              placeholder="Additional notes"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}
              Add Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function AdminPayments() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [summary, setSummary] = useState({ total_amount: 0, completed_count: 0, pending_count: 0, rejected_count: 0 });

  const fetchOfferLetterStudents = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/payments/offer-letter-students`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      console.log('Offer letter students:', data);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch students error:", err);
      toast.error("Failed to load students");
    }
  }, []);

  const fetchAllPayments = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/payments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      console.log('All payments:', data);
      setPayments(data.payments || []);
      setSummary(data.summary || { total_amount: 0, completed_count: 0, pending_count: 0, rejected_count: 0 });
    } catch (err) {
      console.error("Fetch payments error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfferLetterStudents();
    fetchAllPayments();
  }, [fetchOfferLetterStudents, fetchAllPayments]);

  const handleSuccess = () => {
    fetchOfferLetterStudents();
    fetchAllPayments();
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-950 to-teal-900 text-white rounded-3xl p-7 shadow-xl">
          <h1 className="text-2xl font-bold">Payment Management</h1>
          <p className="text-blue-200 text-sm mt-1">Manage student payments and track financial history</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Collections</p>
              <p className="text-2xl font-bold text-gray-800">${summary.total_amount?.toLocaleString() || '0'}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600">{summary.completed_count || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{summary.pending_count || 0}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Offer Letter Students</p>
              <p className="text-2xl font-bold text-purple-600">{students.length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <User size={20} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'students'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
          }`}
        >
          Offer Letter Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'payments'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
          }`}
        >
          Payment History ({payments.length})
        </button>
      </div>

      {/* Offer Letter Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Students with Offer Letter Received</h3>
            <p className="text-xs text-gray-400 mt-0.5">Set fees or add payments for these students</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">University</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total Fees</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Remaining</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-10"><Loader className="animate-spin mx-auto" /></td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-gray-400">No students with offer letter received</td></tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{student.student_name}</p>
                        <p className="text-xs text-gray-400">{student.student_email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{student.university_name}</td>
                      <td className="px-4 py-3 font-semibold">${student.total_fees?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3 text-teal-600 font-semibold">${student.total_paid?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3 text-amber-600 font-semibold">${student.remaining_amount?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowFeesModal(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                          >
                            Set Fees
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowPaymentModal(true);
                            }}
                            className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700"
                          >
                            Add Payment
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800">All Payments</h3>
            <p className="text-xs text-gray-400 mt-0.5">Complete payment history</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">University</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Reference</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-10"><Loader className="animate-spin mx-auto" /></td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-10 text-gray-400">No payments recorded</td></tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{payment.student?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{payment.student?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{payment.application?.target_university || 'N/A'}</td>
                      <td className="px-4 py-3 font-semibold text-teal-600">${parseFloat(payment.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm capitalize">{payment.payment_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100">
                          {payment.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          payment.status === 'awaiting_verification' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {payment.status === 'completed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{formatDate(payment.paid_at)}</td>
                      <td className="px-4 py-3 text-sm">{payment.reference_no || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <SetFeesModal
        isOpen={showFeesModal}
        onClose={() => setShowFeesModal(false)}
        onSuccess={handleSuccess}
        student={selectedStudent}
      />

      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handleSuccess}
        student={selectedStudent}
      />
    </div>
  );
}