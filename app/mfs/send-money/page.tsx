"use client";

import { useState, useEffect } from "react";
import { 
  Send, 
  ArrowRight, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Calendar,
  Phone,
  User,
  DollarSign,
  Activity,
  X,
  RefreshCw,
  TrendingUp,
  Wallet,
  CreditCard,
  FileText,
  Users,
  Shield,
  Zap,
  ArrowLeftRight
} from "lucide-react";

interface Transaction {
  id: string;
  referenceId: string;
  senderPhone: string;
  receiverPhone: string;
  amount: number;
  fee: number;
  total: number;
  status: "pending" | "success" | "failed" | "reversed";
  createdAt: string;
}

export default function SendMoneyPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    senderPhone: "",
    receiverPhone: "",
    amount: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    successRate: 0,
    avgTransaction: 0
  });

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mfs/send-money");
      const data = await res.json();
      if (res.ok && data.data) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/mfs/send-money/stats");
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
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/mfs/send-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Send money transaction created successfully" });
        setFormData({ senderPhone: "", receiverPhone: "", amount: "" });
        fetchTransactions();
        fetchStats();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create transaction" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTransactions(), fetchStats()]);
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      reversed: "bg-blue-100 text-blue-800",
    };
    const icons: Record<string, any> = {
      pending: Clock,
      success: CheckCircle,
      failed: AlertCircle,
      reversed: AlertCircle,
    };
    const Icon = icons[status] || AlertCircle;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const calculateFee = (amount: number) => {
    const feeRate = 0.01; // 1% fee
    return (amount * feeRate).toFixed(2);
  };

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.referenceId.toLowerCase().includes(search.toLowerCase()) ||
      tx.senderPhone.includes(search) ||
      tx.receiverPhone.includes(search)
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
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Send Money (P2P)</h1>
                <p className="text-gray-600">Process and monitor person-to-person transfers</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Transfers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-purple-600" />
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
              <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Avg Transaction</p>
              <p className="text-2xl font-bold text-gray-900">৳{stats.avgTransaction.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Per transfer</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* New Send Money Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-gray-600" />
              New Send Money
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sender Phone
                <span className="text-gray-400 font-normal ml-1">(Required)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="017XXXXXXXX"
                  pattern="01[0-9]{9}"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receiver Phone
                <span className="text-gray-400 font-normal ml-1">(Required)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.receiverPhone}
                  onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="017XXXXXXXX"
                  pattern="01[0-9]{9}"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (৳)
                <span className="text-gray-400 font-normal ml-1">(Required)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              {formData.amount && (
                <p className="text-xs text-gray-500 mt-1">
                  Fee: ৳{calculateFee(parseFloat(formData.amount))} | 
                  Total: ৳{(parseFloat(formData.amount) + parseFloat(calculateFee(parseFloat(formData.amount)))).toFixed(2)}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Money
                </>
              )}
            </button>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transfers</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reference, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">No transactions found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{tx.referenceId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {tx.senderPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          {tx.receiverPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">৳{tx.amount.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">৳{tx.fee.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(tx.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}