"use client";

import { useState, useEffect } from "react";

interface LimitRule {
  id: string;
  name: string;
  transactionType: "cash_in" | "cash_out" | "send_money" | "merchant_payment";
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export default function TransactionLimitsPage() {
  const [rules, setRules] = useState<LimitRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    transactionType: "cash_in" as LimitRule["transactionType"],
    minAmount: "",
    maxAmount: "",
    dailyLimit: "",
    monthlyLimit: "",
    perTransactionLimit: "",
    status: "active" as "active" | "inactive",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mfs/transaction-limits");
      const data = await res.json();
      if (res.ok && data.data) {
        setRules(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/mfs/transaction-limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          minAmount: parseFloat(formData.minAmount),
          maxAmount: parseFloat(formData.maxAmount),
          dailyLimit: parseFloat(formData.dailyLimit),
          monthlyLimit: parseFloat(formData.monthlyLimit),
          perTransactionLimit: parseFloat(formData.perTransactionLimit),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Limit rule created successfully" });
        setFormData({
          name: "",
          transactionType: "cash_in",
          minAmount: "",
          maxAmount: "",
          dailyLimit: "",
          monthlyLimit: "",
          perTransactionLimit: "",
          status: "active",
        });
        fetchRules();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create rule" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
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
        <h1 className="text-2xl font-bold text-gray-900">Transaction Limit Rules</h1>
        <p className="text-gray-600 mt-1">Configure transaction limits and rules</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Limit Rule</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Standard Cash Out"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select
                value={formData.transactionType}
                onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash_in">Cash In</option>
                <option value="cash_out">Cash Out</option>
                <option value="send_money">Send Money</option>
                <option value="merchant_payment">Merchant Payment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25000"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Limit</label>
              <input
                type="number"
                value={formData.dailyLimit}
                onChange={(e) => setFormData({ ...formData, dailyLimit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50000"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit</label>
              <input
                type="number"
                value={formData.monthlyLimit}
                onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="500000"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Transaction Limit</label>
              <input
                type="number"
                value={formData.perTransactionLimit}
                onChange={(e) => setFormData({ ...formData, perTransactionLimit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="25000"
                min="1"
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
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Rule"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Limit Rules</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No limit rules found
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.transactionType.replace("_", " ")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ৳{rule.minAmount} - ৳{rule.maxAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{rule.dailyLimit.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{rule.monthlyLimit.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(rule.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(rule.updatedAt).toLocaleDateString()}</td>
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