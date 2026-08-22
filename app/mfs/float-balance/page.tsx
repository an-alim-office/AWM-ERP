"use client";

import { useState, useEffect } from "react";

interface AgentBalance {
  agentId: string;
  agentName: string;
  phone: string;
  floatBalance: number;
  eMoneyBalance: number;
  totalBalance: number;
  lastTransactionAt: string | null;
  updatedAt: string;
}

export default function FloatBalancePage() {
  const [balances, setBalances] = useState<AgentBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentBalance | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<"add" | "deduct">("add");
  const [adjusting, setAdjusting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mfs/float-balance");
      const data = await res.json();
      if (res.ok && data.data) {
        setBalances(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async () => {
    if (!selectedAgent || !adjustAmount) return;
    setAdjusting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/mfs/float-balance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent.agentId,
          action: adjustType,
          amount: parseFloat(adjustAmount),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Balance adjusted successfully" });
        fetchBalances();
        setSelectedAgent(null);
        setAdjustAmount("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to adjust balance" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setAdjusting(false);
    }
  };

  const filteredBalances = balances.filter(
    (b) =>
      b.agentName.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      b.agentId.includes(search)
  );

  const getBalanceStatus = (balance: number) => {
    if (balance < 1000) return "text-red-600 font-medium";
    if (balance < 5000) return "text-yellow-600 font-medium";
    return "text-green-600 font-medium";
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
        <h1 className="text-2xl font-bold text-gray-900">Agent Float / e-Money Balance</h1>
        <p className="text-gray-600 mt-1">Monitor and manage agent float balances</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Agents</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{balances.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Float</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">৳{(balances.reduce((sum, b) => sum + b.floatBalance, 0) / 100000).toFixed(2)}L</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total e-Money</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">৳{(balances.reduce((sum, b) => sum + b.eMoneyBalance, 0) / 100000).toFixed(2)}L</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Low Balance Agents</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{balances.filter((b) => b.floatBalance < 1000).length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Agent Balances</h2>
            <input
              type="text"
              placeholder="Search by name, phone, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Float Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">e-Money</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {balances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No agent balances found
                  </td>
                </tr>
              ) : (
                filteredBalances.map((balance) => (
                  <tr key={balance.agentId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{balance.agentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{balance.agentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{balance.phone}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getBalanceStatus(balance.floatBalance)}`}>
                      ৳{balance.floatBalance.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getBalanceStatus(balance.eMoneyBalance)}`}>
                      ৳{balance.eMoneyBalance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">৳{balance.totalBalance.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {balance.lastTransactionAt ? new Date(balance.lastTransactionAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedAgent(balance)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Manage Balance</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Agent</label>
                <p className="text-gray-900">{selectedAgent.agentName} ({selectedAgent.agentId})</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Float</label>
                  <p className="text-gray-900 font-medium">৳{selectedAgent.floatBalance.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current e-Money</label>
                  <p className="text-gray-900 font-medium">৳{selectedAgent.eMoneyBalance.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as "add" | "deduct")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="add">Add</option>
                  <option value="deduct">Deduct</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleAdjust}
                disabled={adjusting || !adjustAmount}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adjusting ? "Adjusting..." : "Adjust Balance"}
              </button>
              <button
                onClick={() => {
                  setSelectedAgent(null);
                  setAdjustAmount("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
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