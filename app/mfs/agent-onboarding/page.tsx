"use client";

import { useState, useEffect } from "react";
import { 
  UserCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  Eye,
  RefreshCw,
  TrendingUp,
  Users,
  Activity,
  X,
  ChevronRight,
  Shield,
  BadgeCheck
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  phone: string;
  nid: string;
  email: string;
  address: string;
  status: "pending" | "approved" | "rejected";
  kycStatus: "pending" | "verified" | "rejected";
  documents: string[];
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export default function AgentOnboardingPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    verificationRate: 0
  });

  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, [filter]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/mfs/agent-onboarding" : `/api/mfs/agent-onboarding?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.data) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/mfs/agent-onboarding/stats");
      const data = await res.json();
      if (res.ok && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleAction = async (agentId: string, action: "approve" | "reject") => {
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/mfs/agent-onboarding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, action }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Agent ${action}ed successfully` });
        fetchAgents();
        fetchStats();
        setSelectedAgent(null);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to process" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchAgents(), fetchStats()]);
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      verified: "bg-green-100 text-green-800",
    };
    const icons: Record<string, any> = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      verified: BadgeCheck,
    };
    const Icon = icons[status] || AlertCircle;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.phone.includes(search) ||
      agent.nid.includes(search)
  );

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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agent Onboarding & KYC</h1>
                <p className="text-gray-600">Manage agent onboarding and KYC verification</p>
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
              <p className="text-sm text-gray-500 mb-1">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">Needs review</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">Active agents</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2">Declined</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Verification Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verificationRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Success rate</p>
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

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === "all" 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4" />
                All
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === "pending" 
                    ? "bg-yellow-500 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Clock className="w-4 h-4" />
                Pending
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === "approved" 
                    ? "bg-green-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Approved
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === "rejected" 
                    ? "bg-red-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <XCircle className="w-4 h-4" />
                Rejected
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, NID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium">No agents found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-500">Agent ID: #{agent.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {agent.phone}
                        </div>
                        {agent.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {agent.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">{agent.nid}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(agent.kycStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(agent.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(agent.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedAgent(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedAgent.name}</h2>
                    <p className="text-sm text-white/80">Agent ID: #{selectedAgent.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAgent(null)} className="text-white/80 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Application Status</p>
                  {getStatusBadge(selectedAgent.status)}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">KYC Status</p>
                  {getStatusBadge(selectedAgent.kycStatus)}
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-gray-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-900">{selectedAgent.name}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selectedAgent.phone}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedAgent.email || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">NID Number</p>
                    <p className="font-medium text-gray-900 font-mono">{selectedAgent.nid}</p>
                  </div>
                  <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="font-medium text-gray-900 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      {selectedAgent.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Submitted Documents
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.documents.map((doc, idx) => (
                    <span key={idx} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                      <p className="text-xs text-gray-500">{new Date(selectedAgent.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedAgent.reviewedAt ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Reviewed By: {selectedAgent.reviewedBy || "Admin"}</p>
                        <p className="text-xs text-gray-500">{new Date(selectedAgent.reviewedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">Awaiting Review</p>
                        <p className="text-xs text-yellow-600">Pending admin approval</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              {selectedAgent.status === "pending" ? (
                <>
                  <button
                    onClick={() => handleAction(selectedAgent.id, "reject")}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(selectedAgent.id, "approve")}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  This agent has already been {selectedAgent.status}
                </div>
              )}
              <button
                onClick={() => setSelectedAgent(null)}
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