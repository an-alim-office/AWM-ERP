"use client";

import { useState, useEffect } from "react";

interface SureCashConfig {
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

export default function SureCashPage() {
  const [config, setConfig] = useState<SureCashConfig | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    baseUrl: "",
    apiKey: "",
    status: "inactive" as "active" | "inactive" | "pending",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
    fetchTransactions();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/mfs/surecash");
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
      const res = await fetch("/api/mfs/surecash?limit=10");
      const data = await res.json();
      if (res.ok && data.data?.transactions) {
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/mfs/surecash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Configuration saved successfully" });
        fetchConfig();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save configuration" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      reversed: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SureCash Integration</h1>
        <p className="text-gray-600 mt-1">Configure and monitor SureCash MFS integration</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
              <input
                type="url"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.surecash.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="text"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter API key"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Provider</span>
              <span className="font-medium">SureCash</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              {config ? getStatusBadge(config.status) : <span className="text-gray-400">Not configured</span>}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Sync</span>
              <span className="font-medium">{config?.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString() : "Never"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Created</span>
              <span className="font-medium">{config?.createdAt ? new Date(config.createdAt).toLocaleDateString() : "N/A"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">{config?.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.referenceId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{tx.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.type.replace("_", " ")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(tx.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}