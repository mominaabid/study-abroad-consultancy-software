// src/components/student/StudentPayments.jsx
import { useState, useEffect } from "react";
import { BASE_URL } from "../../Content/Url";
import {
  DollarSign, Receipt, CreditCard, Banknote,
  Calendar, CheckCircle, Clock, FileText, 
  Building2, BookOpen, MapPin, Loader,
  XCircle, AlertCircle, Upload, Eye, Trash2,
  ArrowLeft, Home
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function getToken() { return localStorage.getItem("token") || ""; }

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

// ─── MAKE PAYMENT MODAL ──────────────────────────────────────────────────────
function MakePaymentModal({ isOpen, onClose, onSuccess, application }) {
  const [formData, setFormData] = useState({ 
    amount: '', 
    mode: 'online', 
    payment_date: new Date().toISOString().split('T')[0], 
    notes: '' 
  });
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setProofPreview(previewUrl);
      } else {
        setProofPreview(null);
      }
    }
  };

  const removeFile = () => {
    setProofFile(null);
    if (proofPreview) {
      URL.revokeObjectURL(proofPreview);
      setProofPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (formData.mode === 'online' && !proofFile) {
      toast.error("Please upload payment screenshot for online payment");
      return;
    }
    
    setLoading(true);
    
    const formDataObj = new FormData();
    formDataObj.append('application_id', application.id);
    formDataObj.append('amount', formData.amount);
    formDataObj.append('mode', formData.mode);
    formDataObj.append('payment_date', formData.payment_date);
    formDataObj.append('notes', formData.notes);
    if (proofFile) {
      formDataObj.append('proof', proofFile);
    }

    try {
      const res = await fetch(`${BASE_URL}/student/payments/make`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formDataObj,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success(data.message);
      onSuccess();
      onClose();
      setFormData({ amount: '', mode: 'online', payment_date: new Date().toISOString().split('T')[0], notes: '' });
      removeFile();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Make Payment</h2>
          <p className="text-sm text-gray-500">{application?.target_university}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input 
              type="number" 
              step="0.01" 
              required 
              placeholder="Enter amount" 
              value={formData.amount} 
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
            <select 
              value={formData.mode} 
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })} 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 outline-none"
            >
              <option value="online">Online Transfer (Need Screenshot)</option>
              <option value="cash">Cash (Admin will verify)</option>
            </select>
          </div>

          {formData.mode === 'online' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Screenshot *</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-teal-400 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {proofFile ? (
                  <div className="space-y-2">
                    {proofPreview && (
                      <img src={proofPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                    )}
                    <p className="text-sm text-gray-600">{proofFile.name}</p>
                    <button 
                      type="button" 
                      onClick={removeFile}
                      className="text-red-500 text-xs hover:text-red-700 flex items-center gap-1 mx-auto"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click or drag to upload screenshot</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input 
              type="date" 
              value={formData.payment_date} 
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 outline-none" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              rows="3" 
              placeholder="Additional notes..." 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 outline-none resize-none" 
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
              {loading ? <Loader size={18} className="animate-spin" /> : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN STUDENT PAYMENTS COMPONENT ─────────────────────────────────────────
export default function StudentPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [summary, setSummary] = useState({ 
    total_paid: 0, 
    total_pending: 0, 
    completed_count: 0, 
    pending_count: 0, 
    rejected_count: 0 
  });

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/student/payments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setPayments(data.payments || []);
      setSummary(data.summary || {
        total_paid: 0,
        total_pending: 0,
        completed_count: 0,
        pending_count: 0,
        rejected_count: 0,
      });
    } catch (err) {
      console.error("Fetch payments error:", err);
      toast.error("Failed to load payment history");
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${BASE_URL}/student/getApplications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setApplications(data.data || []);
    } catch (err) {
      console.error("Fetch applications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchApplications();
  }, []);

  const getPaymentModeIcon = (mode) => {
    switch(mode) {
      case 'cash': return <Banknote size={14} />;
      case 'bank': return <Building2 size={14} />;
      case 'online': return <CreditCard size={14} />;
      default: return <CreditCard size={14} />;
    }
  };

  const getPaymentModeColor = (mode) => {
    switch(mode) {
      case 'cash': return 'text-emerald-600 bg-emerald-50';
      case 'bank': return 'text-blue-600 bg-blue-50';
      case 'online': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-50 text-green-700';
      case 'awaiting_verification': return 'bg-amber-50 text-amber-700';
      case 'rejected': return 'bg-red-50 text-red-700';
      case 'pending': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={12} />;
      case 'awaiting_verification': return <Clock size={12} />;
      case 'rejected': return <XCircle size={12} />;
      case 'pending': return <Clock size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'awaiting_verification': return 'Pending Verification';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const offerLetterApplications = applications.filter(app => app.status === 'offer letter received');

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Header with Back Button */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-950 to-teal-900 text-white rounded-3xl p-7 shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative">
            <button 
              onClick={() => navigate(-1)} 
              className="mb-3 flex items-center gap-1 text-teal-300 hover:text-white transition text-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-1">
              Financial History
            </p>
            <h1 className="text-2xl font-bold">My Payments</h1>
            <p className="text-blue-200 text-sm mt-1">
              Track all your payment transactions
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-gray-800">${summary.total_paid?.toLocaleString() || '0'}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Pending Verification</p>
              <p className="text-2xl font-bold text-amber-600">${summary.total_pending?.toLocaleString() || '0'}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{summary.completed_count || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{summary.rejected_count || 0}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Make Payment Section - Show if there are offer letter applications */}
      {offerLetterApplications.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-teal-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <DollarSign size={18} className="text-teal-600" />
              Make a Payment
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">You have applications ready for payment</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offerLetterApplications.map((app) => (
                <div key={app.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition bg-white">
                  <p className="font-semibold text-gray-800">{app.target_university}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{app.course}</p>
                  <button
                    onClick={() => {
                      setSelectedApplication(app);
                      setShowPaymentModal(true);
                    }}
                    className="mt-3 w-full px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2"
                  >
                    <DollarSign size={14} /> Make Payment
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment History List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Payment History</h3>
          <p className="text-xs text-gray-400 mt-0.5">All your payment transactions</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Receipt size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold">No payment records found</p>
            <p className="text-xs text-gray-400 mt-1">Your payment history will appear here</p>
            {offerLetterApplications.length > 0 && (
              <button
                onClick={() => {
                  setSelectedApplication(offerLetterApplications[0]);
                  setShowPaymentModal(true);
                }}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition"
              >
                Make Your First Payment
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <div key={payment.id} className="p-5 hover:bg-gray-50 transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Amount */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      payment.status === 'completed' ? 'bg-green-50' : 
                      payment.status === 'awaiting_verification' ? 'bg-amber-50' : 
                      payment.status === 'rejected' ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <DollarSign size={20} className={`${
                        payment.status === 'completed' ? 'text-green-600' : 
                        payment.status === 'awaiting_verification' ? 'text-amber-600' : 
                        payment.status === 'rejected' ? 'text-red-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-800">${parseFloat(payment.amount).toLocaleString()}</p>
                      <p className="text-xs text-gray-400 capitalize">{payment.payment_type?.replace(/_/g, ' ') || 'Payment'}</p>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="flex-1">
                    {payment.application && (
                      <div>
                        <p className="font-semibold text-gray-800">{payment.application.target_university || 'University'}</p>
                        <p className="text-xs text-gray-500">{payment.application.course || 'Course'}</p>
                      </div>
                    )}
                  </div>

                  {/* Status and Date */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentModeColor(payment.mode)}`}>
                        {getPaymentModeIcon(payment.mode)}
                        {payment.mode?.charAt(0).toUpperCase() + payment.mode?.slice(1)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {formatDate(payment.paid_at)}
                      </span>
                    </div>
                    {payment.status === 'rejected' && payment.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg w-full">
                        <p className="text-xs text-red-600">Reason: {payment.rejection_reason}</p>
                      </div>
                    )}
                    {payment.payment_proof && payment.status === 'awaiting_verification' && (
                      <a href={payment.payment_proof} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline flex items-center gap-1 mt-1">
                        <Eye size={10} /> View Uploaded Proof
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Make Payment Modal */}
      <MakePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          fetchPayments();
          fetchApplications();
          toast.success("Payment submitted! Admin will verify it soon.");
        }}
        application={selectedApplication}
      />
    </div>
  );
}