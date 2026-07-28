"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAllUsers, AdminUser } from "@/lib/composition/api";
import { getAllOrders, ApiOrder } from "@/lib/composition/api";

interface MonthPoint {
  name: string;
  revenue: number;
  users: number;
}

const buildLastTwelveMonths = (orders: ApiOrder[], users: AdminUser[]): MonthPoint[] => {
  const now = new Date();
  const months: MonthPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ name: d.toLocaleString("en-US", { month: "short" }), revenue: 0, users: 0 });
  }

  const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
  const startKey = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const bucketIndex = new Map<string, number>();
  for (let i = 0; i < 12; i++) {
    const d = new Date(startKey.getFullYear(), startKey.getMonth() + i, 1);
    bucketIndex.set(monthKey(d), i);
  }

  orders.forEach((o) => {
    if (o.status === "Cancelled" || !o.createdAt) return;
    const idx = bucketIndex.get(monthKey(new Date(o.createdAt)));
    if (idx !== undefined) months[idx].revenue += o.price || 0;
  });

  users.forEach((u) => {
    if (!u.createdAt) return;
    const idx = bucketIndex.get(monthKey(new Date(u.createdAt)));
    if (idx !== undefined) months[idx].users += 1;
  });

  return months;
};

export default function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
  const [pendingOrders, setPendingOrders] = useState<number | null>(null);
  const [chartData, setChartData] = useState<MonthPoint[]>([]);
  const [metric, setMetric] = useState<"revenue" | "users">("revenue");

  useEffect(() => {
    Promise.all([
      getAllUsers({ page: 1, limit: 1000 }),
      getAllOrders(),
    ])
      .then(([usersResult, ordersResult]) => {
        const users: AdminUser[] = usersResult.data || [];
        const orders: ApiOrder[] = ordersResult.data || [];

        setTotalUsers(usersResult.meta?.total ?? users.length);

        const now = new Date();
        const revenue = orders
          .filter((o) => {
            if (o.status === "Cancelled" || !o.createdAt) return false;
            const created = new Date(o.createdAt);
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          })
          .reduce((sum, o) => sum + (o.price || 0), 0);
        setMonthlyRevenue(revenue);
        setPendingOrders(orders.filter((o) => o.status === "Processing" || o.status === "Delayed").length);

        setChartData(buildLastTwelveMonths(orders, users));
      })
      .catch(() => {
        setTotalUsers(0);
        setMonthlyRevenue(0);
        setPendingOrders(0);
        setChartData([]);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrative Cockpit</h1>
          <p className="text-gray-500 mt-1">Real-time culinary performance metrics and system health.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div><p className="text-xs font-bold text-gray-400 uppercase">Total Users</p><h3 className="text-3xl font-bold mt-1">{totalUsers === null ? "…" : totalUsers.toLocaleString()}</h3></div>
            <div className="p-2 bg-orange-50 rounded-lg text-[#B34B20]"><Users className="w-5 h-5" /></div>
          </div>
          <span className="text-gray-400 text-sm font-semibold">Registered accounts</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div><p className="text-xs font-bold text-gray-400 uppercase">Monthly Revenue</p><h3 className="text-3xl font-bold mt-1">NPR {(monthlyRevenue ?? 0).toLocaleString()}</h3></div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign className="w-5 h-5" /></div>
          </div>
          <span className="text-gray-400 text-sm font-semibold">From non-cancelled orders this month</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div><p className="text-xs font-bold text-gray-400 uppercase">Pending Orders</p><h3 className="text-3xl font-bold mt-1">{pendingOrders === null ? "…" : pendingOrders}</h3></div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600"><Package className="w-5 h-5" /></div>
          </div>
          <span className="text-gray-400 text-sm font-semibold">Processing or delayed</span>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900">Interactive Analytics</h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMetric("revenue")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${metric === "revenue" ? "bg-white shadow-sm text-[#B34B20]" : "text-gray-500"}`}
            >
              Revenue
            </button>
            <button
              onClick={() => setMetric("users")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${metric === "users" ? "bg-white shadow-sm text-[#B34B20]" : "text-gray-500"}`}
            >
              Users
            </button>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey={metric} fill="#B34B20" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {metric === "revenue" ? "Revenue from non-cancelled orders, " : "New user signups, "}
          last 12 months.
        </p>
      </div>
    </div>
  );
}
