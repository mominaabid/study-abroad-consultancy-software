// src/components/counsellor/CounsellorApplication.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/Url";
import {
  User,
  FileText,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Building,
  MapPin,
  Calendar,
  Upload,
  RefreshCw,
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";

const getToken = () => localStorage.getItem("token") || "";

const authAxios = {
  get: (url) =>
    axios.get(url, { headers: { Authorization: `Bearer ${getToken()}` } }),
  post: (url, data) =>
    axios.post(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
  put: (url, data) =>
    axios.put(url, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
  delete: (url) =>
    axios.delete(url, { headers: { Authorization: `Bearer ${getToken()}` } }),
};

// Status options for dropdown
const STATUS_OPTIONS = [
  { value: "inquiry", label: "Inquiry", color: "gray" },
  { value: "evaluation", label: "Evaluation", color: "amber" },
  { value: "application submitted", label: "Application Submitted", color: "blue" },
  { value: "offer letter received", label: "Offer Letter Received", color: "emerald" },
  { value: "offer letter not received", label: "Offer Letter Not Received", color: "orange" },
  { value: "visa filed", label: "Visa Filed", color: "purple" },
  { value: "approved", label: "Approved", color: "green" },
  { value: "reject", label: "Reject", color: "rose" },
];

// Document types for counsellor upload
const DOC_TYPES = [
  { key: "offer_letter", label: "Offer Letter" },
  { key: "acceptance_letter", label: "Acceptance Letter" },
  { key: "visa_letter", label: "Visa Letter" },
  { key: "scholarship_certificate", label: "Scholarship Certificate" },
  { key: "fee_invoice", label: "Fee Invoice" },
  { key: "passport", label: "Passport Copy" },
  { key: "transcript", label: "Academic Transcript" },
  { key: "other", label: "Other Document" },
];

// Document Preview Modal - FIXED
function DocumentPreviewModal({ isOpen, onClose, documents, onVerify, onReject }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (docId) => {
    await onVerify(docId);
    setSelectedDoc(null);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    await onReject(selectedDoc.id, rejectReason);
    setShowRejectModal(false);
    setSelectedDoc(null);
    setRejectReason("");
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Verified' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' };
      case 'review': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'In Review' };
      default: return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' };
    }
  };

  const pendingDocs = documents.filter(d => d.status === 'pending' || d.status === 'review');
  const verifiedDocs = documents.filter(d => d.status === 'verified');
  const rejectedDocs = documents.filter(d => d.status === 'rejected');

  // Helper to get file URL
  const getFileUrl = (doc) => {
    return doc.file_path || doc.file_url;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Documents</h2>
              <p className="text-sm text-gray-500">
                {pendingDocs.length} pending, {verifiedDocs.length} verified, {rejectedDocs.length} rejected
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <XCircle size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => {
                  const status = getStatusBadge(doc.status);
                  const StatusIcon = status.icon;
                  const fileUrl = getFileUrl(doc);
                  const fileName = doc.original_name || (fileUrl ? fileUrl.split('/').pop() : 'document');
                  
                  return (
                    <div key={doc.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText size={18} className="text-teal-600" />
                            <span className="font-medium text-gray-800 capitalize">{doc.doc_type?.replace(/_/g, ' ')}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text} flex items-center gap-1`}>
                              <StatusIcon size={10} /> {status.label}
                            </span>
                            {doc.uploaded_by === 'counsellor' && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Shared by you</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">File: {fileName}</p>
                          <p className="text-xs text-gray-400">Submitted: {new Date(doc.submitted_at).toLocaleDateString()}</p>
                          {doc.rejection_reason && (
                            <p className="text-xs text-red-600 mt-2">Rejection reason: {doc.rejection_reason}</p>
                          )}
                          {doc.notes && (
                            <p className="text-xs text-gray-500 mt-1">Notes: {doc.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-gray-100 transition"
                              title="View Document"
                            >
                              <Eye size={16} className="text-gray-500" />
                            </a>
                          )}
                          {(doc.status === 'pending' || doc.status === 'review') && (
                            <>
                              <button
                                onClick={() => handleVerify(doc.id)}
                                className="p-2 rounded-lg hover:bg-green-50 transition"
                                title="Verify"
                              >
                                <CheckCircle size={16} className="text-green-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setShowRejectModal(true);
                                }}
                                className="p-2 rounded-lg hover:bg-red-50 transition"
                                title="Reject"
                              >
                                <XCircle size={16} className="text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Reject Document</h2>
              <p className="text-sm text-gray-500">Document: {selectedDoc?.doc_type?.replace(/_/g, ' ')}</p>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleReject} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Application Modal (Create/Edit) - FINAL FIXED
// Application Modal (Create/Edit) - FINAL FIXED
function ApplicationModal({ isOpen, onClose, onSuccess, application, students, selectedStudentForCreate }) {
  const [formData, setFormData] = useState({
    user_id: "",
    target_university: "",
    course: "",
    target_country: "",
    deadline: "",
    status: "inquiry",
    full_name: "",
    email: "",
    phone: "",
    last_degree: "",
    cgpa: "",
    english_test: "",
    test_score: "",
    counselor_notes: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (application) {
      console.log("📝 EDIT MODE - Setting form data:", application);
      
      setFormData({
        user_id: application.user_id || application.student_id || "",
        target_university: application.target_university || "",
        course: application.course || "",
        target_country: application.target_country || "",
        deadline: application.deadline ? String(application.deadline).split('T')[0] : "",
        status: application.status || "inquiry",
        full_name: application.full_name || "",
        email: application.email || "",
        phone: application.phone || "",
        last_degree: application.last_degree || "",
        cgpa: application.cgpa || "",
        english_test: application.english_test || "",
        test_score: application.test_score || "",
        counselor_notes: application.counselor_notes || "",
      });
    } else if (selectedStudentForCreate) {
      setFormData({
        user_id: selectedStudentForCreate.user_id || selectedStudentForCreate.id || "",
        full_name: selectedStudentForCreate.name || "",
        email: selectedStudentForCreate.email || "",
        phone: selectedStudentForCreate.phone || "",
        target_university: "",
        course: "",
        target_country: "",
        deadline: "",
        status: "inquiry",
        last_degree: "",
        cgpa: "",
        english_test: "",
        test_score: "",
        counselor_notes: "",
      });
    }
  }, [application, selectedStudentForCreate, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id) {
      toast.error("Please select a student");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_id: parseInt(formData.user_id),
        target_university: formData.target_university,
        course: formData.course,
        target_country: formData.target_country,
        deadline: formData.deadline,
        status: formData.status,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        last_degree: formData.last_degree,
        cgpa: formData.cgpa,
        english_test: formData.english_test,
        test_score: formData.test_score,
        counselor_notes: formData.counselor_notes,
      };
      
      let res;
      if (application) {
        res = await authAxios.put(`${BASE_URL}/counsellor/applications/${application.id}`, payload);
      } else {
        res = await authAxios.post(`${BASE_URL}/counsellor/applications`, payload);
      }

      if (res.data.success) {
        toast.success(application ? "Application updated successfully" : "Application created successfully");
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Failed to save application");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-800">
            {application ? "Edit Application" : "Create Application"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
            <select
              required
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400"
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.user_id || s.id}>
                  {s.name} - {s.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
              <input
                type="text"
                required
                value={formData.target_university}
                onChange={(e) => setFormData({ ...formData, target_university: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400"
                placeholder="University name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
              <input
                type="text"
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400"
                placeholder="Course name"
              />
            </div>
          </div>

          {/* Other fields remain the same... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" value={formData.target_country} onChange={(e) => setFormData({ ...formData, target_country: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400" placeholder="Country" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400">
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Student Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400" />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400" />
              <input type="text" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400" />
              <input type="text" placeholder="Last Degree" value={formData.last_degree} onChange={(e) => setFormData({ ...formData, last_degree: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400" />
              <input type="text" placeholder="CGPA" value={formData.cgpa} onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400" />
              <input type="text" placeholder="English Test (IELTS/TOEFL)" value={formData.english_test} onChange={(e) => setFormData({ ...formData, english_test: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400" />
              <input type="text" placeholder="Test Score" value={formData.test_score} onChange={(e) => setFormData({ ...formData, test_score: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Counselor Notes</label>
            <textarea rows="3" value={formData.counselor_notes} onChange={(e) => setFormData({ ...formData, counselor_notes: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 resize-none" placeholder="Internal notes..." />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-70">
              {loading ? <RefreshCw size={16} className="animate-spin mx-auto" /> : (application ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Document Upload Modal for Counsellor
function CounsellorDocumentModal({ isOpen, onClose, onSuccess, student, application }) {
  const [formData, setFormData] = useState({
    doc_type: "offer_letter",
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setLoading(true);
    const formDataObj = new FormData();
    formDataObj.append('student_email', student.email);
    formDataObj.append('application_id', application.id);
    formDataObj.append('doc_type', formData.doc_type);
    formDataObj.append('notes', formData.notes);
    formDataObj.append('file', file);

    try {
      const res = await authAxios.post(`${BASE_URL}/counsellor/documents/upload-for-student`, formDataObj);
      if (res.data.success) {
        toast.success("Document shared with student successfully!");
        onSuccess();
        onClose();
        setFile(null);
        setFormData({ doc_type: "offer_letter", notes: "" });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Share Document</h2>
          <p className="text-sm text-gray-500">Student: {student?.name}</p>
          <p className="text-xs text-gray-400">{application?.target_university}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
            <select
              required
              value={formData.doc_type}
              onChange={(e) => setFormData({ ...formData, doc_type: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400"
            >
              {DOC_TYPES.map(type => (
                <option key={type.key} value={type.key}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document File *</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-teal-400 resize-none"
              placeholder="Add notes for the student..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">
              {loading ? <RefreshCw size={16} className="animate-spin mx-auto" /> : "Share Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ isOpen, onClose, onConfirm, application }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Application</h3>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to delete the application for <strong>{application?.target_university}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
         
          </div>
        </div>
      </div>
    </div>
  );
}

// Main CounsellorApplication Component
export const CounsellorApplication = () => {
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [counsellorLeads, setCounsellorLeads] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedAppForDoc, setSelectedAppForDoc] = useState(null);
  const [currentAppDocuments, setCurrentAppDocuments] = useState([]);

  // Fetch counsellor leads
  const fetchCounsellorLeads = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await fetch(`${BASE_URL}/counsellor/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const leadsData = Array.isArray(data) ? data : data.data || [];
      setCounsellorLeads(leadsData);
    } catch (err) {
      console.error("Failed to fetch counsellor leads:", err);
    }
  }, []);

  const availableStudents = useMemo(() => {
    const assignedLeads = counsellorLeads.map(lead => ({
      id: lead.id,
      user_id: lead.user_id || lead.id,
      name: lead.name,
      email: lead.email,
      status: lead.status,
    }));
    
    const existingStudents = students.map(s => ({
      id: s.id,
      user_id: s.user_id || s.id,
      name: s.name,
      email: s.email,
      status: s.status,
    }));
    
    const combined = [...assignedLeads, ...existingStudents];
    const unique = combined.filter((student, index, self) => 
      index === self.findIndex(s => s.id === student.id)
    );
    
    return unique;
  }, [counsellorLeads, students]);

  // Fetch all documents for counsellor
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/counsellor/documents/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  }, []);

  // Fetch students with applications
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authAxios.get(`${BASE_URL}/counsellor/applications/students`);
      
      if (res.data.success) {
        const studentsData = res.data.students || [];
        setStudents(studentsData);
        
        const allApps = [];
        const allDocs = [];
        
        studentsData.forEach(student => {
          const applicationsList = student.applications || [];
          
          applicationsList.forEach(app => {
            const appDocuments = app.documents || [];
            
            appDocuments.forEach(doc => {
              allDocs.push({
                ...doc,
                application_id: app.id,
                student_id: student.id,
                student_name: student.name,
                student_email: student.email,
              });
            });
            
            allApps.push({
              id: app.id || app._id,
              target_university: app.target_university,
              course: app.course,
              status: app.status,
              created_at: app.created_at,
              student_name: student.name,
              student_email: student.email,
              student_id: student.id,
              user_id: student.user_id || student.id,
              documents: appDocuments,
            });
          });
        });
        
        setApplications(allApps);
        setDocuments(allDocs);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchCounsellorLeads();
  }, [fetchData, fetchCounsellorLeads]);

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchData(), fetchDocuments(), fetchCounsellorLeads()]).finally(() => setRefreshing(false));
  };

  const handleVerifyDocument = async (docId) => {
    try {
      const res = await authAxios.put(`${BASE_URL}/counsellor/documents/${docId}/verify`);
      if (res.data.message) {
        toast.success("Document verified successfully");
        await fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    }
  };

  const handleRejectDocument = async (docId, reason) => {
    try {
      const res = await authAxios.put(`${BASE_URL}/counsellor/documents/${docId}/reject`, { reason });
      if (res.data.message) {
        toast.success("Document rejected");
        await fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;
    try {
      await authAxios.delete(`${BASE_URL}/counsellor/applications/${selectedApplication.id}`);
      toast.success("Application deleted successfully");
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleViewDocuments = (application) => {
    const latestApp = applications.find(a => a.id === application.id);
    const appDocs = latestApp?.documents || application.documents || [];
    setCurrentAppDocuments(appDocs);
    setSelectedApplication(latestApp || application);
    setShowDocumentPreview(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'inquiry': 'bg-gray-100 text-gray-700',
      'evaluation': 'bg-amber-100 text-amber-700',
      'application submitted': 'bg-blue-100 text-blue-700',
      'offer letter received': 'bg-emerald-100 text-emerald-700',
      'offer letter not received': 'bg-orange-100 text-orange-700',
      'visa filed': 'bg-purple-100 text-purple-700',
      'approved': 'bg-green-100 text-green-700',
      'reject': 'bg-rose-100 text-rose-700',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'inquiry': 'Inquiry',
      'evaluation': 'Evaluation',
      'application submitted': 'App Submitted',
      'offer letter received': 'Offer Received',
      'offer letter not received': 'Offer Not Received',
      'visa filed': 'Visa Filed',
      'approved': 'Approved',
      'reject': 'Rejected',
    };
    return labelMap[status] || status;
  };

  const filteredStudents = availableStudents.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-gradient-to-br from-slate-50 to-zinc-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-950 to-teal-900 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-1">Counsellor Portal</p>
              <h1 className="text-2xl font-bold">Student Applications</h1>
              <p className="text-blue-200 text-sm mt-1">Manage student applications, documents, and share files</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition shadow-md"
            >
              <Plus size={18} /> New Application
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <Users size={16} className="text-teal-500" />
                My Students ({filteredStudents.length})
              </h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {filteredStudents.map((student) => {
                const studentApps = applications.filter(a => a.student_id === student.id);
                const allStudentDocs = studentApps.flatMap(app => app.documents || []);
                const pendingDocsCount = allStudentDocs.filter(d => d.status === 'pending' || d.status === 'review').length;
                
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      selectedStudent?.id === student.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <User size={16} className="text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                      <div className="flex gap-1">
                        {pendingDocsCount > 0 && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {pendingDocsCount} pending
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          {studentApps.length} apps
                        </span>
                      </div>
                    </div>
                    {selectedStudent?.id === student.id && (
                      <div className="mt-3 pl-12 space-y-2">
                        {studentApps.map((app) => {
                          const appDocs = app.documents || [];
                          const pendingDocs = appDocs.filter(d => d.status === 'pending' || d.status === 'review').length;
                          const verifiedDocs = appDocs.filter(d => d.status === 'verified').length;
                          
                          return (
                            <div key={app.id} className="p-2 bg-white rounded-lg border border-gray-100 text-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-800">{app.target_university}</p>
                                  <p className="text-xs text-gray-500">{app.course}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(app.status)}`}>
                                      {getStatusLabel(app.status)}
                                    </span>
                                    {pendingDocs > 0 && (
                                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                        {pendingDocs} doc pending
                                      </span>
                                    )}
                                    {verifiedDocs > 0 && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        {verifiedDocs} verified
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDocuments(app);
                                    }}
                                    className="p-1 rounded hover:bg-blue-50"
                                    title="View Documents"
                                  >
                                    <FileText size={12} className="text-blue-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedApplication(app);
                                      setShowEditModal(true);
                                    }}
                                    className="p-1 rounded hover:bg-amber-50"
                                    title="Edit"
                                  >
                                    <Edit size={12} className="text-amber-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAppForDoc(app);
                                      setSelectedStudent(student);
                                      setShowDocModal(true);
                                    }}
                                    className="p-1 rounded hover:bg-teal-50"
                                    title="Share Document"
                                  >
                                    <Upload size={12} className="text-teal-600" />
                                  </button>
                             
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No students assigned to you</p>
                  <p className="text-xs mt-1">Students will appear here once assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-gray-800">All Applications</h2>
                <p className="text-xs text-gray-400">{applications.length} total applications</p>
              </div>
              <button onClick={handleRefresh} disabled={refreshing} className="p-1.5 rounded-lg hover:bg-gray-200 transition">
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">University</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Documents</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-8"><RefreshCw size={20} className="animate-spin mx-auto" /></td></tr>
                  ) : applications.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8">
                      <div className="text-center">
                        <FileText size={40} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No applications found</p>
                        <p className="text-xs text-gray-400 mt-1">Click "New Application" to create one</p>
                      </div>
                    </td>
                  </tr>
                  ) : (
                    applications.map((app) => {
                      const appDocs = app.documents || [];
                      const pendingDocs = appDocs.filter(d => d.status === 'pending' || d.status === 'review').length;
                      const verifiedDocs = appDocs.filter(d => d.status === 'verified').length;
                      
                      return (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{app.student_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{app.student_email || 'No email'}</p>
                          </td>
                          <td className="px-4 py-3 text-sm">{app.target_university || '—'}</td>
                          <td className="px-4 py-3 text-sm">{app.course || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(app.status)}`}>
                              {getStatusLabel(app.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {pendingDocs > 0 && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  {pendingDocs} pending
                                </span>
                              )}
                              {verifiedDocs > 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  {verifiedDocs} verified
                                </span>
                              )}
                              {appDocs.length === 0 && (
                                <span className="text-xs text-gray-400">No docs</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDocuments(app)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 transition"
                                title="View Documents"
                              >
                                <FileText size={14} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowEditModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-amber-50 transition"
                                title="Edit"
                              >
                                <Edit size={14} className="text-amber-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAppForDoc(app);
                                  setSelectedStudent({ 
                                    id: app.student_id, 
                                    name: app.student_name,
                                    email: app.student_email,
                                    user_id: app.user_id
                                  });
                                  setShowDocModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-teal-50 transition"
                                title="Share Document"
                              >
                                <Upload size={14} className="text-teal-600" />
                              </button>
                        
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={showDocumentPreview}
        onClose={() => {
          setShowDocumentPreview(false);
          setCurrentAppDocuments([]);
        }}
        documents={currentAppDocuments}
        onVerify={handleVerifyDocument}
        onReject={handleRejectDocument}
      />

      {/* Modals */}
   <ApplicationModal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onSuccess={() => {
    fetchData();
    fetchCounsellorLeads();
  }}
  students={availableStudents}
  selectedStudentForCreate={selectedStudent}   // ← Pre-fill when student is selected
/>

<ApplicationModal
  isOpen={showEditModal}
  onClose={() => {
    setShowEditModal(false);
    setSelectedApplication(null);
  }}
  onSuccess={() => {
    fetchData();
    fetchCounsellorLeads();
  }}
  application={selectedApplication}
  students={availableStudents}
  selectedStudentForCreate={null}
/>

      <CounsellorDocumentModal
        isOpen={showDocModal}
        onClose={() => {
          setShowDocModal(false);
          setSelectedAppForDoc(null);
        }}
        onSuccess={() => {
          fetchData();
          fetchCounsellorLeads();
        }}
        student={selectedStudent}
        application={selectedAppForDoc}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedApplication(null);
        }}
        onConfirm={handleDelete}
        application={selectedApplication}
      />
    </div>
  );
};

export default CounsellorApplication;