"use client";

import { useState, useEffect } from "react";

interface Merchant {
  id: string;
  name: string;
  merchantId: string;
  phone: string;
  category: string;
  status: "active" | "inactive" | "suspended";
  totalTransactions: number;
  totalVolume: number;
}

interface Payment {
  id: string;
  referenceId: string;
  merchantName: string;
  merchantId: string;
  amount: number;
  fee: number;
  customerPhone: string;
  status: "pending" | "success" | "failed" | "refunded";
  createdAt: string;
}

export default function MerchantPaymentPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mfs/merchant-payment");
      const data = await res.json();
      if (res.ok && data.data) {
        setMerchants(data.data.merchants || []);
        setPayments(data.data.payments || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.referenceId.toLowerCase().includes(search.toLowerCase()) ||
      p.merchantName.toLowerCase().includes(search.toLowerCase()) ||
      p.customerPhone.includes(search)
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Merchant Payment (P2M)</h1>
        <p className="text-gray-600 mt-1">Manage merchant payments and P2M transactions</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Merchants</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{merchants.length}</div>
          <div className="text-sm text-gray-600 mt-2">
            <span className="text-green-600">{merchants.filter((m) => m.status === "active").length} active</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Payments</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{payments.length.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Volume</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            ৳{(payments.reduce((sum, p) => sum + p.amount, 0) / 100000).toFixed(2)}L
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Success Rate</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {payments.length > 0 ? ((payments.filter((p) => p.status === "success").length / payments.length) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registered Merchants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No merchants found
                  </td>
                </tr>
              ) : (
                merchants.map((merchant) => (
                  <tr key={merchant.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{merchant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{merchant.merchantId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{merchant.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{merchant.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(merchant.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{merchant.totalTransactions.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{(merchant.totalVolume / 1000).toFixed(2)}K</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            <input
              type="text"
              placeholder="Search by reference, merchant, phone..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.referenceId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.merchantName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{payment.fee.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.customerPhone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(payment.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
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