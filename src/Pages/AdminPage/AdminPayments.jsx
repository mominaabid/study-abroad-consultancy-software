import { useState, useEffect, useCallback } from "react";
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
    // Simulate the new value if space is inserted at cursor/selection
    const newValue = value.substring(0, start) + " " + value.substring(end);
    // If the new value would start with a space, prevent it
    if (newValue.trimStart() !== newValue) {
      e.preventDefault();
    }
  },
};

// ─── SET FEES MODAL ────────────────────────────────────────────────────────
function SetFeesModal({ isOpen, onClose, onSuccess, student }) {
  const [formData, setFormData] = useState({
    total_fees: "",
    scholarship: "",
    scholarship_type: "",
    scholarship_remarks: "",
  });
  const [finalFees, setFinalFees] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculate final fees when total_fees or scholarship changes
  useEffect(() => {
    const total = parseFloat(formData.total_fees) || 0;
    const scholarship = parseFloat(formData.scholarship) || 0;
    setFinalFees(total - scholarship);
  }, [formData.total_fees, formData.scholarship]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.total_fees || formData.total_fees <= 0) {
      toast.error("Please enter a valid total fees amount", {
        toastId: "enter-valid-total-fees",
      });
      return;
    }

    const isValidLength = (val, min, max) =>
      val && val.toString().length >= min && val.toString().length <= max;

    const isScholarshipValid =
      !formData.scholarship || isValidLength(formData.scholarship, 3, 12);

    if (!isValidLength(formData.total_fees, 3, 12) || !isScholarshipValid) {
      toast.error("Fees and scholarship must be between 3 and 12 characters", {
        toastId: "fees & scholarship amount between 3 and 12",
      });
      return;
    }

    if (
      formData.scholarship_remarks &&
      (formData.scholarship_remarks.length < 3 ||
        formData.scholarship_remarks.length > 255)
    ) {
      toast.error("Remarks must be between 3 and 255 characters", {
        toastId: "remarks btw 3 and 255",
      });
      return;
    }

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
          total_fees: formData.total_fees,
          scholarship: formData.scholarship || 0,
          scholarship_type: formData.scholarship_type,
          scholarship_remarks: formData.scholarship_remarks,
          final_fees: finalFees,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(
        parseFloat(formData.scholarship) > 0
          ? `Fees set successfully! Scholarship of PKR ${formData.scholarship} applied. Final fees: PKR ${finalFees}`
          : "Total fees set successfully!",
        { toastId: "set-fees-success" },
      );
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to set fees", {
        toastId: "set-fees-api-error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Set Fees & Scholarship
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Student:{" "}
                <span className="font-semibold">{student?.student_name}</span>
              </p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Total Fees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Fees *
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
                value={formData.total_fees}
                onChange={(e) =>
                  setFormData({ ...formData, total_fees: e.target.value })
                }
                onKeyDown={preventLeadingSpace.onKeyDown}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2 outline-none focus:border-teal-400"
                placeholder="Enter total fees"
              />
            </div>
          </div>

          {/* Optional Scholarship Section */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-teal-500" />
              <h3 className="font-semibold text-gray-700 text-sm">
                Scholarship (Optional)
              </h3>
              <span className="text-xs text-gray-400">
                - deduct from total fees
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scholarship Amount
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
                    value={formData.scholarship}
                    onChange={(e) =>
                      setFormData({ ...formData, scholarship: e.target.value })
                    }
                    onKeyDown={preventLeadingSpace.onKeyDown}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2 outline-none focus:border-teal-400"
                    placeholder="Enter scholarship amount (if any)"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  This amount will be deducted from total fees
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scholarship Type
                </label>
                <SearchableSelect
                  name="scholarship_type"
                  value={formData.scholarship_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scholarship_type: e.target.value,
                    })
                  }
                  options={[
                    { value: "", label: "Select type (optional)" },
                    { value: "Merit Scholarship", label: "Merit Scholarship" },
                    {
                      value: "Need-based Scholarship",
                      label: "Need-based Scholarship",
                    },
                    {
                      value: "Sports Scholarship",
                      label: "Sports Scholarship",
                    },
                    {
                      value: "Academic Excellence",
                      label: "Academic Excellence",
                    },
                    { value: "Early Admission", label: "Early Admission" },
                    { value: "Sibling Discount", label: "Sibling Discount" },
                    { value: "Other", label: "Other" },
                  ]}
                  placeholder="Search or select scholarship type..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  rows="2"
                  minLength={3}
                  maxLength={255}
                  value={formData.scholarship_remarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scholarship_remarks: e.target.value,
                    })
                  }
                  onKeyDown={preventLeadingSpace.onKeyDown}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-teal-400 resize-none text-sm"
                  placeholder="Additional remarks about scholarship"
                />
              </div>
            </div>
          </div>

          {/* Final Fees Preview */}
          {(parseFloat(formData.scholarship) > 0 || finalFees > 0) && (
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200">
              <p className="text-xs font-semibold text-teal-700 mb-2">
                💰 Fee Summary
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Fees:</span>
                  <span className="font-semibold">
                    PKR {parseFloat(formData.total_fees || 0).toLocaleString()}
                  </span>
                </div>
                {parseFloat(formData.scholarship) > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Scholarship:</span>
                      <span>
                        - PKR{" "}
                        {parseFloat(formData.scholarship).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-teal-200 my-1"></div>
                    <div className="flex justify-between font-bold">
                      <span>Final Fees to Pay:</span>
                      <span className="text-teal-700">
                        PKR {finalFees.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
                {parseFloat(formData.scholarship) === 0 &&
                  parseFloat(formData.total_fees) > 0 && (
                    <div className="flex justify-between font-bold">
                      <span>Amount to Pay:</span>
                      <span className="text-teal-700">
                        PKR {finalFees.toLocaleString()}
                      </span>
                    </div>
                  )}
              </div>
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
                "Save Fees"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── ADD PAYMENT MODAL (RESPONSIVE) ─────────────────────────────────────────
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

  // Generate reference number when modal opens or mode changes
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

  // Auto-generate reference when modal opens or mode changes to cash
  useEffect(() => {
    if (formData.mode === "cash") {
      setFormData((prev) => ({
        ...prev,
        reference_no: generateReferenceNo(),
        transaction_id: generateTransactionId(),
      }));
    } else {
      // Clear for online mode (student will provide their own)
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
          payment_type: formData.payment_type,
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
        payment_type: "consultancy_fee",
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

  // Regenerate reference numbers manually
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
                Payment Type
              </label>
              <SearchableSelect
                name="payment_type"
                value={formData.payment_type}
                onChange={(e) =>
                  setFormData({ ...formData, payment_type: e.target.value })
                }
                options={[
                  { value: "application_fee", label: "Application Fee" },
                  { value: "tuition_deposit", label: "Tuition Deposit" },
                  { value: "visa_fee", label: "Visa Fee" },
                  { value: "consultancy_fee", label: "Consultancy Fee" },
                  { value: "other", label: "Other" },
                ]}
                placeholder="Search payment type..."
              />
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
                placeholder="Search payment mode..."
                required={true}
              />
            </div>
          </div>
          {/* Reference fields - with auto-generation for cash mode */}
          <div className="grid grid-cols-2 gap-3">
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

          {/* Preview for cash mode */}

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

function StudentDetailsPanel({
  student,
  onClose,
  onSetFees,
  onAddPayment,
  onRefresh,
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

  // Calculate totals using final_fees (after scholarship)
  const totalFeesNet = student.final_fees || student.total_fees || 0;
  const totalPaid = parseFloat(student.total_paid) || 0;
  const remainingAmount = student.remaining_amount ?? totalFeesNet - totalPaid;

  // Determine overall payment status
  const overallStatus = remainingAmount <= 0 ? "Complete" : "In Progress";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {student.student_name}
            </h3>
            <p className="text-sm text-gray-500">{student.student_email}</p>
            <p className="text-xs text-gray-400 mt-1">
              {student.university_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Payment Summary - with overall status badge */}
        {totalFeesNet > 0 ? (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-700 text-sm">
                Payment Summary
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  overallStatus === "Complete"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {overallStatus}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Total Fees (after scholarship):
                </span>
                <span className="font-semibold">
                  PKR {totalFeesNet.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Paid:</span>
                <span className="font-semibold text-green-600">
                  PKR {totalPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm text-gray-600">Remaining:</span>
                <span className="font-semibold text-amber-600">
                  PKR {remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(totalPaid / totalFeesNet) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <AlertCircle size={20} className="text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-amber-700">
              Fees not set yet
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Please set the total fees using the "Set Fees" button above.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Show only if fees are NOT set */}
          {totalFeesNet <= 0 && (
            <button
              onClick={() => onSetFees(student)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
            >
              Set Fees
            </button>
          )}

          <button
            onClick={() => onAddPayment(student)}
            className={`px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 ${
              totalFeesNet <= 0 ? "flex-1" : "w-full"
            }`}
          >
            Add Payment
          </button>
        </div>

        {/* Payment History */}
        <div>
          <h4 className="font-semibold text-gray-700 text-sm mb-3">
            Payment History
          </h4>
          {loading ? (
            <div className="text-center py-4">
              <Loader size={20} className="animate-spin mx-auto" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">
              No payments yet
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {payments.map((payment) => (
                <div key={payment.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        PKR {parseFloat(payment.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(payment.paid_at)}
                      </p>
                    </div>
                  </div>
                  {payment.notes && (
                    <p className="text-xs text-gray-500 mt-1">
                      Note: {payment.notes}
                    </p>
                  )}
                  {payment.reference_no && (
                    <p className="text-xs text-gray-400 mt-1">
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

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function AdminPayments() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showFeesModal, setShowFeesModal] = useState(false);
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

    // Realtime update selected student
    if (selectedStudent) {
      try {
        const res = await fetch(
          `${BASE_URL}/admin/payments/offer-letter-students`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        const data = await res.json();

        const updatedStudent = data.find((s) => s.id === selectedStudent.id);

        if (updatedStudent) {
          setSelectedStudent(updatedStudent);
        }
      } catch (err) {
        console.error("Failed to refresh selected student", err);
        toast.error("Failed to refresh selected student", {
          toastId: "refresh-selected-student-error",
        });
      }
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.university_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const completedApplicationsCount = students.filter(
    (s) => s.payment_status === "completed" && s.total_fees > 0,
  ).length;

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-[#009E99] text-white rounded-2xl p-6 shadow-xl">
          <h1 className="text-xl md:text-2xl font-bold">Payment Management</h1>
          <p className="text-blue-200 text-sm mt-1">
            Manage student payments, set fees, and verify transactions
          </p>
        </div>
      </div>

      {/* Summary Cards - Responsive Grid */}
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
          <p className="text-xs text-gray-400">Offer Letter Students</p>
          <p className="text-xl font-bold text-purple-600">{students.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("students");
            setSelectedStudent(null);
          }}
          className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap ${
            activeTab === "students"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-teal-300"
          }`}
        >
          📋 Offer Letter Students ({students.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("pending");

            setSelectedStudent(null);
          }}
          className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap flex items-center gap-2 ${
            activeTab === "pending"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-teal-300"
          }`}
        >
          ⏳ Pending ({pendingVerifications.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("payments");
            setSelectedStudent(null);
          }}
          className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap ${
            activeTab === "payments"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-teal-300"
          }`}
        >
          📜 All Payments ({payments.length})
        </button>
      </div>

      {/* Main Content Area with Student Sidebar */}
      {activeTab === "students" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={preventLeadingSpace.onKeyDown}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-teal-400"
                  />
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No students found
                  </div>
                ) : (
                  filteredStudents.map((student) => {
                    // Compute overall payment status on frontend for reliability
                    const totalFees = student.total_fees || 0;
                    const remaining =
                      student.remaining_amount ??
                      totalFees - (student.total_paid || 0);
                    let statusText = "In Progress";
                    let statusClass = "bg-amber-100 text-amber-700";

                    if (totalFees === 0) {
                      statusText = "Fees not set";
                      statusClass = "bg-gray-100 text-gray-600";
                    } else if (remaining <= 0) {
                      statusText = "Complete";
                      statusClass = "bg-green-100 text-green-700";
                    } else {
                      statusText = "In Progress";
                      statusClass = "bg-amber-100 text-amber-700";
                    }

                    return (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                          selectedStudent?.id === student.id
                            ? "bg-teal-50 border-l-4 border-l-teal-500"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {student.student_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.student_email}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {student.university_name}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${statusClass}`}
                          >
                            {statusText}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                          {totalFees > 0 ? (
                            <>
                              <span className="text-green-600">
                                Paid: PKR{" "}
                                {(student.total_paid || 0).toLocaleString()}
                              </span>
                              <span className="text-amber-600">
                                Remaining: PKR{" "}
                                {(remaining > 0
                                  ? remaining
                                  : 0
                                ).toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">
                              Fees not set
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Student Details - Right Panel */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <StudentDetailsPanel
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
                onSetFees={(student) => {
                  setSelectedStudent(student);
                  setShowFeesModal(true);
                }}
                onAddPayment={(student) => {
                  setSelectedStudent(student);
                  setShowPaymentModal(true);
                }}
                onRefresh={handleSuccess}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <Users size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-semibold">Select a student</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click on a student from the list to view details
                </p>
              </div>
            )}
          </div>
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

      <VerifyPaymentModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onSuccess={handleSuccess}
        payment={selectedPayment}
      />
    </div>
  );
}
