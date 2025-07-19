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
    <div className="min-h-screen w-full flex bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Sidebar for filters */}
      <div className="w-80 min-w-[260px] bg-white/90 backdrop-blur-sm border-r border-green-200/50 flex flex-col p-8 gap-8 shadow-2xl animate-slide-in-left">
        <button
          onClick={() => navigate("/operator")}
          className="flex items-center gap-2 text-white font-semibold text-base px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 text-lg md:mr-2">Status</label>
            <select
              className="border-2 border-green-200 rounded-xl px-5 py-3 text-lg shadow-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 appearance-none bg-white/80 backdrop-blur-sm min-w-[180px] transition-all duration-200 hover:shadow-xl"
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
              className="border-2 border-green-200 rounded-xl px-5 py-3 text-lg shadow-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/80 backdrop-blur-sm w-full transition-all duration-200 hover:shadow-xl"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 text-lg">Sort By</label>
            <select
              className="border-2 border-green-200 rounded-xl px-5 py-3 text-lg shadow-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 appearance-none bg-white/80 backdrop-blur-sm min-w-[160px] transition-all duration-200 hover:shadow-xl"
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
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-8 animate-slide-in-right">
        <div className="w-full max-w-6xl flex flex-col items-center justify-center min-h-[70vh]">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-green-100/50 flex flex-col items-center w-full h-[80vh] max-h-[900px] animate-fade-in">
            <h2 className="font-bold text-4xl mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Completed Orders</h2>
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
                    <tr key={order.id} className="border-b last:border-0 hover:bg-green-50/60 transition-all duration-300 transform hover:scale-[1.02] rounded-xl group">
                      <td className="py-4 px-6 font-medium bg-white/90 backdrop-blur-sm rounded-l-xl shadow-lg group-hover:shadow-xl transition-all duration-300">{order.id}</td>
                      <td className="py-4 px-6 bg-white/90 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300">{order.customer}</td>
                      <td className="py-4 px-6 bg-white/90 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300">{order.date}</td>
                      <td className="py-4 px-6 bg-white/90 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300">${order.amount.toFixed(2)}</td>
                      <td className="py-4 px-6 bg-white/90 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <span className={`px-4 py-2 rounded-full text-base font-semibold shadow-md ${order.status === "Ordered" ? "bg-gradient-to-r from-green-400 to-green-500 text-white" : order.status === "Pending" ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white" : order.status === "Cancelled" ? "bg-gradient-to-r from-red-400 to-red-500 text-white" : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"}`}>{order.status}</span>
                      </td>
                      <td className="py-4 px-6 bg-white/90 backdrop-blur-sm rounded-r-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <Button size="lg" variant="outline" onClick={() => navigate(`/order-detail/${order.id}`)} className="hover:bg-green-50 hover:border-green-300 transition-all duration-200">
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