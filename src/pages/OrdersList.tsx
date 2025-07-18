import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { mockOrders } from "./AdminDashboard";
import { ArrowLeft } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Ordered", value: "Ordered" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Pending", value: "Pending" },
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
  if (sort === "date_new") return [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (sort === "date_old") return [...orders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
    <div className="min-h-screen w-full flex bg-gradient-to-br from-gray-50 to-green-50">
      {/* Sidebar for filters */}
      <div className="w-80 min-w-[260px] bg-white border-r border-gray-200 flex flex-col p-8 gap-8 shadow-xl">
        <button
          onClick={() => navigate("/operator")}
          className="flex items-center gap-2 text-gray-500 hover:text-green-700 font-semibold text-base px-4 py-2 rounded-lg bg-white shadow border border-gray-200 transition-all mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex flex-col gap-6">
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
          <div className="flex flex-col gap-2">
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
      {/* Main dashboard area */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-8">
        <div className="w-full max-w-6xl flex flex-col items-center justify-center min-h-[70vh]">
          <div className="bg-white rounded-2xl shadow-2xl p-12 border border-gray-100 flex flex-col items-center w-full h-[80vh] max-h-[900px]">
            <h2 className="font-semibold text-3xl mb-8 text-green-800">Completed Orders</h2>
            <div className="w-full flex-1 overflow-y-auto min-h-0 custom-scrollbar" style={{ maxHeight: "600px" }}>
              <table className="w-full text-lg border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-green-50/60 transition rounded-xl">
                      <td className="py-3 px-4 font-medium bg-white rounded-l-xl shadow-sm">{order.id}</td>
                      <td className="py-3 px-4 bg-white shadow-sm">{order.customer}</td>
                      <td className="py-3 px-4 bg-white shadow-sm">{order.date}</td>
                      <td className="py-3 px-4 bg-white shadow-sm">${order.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 bg-white shadow-sm">
                        <span className={`px-3 py-1 rounded text-base font-semibold ${order.status === "Ordered" ? "bg-green-100 text-green-700" : order.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{order.status}</span>
                      </td>
                      <td className="py-3 px-4 bg-white rounded-r-xl shadow-sm">
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
      </div>
    </div>
  );
} 