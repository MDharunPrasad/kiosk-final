import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { mockOrders } from "./AdminDashboard";
import { ArrowLeft } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Paid", value: "Paid" },
  { label: "Refunded", value: "Refunded" },
];
const SORT_OPTIONS = [
  { label: "Name A-Z", value: "az" },
  { label: "Name Z-A", value: "za" },
  { label: "Date Newest", value: "date_new" },
  { label: "Date Oldest", value: "date_old" },
];

function sortOrders(orders, sort) {
  if (sort === "az") return [...orders].sort((a, b) => a.customer.localeCompare(b.customer));
  if (sort === "za") return [...orders].sort((a, b) => b.customer.localeCompare(a.customer));
  if (sort === "date_new") return [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sort === "date_old") return [...orders].sort((a, b) => new Date(a.date) - new Date(b.date));
  return orders;
}

export default function OrdersList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("az");
  let filteredOrders = (mockOrders || []).filter(o =>
    (statusFilter === "all" ? true : o.status === statusFilter) &&
    (o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
  );
  filteredOrders = sortOrders(filteredOrders, sort);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-50 to-green-50 items-center justify-center py-10 px-2">
      {/* Subtle back button above card */}
      <div className="w-full max-w-4xl flex items-start mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-green-700 font-semibold text-base px-4 py-2 rounded-lg bg-white shadow border border-gray-200 transition-all"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>
      <div className="w-full max-w-4xl flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100 flex flex-col items-center w-full">
          {/* Filter Row */}
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 p-6 bg-white rounded-xl shadow border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center gap-6 w-full">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700 text-lg md:mr-2">Status</label>
                <select
                  className="border-2 border-green-200 rounded-lg px-5 py-3 text-lg shadow-sm focus:ring-2 focus:ring-green-400 appearance-none bg-white min-w-[180px]"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="font-semibold text-gray-700 text-lg">Search</label>
                <input
                  type="text"
                  placeholder="Order ID or Customer"
                  className="border-2 border-green-200 rounded-lg px-5 py-3 text-lg shadow-sm focus:ring-2 focus:ring-green-400 bg-white w-full"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700 text-lg">Sort By</label>
                <select
                  className="border-2 border-green-200 rounded-lg px-5 py-3 text-lg shadow-sm focus:ring-2 focus:ring-green-400 appearance-none bg-white min-w-[160px]"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <h2 className="font-semibold text-2xl mb-6 text-green-800">Completed Orders</h2>
          <table className="w-full text-lg">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-3">Order ID</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Date</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-green-50/40 transition">
                  <td className="py-3 font-medium">{order.id}</td>
                  <td className="py-3">{order.customer}</td>
                  <td className="py-3">{order.date}</td>
                  <td className="py-3">${order.amount.toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded text-base font-semibold ${order.status === "Paid" ? "bg-green-100 text-green-700" : order.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-purple-100 text-purple-700"}`}>{order.status}</span>
                  </td>
                  <td className="py-3">
                    <Button size="lg" variant="outline" onClick={() => navigate(`/order-detail/${order.id}`)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 