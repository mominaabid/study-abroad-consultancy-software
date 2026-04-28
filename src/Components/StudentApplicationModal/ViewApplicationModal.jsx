import React from "react";

import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  Clock,
  FileText,
  CreditCard,
  Globe,
  Flag,
  Award,
  Briefcase,
  Home,
  CheckCircle2,
  Clock as ClockIcon,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { BASE_URL } from "../../Content/Url";

// Info Section Component - moved outside render
const InfoSection = ({
  title,
  icon: IconComponent,
  children,
  className = "",
}) => (
  <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      {IconComponent && <IconComponent size={18} className="text-gray-600" />}
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

// Info Row Component - moved outside render
const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-2 text-sm">
    {Icon && <Icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />}
    <span className="text-gray-500 min-w-[120px]">{label}:</span>
    <span className="text-gray-700 font-medium flex-1">{value || "—"}</span>
  </div>
);

// Helper function to get status badge color
const getStatusBadgeColor = (status) => {
  const colors = {
    inquiry: "bg-blue-100 text-blue-800",
    evaluation: "bg-purple-100 text-purple-800",
    "application submitted": "bg-indigo-100 text-indigo-800",
    "offer letter received": "bg-green-100 text-green-800",
    "offer letter not received": "bg-yellow-100 text-yellow-800",
    "visa filed": "bg-orange-100 text-orange-800",
    approved: "bg-emerald-100 text-emerald-800",
    reject: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format date and time for display
const formatDateTime = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return null;
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  } catch (error) {
    console.error("Error formatting date:", error);
    return null;
  }
};

// Helper component for BarChart icon
const BarChart = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

// Application Stages for Vertical Stepper - with date fields
const applicationStages = [
  {
    id: "inquiry",
    label: "Inquiry",
    description: "Initial application inquiry received",
    icon: Clock,
    color: "blue",
    dateField: "inquiry_date",
  },
  {
    id: "evaluation",
    label: "Evaluation",
    description: "Application under review",
    icon: FileText,
    color: "purple",
    dateField: "evaluation_date",
  },
  {
    id: "application submitted",
    label: "Application Submitted",
    description: "Application sent to university",
    icon: CheckCircle,
    color: "indigo",
    dateField: "application_submitted_date",
  },
  {
    id: "offer letter received",
    label: "Offer Letter Received",
    description: "Offer received",
    icon: Award,
    color: "green",
    dateField: "offer_received_date",
  },
  {
    id: "offer letter not received",
    label: "Offer Not Received",
    description: "Application rejected",
    icon: XCircle,
    color: "red",
    dateField: "offer_not_received_date",
  },
  {
    id: "visa filed",
    label: "Visa Filed",
    description: "Visa application submitted",
    icon: Globe,
    color: "orange",
    dateField: "visa_filed_date",
  },
  {
    id: "approved",
    label: "Approved",
    description: "Visa approved - Ready to travel",
    icon: CheckCircle2,
    color: "emerald",
    dateField: "approved_date",
  },
  {
    id: "reject",
    label: "Rejected",
    description: "Visa rejected",
    icon: XCircle,
    color: "red",
    dateField: "reject_date",
  },
];

