"use client";

import { useState, useEffect } from "react";
import { 
  Percent, 
  Wallet, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Calendar,
  DollarSign,
  Activity,
  X,
  RefreshCw,
  TrendingUp,
  Users,
  FileText,
  ChevronRight,
  BarChart3,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  Store
} from "lucide-react";

interface CommissionRule {
  id: string;
  name: string;
  transactionType: "cash_in" | "cash_out" | "send_money" | "merchant_payment";
  minAmount: number;
  maxAmount: number;
  commissionType: "fixed" | "percentage";
  commissionValue: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface AgentCommission {
  agentId: string;
  agentName: string;
  totalTransactions: number;
  totalVolume: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  period: string;
}

export default function CommissionPage() {
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [agentCommissions, setAgentCommissions] = useState<AgentCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rules");
  const [formData, setFormData] = useState({
    name: "",
    transactionType: "cash_in" as CommissionRule["transactionType"],
    minAmount: "",
    maxAmount: "",
    commissionType: "percentage" as "fixed" | "percentage",
    commissionValue: "",
    status: "active" as "active" | "inactive",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    totalCommissionPaid: 0,
    totalCommissionPending: 0,
    totalAgents: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mfs/commission");
      const data = await res.json();
      if (res.ok && data.data) {
        const rulesData = data.data.rules || [];
        const agentsData = data.data.agentCommissions || [];
        
        setRules(rulesData);
        setAgentCommissions(agentsData);
        
        // Calculate stats inline with proper typing
        setStats({
          totalRules: rulesData.length,
          activeRules: rulesData.filter((r: CommissionRule) => r.status === "active").length,
          totalCommissionPaid: agentsData.reduce((sum: number, ac: AgentCommission) => sum + (ac.paidCommission || 0), 0),
          totalCommissionPending: agentsData.reduce((sum: number, ac: AgentCommission) => sum + (ac.pendingCommission || 0), 0),
          totalAgents: agentsData.length
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/mfs/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          minAmount: parseFloat(formData.minAmount),
          maxAmount: parseFloat(formData.maxAmount),
          commissionValue: parseFloat(formData.commissionValue),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Commission rule created successfully" });
        setFormData({
          name: "",
          transactionType: "cash_in",
          minAmount: "",
          maxAmount: "",
          commissionType: "percentage",
          commissionValue: "",
          status: "active",
        });
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create rule" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    const icons: Record<string, any> = {
      active: CheckCircle,
      inactive: Clock,
    };
    const Icon = icons[status] || AlertCircle;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      cash_in: ArrowDownLeft,
      cash_out: ArrowUpRight,
      send_money: Share2,
      merchant_payment: Store,
    };
    return icons[type] || CreditCard;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      cash_in: "bg-green-100 text-green-600",
      cash_out: "bg-orange-100 text-orange-600",
      send_money: "bg-blue-100 text-blue-600",
      merchant_payment: "bg-purple-100 text-purple-600",
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

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
                <Percent className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Commission & Incentive</h1>
                <p className="text-gray-600">Manage commission rules and agent incentives</p>
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
              <p className="text-sm text-gray-500 mb-1">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRules}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All rules</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Rules</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeRules}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">Currently active</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAgents}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Earning commission</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Commission Paid</p>
              <p className="text-2xl font-bold text-green-600">৳{(stats.totalCommissionPaid / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">Total paid</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Commission Pending</p>
              <p className="text-2xl font-bold text-yellow-600">৳{(stats.totalCommissionPending / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">To be paid</p>
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
              onClick={() => setActiveTab("rules")}
              className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === "rules"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Percent className="w-4 h-4" />
              Commission Rules
            </button>
            <button
              onClick={() => setActiveTab("agents")}
              className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === "agents"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              Agent Commissions
            </button>
          </nav>
        </div>
      </div>

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Rule Form */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-gray-600" />
                New Commission Rule
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name
                  <span className="text-gray-400 font-normal ml-1">(Required)</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Cash Out Standard"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                  <span className="text-gray-400 font-normal ml-1">(Required)</span>
                </label>
                <select
                  value={formData.transactionType}
                  onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as any })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash_in">💰 Cash In</option>
                  <option value="cash_out">💸 Cash Out</option>
                  <option value="send_money">📤 Send Money</option>
                  <option value="merchant_payment">🏪 Merchant Payment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Amount
                    <span className="text-gray-400 font-normal ml-1">(৳)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Amount
                    <span className="text-gray-400 font-normal ml-1">(৳)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100000"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Type
                  <span className="text-gray-400 font-normal ml-1">(Required)</span>
                </label>
                <select
                  value={formData.commissionType}
                  onChange={(e) => setFormData({ ...formData, commissionType: e.target.value as any })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fixed">🔒 Fixed (৳)</option>
                  <option value="percentage">📊 Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Value
                  <span className="text-gray-400 font-normal ml-1">
                    ({formData.commissionType === "fixed" ? "৳" : "%"})
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.commissionValue}
                  onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={formData.commissionType === "fixed" ? "5" : "1.5"}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                  <span className="text-gray-400 font-normal ml-1">(Required)</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">✅ Active</option>
                  <option value="inactive">⏸️ Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Rule
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Rules Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Commission Rules</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="font-medium">No commission rules found</p>
                        <p className="text-sm mt-1">Create your first rule to get started</p>
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => {
                      const TypeIcon = getTypeIcon(rule.transactionType);
                      const typeColor = getTypeColor(rule.transactionType);
                      return (
                        <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Percent className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${typeColor}`}>
                                <TypeIcon className="w-3 h-3" />
                              </div>
                              <span className="text-sm font-medium text-gray-900 capitalize">{rule.transactionType.replace("_", " ")}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 font-medium">৳{rule.minAmount.toLocaleString()} - ৳{rule.maxAmount.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Percent className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {rule.commissionType === "fixed" ? `৳${rule.commissionValue.toFixed(2)}` : `${rule.commissionValue.toFixed(2)}%`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(rule.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {new Date(rule.updatedAt).toLocaleDateString()}
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
      )}

      {/* Agents Tab */}
      {activeTab === "agents" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Agent Commission Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agentCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">No agent commission data found</p>
                      <p className="text-sm mt-1">Commission data will appear here</p>
                    </td>
                  </tr>
                ) : (
                  agentCommissions.map((ac) => (
                    <tr key={ac.agentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{ac.agentName}</p>
                            <p className="text-xs text-gray-500">ID: #{ac.agentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Activity className="w-4 h-4 text-gray-400" />
                          {ac.totalTransactions.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          ৳{(ac.totalVolume / 1000).toFixed(2)}K
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Percent className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">৳{ac.totalCommission.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4" />
                          ৳{ac.paidCommission.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium">
                          <Clock className="w-4 h-4" />
                          ৳{ac.pendingCommission.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {ac.period}
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
    </div>
  );
}