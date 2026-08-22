"use client";

import { useState, useEffect } from "react";
import { 
  Landmark, 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  DollarSign,
  Activity,
  Clock,
  Calendar,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Store,
  Share2,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  X
} from "lucide-react";

interface UpayConfig {
  id: string;
  providerName: string;
  baseUrl: string;
  apiKey: string;
  status: "active" | "inactive" | "pending";
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  referenceId: string;
  amount: number;
  type: "cash_in" | "cash_out" | "send_money" | "merchant_payment";
  status: "pending" | "success" | "failed" | "reversed";
  createdAt: string;
}

export default function UpayPage() {
  const [config, setConfig] = useState<UpayConfig | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    baseUrl: "",
    apiKey: "",
    status: "inactive" as "active" | "inactive" | "pending",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    successRate: 0,
    pendingTransactions: 0
  });

  useEffect(() => {
    fetchConfig();
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/mfs/upay");
      const data = await res.json();
      if (res.ok && data.data) {
        setConfig(data.data);
        setFormData({
          baseUrl: data.data.baseUrl || "",
          apiKey: data.data.apiKey || "",
          status: data.data.status || "inactive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/mfs/upay?limit=10");
      const data = await res.json();
      if (res.ok && data.data?.transactions) {
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/mfs/upay/stats");
      const data = await res.json();
      if (res.ok && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/mfs/upay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Configuration saved successfully" });
        fetchConfig();
        fetchStats();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save configuration" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchConfig(), fetchTransactions(), fetchStats()]);
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      reversed: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
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
    return icons[type] || FileText;
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.referenceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const maskApiKey = (key: string) => {
    if (!key) return "Not configured";
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
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
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Landmark className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upay Integration</h1>
                <p className="text-gray-600">Configure and monitor Upay MFS integration</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <a
              href="https://developer.upay.com.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              API Docs
            </a>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Live updates</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">৳{(stats.totalVolume / 1000000).toFixed(2)}M</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-2">Needs attention</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Configuration Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              API Configuration
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              config?.status === "active" ? "bg-green-100 text-green-800" :
              config?.status === "pending" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {config?.status || "Not configured"}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base URL
                <span className="text-gray-400 font-normal ml-1">(Required)</span>
              </label>
              <input
                type="url"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.upay.com.bd"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
                <span className="text-gray-400 font-normal ml-1">(Required)</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="Enter API key"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {config?.apiKey && (
                <p className="text-xs text-gray-500 mt-1">
                  Current: {maskApiKey(config.apiKey)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
                <span className="text-gray-400 font-normal ml-1">(Required)</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  Save Configuration
                </>
              )}
            </button>
          </form>
        </div>

        {/* Integration Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-600" />
              Integration Status
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                Provider
              </span>
              <span className="font-medium text-gray-900">Upay</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Status
              </span>
              {config ? getStatusBadge(config.status) : <span className="text-gray-400">Not configured</span>}
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Base URL
              </span>
              <span className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                {config?.baseUrl || "Not configured"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                API Key
              </span>
              <span className="font-medium text-gray-900 text-sm">
                {config?.apiKey ? maskApiKey(config.apiKey) : "Not configured"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Last Sync
              </span>
              <span className="font-medium text-gray-900 text-sm">
                {config?.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString() : "Never"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created
              </span>
              <span className="font-medium text-gray-900 text-sm">
                {config?.createdAt ? new Date(config.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Last Updated
              </span>
              <span className="font-medium text-gray-900 text-sm">
                {config?.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reference ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="cash_in">Cash In</option>
                <option value="cash_out">Cash Out</option>
                <option value="send_money">Send Money</option>
                <option value="merchant_payment">Merchant Payment</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium">No transactions found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const TypeIcon = getTypeIcon(tx.type);
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <TypeIcon className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{tx.referenceId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">{tx.type.replace("_", " ")}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">৳{tx.amount.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(tx.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</span>
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
  );
}