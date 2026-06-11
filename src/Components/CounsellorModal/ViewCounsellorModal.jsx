import React from "react";
import {
  X,
  Mail,
  Phone,
  Briefcase,
  User,
  CreditCard,
  MapPin,
  TrendingUp,
  Users,
  XCircleIcon,
} from "lucide-react";
import { Title } from "../Title";
import { CancelButton } from "../../Components/CustomButtons/CancelButton";


export const ViewCounsellorModal = ({ isOpen, onClose, counselor }) => {
  if (!isOpen || !counselor) return null;

  const detailItem = (icon, label, value) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-teal-100 transition-colors">
      <div className="text-teal-600 bg-teal-50 p-2 rounded-lg">{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
          {label}
        </p>
        <p className="text-sm text-slate-800 font-medium truncate">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <Title setModal={onClose}>View Counselor Details</Title>
        <div className="p-6">
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detailItem(
                  <User size={18} />,
                  "Father Name",
                  counselor.father_name,
                )}
                {detailItem(<CreditCard size={18} />, "CNIC", counselor.cnic)}
                {detailItem(
                  <Mail size={18} />,
                  "Email Address",
                  counselor.email,
                )}
                {detailItem(
                  <Phone size={18} />,
                  "Phone Number",
                  counselor.phone,
                )}
                <div className="sm:col-span-2">
                  {detailItem(
                    <MapPin size={18} />,
                    "Residential Address",
                    counselor.address,
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Performance Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 flex flex-col items-center justify-center text-center">
                  <Users className="text-teal-600 mb-2" size={24} />
                  <p className="text-2xl font-bold text-slate-800">
                    {counselor.assigned_leads || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    Assigned Leads
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex flex-col items-center justify-center text-center">
                  <TrendingUp className="text-orange-600 mb-2" size={24} />
                  <p className="text-2xl font-bold text-slate-800">
                    {Number(counselor.counsellingConversionRate || 0).toFixed(
                      0,
                    )}
                    %
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    Conversion Rate
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <CancelButton handleCancel={onClose} />
        </div>
      </div>
    </div>
  );
};