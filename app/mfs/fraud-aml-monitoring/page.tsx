"use client";

import { useState, useEffect } from "react";

interface Alert {
  id: string;
  alertType: "suspicious_transaction" | "high_value" | "velocity" | "pattern" | "kyc_mismatch";
  severity: "low" | "medium" | "high" | "critical";
  riskScore: number;
  referenceId: string;
  amount: number;
  description: string;
  status: "new" | "investigating" | "resolved" | "false_positive";
  createdAt: string;
  resolvedAt: string | null;
}

export default function FraudAmlMonitoringPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolving, setResolving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/mfs/fraud-aml-monitoring" : `/api/mfs/fraud-aml-monitoring?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.data) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (status: "resolved" | "false_positive") => {
    if (!selectedAlert) return;
    setResolving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/mfs/fraud-aml-monitoring", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedAlert.id, action: "resolve", status, note: resolutionNote }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Alert resolved successfully" });
        fetchAlerts();
        setSelectedAlert(null);
        setResolutionNote("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to resolve alert" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setResolving(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {severity}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      new: "bg-red-100 text-red-800",
      investigating: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      false_positive: "bg-gray-100 text-gray-800",
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
        <h1 className="text-2xl font-bold text-gray-900">Fraud & AML Monitoring</h1>
        <p className="text-gray-600 mt-1">Monitor suspicious transactions and AML alerts</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Alerts</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{alerts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">New Alerts</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{alerts.filter((a) => a.status === "new").length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Investigating</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{alerts.filter((a) => a.status === "investigating").length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">High Risk</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{alerts.filter((a) => a.severity === "high" || a.severity === "critical").length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">AML Alerts</h2>
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
                onClick={() => setFilter("new")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === "new" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                New
              </button>
              <button
                onClick={() => setFilter("investigating")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === "investigating" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Investigating
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No alerts found
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{alert.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.alertType.replace("_", " ")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getSeverityBadge(alert.severity)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              alert.riskScore >= 80 ? "bg-red-600" : alert.riskScore >= 50 ? "bg-yellow-600" : "bg-green-600"
                            }`}
                            style={{ width: `${alert.riskScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{alert.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{alert.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(alert.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(alert.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Alert Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Alert ID</label>
                <p className="text-gray-900">{selectedAlert.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="text-gray-900">{selectedAlert.alertType.replace("_", " ")}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Severity</label>
                  <p>{getSeverityBadge(selectedAlert.severity)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Risk Score</label>
                  <p className="font-medium">{selectedAlert.riskScore}/100</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-gray-900">৳{selectedAlert.amount.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{selectedAlert.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p>{getStatusBadge(selectedAlert.status)}</p>
              </div>

              {selectedAlert.status === "new" || selectedAlert.status === "investigating" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Note</label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter investigation findings..."
                  />
                </div>
              ) : null}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {selectedAlert.status === "new" || selectedAlert.status === "investigating" ? (
                <>
                  <button
                    onClick={() => handleResolve("false_positive")}
                    disabled={resolving}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    Mark as False Positive
                  </button>
                  <button
                    onClick={() => handleResolve("resolved")}
                    disabled={resolving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark as Resolved
                  </button>
                </>
              ) : null}
              <button
                onClick={() => {
                  setSelectedAlert(null);
                  setResolutionNote("");
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