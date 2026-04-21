import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, MoreHorizontal } from "lucide-react";

import { ViewIcon } from "../CustomButtons/ViewIcon";
import { EditIcon } from "../CustomButtons/EditIcon";
import { DeleteIcon } from "../CustomButtons/DeleteIcon";

export const CounselorCard = ({ counselor, onEdit, onView, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { name, role, email, phone, status, assigned_leads, conversion_rate } =
    counselor;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-visible group hover:shadow-md transition-all">
      <div className="p-5 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">{name}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {role}
              </p>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-2 px-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-2">
                  <div
                    className="flex items-center justify-between hover:bg-slate-50 p-1 rounded-md transition-colors"
                    onClick={() => {
                      onView();
                      setShowMenu(false);
                    }}
                  >
                    <span className="text-sm text-slate-600">View</span>
                    <ViewIcon handleView={onView} />
                  </div>

                  <div
                    className="flex items-center justify-between hover:bg-slate-50 p-1 rounded-md transition-colors"
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                  >
                    <span className="text-sm text-slate-600">Edit</span>
                    <EditIcon handleUpdate={onEdit} />
                  </div>

                  <hr className="border-slate-100" />

                  <div
                    className="flex items-center justify-between hover:bg-red-50 p-1 rounded-md transition-colors"
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                  >
                    <span className="text-sm text-red-600">Delete</span>
                    <DeleteIcon handleDelete={onDelete} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
              status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="px-5 py-3 space-y-1.5 border-t border-slate-50">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Mail size={12} className="text-slate-400" />
          <span className="truncate">{email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Phone size={12} className="text-slate-400" />
          <span>{phone}</span>
        </div>
      </div>

      <div className="px-5 py-4 bg-slate-50/50 flex border-t border-slate-100 rounded-b-xl">
        <div className="flex-1 text-center border-r border-slate-200">
          <p className="text-[10px] text-slate-500 uppercase font-bold">
            Leads
          </p>
          <p className="font-bold text-slate-700">{assigned_leads || 0}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold">
            Conv.
          </p>
          <p className="font-bold text-teal-600">{conversion_rate || 0}%</p>
        </div>
      </div>
    </div>
  );
};