export const ViewApplicationModal = ({ application, onClose }) => {
  if (!application) return null;

  // Find current stage index
  const currentStageIndex = applicationStages.findIndex(
    (s) => s.id === application.status,
  );

  // Get stages that have been reached (including current stage)
  const reachedStages = applicationStages.filter(
    (_, index) => index <= currentStageIndex,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Application Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    {application.target_university || "University Application"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusBadgeColor(application.status)}`}
                >
                  {application.status?.toUpperCase() || "INQUIRY"}
                </span>
                {application.deadline && (
                  <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold">
                    Deadline: {application.deadline}
                  </span>
                )}
                {application.round && (
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold">
                    Round {application.round}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Application Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Personal Information */}
              <InfoSection title="Personal Information" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoRow
                    label="Full Name"
                    value={application.full_name}
                    icon={User}
                  />
                  <InfoRow
                    label="Email"
                    value={application.email}
                    icon={Mail}
                  />
                  <InfoRow
                    label="Phone"
                    value={application.phone}
                    icon={Phone}
                  />
                  <InfoRow
                    label="Gender"
                    value={application.gender}
                    icon={User}
                  />
                  <InfoRow
                    label="Date of Birth"
                    value={formatDate(application.dob)}
                    icon={Calendar}
                  />
                  <InfoRow
                    label="Age"
                    value={application.age ? `${application.age} years` : "—"}
                    icon={Clock}
                  />
                  <InfoRow
                    label="CNIC"
                    value={application.cnic}
                    icon={CreditCard}
                  />
                  <InfoRow
                    label="Passport Number"
                    value={application.passport_number}
                    icon={Globe}
                  />
                  <InfoRow
                    label="Nationality"
                    value={application.nationality}
                    icon={Flag}
                  />
                </div>
                {application.profile_picture && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        Profile Picture:
                      </span>
                      <a
                        href={`${BASE_URL}${application.profile_picture}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Photo
                      </a>
                    </div>
                  </div>
                )}
              </InfoSection>

              {/* Academic Information */}
              <InfoSection title="Academic Information" icon={GraduationCap}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoRow
                    label="Last Degree"
                    value={application.last_degree}
                    icon={BookOpen}
                  />
                  <InfoRow
                    label="Institute"
                    value={application.institute}
                    icon={Home}
                  />
                  <InfoRow
                    label="CGPA/Percentage"
                    value={application.cgpa}
                    icon={Award}
                  />
                  <InfoRow
                    label="Passing Year"
                    value={application.passing_year}
                    icon={Calendar}
                  />
                  <InfoRow
                    label="English Test"
                    value={application.english_test}
                    icon={FileText}
                  />
                  <InfoRow
                    label="Test Score"
                    value={application.test_score}
                    icon={BarChart}
                  />
                </div>
              </InfoSection>

              {/* Application Details */}
              <InfoSection title="Application Details" icon={Briefcase}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoRow
                    label="Target Country"
                    value={application.target_country}
                    icon={MapPin}
                  />
                  <InfoRow
                    label="Target University"
                    value={application.target_university}
                    icon={GraduationCap}
                  />
                  <InfoRow
                    label="Proposed Course"
                    value={application.course}
                    icon={BookOpen}
                  />
                  <InfoRow
                    label="Deadline"
                    value={application.deadline}
                    icon={Calendar}
                  />
                  <InfoRow
                    label="Round"
                    value={application.round}
                    icon={ClockIcon}
                  />
                </div>
                {application.counselor_notes && (
                  <div className="mt-3 pt-3 border-t">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Counselor Notes
                    </label>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                      {application.counselor_notes}
                    </p>
                  </div>
                )}
              </InfoSection>
            </div>

            {/* Right Column - Vertical Stepper */}
            <div className="space-y-4">
              {/* Application Status Vertical Stepper */}
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600" />
                  Application Progress
                </h3>

                <div className="relative">
                  <div className="space-y-0">
                    {reachedStages.map((stage, index) => {
                      const isCompleted = currentStageIndex > index;
                      const isCurrent = stage.id === application.status;
                      const StageIcon = stage.icon;

                      // Get date and time for this stage
                      const stageDate = application[stage.dateField];
                      const dateTime = stageDate
                        ? formatDateTime(stageDate)
                        : null;

                      return (
                        <div key={stage.id} className="relative">
                          {/* Connector Line */}
                          {index < reachedStages.length - 1 && (
                            <div
                              className={`absolute left-4 top-8 w-0.5 ${
                                isCompleted ? "bg-green-500" : "bg-blue-400"
                              }`}
                              style={{ height: "calc(100% - 1rem)" }}
                            />
                          )}

                          {/* Stage Item */}
                          <div className="flex items-start gap-3 mb-4 relative">
                            <div className="relative z-10">
                              <div
                                className={`
                                  w-8 h-8 rounded-full flex items-center justify-center
                                  ${
                                    isCompleted
                                      ? "bg-green-500"
                                      : isCurrent
                                        ? "bg-blue-500 ring-4 ring-blue-100"
                                        : "bg-gray-300"
                                  }
                                  transition-all duration-300
                                `}
                              >
                                {isCompleted ? (
                                  <CheckCircle2
                                    size={16}
                                    className="text-white"
                                  />
                                ) : (
                                  <StageIcon size={16} className="text-white" />
                                )}
                              </div>
                            </div>

                            <div className="flex-1 pb-3">
                              <div className="flex items-center justify-between">
                                <h4
                                  className={`font-semibold text-sm ${
                                    isCompleted
                                      ? "text-green-700"
                                      : isCurrent
                                        ? "text-blue-700"
                                        : "text-gray-500"
                                  }`}
                                >
                                  {stage.label}
                                </h4>
                                {isCurrent && !isCompleted && (
                                  <span className="text-xs text-blue-600 animate-pulse">
                                    In Progress
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="text-xs text-green-600">
                                    Completed
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-gray-500 mt-0.5">
                                {stage.description}
                              </p>

                              {/* Show Date and Time if available */}
                              {dateTime && (
                                <div className="flex items-center gap-2 mt-2 text-xs bg-gray-50 p-1.5 rounded-md">
                                  <Calendar
                                    size={12}
                                    className="text-gray-400"
                                  />
                                  <span className="text-gray-600">
                                    {dateTime.date}
                                  </span>
                                  <Clock
                                    size={12}
                                    className="text-gray-400 ml-1"
                                  />
                                  <span className="text-gray-600 font-medium">
                                    {dateTime.time}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          <div>
            {application.deadline && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                Application Deadline: {application.deadline}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
