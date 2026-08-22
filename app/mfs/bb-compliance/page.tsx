"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  Search,
  Filter,
  X,
  RefreshCw,
  ChevronRight,
  FileCheck,
  BarChart3,
  ClipboardList,
  AlertTriangle,
  BadgeCheck
} from "lucide-react";

interface ComplianceItem {
  id: string;
  category: "kyc" | "aml" | "transaction_limit" | "reporting" | "audit";
  requirement: string;
  description: string;
  status: "compliant" | "non_compliant" | "partial" | "not_applicable";
  lastCheckedAt: string | null;
  nextReviewDate: string | null;
  notes: string | null;
}

interface Report {
  id: string;
  reportType: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  period: string;
  status: "pending" | "submitted" | "approved" | "rejected";
  submittedAt: string | null;
  approvedAt: string | null;
}

export default function BbCompliancePage() {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("checklist");
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [updateNote, setUpdateNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    partial: 0,
    notApplicable: 0,
    complianceScore: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mfs/bb-compliance");
      const data = await res.json();
      if (res.ok && data.data) {
        setComplianceItems(data.data.complianceItems || []);
        setReports(data.data.reports || []);
        calculateStats(data.data.complianceItems || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (items: ComplianceItem[]) => {
    const total = items.length;
    const compliant = items.filter(i => i.status === "compliant").length;
    const nonCompliant = items.filter(i => i.status === "non_compliant").length;
    const partial = items.filter(i => i.status === "partial").length;
    const notApplicable = items.filter(i => i.status === "not_applicable").length;
    const complianceScore = total > 0 ? Math.round((compliant / total) * 100) : 0;

    setStats({
      total,
      compliant,
      nonCompliant,
      partial,
      notApplicable,
      complianceScore
    });
  };

  const handleUpdateStatus = async (status: ComplianceItem["status"]) => {
    if (!selectedItem) return;
    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/mfs/bb-compliance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedItem.id, status, notes: updateNote }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Compliance status updated successfully" });
        fetchData();
        setSelectedItem(null);
        setUpdateNote("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update status" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setUpdating(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      compliant: "bg-green-100 text-green-800",
      non_compliant: "bg-red-100 text-red-800",
      partial: "bg-yellow-100 text-yellow-800",
      not_applicable: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const icons: Record<string, any> = {
      compliant: CheckCircle,
      non_compliant: XCircle,
      partial: AlertTriangle,
      not_applicable: AlertCircle,
      pending: Clock,
      submitted: FileCheck,
      approved: BadgeCheck,
      rejected: XCircle,
    };
    const Icon = icons[status] || AlertCircle;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      kyc: ClipboardList,
      aml: Shield,
      transaction_limit: BarChart3,
      reporting: FileText,
      audit: Activity,
    };
    return icons[category] || FileText;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      kyc: "bg-blue-100 text-blue-600",
      aml: "bg-purple-100 text-purple-600",
      transaction_limit: "bg-orange-100 text-orange-600",
      reporting: "bg-green-100 text-green-600",
      audit: "bg-red-100 text-red-600",
    };
    return colors[category] || "bg-gray-100 text-gray-600";
  };

  const filteredItems = complianceItems.filter(item => {
    const matchesSearch = item.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bangladesh Bank Compliance</h1>
                <p className="text-gray-600">Manage BB compliance checklist and regulatory reporting</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Compliance Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.complianceScore}%</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    stats.complianceScore >= 80 ? "bg-green-600" :
                    stats.complianceScore >= 60 ? "bg-yellow-600" :
                    "bg-red-600"
                  }`} 
                  style={{ width: `${stats.complianceScore}%` }} 
                />
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Overall compliance</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All requirements</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Compliant</p>
              <p className="text-3xl font-bold text-green-600">{stats.compliant}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">Fully compliant</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Non-Compliant</p>
              <p className="text-3xl font-bold text-red-600">{stats.nonCompliant}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2">Needs attention</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Partial</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.partial}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">In progress</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("checklist")}
              className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === "checklist"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Compliance Checklist
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === "reports"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="w-4 h-4" />
              Regulatory Reports
            </button>
          </nav>
        </div>
      </div>

      {/* Checklist Tab */}
      {activeTab === "checklist" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Compliance Requirements</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="kyc">KYC</option>
                  <option value="aml">AML</option>
                  <option value="transaction_limit">Transaction Limit</option>
                  <option value="reporting">Reporting</option>
                  <option value="audit">Audit</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requirements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Review</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">No compliance items found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const CategoryIcon = getCategoryIcon(item.category);
                    const categoryColor = getCategoryColor(item.category);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryColor}`}>
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.category.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{item.requirement}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {item.lastCheckedAt ? new Date(item.lastCheckedAt).toLocaleDateString() : "Never"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {item.nextReviewDate ? new Date(item.nextReviewDate).toLocaleDateString() : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                          >
                            Update
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Regulatory Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">No reports found</p>
                      <p className="text-sm mt-1">Reports will appear here once submitted</p>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{report.reportType.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{report.period}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : "Not submitted"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4" />
                          {report.approvedAt ? new Date(report.approvedAt).toLocaleDateString() : "Pending"}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Update Compliance Status</h2>
                  <p className="text-sm text-white/80 mt-1">Modify compliance requirement status</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="text-white/80 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Requirement Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Requirement</p>
                <p className="font-medium text-gray-900">{selectedItem.requirement}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-900">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${getCategoryColor(selectedItem.category)}`}>
                      {getCategoryIcon(selectedItem.category)}
                    </div>
                    <p className="font-medium text-gray-900">{selectedItem.category.toUpperCase()}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Current Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <select
                  defaultValue={selectedItem.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="compliant">Compliant</option>
                  <option value="non_compliant">Non-Compliant</option>
                  <option value="partial">Partial</option>
                  <option value="not_applicable">Not Applicable</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Notes</label>
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add compliance notes, observations, or action items..."
                />
                <p className="text-xs text-gray-500 mt-1">Document any relevant compliance information</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setUpdateNote("");
                }}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}