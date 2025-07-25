import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state || {};
  const { cartItems = [], subtotal = 0, tax = 0, total = 0, orderDate, photographer = "", orderNumber } = order;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-2">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col md:flex-row gap-10 md:gap-12 border border-gray-100 relative">
          {/* Left: Images Preview Column */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <img src="/m2-logo.jpg" alt="M2 Photography Logo" className="w-10 h-10 object-contain rounded" />
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">M2 Photography</h1>
            </div>
            <div className="mb-4">
              <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-base shadow">Order Placed Successfully</span>
            </div>
            <h2 className="font-semibold text-lg mb-4 text-gray-800">Your Ordered Photos</h2>
            <div className="overflow-y-auto max-h-[400px] pr-2 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="relative bg-white rounded shadow-sm p-2 flex flex-col items-center">
                    <img src={item.thumb} alt={item.name} className="w-24 h-24 object-cover rounded border mb-2" />
                    <div className="text-xs font-medium text-gray-800 truncate text-center mb-1">{item.name}</div>
                    {/* Print count tag */}
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right: Invoice Details */}
          <div className="w-full md:w-96 flex flex-col justify-center">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 sticky top-10">
              <h3 className="font-semibold text-xl mb-2 text-gray-900">Order Invoice</h3>
              {orderNumber && (
                <div className="flex justify-between text-base text-gray-700"><span>Order Number</span><span>{orderNumber}</span></div>
              )}
              <div className="flex justify-between text-base text-gray-700"><span>Date</span><span>{orderDate ? new Date(orderDate).toLocaleDateString() : "-"}</span></div>
              <div className="flex justify-between text-base text-gray-700"><span>Photographer</span><span>{photographer || "-"}</span></div>
              <div className="flex justify-between text-base text-gray-700"><span>Photo Count</span><span>{cartItems.length}</span></div>
              <div className="flex justify-between text-base font-medium text-gray-700"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-base text-gray-700"><span>Tax (8.25%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between font-bold text-2xl text-gray-900"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <div className="flex gap-3 mt-4">
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 rounded-xl text-base shadow-lg transition-all duration-150 active:scale-95" onClick={() => window.print()}>
                  Print Invoice
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 rounded-xl text-base shadow-lg transition-all duration-150 active:scale-95" onClick={() => alert('Printing photos...')}>
                  Print Photos
                </Button>
              </div>
              {/* Move Done button here, below Print buttons */}
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => navigate('/operator')}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-full shadow-lg text-lg transition-all"
                >
                  Done
                </Button>
              </div>
              <div className="text-xs text-gray-400 text-center mt-1">Invoice generated by M2 Photography</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 