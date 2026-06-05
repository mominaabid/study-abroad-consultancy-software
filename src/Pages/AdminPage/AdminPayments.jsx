import { useState, useEffect, useCallback, useMemo } from "react";
import { BASE_URL } from "../../Content/Url";
import {
  DollarSign,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Calendar,
  CreditCard,
  Banknote,
  Receipt,
  AlertCircle,
  Loader,
  User,
  Building2,
  BookOpen,
  MapPin,
  RefreshCw,
  Wallet,
  Clock,
  Award,
  FileText,
  Upload,
  Download,
  Filter,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Layers,
  GraduationCap,
  Edit2,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import SearchableSelect from "../../Components/SearchableSelect";

function getToken() {
  return localStorage.getItem("token") || "";
}
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── HELPER: Prevent spacebar as first character ───────────────────────────
const preventLeadingSpace = {
  onKeyDown: (e) => {
    if (e.key !== " ") return;
    const target = e.target;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const value = target.value;
    const newValue = value.substring(0, start) + " " + value.substring(end);
    if (newValue.trimStart() !== newValue) {
      e.preventDefault();
    }
  },
};

function AddPaymentModal({ isOpen, onClose, onSuccess, student }) {
  const [formData, setFormData] = useState({
    amount: "",
    mode: "cash",
    reference_no: "",
    transaction_id: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const generateReferenceNo = () => {
    const prefix = "EDU";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${timestamp}-${random}`;
  };

  const generateTransactionId = () => {
    const prefix = "TXN";
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${prefix}${date}${random}`;
  };

  useEffect(() => {
    if (formData.mode === "cash") {
      setFormData((prev) => ({
        ...prev,
        reference_no: generateReferenceNo(),
        transaction_id: generateTransactionId(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        reference_no: "",
        transaction_id: "",
      }));
    }
  }, [formData.mode, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid amount", {
        toastId: "add-payment-validation-error",
      });
      return;
    }

    if (
      !formData.amount ||
      formData.amount.toString().length < 3 ||
      formData.amount.toString().length > 12
    ) {
      toast.error("Amount must be between 3 and 12 characters", {
        toastId: "add-payment-validation-error",
      });
      return;
    }

    if (
      formData.notes &&
      (formData.notes.length < 3 || formData.notes.length > 255)
    ) {
      toast.error("Notes must be between 3 and 255 characters", {
        toastId: "add-payment-validation-error",
      });
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
          amount: parseFloat(formData.amount),
          payment_type: "consultancy_fee", // Only Consultancy Fee allowed
          mode: formData.mode,
          reference_no: formData.reference_no,
          transaction_id: formData.transaction_id,
          notes: formData.notes,
          status: "completed",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add payment");

      toast.success("Payment added successfully!", {
        toastId: "add-payment-success",
      });
      onSuccess();
      onClose();
      setFormData({
        amount: "",
        mode: "cash",
        reference_no: "",
        transaction_id: "",
        notes: "",
      });
    } catch (err) {
      console.error("Add payment error:", err);

      toast.error(err.message || "Failed to add payment", {
        toastId: "add-payment-api-error",
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateReferences = () => {
    setFormData((prev) => ({
      ...prev,
      reference_no: generateReferenceNo(),
      transaction_id: generateTransactionId(),
    }));

    toast.info("New reference numbers generated", {
      toastId: "regenerate-ref-info",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Add Payment</h2>
              <p className="text-sm text-gray-500">{student?.student_name}</p>
              <p className="text-xs text-gray-400">
                {student?.university_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <XCircle size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500">
                PKR
              </span>
              <input
                type="text"
                inputMode="numeric"
                minLength={3}
                maxLength={12}
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                onKeyDown={preventLeadingSpace.onKeyDown}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2 outline-none focus:border-teal-400"
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode *
              </label>
              <SearchableSelect
                name="mode"
                value={formData.mode}
                onChange={(e) =>
                  setFormData({ ...formData, mode: e.target.value })
                }
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "bank", label: "Bank Transfer" },
                  { value: "online", label: "Online Payment" },
                ]}
                placeholder="Search payment mode..."
                required={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference No
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.reference_no}
                  onChange={(e) =>
                    setFormData({ ...formData, reference_no: e.target.value })
                  }
                  onKeyDown={preventLeadingSpace.onKeyDown}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-teal-400 text-sm"
                  placeholder="Reference number"
                  readOnly={formData.mode === "cash"}
                />
                {formData.mode === "cash" && (
                  <button
                    type="button"
                    onClick={regenerateReferences}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700"
                    title="Generate new reference"
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
              {formData.mode === "cash" && (
                <p className="text-xs text-gray-400 mt-1">
                  Auto-generated for cash payments
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.transaction_id}
                onChange={(e) =>
                  setFormData({ ...formData, transaction_id: e.target.value })
                }
                onKeyDown={preventLeadingSpace.onKeyDown}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-teal-400 text-sm"
                placeholder="Transaction ID"
                readOnly={formData.mode === "cash"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows="2"
              minLength={3}
              maxLength={255}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              onKeyDown={preventLeadingSpace.onKeyDown}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-teal-400 resize-none text-sm"
              placeholder="Additional notes"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-xl text-gray-600 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── VERIFY PAYMENT MODAL ──────────────────────────────────────────────────
function VerifyPaymentModal({ isOpen, onClose, onSuccess, payment }) {
  const [action, setAction] = useState("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection", {
        toastId: "verify-payment-validation-error",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/admin/payments/verify/${payment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ action, rejection_reason: rejectionReason }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(`Payment ${action}d successfully!`, {
        toastId: "verify-payment-success",
      });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to verify payment", {
        toastId: "verify-payment-api-error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Verify Payment</h2>
          <p className="text-sm text-gray-500">
            Amount: <span className="font-semibold">PKR {payment?.amount}</span>
          </p>
          <p className="text-xs text-gray-400">
            Student: {payment?.student?.name}
          </p>
          {payment?.notes && (
            <p className="text-xs text-gray-500 mt-1">Notes: {payment.notes}</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action *
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-teal-400"
            >
              <option value="approve">✅ Approve Payment</option>
              <option value="reject">❌ Reject Payment</option>
            </select>
          </div>

          {action === "reject" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                onKeyDown={preventLeadingSpace.onKeyDown}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-red-400 resize-none text-sm"
                placeholder="Why is this payment being rejected?"
              />
            </div>
          )}

          {payment?.payment_proof && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 mb-2">Payment Proof:</p>
              <a
                href={payment.payment_proof}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 text-sm hover:underline flex items-center gap-1"
              >
                <Eye size={14} /> View Screenshot
              </a>
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
              {loading ? (
                <Loader size={18} className="animate-spin mx-auto" />
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── APPLICATION DETAIL PANEL (reused for each application) ─────────────────
function ApplicationDetailsPanel({
  student,
  onAddPayment,
  onRefresh,
  hideCloseButton = true,
}) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      fetchStudentPayments();
    }
  }, [student]);

  const fetchStudentPayments = async () => {
    if (!student) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/admin/payments/student/${student.user_id}/application/${student.id}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const paymentsArray = Array.isArray(data) ? data : data.payments || [];
      setPayments(paymentsArray);
    } catch (err) {
      console.error("Fetch student payments error:", err);
      toast.error(`Failed to load payment history: ${err.message}`, {
        toastId: "fetch-student-payments-error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  // Only Consultancy Fee matters
  const consultancyFee = parseFloat(student.consultancy_fee) || 0;
  const totalPaid = parseFloat(student.total_paid) || 0;
  const remainingAmount = consultancyFee - totalPaid;
  const overallStatus =
    remainingAmount <= 0 && consultancyFee > 0 ? "Complete" : "In Progress";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-800">
                {student.university_name}
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  overallStatus === "Complete"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {overallStatus}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Application ID: {student.id}
            </p>
          </div>
          {!hideCloseButton && (
            <button
              onClick={onRefresh}
              className="p-1 hover:bg-gray-200 rounded-lg"
            >
              <X size={18} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {consultancyFee > 0 ? (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Consultancy Fee:</span>
                <span className="font-semibold">
                  PKR {consultancyFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-semibold text-green-600">
                  PKR {totalPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-semibold text-amber-600">
                  PKR {remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-teal-600 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (totalPaid / consultancyFee) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <AlertCircle size={16} className="text-amber-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-amber-700">
              Consultancy fee not set yet
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onAddPayment(student)}
            className={`px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 w-full`}
          >
            Add Payment
          </button>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 text-xs mb-2">
            Payment History
          </h4>
          {loading ? (
            <div className="text-center py-2">
              <Loader size={16} className="animate-spin mx-auto" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-2">
              No payments yet
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-2 bg-gray-50 rounded-lg text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        PKR {parseFloat(payment.amount).toLocaleString()}
                      </p>
                      <p className="text-gray-500">
                        {formatDate(payment.paid_at)}
                      </p>
                    </div>
                  </div>
                  {payment.notes && (
                    <p className="text-gray-500 mt-0.5">
                      Note: {payment.notes}
                    </p>
                  )}
                  {payment.reference_no && (
                    <p className="text-gray-400 mt-0.5">
                      Ref: {payment.reference_no}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT CARD COMPONENT (with Add Payment button & total Consultancy Fee) ─────────────────
function StudentCard({ student, applications, onAddPaymentClick }) {
  const totalPaid = applications.reduce(
    (sum, app) => sum + (parseFloat(app.total_paid) || 0),
    0,
  );
  // Only Consultancy Fee matters
  const totalConsultancyFee = applications.reduce(
    (sum, app) => sum + (parseFloat(app.consultancy_fee) || 0),
    0,
  );

  const completedApps = applications.filter((app) => {
    const consultancy = parseFloat(app.consultancy_fee) || 0;
    const paid = parseFloat(app.total_paid) || 0;
    return consultancy > 0 && paid >= consultancy;
  }).length;

  const handleAddPaymentClick = (e) => {
    e.stopPropagation();
    onAddPaymentClick(student);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 transition-all hover:shadow-lg relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <User size={16} className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">
                {student.student_name}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                {student.student_email}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              <Layers size={12} />
              <span>{applications.length} application(s)</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <CheckCircle size={12} className="text-green-500" />
              <span>{completedApps} completed</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 col-span-2">
              <Wallet size={12} />
              <span>Paid: PKR {totalPaid.toLocaleString()}</span>
            </div>
            {/* Only Consultancy Fee row */}
            <div className="flex items-center gap-1 text-gray-500 col-span-2">
              <Award size={12} />
              <span>
                Consultancy Fee: PKR {totalConsultancyFee.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Add Payment button at bottom-right corner */}
      <button
        onClick={handleAddPaymentClick}
        className="absolute bottom-3 right-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-1.5 shadow-md transition-all"
        title="Add Payment"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

// ─── STUDENT PAYMENTS PAGE (MODIFIED: FILTER DROPDOWN BY OUTSTANDING BALANCE) ───
function StudentPaymentsPage({ studentGroup, onBack, onRefreshMain }) {
  // Use applications directly from props (no local state) to reflect updates
  const applications = studentGroup.applications;
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Form state – initially empty, mode = 'bank' to avoid auto-generated refs on load
  const [formData, setFormData] = useState({
    amount: "",
    mode: "bank",
    reference_no: "",
    transaction_id: "",
    notes: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  const generateReferenceNo = () => {
    const prefix = "EDU";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${timestamp}-${random}`;
  };

  const generateTransactionId = () => {
    const prefix = "TXN";
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${prefix}${date}${random}`;
  };

  // Auto-generate reference numbers only when mode is 'cash' and not editing
  useEffect(() => {
    if (formData.mode === "cash" && !editingPaymentId) {
      setFormData((prev) => ({
        ...prev,
        reference_no: generateReferenceNo(),
        transaction_id: generateTransactionId(),
      }));
    }
  }, [formData.mode, editingPaymentId]);

  const fetchPaymentsForApplication = async (application) => {
    if (!application) return;
    setLoadingPayments(true);
    try {
      const res = await fetch(
        `${BASE_URL}/admin/payments/student/${application.user_id}/application/${application.id}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const paymentsArray = Array.isArray(data) ? data : data.payments || [];
      setPayments(paymentsArray);
    } catch (err) {
      console.error("Fetch payments error:", err);
      toast.error("Failed to load payment history");
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleSelectApplication = (app) => {
    setSelectedApplication(app);
    setEditingPaymentId(null);
    setFormData({
      amount: "",
      mode: "bank",
      reference_no: "",
      transaction_id: "",
      notes: "",
    });
    fetchPaymentsForApplication(app);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedApplication) {
      toast.error("Please select an application first");
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (
      formData.amount.toString().length < 3 ||
      formData.amount.toString().length > 12
    ) {
      toast.error("Amount must be between 3 and 12 characters");
      return;
    }
    if (
      formData.notes &&
      (formData.notes.length < 3 || formData.notes.length > 255)
    ) {
      toast.error("Notes must be between 3 and 255 characters");
      return;
    }

    setFormLoading(true);
    try {
      const url = editingPaymentId
        ? `${BASE_URL}/admin/payments/${editingPaymentId}`
        : `${BASE_URL}/admin/payments`;
      const method = editingPaymentId ? "PUT" : "POST";

      const payload = {
        user_id: selectedApplication.user_id,
        application_id: selectedApplication.id,
        amount: parseFloat(formData.amount),
        payment_type: "consultancy_fee",
        mode: formData.mode,
        reference_no: formData.reference_no,
        transaction_id: formData.transaction_id,
        notes: formData.notes,
        status: "completed",
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save payment");

      toast.success(
        editingPaymentId
          ? "Payment updated successfully!"
          : "Payment added successfully!",
      );

      setEditingPaymentId(null);
      setFormData({
        amount: "",
        mode: "bank",
        reference_no: "",
        transaction_id: "",
        notes: "",
      });
      await fetchPaymentsForApplication(selectedApplication);
      onRefreshMain(); // Refresh parent data
    } catch (err) {
      console.error("Save payment error:", err);
      toast.error(err.message || "Failed to save payment");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPaymentId(payment.id);
    setFormData({
      amount: payment.amount,
      mode: payment.mode || "cash",
      reference_no: payment.reference_no || "",
      transaction_id: payment.transaction_id || "",
      notes: payment.notes || "",
    });
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?"))
      return;
    try {
      const res = await fetch(`${BASE_URL}/admin/payments/${paymentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Payment deleted successfully");
      if (selectedApplication) {
        await fetchPaymentsForApplication(selectedApplication);
      }
      onRefreshMain();
      if (editingPaymentId === paymentId) {
        setEditingPaymentId(null);
        setFormData({
          amount: "",
          mode: "bank",
          reference_no: "",
          transaction_id: "",
          notes: "",
        });
      }
    } catch (err) {
      console.error("Delete payment error:", err);
      toast.error("Failed to delete payment");
    }
  };

  const cancelEdit = () => {
    setEditingPaymentId(null);
    setFormData({
      amount: "",
      mode: "bank",
      reference_no: "",
      transaction_id: "",
      notes: "",
    });
  };

  // --- NEW: Filter applications with outstanding balance ---
  const outstandingApplications = useMemo(() => {
    return applications.filter((app) => {
      const consultancy = parseFloat(app.consultancy_fee) || 0;
      const paid = parseFloat(app.total_paid) || 0;
      const remaining = consultancy - paid;
      return remaining > 0;
    });
  }, [applications]);

  // If selected application no longer has outstanding balance, clear selection
  useEffect(() => {
    if (selectedApplication) {
      const stillOutstanding = outstandingApplications.some(
        (app) => app.id === selectedApplication.id,
      );
      if (!stillOutstanding) {
        setSelectedApplication(null);
        toast.info(
          "This application is fully paid and has been removed from the dropdown.",
          { toastId: "fully-paid-clear" },
        );
      }
    }
  }, [outstandingApplications, selectedApplication]);

  // Dropdown options based on outstanding applications only
  const applicationOptions = outstandingApplications.map((app) => {
    const consultancy = parseFloat(app.consultancy_fee) || 0;
    const paid = parseFloat(app.total_paid) || 0;
    const remaining = consultancy - paid;
    return {
      value: app.id,
      label: `${app.university_name} (ID: ${app.id}) - Remaining: PKR ${remaining.toLocaleString()}`,
      appData: app,
    };
  });

  const selectedAppConsultancy = selectedApplication
    ? parseFloat(selectedApplication.consultancy_fee) || 0
    : 0;
  const selectedAppPaid = selectedApplication
    ? parseFloat(selectedApplication.total_paid) || 0
    : 0;
  const remainingAmount = selectedAppConsultancy - selectedAppPaid;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="hover:bg-gray-100 rounded-xl transition"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {studentGroup.student_name}
          </h1>
          <p className="text-sm text-gray-500">{studentGroup.student_email}</p>
        </div>
      </div>

      {/* Application Cards (showing all applications, but highlight selected) */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Applications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {applications.map((app) => {
            const consultancyFee = parseFloat(app.consultancy_fee) || 0;
            const appPaid = parseFloat(app.total_paid) || 0;
            const isComplete = consultancyFee > 0 && appPaid >= consultancyFee;

            return (
              <div
                key={app.id}
                className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                  selectedApplication?.id === app.id
                    ? "border-teal-400 ring-2 ring-teal-200"
                    : "border-gray-100"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {app.university_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Application ID: {app.id}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isComplete
                        ? "bg-green-100 text-green-700"
                        : consultancyFee > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isComplete
                      ? "Paid"
                      : consultancyFee > 0
                        ? "Pending"
                        : "Fee Not Set"}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Consultancy Fee:</span>
                    <span className="font-semibold">
                      PKR {consultancyFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid:</span>
                    <span className="text-green-600 font-semibold">
                      PKR {appPaid.toLocaleString()}
                    </span>
                  </div>
                  {consultancyFee > 0 && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-teal-600 h-1 rounded-full"
                        style={{
                          width: `${Math.min(100, (appPaid / consultancyFee) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Management Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Payment Management
          </h2>
          {selectedApplication && (
            <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              Remaining:{" "}
              <span className="font-bold text-amber-600">
                PKR {remainingAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Application Dropdown - Only outstanding applications */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Application <span className="text-red-500">*</span>
            <span className="text-xs text-gray-400 ml-2">
              (Only applications with outstanding balance are shown)
            </span>
          </label>
          {outstandingApplications.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <AlertCircle size={16} className="text-amber-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-amber-700">
                No applications with outstanding consultancy fee balance.
              </p>
              <p className="text-xs text-amber-600 mt-1">
                All applications for this student are fully paid.
              </p>
            </div>
          ) : (
            <SearchableSelect
              name="application"
              value={selectedApplication?.id || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const app = outstandingApplications.find(
                  (a) => a.id === Number(selectedId),
                );
                if (app) handleSelectApplication(app);
              }}
              options={applicationOptions}
              placeholder="Search application by university or ID..."
              required
            />
          )}
        </div>

        {/* Read-only fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Total Consultancy Fees
            </label>
            <div className="text-lg font-bold text-gray-800">
              PKR {selectedAppConsultancy.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Paid
            </label>
            <div className="text-lg font-bold text-green-600">
              PKR {selectedAppPaid.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Remaining
            </label>
            <div className="text-lg font-bold text-amber-600">
              PKR {remainingAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Payment Entry Form */}
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  PKR
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  onKeyDown={preventLeadingSpace.onKeyDown}
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-3 py-2 outline-none focus:border-teal-400"
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode *
              </label>
              <SearchableSelect
                name="mode"
                value={formData.mode}
                onChange={(e) =>
                  setFormData({ ...formData, mode: e.target.value })
                }
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "bank", label: "Bank Transfer" },
                  { value: "online", label: "Online Payment" },
                ]}
                placeholder="Select mode..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference No
              </label>
              <input
                type="text"
                value={formData.reference_no}
                onChange={(e) =>
                  setFormData({ ...formData, reference_no: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-teal-400"
                placeholder="Reference number"
                readOnly={formData.mode === "cash" && !editingPaymentId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                value={formData.transaction_id}
                onChange={(e) =>
                  setFormData({ ...formData, transaction_id: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-teal-400"
                placeholder="Transaction ID"
                readOnly={formData.mode === "cash" && !editingPaymentId}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-teal-400"
                placeholder="Additional notes"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={formLoading || !selectedApplication}
              className="px-5 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {formLoading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {editingPaymentId ? "Update Payment" : "Add Payment"}
            </button>
            {editingPaymentId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel Edit
              </button>
            )}
          </div>
          {!selectedApplication && outstandingApplications.length > 0 && (
            <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
              <AlertCircle size={14} /> Please select an application from the
              dropdown above to add a payment.
            </p>
          )}
        </form>

        {/* Payment History */}
        {selectedApplication && (
          <div className="mt-8">
            <h3 className="font-semibold text-gray-700 mb-3">
              Payment History
            </h3>
            {loadingPayments ? (
              <div className="text-center py-8">
                <Loader
                  size={24}
                  className="animate-spin mx-auto text-teal-500"
                />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-400">
                  No payments recorded for this application
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-teal-600">
                          PKR {parseFloat(payment.amount).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(payment.paid_at)}
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                          {payment.mode}
                        </span>
                        <span className="text-xs text-gray-500">
                          Consultancy Fee
                        </span>
                      </div>
                      {payment.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          📝 {payment.notes}
                        </p>
                      )}
                      {payment.reference_no && (
                        <p className="text-xs text-gray-400">
                          Ref: {payment.reference_no}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPayment(payment)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function AdminPayments() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    total_amount: 0,
    completed_count: 0,
    pending_count: 0,
    rejected_count: 0,
    in_progress_count: 0,
  });
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [paymentViewStudent, setPaymentViewStudent] = useState(null);

  // Group applications by student (user_id)
  const groupedStudents = useMemo(() => {
    const map = new Map();
    students.forEach((app) => {
      const uid = app.user_id;
      if (!map.has(uid)) {
        map.set(uid, {
          user_id: uid,
          student_name: app.student_name,
          student_email: app.student_email,
          applications: [],
        });
      }
      map.get(uid).applications.push(app);
    });
    return Array.from(map.values());
  }, [students]);

  // Auto-update paymentViewStudent when groupedStudents changes and we are viewing a student
  useEffect(() => {
    if (paymentViewStudent) {
      const updatedGroup = groupedStudents.find(
        (group) => group.user_id === paymentViewStudent.user_id,
      );
      if (updatedGroup) {
        setPaymentViewStudent(updatedGroup);
      } else {
        // Student no longer has any applications? Go back to list.
        setPaymentViewStudent(null);
        toast.info("Student data has changed. Returning to list.", {
          toastId: "student-data-changed",
        });
      }
    }
  }, [groupedStudents, paymentViewStudent]);

  const filteredGroupedStudents = useMemo(() => {
    if (!searchTerm.trim()) return groupedStudents;
    const term = searchTerm.toLowerCase();
    return groupedStudents.filter(
      (group) =>
        group.student_name?.toLowerCase().includes(term) ||
        group.student_email?.toLowerCase().includes(term),
    );
  }, [groupedStudents, searchTerm]);

  const fetchOfferLetterStudents = useCallback(async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/admin/payments/offer-letter-students`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch students error:", err);
      toast.error("Failed to load students", {
        toastId: "fetch-offer-letter-error",
      });
    }
  }, []);

  const fetchAllPayments = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/payments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setPayments(data.payments || []);
      setSummary(
        data.summary || {
          total_amount: 0,
          completed_count: 0,
          pending_count: 0,
          rejected_count: 0,
          in_progress_count: 0,
        },
      );
    } catch (err) {
      console.error("Fetch payments error:", err);
      toast.error("Failed to load payments", {
        toastId: "fetch-all-payments-error",
      });
    }
  }, []);

  const fetchPendingVerifications = useCallback(async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/admin/payments/pending-verifications`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await res.json();
      setPendingVerifications(data.payments || []);
    } catch (err) {
      console.error("Fetch pending verifications error:", err);
      toast.error("Failed to load pending verifications", {
        toastId: "fetch-pending-verifications-error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfferLetterStudents();
    fetchAllPayments();
    fetchPendingVerifications();
  }, [fetchOfferLetterStudents, fetchAllPayments, fetchPendingVerifications]);

  const handleSuccess = async () => {
    await fetchOfferLetterStudents();
    await fetchAllPayments();
    await fetchPendingVerifications();
  };

  const handleAddPayment = (student) => {
    setSelectedStudentForModal(student);
    setShowPaymentModal(true);
  };

  const handleAddPaymentFromCard = (studentGroup) => {
    setPaymentViewStudent(studentGroup);
  };

  const handleBackFromPaymentsPage = () => {
    setPaymentViewStudent(null);
    handleSuccess();
  };

  const completedApplicationsCount = students.filter((app) => {
    const consultancy = parseFloat(app.consultancy_fee) || 0;
    const paid = parseFloat(app.total_paid) || 0;
    return consultancy > 0 && paid >= consultancy;
  }).length;

  if (paymentViewStudent) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
        <StudentPaymentsPage
          studentGroup={paymentViewStudent}
          onBack={handleBackFromPaymentsPage}
          onRefreshMain={handleSuccess}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">Total Collected</p>
          <p className="text-xl font-bold text-gray-800">
            PKR {summary.total_amount?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="text-xl font-bold text-green-600">
            {completedApplicationsCount}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">Pending Verifications</p>
          <p className="text-xl font-bold text-amber-600">
            {pendingVerifications.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">Rejected</p>
          <p className="text-xl font-bold text-red-600">
            {summary.rejected_count || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">Total Applications</p>
          <p className="text-xl font-bold text-purple-600">{students.length}</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("students")}
          className={`px-5 py-2 rounded-xl font-medium transition ${
            activeTab === "students"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={16} />
            Students
          </div>
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-5 py-2 rounded-xl font-medium transition ${
            activeTab === "pending"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            Pending Verifications
            {pendingVerifications.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {pendingVerifications.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-5 py-2 rounded-xl font-medium transition ${
            activeTab === "payments"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Receipt size={16} />
            All Payments
          </div>
        </button>
      </div>

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={preventLeadingSpace.onKeyDown}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-teal-400 bg-white"
            />
          </div>
          {filteredGroupedStudents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-semibold">No students found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your search
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGroupedStudents.map((group) => (
                <StudentCard
                  key={group.user_id}
                  student={group}
                  applications={group.applications}
                  onAddPaymentClick={handleAddPaymentFromCard}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Verifications Tab */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingVerifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <CheckCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-semibold">
                No pending verifications
              </p>
              <p className="text-xs text-gray-400 mt-1">
                All payments have been processed
              </p>
            </div>
          ) : (
            pendingVerifications.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <User size={14} className="text-amber-600" />
                      </div>
                      <p className="font-semibold text-gray-800">
                        {payment.student?.name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {payment.application?.target_university}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Wallet size={12} /> Amount: PKR {payment.amount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatDate(payment.paid_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard size={12} /> {payment.mode}
                      </span>
                    </div>
                    {payment.notes && (
                      <p className="text-xs text-gray-500 mt-2">
                        📝 Note: {payment.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {payment.payment_proof && (
                      <a
                        href={payment.payment_proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 border rounded-lg text-gray-600 text-sm hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Eye size={14} /> Proof
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowVerifyModal(true);
                      }}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-1"
                    >
                      <CheckCircle size={14} /> Verify
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Payments Tab */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    University
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">
                      No payments recorded
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 text-sm">
                          {payment.student?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {payment.student?.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {payment.application?.target_university || "N/A"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-teal-600">
                        PKR {parseFloat(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100">
                          {payment.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            payment.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "in-progress"
                                ? "bg-amber-100 text-amber-700"
                                : payment.status === "awaiting_verification"
                                  ? "bg-amber-100 text-amber-700"
                                  : payment.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {payment.status === "in-progress"
                            ? "In Progress"
                            : payment.status === "awaiting_verification"
                              ? "Pending"
                              : payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(payment.paid_at)}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-gray-500 max-w-[150px] truncate"
                        title={payment.notes}
                      >
                        {payment.notes || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handleSuccess}
        student={selectedStudentForModal}
      />

      <VerifyPaymentModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onSuccess={handleSuccess}
        payment={selectedPayment}
      />
    </div>
  );
}
