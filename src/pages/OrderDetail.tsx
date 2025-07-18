import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { mockOrders } from "./AdminDashboard";
import { ArrowLeft } from "lucide-react";

type OrderType = {
  images: string[];
  customer: string;
  date: string;
  amount: number;
  status: string;
  id: string;
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order: OrderType = (mockOrders || []).find(o => o.id === orderId) || {
    images: [],
    customer: "",
    date: "",
    amount: 0,
    status: "",
    id: "",
  };
  // For demo, assume each image has a print count of 1
  const { images, customer, date, amount, status, id } = order;
  // Track selected images for printing
  const [selected, setSelected] = useState(images.map(() => true));

  // Print only selected images
  const handlePrintSelected = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Photos</title></head><body style="margin:0;padding:0;">');
      images.forEach((img, idx) => {
        if (selected[idx]) {
          printWindow.document.write(`<div style=\"margin-bottom:16px;text-align:center;\"><img src='${img}' style='max-width:90vw;max-height:80vh;border-radius:12px;box-shadow:0 2px 8px #0002;'/></div>`);
        }
      });
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // Print a single image
  const handlePrintOne = (img) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Photo</title></head><body style="margin:0;padding:0;">');
      printWindow.document.write(`<div style=\"margin-bottom:16px;text-align:center;\"><img src='${img}' style='max-width:90vw;max-height:80vh;border-radius:12px;box-shadow:0 2px 8px #0002;'/></div>`);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-50 to-green-50 items-center justify-center py-10 px-2">
      {/* Subtle back button above card */}
      <div className="w-full max-w-5xl flex items-start mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-green-700 font-semibold text-base px-4 py-2 rounded-lg bg-white shadow border border-gray-200 transition-all"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>
      </div>
      <div className="w-full max-w-5xl flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col md:flex-row gap-10 md:gap-12 border border-gray-100 relative">
          {/* Left: Images Preview Column */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <img src="/m2-logo.jpg" alt="M2 Photography Logo" className="w-10 h-10 object-contain rounded" />
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">M2 Photography</h1>
            </div>
            <h2 className="font-semibold text-lg mb-4 text-gray-800">Ordered Photos</h2>
            <div className="overflow-y-auto max-h-[400px] pr-2 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2">
                {images.length === 0 && <div className="text-gray-400">No images</div>}
                {images.map((img, idx) => (
                  <div key={idx} className="relative bg-white rounded shadow-sm p-2 flex flex-col items-center">
                    <img src={img} alt={`Order Photo ${idx + 1}`} className="w-24 h-24 object-cover rounded border mb-2" />
                    <div className="text-xs font-medium text-gray-800 truncate text-center mb-1">Photo {idx + 1}</div>
                    {/* Print count tag (assume 1 for now) */}
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">x1</span>
                    {/* Checkbox for selecting image to print */}
                    <input
                      type="checkbox"
                      checked={selected[idx]}
                      onChange={() => setSelected(sel => sel.map((v, i) => i === idx ? !v : v))}
                      className="absolute top-2 left-2 w-5 h-5 accent-green-500 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-green-400 cursor-pointer"
                      title="Select for printing"
                    />
                    {/* Individual print button */}
                    <Button
                      size="sm"
                      className="mt-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded shadow hover:scale-105 transition-all"
                      onClick={() => handlePrintOne(img)}
                    >
                      Print This Photo
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right: Invoice Details */}
          <div className="w-full md:w-96 flex flex-col justify-center">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 sticky top-10">
              <h3 className="font-semibold text-xl mb-2 text-gray-900">Order Invoice</h3>
              <div className="flex justify-between text-base text-gray-700"><span>Order ID</span><span>{id}</span></div>
              <div className="flex justify-between text-base text-gray-700"><span>Date</span><span>{date}</span></div>
              <div className="flex justify-between text-base text-gray-700"><span>Customer</span><span>{customer}</span></div>
              <div className="flex justify-between text-base text-gray-700"><span>Status</span><span>{status}</span></div>
              <div className="flex justify-between text-base text-gray-700"><span>Photo Count</span><span>{images.length}</span></div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between font-bold text-2xl text-gray-900"><span>Total</span><span>${amount.toFixed(2)}</span></div>
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 rounded-xl text-base shadow-lg transition-all duration-150 active:scale-95"
                onClick={handlePrintSelected}
              >
                Print Photos
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 rounded-xl text-base shadow-lg transition-all duration-150 active:scale-95"
                onClick={() => window.print()}
              >
                Print Invoice
              </Button>
              <div className="text-xs text-gray-400 text-center mt-1">Invoice generated by M2 Photography</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 