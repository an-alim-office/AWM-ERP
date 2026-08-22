"use client";

import { useState, useEffect } from "react";

interface Settlement {
  id: string;
  settlementId: string;
  date: string;
  totalTransactions: number;
  totalAmount: number;
  totalFee: number;
  netAmount: number;
  status: "pending" | "processing" | "completed" | "failed";
  processedAt: string | null;
  createdAt: string;
}

export default function SettlementPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettlements();
  }, [filter]);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/mfs/settlement" : `/api/mfs/settlement?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.data) {
        setSettlements(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch settlements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (settlementId: string) => {
    setProcessing(settlementId);
    setMessage(null);

    try {
      const res = await fetch("/api/mfs/settlement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settlementId, action: "process" }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Settlement processed successfully" });
        fetchSettlements();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to process settlement" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
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
        <h1 className="text-2xl font-bold text-gray-900">Daily Settlement</h1>
        <p className="text-gray-600 mt-1">Manage daily settlement workflow</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{settlements.filter((s) => s.status === "pending").length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Processing</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{settlements.filter((s) => s.status === "processing").length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{settlements.filter((s) => s.status === "completed").length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Failed</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{settlements.filter((s) => s.status === "failed").length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Settlement History</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === "completed" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Settlement ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No settlements found
                  </td>
                </tr>
              ) : (
                settlements.map((settlement) => (
                  <tr key={settlement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{settlement.settlementId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(settlement.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{settlement.totalTransactions.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{(settlement.totalAmount / 1000).toFixed(2)}K</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{settlement.totalFee.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">৳{settlement.netAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(settlement.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {settlement.status === "pending" && (
                        <button
                          onClick={() => handleProcess(settlement.id)}
                          disabled={processing === settlement.id}
                          className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                        >
                          {processing === settlement.id ? "Processing..." : "Process"}
                        </button>
                      )}
                      {settlement.processedAt && (
                        <span className="text-gray-500 text-xs">{new Date(settlement.processedAt).toLocaleDateString()}</span>
                      )}
                    </td>
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