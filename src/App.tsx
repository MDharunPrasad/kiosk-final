import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import { CounterStaffDashboard } from "./components/CounterStaffDashboard";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrdersList from "./pages/OrdersList";
import OrderDetail from "./pages/OrderDetail";

const queryClient = new QueryClient();

const App = () => (
  <CartProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter v7_relativeSplatPath>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/operator" element={<CounterStaffDashboard />} />
            <Route path="/orders-list" element={<OrdersList />} />
            <Route path="/order-detail/:orderId" element={<OrderDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </CartProvider>
);

export default App;
