import React from "react";
import {
  Users,
  UserCheck,
  DollarSign,
  FileText,
  Plus,
  Mail,
  Upload,
  Calendar,
  MessageSquare,
  Briefcase,
} from "lucide-react";

export const MainContent = () => {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Leads"
          value="1,284"
          change="+12.5%"
          icon={<Users className="text-teal-600" />}
        />
        <StatCard
          title="Active Students"
          value="847"
          change="+8.2%"
          icon={<UserCheck className="text-green-600" />}
        />
        <StatCard
          title="Monthly Revenue"
          value="$127,500"
          change="+23.1%"
          icon={<DollarSign className="text-emerald-600" />}
        />
        <StatCard
          title="Applications"
          value="156"
          change="-3.2%"
          isNegative
          icon={<FileText className="text-orange-600" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Lead Funnel</h3>
          <div className="space-y-3">
            <ProgressBar label="New" width="100%" />
            <ProgressBar label="Contacted" width="75%" />
            <ProgressBar label="Counseling" width="50%" />
            <ProgressBar label="Evaluated" width="35%" />
            <ProgressBar label="Converted" width="20%" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <h3 className="font-bold text-gray-800 mb-2">Revenue Overview</h3>
          <div className="h-40 bg-gradient-to-t from-gray-50 to-white flex items-end">
            {/* Simple SVG Area Chart Mockup */}
            <svg
              className="w-full h-full text-gray-300"
              viewBox="0 0 400 100"
              preserveAspectRatio="none"
            >
              <path
                d="M0,80 Q50,70 100,50 T200,40 T300,20 T400,10 V100 H0 Z"
                fill="currentColor"
                opacity="0.2"
              />
              <path
                d="M0,80 Q50,70 100,50 T200,40 T300,20 T400,10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Section: Table & Sidebars */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table Section */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Leads</h3>
            <button className="text-sm text-blue-600 hover:underline">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Country</th>
                  <th className="p-4 font-medium">Program</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <TableRow
                  name="Maria Santos"
                  email="m.santos@email.com"
                  country="Brazil"
                  program="MBA"
                  status="New"
                  color="bg-blue-100 text-blue-700"
                  assigned="Unassigned"
                />
                <TableRow
                  name="Ahmed Hassan"
                  email="ahmed.h@email.com"
                  country="Egypt"
                  program="CS"
                  status="Counseling"
                  color="bg-purple-100 text-purple-700"
                  assigned="Sarah Johnson"
                />
                <TableRow
                  name="Chen Wei"
                  email="chen.w@email.com"
                  country="China"
                  program="Engineering"
                  status="Evaluated"
                  color="bg-orange-100 text-orange-700"
                  assigned="Michael Chen"
                />
                <TableRow
                  name="Priya Sharma"
                  email="priya.s@email.com"
                  country="India"
                  program="Data Science"
                  status="Contacted"
                  color="bg-yellow-100 text-yellow-700"
                  assigned="Sarah Johnson"
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Quick Actions & Activity */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                icon={<Plus size={18} />}
                label="Add Lead"
                color="bg-teal-500"
              />
              <ActionButton
                icon={<Briefcase size={18} />}
                label="Create App"
                color="bg-blue-600"
              />
              <ActionButton
                icon={<Mail size={18} />}
                label="Bulk Email"
                color="bg-orange-500"
              />
              <ActionButton
                icon={<Calendar size={18} />}
                label="Meeting"
                color="bg-green-500"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-gray-800">Live Activity</h3>
              <span className="flex items-center text-[10px] text-green-500 uppercase font-bold tracking-wider">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>{" "}
                Real-time
              </span>
            </div>
            <div className="space-y-4">
              <ActivityItem
                title="New lead received"
                desc="Maria Santos submitted inquiry"
                time="2 min ago"
              />
              <ActivityItem
                title="Application approved"
                desc="James Wilson moved to Visa Processing"
                time="15 min ago"
              />
              <ActivityItem
                title="Payment received"
                desc="$3,500 tuition from Chen Wei"
                time="1 hour ago"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

/* Sub-components for cleaner structure */

const StatCard = ({ title, value, change, icon, isNegative }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
      <p
        className={`text-xs mt-1 font-bold ${isNegative ? "text-red-500" : "text-green-500"}`}
      >
        {isNegative ? "↘" : "↗"} {change}{" "}
        <span className="text-gray-400 font-normal">vs last month</span>
      </p>
    </div>
    <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
  </div>
);

const ProgressBar = ({ label, width }) => (
  <div>
    <div className="flex justify-between text-xs mb-1 text-gray-600 font-medium">
      <span>{label}</span>
    </div>
    <div className="w-full bg-gray-100 h-6 rounded">
      {/* Updated background color here */}
      <div
        className="h-full rounded"
        style={{ width, backgroundColor: "#009E99" }}
      ></div>
    </div>
  </div>
);

const TableRow = ({
  name,
  email,
  country,
  program,
  status,
  color,
  assigned,
}) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="p-4">
      <p className="font-bold text-sm text-gray-800">{name}</p>
      <p className="text-xs text-gray-400">{email}</p>
    </td>
    <td className="p-4 text-sm text-gray-600">{country}</td>
    <td className="p-4 text-sm text-gray-600">{program}</td>
    <td className="p-4">
      <span
        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${color}`}
      >
        {status}
      </span>
    </td>
    <td className="p-4 text-sm text-gray-600">{assigned}</td>
  </tr>
);

const ActionButton = ({ icon, label, color }) => (
  <button
    className={`${color} text-white p-3 rounded-lg flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-opacity`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const ActivityItem = ({ title, desc, time }) => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
    </div>
    <div>
      <p className="text-sm font-bold text-gray-800">{title}</p>
      <p className="text-xs text-gray-500">{desc}</p>
      <p className="text-[10px] text-gray-400 mt-1 uppercase">{time}</p>
    </div>
  </div>
);
