import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AddApplicationModal } from "../../Components/StudentApplicationModal/AddApplicationModal";
import { EditApplicationModal } from "../../Components/StudentApplicationModal/EditApplicationModal";
import { DeleteConfirmationModal } from "../../Components/DeleteConfirmationModal";
import { BASE_URL } from "../../Content/Url";
import ActionButton from "../../Components/StudentApplicationModal/ActionButton";
import TaskCard from "../../Components/StudentApplicationModal/TaskCard";
import ApplicationDetailModal from "../../Components/StudentApplicationModal/ApplicationDetailModal";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";
import {
  User,
  FileText,
  BarChart,
  Upload,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Plus,
  RefreshCw,
  Edit,
} from "lucide-react";

const mockTasks = [
  {
    id: 1,
    title: "Personal Information",
    desc: "Personal details",
    status: "Verified",
    date: "Oct 1, 2026",
    icon: <User className="text-green-500" />,
  },
  {
    id: 2,
    title: "Academic History",
    desc: "Official transcripts",
    status: "Verified",
    date: "Oct 5, 2026",
    icon: <FileText className="text-green-500" />,
  },
  {
    id: 3,
    title: "English Proficiency Score",
    desc: "Score Report",
    status: "Verified",
    icon: <BarChart className="text-blue-500" />,
  },
  {
    id: 4,
    title: "Statement of Purpose",
    desc: "Personal statement",
    status: "Uploaded",
    icon: <FileText className="text-purple-500" />,
  },
];

const mockApplications = [
  {
    id: 1,
    universityCode: "HBS",
    target_university: "Harvard Business School",
    course: "MBA Program",
    status: "In Progress",
    deadline: "Nov 30, 2026",
    round: "1",
  },
];

export const StudentApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingApplication, setEditingApplication] = useState(null);
  const [applicationToDelete, setApplicationToDelete] = useState(null);

  const reduxUser = useSelector(selectUser);
  const [user, setUser] = useState({ name: "" });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const appsResponse = await axios.get(`${BASE_URL}/getApplications`);
      setApplications(appsResponse.data);

      if (!reduxUser) {
        const userResponse = await axios.get(`${BASE_URL}/user/profile`);
        setUser(userResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data", {
        toastId: "dashboard-load-error",
      });
      setApplications(mockApplications);
    } finally {
      setLoading(false);
    }
  }, [reduxUser]);

  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
    }
  }, [reduxUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApplicationAdded = (newApplication) => {
    setApplications([newApplication, ...applications]);
  };

  const handleApplicationUpdated = (updatedApplication) => {
    setApplications(
      applications.map((app) =>
        app.id === updatedApplication.id ? updatedApplication : app,
      ),
    );
  };

  const handleUpdateApplicationStatus = async (id, status) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/updateApplicationStatus/${id}`,
        { status },
      );
      setApplications(
        applications.map((app) => (app.id === id ? response.data : app)),
      );
      toast.success(`Application ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
    }
  };

  const handleDeleteClick = (application) => {
    setApplicationToDelete(application);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!applicationToDelete) return;
    try {
      await axios.delete(
        `${BASE_URL}/deleteApplication/${applicationToDelete.id}`,
      );
      setApplications(
        applications.filter((app) => app.id !== applicationToDelete.id),
      );
      toast.success("Application deleted successfully!");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    } finally {
      setIsDeleteModalOpen(false);
      setApplicationToDelete(null);
    }
  };

  const progressValue = 75;

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="animate-spin mx-auto mb-4 text-blue-600"
            size={40}
          />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-50 min-h-screen font-sans">
      <div className="bg-gradient-to-r from-[#e6f6f4] to-[#d1ede9] border border-[#d1ede9] rounded-2xl p-5 mb-8 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-full shadow-sm flex items-center justify-center">
            <GraduationCap className="text-[#40b3a2]" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-xl">
              Welcome back,{" "}
              <span className="text-[#40b3a2]">{user?.name || "Student"}!</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {applications.length > 0
                ? `📚 You have ${applications.length} active application${applications.length > 1 ? "s" : ""}`
                : "✨ Start your journey by creating a new application"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Plus size={18} />
          New Application
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-slate-700">
            Active Applications
          </h3>
          <button
            onClick={fetchDashboardData}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
              <GraduationCap
                className="mx-auto mb-3 text-slate-400"
                size={48}
              />
              <p className="text-slate-500">No applications yet.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first application →
              </button>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-red-700 border">
                    {app.universityCode ||
                      app.target_university?.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      {app.target_university} - {app.course}
                    </h4>
                    <div className="flex flex-wrap gap-3 text-sm mt-1">
                      <span className="text-slate-500">
                        Deadline:{" "}
                        <span className="font-medium text-slate-700">
                          {app.deadline || "Dec 31, 2026"}
                        </span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
                          app.status === "In Progress"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {app.status || "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                  >
                    Submit Application
                  </button>
                  {app.status !== "Submitted" && (
                    <>
                      <button
                        onClick={() => {
                          setEditingApplication(app);
                          setIsEditModalOpen(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(app)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-3">
          <h3 className="text-lg font-bold mb-3 text-slate-700">
            Application Task Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateStatus={() => toast.info("Task editing disabled")}
                onUploadDocument={() =>
                  toast.info("Uploads currently disabled")
                }
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-700">
                Application Progress
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {progressValue}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressValue}%` }}
              ></div>
            </div>
            <button
              className="w-full mt-4 py-3 rounded-xl font-bold text-sm bg-slate-200 text-slate-500 cursor-not-allowed"
              disabled
            >
              Submit for Review
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-3">Quick Actions</h4>
            <div className="space-y-3">
              <ActionButton
                icon={<Upload size={18} />}
                label="Upload Extra Documents"
                onClick={() => {}}
              />
              <ActionButton
                icon={<Calendar size={18} />}
                label="Schedule Counselor Call"
                onClick={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplicationAdded={handleApplicationAdded}
      />
      {editingApplication && (
        <EditApplicationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          application={editingApplication}
          onApplicationUpdated={handleApplicationUpdated}
        />
      )}
      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleUpdateApplicationStatus}
        />
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Application"
        message={`Are you sure you want to delete the application for ${applicationToDelete?.target_university}?`}
      />
    </div>
  );
};
