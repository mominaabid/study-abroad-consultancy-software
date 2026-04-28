import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";
import {
  Search,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  User,
  Users,
  FolderOpen,
  Building,
  GraduationCap,
  Calendar,
  MapPin,
} from "lucide-react";

// Create axios instance with token interceptor
const api = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const CounsellorApplication = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    inquiry: 0,
    evaluation: 0,
    applicationSubmitted: 0,
    offerLetterReceived: 0,
    offerLetterNotReceived: 0,
    visaFiled: 0,
    approved: 0,
    reject: 0,
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/counsellor/applications/students");
      if (response.data.success) {
        setStudents(response.data.students);
        calculateStats(response.data.students);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      } else {
        toast.error(
          error.response?.data?.message || "Failed to fetch students",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentApplications = async (studentId) => {
    try {
      setLoading(true);
      console.log("Fetching applications for student:", studentId);
      const response = await api.get(
        `/counsellor/applications/student/${studentId}`,
      );

      console.log("Full API Response:", response.data);

      if (response.data.success) {
        console.log("Applications received:", response.data.applications);
        console.log("Applications count:", response.data.applications?.length);

        let applicationsArray = [];

        if (
          response.data.applications &&
          Array.isArray(response.data.applications)
        ) {
          applicationsArray = response.data.applications;
          console.log(
            "Using applications array, length:",
            applicationsArray.length,
          );
        } else if (Array.isArray(response.data)) {
          applicationsArray = response.data;
          console.log(
            "Using response data as array, length:",
            applicationsArray.length,
          );
        } else {
          console.log("No applications found in response");
        }

        setApplications(applicationsArray);
        setSelectedStudent(students.find((s) => s._id === studentId));

        if (applicationsArray.length === 0) {
          toast.info("No applications found for this student");
        }
      } else {
        toast.error(response.data.message || "Failed to fetch applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch student applications",
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (studentsData) => {
    let counts = {
      inquiry: 0,
      evaluation: 0,
      applicationSubmitted: 0,
      offerLetterReceived: 0,
      offerLetterNotReceived: 0,
      visaFiled: 0,
      approved: 0,
      reject: 0,
    };

    studentsData.forEach((student) => {
      student.applications?.forEach((app) => {
        const statusMap = {
          "inquiry": "inquiry",
          "evaluation": "evaluation",
          "application submitted": "applicationSubmitted",
          "offer letter received": "offerLetterReceived",
          "offer letter not received": "offerLetterNotReceived",
          "visa filed": "visaFiled",
          "approved": "approved",
          "reject": "reject",
        };
        const mappedStatus = statusMap[app.status];
        if (mappedStatus && counts[mappedStatus] !== undefined) {
          counts[mappedStatus]++;
        }
      });
    });

    setStats({ totalStudents: studentsData.length, ...counts });
  };

  const updateApplicationStatus = async (applicationId, status, notes = "") => {
    try {
      setLoading(true);
      const response = await api.put(
        `/counsellor/applications/${applicationId}/status`,
        { status, counsellor_notes: notes },
      );

      if (response.data.success) {
        toast.success(`Application status updated to ${status}`);
        if (selectedStudent) {
          await fetchStudentApplications(selectedStudent._id);
        }
        await fetchStudents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      "inquiry": "bg-gray-100 text-gray-700 border-gray-200",
      "evaluation": "bg-amber-100 text-amber-700 border-amber-200",
      "application submitted": "bg-blue-100 text-blue-700 border-blue-200",
      "offer letter received": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "offer letter not received": "bg-orange-100 text-orange-700 border-orange-200",
      "visa filed": "bg-purple-100 text-purple-700 border-purple-200",
      "approved": "bg-green-100 text-green-700 border-green-200",
      "reject": "bg-rose-100 text-rose-700 border-rose-200",
    };
    
    const displayStatus = {
      "inquiry": "Inquiry",
      "evaluation": "Evaluation",
      "application submitted": "App Submitted",
      "offer letter received": "Offer Received",
      "offer letter not received": "Offer Not Received",
      "visa filed": "Visa Filed",
      "approved": "Approved",
      "reject": "Rejected",
    };
    
    return (
      <span
        className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${configs[status] || "bg-gray-100"}`}
      >
        {displayStatus[status] || status}
      </span>
    );
  };

  // Get next status options based on current status
  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      "inquiry": [{ value: "evaluation", label: "Move to Evaluation", color: "amber" }],
      "evaluation": [{ value: "application submitted", label: "Mark as Application Submitted", color: "blue" }],
      "application submitted": [
        { value: "offer letter received", label: "Offer Letter Received", color: "emerald" },
        { value: "offer letter not received", label: "Offer Letter Not Received", color: "orange" }
      ],
      "offer letter received": [{ value: "visa filed", label: "Visa Filed", color: "purple" }],
      "offer letter not received": [
        { value: "application submitted", label: "Resubmit Application", color: "blue" },
        { value: "reject", label: "Reject Application", color: "rose" }
      ],
      "visa filed": [
        { value: "approved", label: "Visa Approved", color: "green" },
        { value: "reject", label: "Visa Rejected", color: "rose" }
      ],
      "approved": [],
      "reject": []
    };
    
    return statusFlow[currentStatus] || [];
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const [filterStatus, setFilterStatus] = useState("all");

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredApplications = applications.filter((app) =>
    filterStatus === "all" ? true : app.status === filterStatus,
  );

  return (
    <div className="p-3 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen font-sans antialiased">
      {/* Header Section */}
      <div className="mb-3">
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-teal-900 text-white rounded-xl p-7 shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative">
            <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-1">
              Application Management
            </p>
            <h1 className="text-2xl font-bold">Applications Console</h1>
            <p className="text-blue-200 text-sm mt-1">
              Manage student applications and track progress
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 mb-3">
        {[
          { label: "Total Students", val: stats.totalStudents, color: "text-gray-900", bg: "bg-white", icon: Users },
          { label: "Inquiry", val: stats.inquiry, color: "text-gray-600", bg: "bg-gray-50", icon: Clock },
          { label: "Evaluation", val: stats.evaluation, color: "text-amber-600", bg: "bg-amber-50", icon: Eye },
          { label: "App Submitted", val: stats.applicationSubmitted, color: "text-blue-600", bg: "bg-blue-50", icon: FileText },
          { label: "Offer Received", val: stats.offerLetterReceived, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
          { label: "Offer Not Received", val: stats.offerLetterNotReceived, color: "text-orange-600", bg: "bg-orange-50", icon: AlertCircle },
          { label: "Visa Filed", val: stats.visaFiled, color: "text-purple-600", bg: "bg-purple-50", icon: FileText },
          { label: "Approved", val: stats.approved, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
          { label: "Rejected", val: stats.reject, color: "text-rose-600", bg: "bg-rose-50", icon: AlertCircle },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`${item.bg} rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase font-semibold text-gray-500">
                  {item.label}
                </div>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.val}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none w-full transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-3 h-[calc(100vh-420px)] min-h-[600px]">
        {/* Student List Sidebar */}
        <div className="lg:w-80 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Students
            </h2>
            <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-bold">
              {filteredStudents.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && students.length === 0 ? (
              <div className="p-10 text-center animate-pulse text-gray-400 text-sm">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-3" />
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">No students found</p>
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student._id}
                  onClick={() => fetchStudentApplications(student._id)}
                  className={`p-4 cursor-pointer border-l-4 transition-all border-b border-gray-50 ${
                    selectedStudent?._id === student._id
                      ? "bg-teal-50 border-teal-500"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-800 truncate">
                    {student.name || "Unnamed Student"}
                  </div>
                  <div className="text-xs text-gray-500 truncate mb-2">
                    {student.email}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {student.applications?.slice(0, 2).map((app, idx) => (
                      <div key={idx} className="scale-90 origin-left">
                        {getStatusBadge(app.status)}
                      </div>
                    ))}
                    {student.applications?.length > 2 && (
                      <span className="text-[10px] text-gray-400">
                        +{student.applications.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Applications Table */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
            <div>
              <h2 className="text-md font-bold text-gray-800">
                {selectedStudent
                  ? `${selectedStudent.name}'s Applications`
                  : "Select a Student"}
              </h2>
              {selectedStudent && (
                <p className="text-xs text-gray-500">{selectedStudent.email}</p>
              )}
            </div>

            {selectedStudent && (
              <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg gap-1">
                {[
                  "all",
                  "inquiry",
                  "evaluation",
                  "application submitted",
                  "offer letter received",
                  "offer letter not received",
                  "visa filed",
                  "approved",
                  "reject",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab === "all" ? "all" : tab)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      filterStatus === (tab === "all" ? "all" : tab)
                        ? "bg-white text-teal-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "all" ? "All" : getStatusBadge(tab).props.children}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            {!selectedStudent ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-16 h-16 mb-3 opacity-20" />
                <p className="text-sm font-medium">No Student Selected</p>
                <p className="text-xs mt-1">
                  Choose a student from the sidebar to view their applications
                </p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FolderOpen className="w-16 h-16 mb-3 opacity-20" />
                <p className="text-sm font-medium">No Applications Found</p>
                <p className="text-xs mt-1">
                  This student hasn't submitted any applications yet
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      University / Course
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Academic Info
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map((app) => {
                    const nextOptions = getNextStatusOptions(app.status);
                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building className="w-3.5 h-3.5 text-teal-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {app.target_university || "Not specified"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {app.course || "Course not specified"}
                              </span>
                            </div>
                            {app.target_country && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {app.target_country}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-gray-900">
                              {app.full_name || selectedStudent?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {app.email || selectedStudent?.email}
                            </div>
                            {app.phone && (
                              <div className="text-xs text-gray-500">
                                {app.phone}
                              </div>
                            )}
                            {app.cnic && (
                              <div className="text-xs text-gray-400">
                                CNIC: {app.cnic}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1 text-xs">
                            {app.last_degree && (
                              <div className="text-gray-700">
                                <span className="font-medium">Degree:</span>{" "}
                                {app.last_degree}
                              </div>
                            )}
                            {app.cgpa && (
                              <div className="text-gray-700">
                                <span className="font-medium">CGPA:</span>{" "}
                                {app.cgpa}
                              </div>
                            )}
                            {app.english_test && (
                              <div className="text-gray-700">
                                <span className="font-medium">
                                  {app.english_test}:
                                </span>{" "}
                                {app.test_score || "N/A"}
                              </div>
                            )}
                            {app.passing_year && (
                              <div className="text-gray-500">
                                Passed: {app.passing_year}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-2">
                            {getStatusBadge(app.status)}
                            {app.counselor_notes && app.status === "reject" && (
                              <div className="max-w-[200px]">
                                <div className="text-[10px] text-rose-600 bg-rose-50 p-1.5 rounded">
                                  {app.counselor_notes}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {app.deadline && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(app.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {app.round && (
                            <div className="text-xs text-gray-400 mt-1">
                              Round: {app.round}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            {nextOptions.length > 0 ? (
                              nextOptions.map((option) => {
                                const colorClasses = {
                                  amber: "bg-amber-600 hover:bg-amber-700",
                                  blue: "bg-blue-600 hover:bg-blue-700",
                                  emerald: "bg-emerald-600 hover:bg-emerald-700",
                                  orange: "bg-orange-600 hover:bg-orange-700",
                                  purple: "bg-purple-600 hover:bg-purple-700",
                                  green: "bg-green-600 hover:bg-green-700",
                                  rose: "bg-rose-600 hover:bg-rose-700",
                                };
                                return (
                                  <button
                                    key={option.value}
                                    onClick={() => {
                                      if (option.value === "reject") {
                                        const note = prompt("Reason for rejection:");
                                        if (note)
                                          updateApplicationStatus(
                                            app.id,
                                            option.value,
                                            note,
                                          );
                                      } else {
                                        updateApplicationStatus(app.id, option.value);
                                      }
                                    }}
                                    className={`${colorClasses[option.color]} text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition whitespace-nowrap`}
                                  >
                                    {option.label}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="text-xs text-gray-400">
                                {app.status === "approved" ? "✓ Completed" : "✗ Closed"}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};