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
        <div className="bg-white rounded-2xl shadow-2xl p-12 md:p-16 flex flex-col md:flex-row gap-12 md:gap-16 border border-gray-100 relative max-w-6xl w-full">
          {/* Left: Images Preview Column */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <img src="/m2-logo.jpg" alt="M2 Photography Logo" className="w-14 h-14 object-contain rounded" />
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">M2 Photography</h1>
            </div>
            <h2 className="font-semibold text-2xl mb-6 text-gray-800">Ordered Photos</h2>
            <div className="overflow-y-auto custom-scrollbar max-h-[500px] min-h-[500px] pr-3 border rounded-xl bg-gray-50">
              <div className={`grid ${images.length > 8 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'} gap-4 md:gap-6 p-4`}>
                {images.length === 0 && <div className="text-gray-400">No images</div>}
                {images.map((img, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center">
                    <img
                      src={img}
                      alt={`Order Photo ${idx + 1}`}
                      className="w-72 h-[216px] object-cover rounded-xl border border-green-200 shadow-sm bg-white" // 4:3 ratio: 288px x 216px
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.img-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'img-fallback flex flex-col items-center justify-center w-72 h-[216px] text-gray-400 text-base font-semibold rounded-xl bg-gray-100 border border-green-200 shadow-sm';
                          fallback.innerText = 'Image not found';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right: Invoice Details */}
          <div className="w-full md:w-[420px] flex flex-col justify-center">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col gap-6 sticky top-10">
              <h3 className="font-semibold text-2xl mb-2 text-gray-900">Order Invoice</h3>
              <div className="flex justify-between text-lg text-gray-700"><span>Order ID</span><span>{id}</span></div>
              <div className="flex justify-between text-lg text-gray-700"><span>Date</span><span>{date}</span></div>
              <div className="flex justify-between text-lg text-gray-700"><span>Customer</span><span>{customer}</span></div>
              <div className="flex justify-between text-lg text-gray-700"><span>Status</span><span>{status}</span></div>
              <div className="flex justify-between text-lg text-gray-700"><span>Photo Count</span><span>{images.length}</span></div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between font-bold text-3xl text-gray-900"><span>Total</span><span>${amount.toFixed(2)}</span></div>
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-xl text-lg shadow-lg transition-all duration-150 active:scale-95"
                onClick={handlePrintSelected}
              >
                Print Photos
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl text-lg shadow-lg transition-all duration-150 active:scale-95"
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