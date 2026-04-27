import React from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";

import {
  CheckCircle,
  Clock,
  Calendar,
  User,
  CreditCard,
  Download,
  Eye,
  DollarSign,
} from "lucide-react";

export const StudentPayment = () => {
  const handlePayNow = () => {
    toast.success("Redirecting to payment gateway...");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-3 font-sans text-slate-700">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <StatCard
          icon={<CheckCircle className="text-green-500" />}
          label="Total Paid"
          value="$850"
        />
        <StatCard
          icon={<Clock className="text-yellow-500" />}
          label="Pending Amount"
          value="$6,200"
          valueColor="text-yellow-600"
        />
        <StatCard
          icon={<Calendar className="text-teal-500" />}
          label="Next Due Date"
          value="Apr 25, 2026"
        />
      </div>

      {/* Receiver Details Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-gray-100 p-3 rounded-full">
            <User className="text-gray-400 w-6 h-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 w-full">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">
                Receiver's Bank Account Details
              </h3>
              <p className="text-sm">
                <span className="font-semibold">Bank Name:</span> Standard
                Global Bank
              </p>
              <p className="text-sm">
                <span className="font-semibold">Account Name:</span> Educatia
                Limited
              </p>
            </div>
            <div className="md:mt-3">
              <p className="text-sm">
                <span className="font-semibold">Account Number:</span>{" "}
                0987-6543-2109-8765
              </p>
              <p className="text-sm">
                <span className="font-semibold">SWIFT/BIC Code:</span> SGLOBKXX
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-3 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-lg">
            <DollarSign className="text-teal-600" />
          </div>
          <div>
            <h4 className="font-bold text-teal-900">Payment Due</h4>
            <p className="text-sm text-teal-700">
              Tuition Deposit - $5,000 due by Apr 25, 2026
            </p>
          </div>
        </div>
        <button
          onClick={handlePayNow}
          className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <CreditCard size={18} /> Pay Now
        </button>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <h3 className="font-bold text-lg">Payment History</h3>
          <button className="text-sm border border-gray-200 px-4 py-1.5 rounded-md flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Download size={16} /> Download All
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          <HistoryRow
            title="Application Processing Fee"
            id="INV-001"
            due="Mar 1, 2026"
            paid="Feb 28, 2026"
            method="Credit Card"
            amount="500"
            status="Paid"
          />
          <HistoryRow
            title="Document Verification Fee"
            id="INV-002"
            due="Mar 15, 2026"
            paid="Mar 12, 2026"
            method="Bank Transfer"
            amount="350"
            status="Paid"
          />
          <HistoryRow
            title="Tuition Deposit"
            id="INV-003"
            due="Apr 25, 2026"
            amount="5,000"
            status="Pending"
          />
        </div>
      </div>
    </div>
  );
};

// Sub-component for Stats
const StatCard = ({ icon, label, value, valueColor = "text-gray-800" }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
    <div className="bg-white p-2 rounded-lg shadow-inner border border-gray-50">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  </div>
);

// Sub-component for Table Rows
const HistoryRow = ({ title, id, due, paid, method, amount, status }) => (
  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors group">
    <div className="flex items-start gap-3">
      <div
        className={`mt-1 ${status === "Paid" ? "text-green-500" : "text-yellow-500"}`}
      >
        {status === "Paid" ? (
          <CheckCircle
            size={20}
            fill="currentColor"
            className="text-white bg-green-500 rounded-full"
          />
        ) : (
          <Clock size={20} />
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <span className="text-xs text-gray-400 font-mono">{id}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-2">
          <span>Due: {due}</span>
          {paid && <span>• Paid: {paid}</span>}
          {method && <span>• {method}</span>}
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between md:justify-end gap-3 mt-3 md:mt-0">
      <div className="text-right">
        <p className="font-bold text-gray-800">${amount}</p>
        <span
          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
        >
          {status}
        </span>
      </div>
      <div className="flex items-center gap-3 text-gray-400">
        <button className="hover:text-teal-600 transition-colors">
          <Eye size={18} />
        </button>
        <button className="hover:text-teal-600 transition-colors">
          <Download size={18} />
        </button>
      </div>
    </div>
  </div>
);
