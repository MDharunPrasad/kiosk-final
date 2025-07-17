import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Users, Camera, FileText, Settings, DollarSign, BarChart2, Home, Edit, Trash2 } from "lucide-react";
import { mockSessions } from "@/components/CounterStaffDashboard";
import { BarChart, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Bar } from "recharts";
import { useTheme } from "next-themes";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { useMediaQuery } from "@uidotdev/usehooks";

// Mock order data
const mockOrders = [
  { id: "ORD-1001", customer: "Emma Johnson", date: "2024-07-14", amount: 125.00, status: "Paid" },
  { id: "ORD-1002", customer: "Michael Smith", date: "2024-07-13", amount: 81.50, status: "Pending" },
  { id: "ORD-1003", customer: "Sarah Williams", date: "2024-07-12", amount: 210.70, status: "Paid" },
  { id: "ORD-1004", customer: "David Brown", date: "2024-07-11", amount: 65.20, status: "Refunded" },
  { id: "ORD-1005", customer: "Jessica Miller", date: "2024-07-10", amount: 145.00, status: "Paid" },
];

const SIDEBAR_LINKS = [
  { label: "Dashboard", key: "dashboard", icon: <Home className="w-5 h-5 mr-2" /> },
  { label: "Sessions", key: "sessions", icon: <Camera className="w-5 h-5 mr-2" /> },
  { label: "Orders", key: "orders", icon: <FileText className="w-5 h-5 mr-2" /> },
  { label: "Manage Photographers", key: "photographers", icon: <User className="w-5 h-5 mr-2" /> },
  { label: "Manage Operators", key: "operators", icon: <Users className="w-5 h-5 mr-2" /> },
  { label: "Pricing", key: "pricing", icon: <DollarSign className="w-5 h-5 mr-2" /> },
  { label: "Generate Reports", key: "reports", icon: <BarChart2 className="w-5 h-5 mr-2" /> },
  { label: "Settings", key: "settings", icon: <Settings className="w-5 h-5 mr-2" /> },
];

// Mock KPI data
const kpiData = {
  totalSessions: mockSessions.length,
  totalRevenue: 24568,
  totalCustomers: 856,
  avgOrderValue: 86.42,
};

// Mock chart data
const revenueTrendData = [
  { week: "Week 1", revenue: 7500 },
  { week: "Week 2", revenue: 8200 },
  { week: "Week 3", revenue: 7900 },
  { week: "Week 4", revenue: 8100 },
];
const sessionsPieData = [
  { name: "Monday", value: 120 },
  { name: "Tuesday", value: 140 },
  { name: "Wednesday", value: 180 },
  { name: "Thursday", value: 160 },
  { name: "Friday", value: 200 },
  { name: "Weekend", value: 448 },
];
const orderStatusPieData = [
  { name: "Paid", value: 785 },
  { name: "Pending", value: 152 },
  { name: "Refunded", value: 63 },
];
const pieColors = ["#8b5cf6", "#6366f1", "#f472b6", "#22d3ee", "#facc15", "#34d399", "#f87171"];

// --- Error Boundary for Robustness ---
class DashboardErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // Log error to service if needed
    // console.error("Dashboard Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong in the dashboard.</h2>
          <pre className="bg-red-50 text-red-800 rounded p-4 max-w-xl overflow-x-auto text-xs">{String(this.state.error)}</pre>
          <button className="mt-6 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded shadow" onClick={() => window.location.reload()}>Reload Dashboard</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Safe Legend Function ---
const renderSessionsLegend = (props: any) => {
  const { payload } = props || {};
  if (!payload || !Array.isArray(payload)) return null;
  return (
    <div className={`flex ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'flex-wrap justify-center' : 'flex-col items-start'} gap-2 mt-4`} style={{ maxWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 120 }}>
      {payload.map((entry: any, idx: number) => (
        <div key={entry?.value || idx} className="flex items-center gap-2 text-xs font-semibold" style={{ minWidth: 80 }}>
          <span style={{ background: entry?.color, width: 12, height: 12, borderRadius: 6, display: 'inline-block' }}></span>
          <span style={{ color: entry?.color }}>{entry?.value}</span>
        </div>
      ))}
    </div>
  );
};

// --- Robust sample session fallback ---
const sampleSessionsFallback = [
  {
    id: "sample-1",
    name: "Family Portrait",
    date: "2024-07-20",
    type: "Family",
    status: "pending",
    printCount: 2,
    images: ["/public/placeholder.svg"],
    customerDetails: {
      name: "Johnson Family",
      location: "Central Park",
      date: "2024-07-20",
      photographer: "John Doe"
    }
  },
  {
    id: "sample-2",
    name: "Wedding Photography",
    date: "2024-07-15",
    type: "Wedding",
    status: "ready",
    printCount: 5,
    images: ["/public/placeholder.svg"],
    customerDetails: {
      name: "Sarah & Mike",
      location: "Riverside Gardens",
      date: "2024-07-15",
      photographer: "Jane Smith"
    }
  },
  {
    id: "sample-3",
    name: "Graduation Photoshoot",
    date: "2024-07-10",
    type: "Graduation",
    status: "completed",
    printCount: 3,
    images: ["/public/placeholder.svg"],
    customerDetails: {
      name: "Emily Rodriguez",
      location: "University Campus",
      date: "2024-07-10",
      photographer: "John Doe"
    }
  }
];

// --- Sample data for photographers ---
const samplePhotographers = [
  {
    id: 'P-001',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    phone: '+1 (555) 123-4567',
    sessionsCompleted: 142,
    active: true,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 'P-002',
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1 (555) 987-6543',
    sessionsCompleted: 98,
    active: true,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 'P-003',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '+1 (555) 456-7890',
    sessionsCompleted: 67,
    active: false,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: 'P-004',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 321-0987',
    sessionsCompleted: 203,
    active: true,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];
// --- Sample data for operators ---
const sampleOperators = [
  {
    id: 'OP-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    role: 'Operator',
    lastLogin: '2 hours ago',
    lastLoginDate: 'Jul 14, 2025',
    active: true,
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: 'OP-002',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 987-6543',
    role: 'Support',
    lastLogin: '1 day ago',
    lastLoginDate: 'Jul 13, 2025',
    active: true,
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
  },
  {
    id: 'OP-003',
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@email.com',
    phone: '+1 (555) 456-7890',
    role: 'Operator',
    lastLogin: '3 days ago',
    lastLoginDate: 'Jul 11, 2025',
    active: false,
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
  },
];

// --- Sample/mock data for reports ---
const reportKpis = {
  totalOrders: 1247,
  totalRevenue: 31175,
  sessionsCount: 892,
  topPhotographer: {
    name: 'Sarah Johnson',
    sessions: 342,
  },
  ordersChange: 12.5,
  revenueChange: 8.2,
  sessionsChange: 15.3,
};
const reportRevenueTrend = [
  { week: 'Week 1', revenue: 7500 },
  { week: 'Week 2', revenue: 8200 },
  { week: 'Week 3', revenue: 7900 },
  { week: 'Week 4', revenue: 8100 },
];
const reportOrderStatus = [
  { name: 'Paid', value: 981 },
  { name: 'Pending', value: 190 },
  { name: 'Refunded', value: 76 },
];
const reportPieColors = ['#4f46e5', '#fbbf24', '#f87171'];

// Animated Counter Hook
function useAnimatedNumber(target: number, duration = 1000) {
  const [value, setValue] = React.useState(0);
  useEffect(() => {
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line
  }, [target]);
  return value;
}

// --- Settings section state (demo only) ---
const [settingsProfile, setSettingsProfile] = React.useState({
  name: 'John Doe',
  email: 'admin@email.com',
  password: '',
});
const [settingsNotifications, setSettingsNotifications] = React.useState({
  email: true,
  sms: false,
  push: true,
});
const handleSettingsChange = (field: string, value: any) => {
  setSettingsProfile((prev) => ({ ...prev, [field]: value }));
};
const handleNotifChange = (field: string, value: boolean) => {
  setSettingsNotifications((prev) => ({ ...prev, [field]: value }));
};
const handleSettingsSave = () => {
  // Demo only: show a toast or alert
  alert('Settings saved! (demo only)');
};
const handleSettingsDelete = () => {
  if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    alert('Account deleted! (demo only)');
  }
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [modal, setModal] = useState<{ type: "session" | "order"; data: any } | null>(null);
  const [showAddBundle, setShowAddBundle] = useState(false);

  const animatedSessions = useAnimatedNumber(kpiData.totalSessions);
  const animatedRevenue = useAnimatedNumber(kpiData.totalRevenue);
  const animatedCustomers = useAnimatedNumber(kpiData.totalCustomers);
  const animatedAvgOrder = useAnimatedNumber(Math.round(kpiData.avgOrderValue));

  const { theme, setTheme } = useTheme ? useTheme() : { theme: "light", setTheme: () => {} };
  const [dateRange, setDateRange] = useState({ from: "2024-07-01", to: "2024-07-31" });
  const [statusFilter, setStatusFilter] = useState("");
  const [photographerFilter, setPhotographerFilter] = useState("");

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // Patch: Safe import for mockSessions
  let mockSessions: any[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mockSessions = require("@/components/CounterStaffDashboard").mockSessions || [];
  } catch (e) {
    mockSessions = [];
  }

  // Use fallback if mockSessions is empty or not an array
  const safeMockSessions = Array.isArray(mockSessions) && mockSessions.length > 0 ? mockSessions : sampleSessionsFallback;
  const filteredSessions = (safeMockSessions).filter(s =>
    (!statusFilter || s.status === statusFilter) &&
    (!photographerFilter || s.customerDetails.photographer === photographerFilter)
  );
  const recentSessions = filteredSessions.length > 0 ? filteredSessions : safeMockSessions.slice(0, 3);
  const allSessions = filteredSessions.length > 0 ? filteredSessions : safeMockSessions.slice(0, 3);
  const filteredOrders = mockOrders.filter(o =>
    !statusFilter || (statusFilter === "Paid" && o.status === "Paid") || (statusFilter === "Pending" && o.status === "Pending") || (statusFilter === "Refunded" && o.status === "Refunded")
  );
  const photographers = Array.from(new Set((mockSessions || []).map(s => s.customerDetails.photographer).filter(Boolean)));

  function handleExport(type: "pdf" | "excel") {
    toast.success(`Exported as ${type.toUpperCase()}! (mock)`);
  }

  return (
    <DashboardErrorBoundary>
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-border p-4 flex justify-between items-center shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/m2-logo.jpg" alt="M2 Photography Logo" className="w-8 h-8 object-contain rounded mr-2" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">M2 Admin Portal</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-left bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-4 py-2 rounded-lg shadow-sm border border-purple-200 dark:border-slate-600">
            <p className="font-bold text-slate-800 dark:text-slate-200 text-base">John Doe</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{new Date().toLocaleDateString()}</p>
          </div>
          <Button 
            onClick={() => { localStorage.removeItem("currentUser"); window.location.href = "/"; }}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Logout
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar */}
        <aside className="w-72 lg:w-80 bg-white dark:bg-slate-800 border-r border-border p-4 lg:p-6 flex flex-col flex-shrink-0 min-w-0 group">
          <div className="mb-8 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 block" />
            <span className="font-bold text-lg text-purple-700 tracking-wide">Admin Menu</span>
          </div>
          <nav className="flex-1">
            <ul className="space-y-1">
              {SIDEBAR_LINKS.map(link => (
                <li key={link.key}>
                  <button
                    className={`w-full flex items-center px-4 py-2 rounded-lg transition font-medium text-base gap-2 ${activeSection === link.key ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 shadow" : "hover:bg-muted/50 text-gray-700 dark:text-gray-200"}`}
                    onClick={() => setActiveSection(link.key)}
                  >
                    {link.icon}
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto pt-8 border-t flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold text-lg">J</div>
            <div>
              <div className="font-semibold text-sm">John Doe</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-transparent">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{SIDEBAR_LINKS.find(l => l.key === activeSection)?.label}</h1>
          </div>
          {/* Section Content */}
          {activeSection === "dashboard" && (
            <>
              {/* KPI Cards Section */}
              <div className="w-full bg-gradient-to-r from-white via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950 rounded-2xl shadow-none p-2 md:p-4 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 md:p-6 flex flex-col items-start border border-purple-100 dark:border-slate-700 transition-transform hover:scale-105 min-w-0">
                    <span className="text-xs font-semibold text-purple-700 mb-1 md:mb-2">Total Sessions</span>
                    <span className="text-2xl md:text-3xl font-extrabold text-purple-900 dark:text-white">{animatedSessions.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 mt-1">+5% this month</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 md:p-6 flex flex-col items-start border border-indigo-100 dark:border-slate-700 transition-transform hover:scale-105 min-w-0">
                    <span className="text-xs font-semibold text-indigo-700 mb-1 md:mb-2">Total Revenue</span>
                    <span className="text-2xl md:text-3xl font-extrabold text-indigo-900 dark:text-white">${animatedRevenue.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 mt-1">+8% this month</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 md:p-6 flex flex-col items-start border border-pink-100 dark:border-slate-700 transition-transform hover:scale-105 min-w-0">
                    <span className="text-xs font-semibold text-pink-700 mb-1 md:mb-2">Total Customers</span>
                    <span className="text-2xl md:text-3xl font-extrabold text-pink-900 dark:text-white">{animatedCustomers.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 mt-1">+3% this month</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 md:p-6 flex flex-col items-start border border-indigo-100 dark:border-slate-700 transition-transform hover:scale-105 min-w-0">
                    <span className="text-xs font-semibold text-indigo-700 mb-1 md:mb-2">Avg. Order Value</span>
                    <span className="text-2xl md:text-3xl font-extrabold text-indigo-900 dark:text-white">${animatedAvgOrder.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 mt-1">-2% this month</span>
                  </div>
                </div>
              </div>
              {/* Divider between KPI and charts */}
              <div className="w-full flex justify-center mb-10">
                <div className="h-1 w-2/3 bg-gradient-to-r from-purple-100 via-indigo-100 to-pink-100 dark:from-purple-900 dark:via-indigo-900 dark:to-pink-900 rounded-full opacity-60"></div>
              </div>
              {/* Charts Section */}
              <div className="w-full bg-gradient-to-r from-white via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 rounded-2xl shadow-none p-2 md:p-4 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {/* Revenue Trend Bar Chart */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 md:p-6 border border-purple-100 dark:border-slate-700 flex flex-col min-w-0">
                    <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 text-purple-800 dark:text-purple-200">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={revenueTrendData}>
                        <XAxis dataKey="week" stroke="#a78bfa" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a78bfa" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#ede9fe', borderRadius: 8, border: 'none' }} />
                        <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Sessions Distribution Pie Chart */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 md:p-6 border border-purple-100 dark:border-slate-700 flex flex-col min-w-0">
                    <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 text-purple-800 dark:text-purple-200">Sessions Distribution</h3>
                    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center`}>
                      <ResponsiveContainer width={isMobile ? '100%' : 160} height={200}>
                        <PieChart>
                          <Pie data={sessionsPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={32} label fontSize={12}>
                            {sessionsPieData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#ede9fe', borderRadius: 8, border: 'none' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="ml-0 md:ml-6 mt-4 md:mt-0">
                        <Legend content={renderSessionsLegend} />
                      </div>
                    </div>
                  </div>
                  {/* Order Status Breakdown Pie Chart */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 md:p-6 border border-purple-100 dark:border-slate-700 flex flex-col min-w-0">
                    <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 text-purple-800 dark:text-purple-200">Order Status Breakdown</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={orderStatusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={32} label fontSize={12}>
                          {orderStatusPieData.map((entry, idx) => (
                            <Cell key={`cell-status-${idx}`} fill={pieColors[idx % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#ede9fe', borderRadius: 8, border: 'none' }} />
                        <Legend verticalAlign="bottom" height={32} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {/* Filters and Export Buttons */}
              <div className="flex flex-wrap gap-4 items-center mb-8">
                {/* Date Range Picker (mock) */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-lg px-4 py-2 shadow">
                  <Calendar className="w-4 h-4 text-purple-500 mr-2" />
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                    className="bg-transparent outline-none text-sm w-28"
                  />
                  <span className="mx-2 text-gray-400">to</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                    className="bg-transparent outline-none text-sm w-28"
                  />
                </div>
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-lg px-4 py-2 text-sm shadow"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                </select>
                {/* Photographer Filter */}
                <select
                  value={photographerFilter}
                  onChange={e => setPhotographerFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-lg px-4 py-2 text-sm shadow"
                >
                  <option value="">All Photographers</option>
                  {photographers.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                {/* Export Buttons */}
                <button
                  onClick={() => handleExport("pdf")}
                  className="ml-auto px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-all"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:scale-105 transition-all"
                >
                  Export Excel
                </button>
              </div>
              {/* Sessions Table */}
              <div className="w-full flex flex-col gap-8 mt-2">
                {/* Recent Sessions Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-10 border border-purple-100 dark:border-slate-700 mb-4">
                  <h2 className="font-semibold text-xl mb-6 text-purple-800 dark:text-purple-200">Recent Sessions</h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-3">Session</th>
                        <th className="py-3">Customer</th>
                        <th className="py-3">Date</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(recentSessions || []).map(session => (
                        <tr key={session.id} className="border-b last:border-0 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition">
                          <td className="py-4 font-medium">{session.name}</td>
                          <td className="py-4">{session.customerDetails.name}</td>
                          <td className="py-4">{session.date}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${session.status === "completed" ? "bg-green-100 text-green-700" : session.status === "ready" ? "bg-indigo-100 text-indigo-700" : "bg-yellow-100 text-yellow-700"}`}>{session.status.charAt(0).toUpperCase() + session.status.slice(1)}</span>
                          </td>
                          <td className="py-4">
                            <Button size="sm" variant="outline" onClick={() => setModal({ type: "session", data: session })}>View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Recent Orders Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-10 border border-purple-100 dark:border-slate-700">
                  <h2 className="font-semibold text-xl mb-6 text-purple-800 dark:text-purple-200">Recent Orders</h2>
                  <table className="w-full text-sm">
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
                        <tr key={order.id} className="border-b last:border-0 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition">
                          <td className="py-4 font-medium">{order.id}</td>
                          <td className="py-4">{order.customer}</td>
                          <td className="py-4">{order.date}</td>
                          <td className="py-4">${order.amount.toFixed(2)}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === "Paid" ? "bg-green-100 text-green-700" : order.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-purple-100 text-purple-700"}`}>{order.status}</span>
                          </td>
                          <td className="py-4">
                            <Button size="sm" variant="outline" onClick={() => setModal({ type: "order", data: order })}>View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {/* Sessions Section */}
          {activeSection === "sessions" && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-slate-700">
              <h2 className="font-semibold text-xl mb-4 text-purple-800 dark:text-purple-200">All Sessions</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2">Session</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(allSessions || []).map(session => (
                    <tr key={session.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{session.name}</td>
                      <td className="py-2">{session.customerDetails.name}</td>
                      <td className="py-2">{session.date}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${session.status === "completed" ? "bg-green-100 text-green-700" : session.status === "ready" ? "bg-indigo-100 text-indigo-700" : "bg-yellow-100 text-yellow-700"}`}>{session.status.charAt(0).toUpperCase() + session.status.slice(1)}</span>
                      </td>
                      <td className="py-2">
                        <Button size="sm" variant="outline" onClick={() => setModal({ type: "session", data: session })}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Orders Section */}
          {activeSection === "orders" && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-slate-700">
              <h2 className="font-semibold text-xl mb-4 text-purple-800 dark:text-purple-200">All Orders</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2">Order ID</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map(order => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{order.id}</td>
                      <td className="py-2">{order.customer}</td>
                      <td className="py-2">{order.date}</td>
                      <td className="py-2">${order.amount.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === "Paid" ? "bg-green-100 text-green-700" : order.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-purple-100 text-purple-700"}`}>{order.status}</span>
                      </td>
                      <td className="py-2">
                        <Button size="sm" variant="outline" onClick={() => setModal({ type: "order", data: order })}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === "pricing" && (
            <div className="w-full max-w-6xl mx-auto bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950 rounded-2xl shadow-xl p-8 md:p-12 mt-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-md p-6 flex flex-col items-start border border-purple-100 dark:border-slate-700">
                  <span className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Price per Image</span>
                  <span className="text-3xl font-extrabold text-purple-900 dark:text-white">₹25.00</span>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-md p-6 flex flex-col items-start border border-indigo-100 dark:border-slate-700">
                  <span className="text-xs font-semibold text-indigo-700 mb-2 flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Most Popular Bundle</span>
                  <span className="text-3xl font-extrabold text-indigo-900 dark:text-white">10 Photos Pack</span>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-md p-6 flex flex-col items-start border border-pink-100 dark:border-slate-700">
                  <span className="text-xs font-semibold text-pink-700 mb-2 flex items-center gap-2"><Camera className="w-4 h-4" /> Total Bundles</span>
                  <span className="text-3xl font-extrabold text-pink-900 dark:text-white">3</span>
                </div>
              </div>
              {/* Bundle Offers Grid */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-2xl text-purple-800 dark:text-purple-200">Bundle Offers</h2>
                <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-all" onClick={() => setShowAddBundle(true)}>
                  + Add New Bundle
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Example bundles, replace with real data if available */}
                {[
                  { name: "5 Photos Pack", images: 5, price: 100, perImage: 20, savings: 25, savingsPct: 20 },
                  { name: "10 Photos Pack", images: 10, price: 180, perImage: 18, savings: 70, savingsPct: 28 },
                  { name: "20 Photos Pack", images: 20, price: 320, perImage: 16, savings: 180, savingsPct: 36 },
                ].map((bundle, idx) => (
                  <div key={bundle.name} className="bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-lg p-6 border border-purple-100 dark:border-slate-700 flex flex-col gap-2 hover:shadow-2xl hover:scale-[1.03] transition-all relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg text-purple-800 dark:text-purple-200">{bundle.name}</span>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="hover:bg-indigo-100 dark:hover:bg-indigo-900" title="Edit Bundle"><Edit className="w-4 h-4 text-indigo-500" /></Button>
                        <Button size="icon" variant="ghost" className="hover:bg-pink-100 dark:hover:bg-pink-900" title="Delete Bundle"><Trash2 className="w-4 h-4 text-pink-500" /></Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <div>Images: <span className="font-semibold">{bundle.images}</span></div>
                      <div>Price: <span className="font-semibold text-indigo-600 dark:text-indigo-300">₹{bundle.price}</span></div>
                      <div>Per Image: <span className="font-semibold text-purple-600 dark:text-purple-300">₹{bundle.perImage}</span></div>
                      <div>Savings: <span className="font-semibold text-green-600 dark:text-green-400">₹{bundle.savings} ({bundle.savingsPct}%)</span></div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Add/Edit Bundle Modal (mock, UI only) */}
              {showAddBundle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-purple-200 dark:border-slate-700">
                    <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl font-bold" onClick={() => setShowAddBundle(false)}>&times;</button>
                    <h2 className="font-bold text-xl mb-4 text-purple-800 dark:text-purple-200">Add New Bundle</h2>
                    <div className="flex flex-col gap-4">
                      <input type="text" placeholder="Bundle Name" className="border rounded-lg px-4 py-2" />
                      <input type="number" placeholder="Number of Images" className="border rounded-lg px-4 py-2" />
                      <input type="number" placeholder="Total Price" className="border rounded-lg px-4 py-2" />
                    </div>
                    <div className="flex gap-4 mt-6 justify-end">
                      <Button variant="outline" className="px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all" onClick={() => setShowAddBundle(false)}>Cancel</Button>
                      <Button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-all">Save</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Manage Photographers Section */}
          {activeSection === "photographers" && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-slate-700">
              <h2 className="font-semibold text-xl mb-6 text-purple-800 dark:text-purple-200">Photographers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(samplePhotographers || []).map((p) => (
                  <div key={p.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6 flex flex-col items-start border border-purple-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-2">
                      <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full object-cover border" />
                      <div>
                        <div className="font-bold text-lg text-purple-900 dark:text-white">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.email}</div>
                        <div className="text-xs text-gray-400">{p.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-indigo-700">Sessions Completed:</span>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">{p.sessionsCompleted}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Edit</Button>
                      <span className={`ml-2 w-3 h-3 rounded-full ${p.active ? 'bg-green-400' : 'bg-gray-300'}`} title={p.active ? 'Active' : 'Inactive'}></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Manage Operators Section */}
          {activeSection === "operators" && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-slate-700">
              <h2 className="font-semibold text-xl mb-6 text-purple-800 dark:text-purple-200">Operators</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Operator</th>
                      <th className="py-2">Contact</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Last Login</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sampleOperators || []).map((op) => (
                      <tr key={op.id} className="border-b last:border-0">
                        <td className="py-2 flex items-center gap-3">
                          <img src={op.avatar} alt={op.name} className="w-8 h-8 rounded-full object-cover border" />
                          <div>
                            <div className="font-semibold">{op.name}</div>
                            <div className="text-xs text-gray-400">{op.id}</div>
                          </div>
                        </td>
                        <td className="py-2">
                          <div className="text-xs">{op.email}</div>
                          <div className="text-xs text-gray-400">{op.phone}</div>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${op.role === 'Support' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>{op.role}</span>
                        </td>
                        <td className="py-2">
                          <div className="text-xs">{op.lastLogin}</div>
                          <div className="text-xs text-gray-400">{op.lastLoginDate}</div>
                        </td>
                        <td className="py-2">
                          <span className={`inline-block w-3 h-3 rounded-full ${op.active ? 'bg-green-400' : 'bg-gray-300'}`} title={op.active ? 'Active' : 'Inactive'}></span>
                        </td>
                        <td className="py-2 flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="destructive">Remove</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Generate Reports Section */}
          {activeSection === "reports" && (
            <div className="w-full max-w-6xl mx-auto bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950 rounded-2xl shadow-xl p-8 md:p-12 mt-4">
              {/* Report Filters */}
              <div className="flex flex-wrap gap-4 items-end mb-8">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">From Date</label>
                  <input type="date" className="border rounded px-3 py-2 text-sm" defaultValue="2025-07-01" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">To Date</label>
                  <input type="date" className="border rounded px-3 py-2 text-sm" defaultValue="2025-07-14" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">Report Type</label>
                  <select className="border rounded px-3 py-2 text-sm">
                    <option>Session Summary</option>
                    <option>Revenue</option>
                    <option>Orders</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">Photographer (Optional)</label>
                  <select className="border rounded px-3 py-2 text-sm">
                    <option>All Photographers</option>
                    <option>Sarah Johnson</option>
                    <option>Alex Thompson</option>
                  </select>
                </div>
                <Button className="ml-auto px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:scale-105 transition-all">Generate Report</Button>
              </div>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-md p-6 flex flex-col items-start border border-indigo-100 dark:border-slate-700">
                  <span className="text-xs font-semibold text-indigo-700 mb-2">Total Orders</span>
                  <span className="text-3xl font-extrabold text-indigo-900 dark:text-white">{reportKpis.totalOrders.toLocaleString()}</span>
                  <span className="text-xs text-green-600 mt-1">+{reportKpis.ordersChange}% from last period</span>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-md p-6 flex flex-col items-start border border-purple-100 dark:border-slate-700">
                  <span className="text-xs font-semibold text-purple-700 mb-2">Total Revenue</span>
                  <span className="text-3xl font-extrabold text-purple-900 dark:text-white">₹{reportKpis.totalRevenue.toLocaleString()}</span>
                  <span className="text-xs text-green-600 mt-1">+{reportKpis.revenueChange}% from last period</span>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-md p-6 flex flex-col items-start border border-pink-100 dark:border-slate-700">
                  <span className="text-xs font-semibold text-pink-700 mb-2">Sessions Count</span>
                  <span className="text-3xl font-extrabold text-pink-900 dark:text-white">{reportKpis.sessionsCount.toLocaleString()}</span>
                  <span className="text-xs text-green-600 mt-1">+{reportKpis.sessionsChange}% from last period</span>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-md p-6 flex flex-col items-start border border-orange-100 dark:border-slate-700">
                  <span className="text-xs font-semibold text-orange-700 mb-2">Top Photographer</span>
                  <span className="text-lg font-bold text-orange-900 dark:text-white">{reportKpis.topPhotographer.name}</span>
                  <span className="text-xs text-gray-500">{reportKpis.topPhotographer.sessions} sessions completed</span>
                </div>
              </div>
              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Revenue Trend Bar Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-indigo-100 dark:border-slate-700 flex flex-col min-w-0">
                  <h3 className="font-semibold text-base md:text-lg mb-4 text-indigo-800 dark:text-indigo-200">Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={reportRevenueTrend}>
                      <XAxis dataKey="week" stroke="#6366f1" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6366f1" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#ede9fe', borderRadius: 8, border: 'none' }} />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Order Status Breakdown Pie Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-purple-100 dark:border-slate-700 flex flex-col min-w-0">
                  <h3 className="font-semibold text-base md:text-lg mb-4 text-purple-800 dark:text-purple-200">Order Status Breakdown</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={reportOrderStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={36} label fontSize={12}>
                        {reportOrderStatus.map((entry, idx) => (
                          <Cell key={`cell-status-${idx}`} fill={reportPieColors[idx % reportPieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#ede9fe', borderRadius: 8, border: 'none' }} />
                      <Legend verticalAlign="bottom" height={32} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Export Options */}
              <div className="flex gap-4 mt-4">
                <Button className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:scale-105 transition-all">Download PDF</Button>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow hover:scale-105 transition-all">Export Excel</Button>
                <Button className="bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold shadow hover:scale-105 transition-all">Print</Button>
              </div>
            </div>
          )}
          {/* Manage Photographers Section */}
          {activeSection === "photographers" && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-slate-700">
              <h2 className="font-semibold text-xl mb-6 text-purple-800 dark:text-purple-200">Photographers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(samplePhotographers || []).map((p) => (
                  <div key={p.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6 flex flex-col items-start border border-purple-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-2">
                      <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full object-cover border" />
                      <div>
                        <div className="font-bold text-lg text-purple-900 dark:text-white">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.email}</div>
                        <div className="text-xs text-gray-400">{p.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-indigo-700">Sessions Completed:</span>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">{p.sessionsCompleted}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Edit</Button>
                      <span className={`ml-2 w-3 h-3 rounded-full ${p.active ? 'bg-green-400' : 'bg-gray-300'}`} title={p.active ? 'Active' : 'Inactive'}></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Manage Operators Section */}
          {activeSection === "operators" && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-slate-700">
              <h2 className="font-semibold text-xl mb-6 text-purple-800 dark:text-purple-200">Operators</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Operator</th>
                      <th className="py-2">Contact</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Last Login</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sampleOperators || []).map((op) => (
                      <tr key={op.id} className="border-b last:border-0">
                        <td className="py-2 flex items-center gap-3">
                          <img src={op.avatar} alt={op.name} className="w-8 h-8 rounded-full object-cover border" />
                          <div>
                            <div className="font-semibold">{op.name}</div>
                            <div className="text-xs text-gray-400">{op.id}</div>
                          </div>
                        </td>
                        <td className="py-2">
                          <div className="text-xs">{op.email}</div>
                          <div className="text-xs text-gray-400">{op.phone}</div>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${op.role === 'Support' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>{op.role}</span>
                        </td>
                        <td className="py-2">
                          <div className="text-xs">{op.lastLogin}</div>
                          <div className="text-xs text-gray-400">{op.lastLoginDate}</div>
                        </td>
                        <td className="py-2">
                          <span className={`inline-block w-3 h-3 rounded-full ${op.active ? 'bg-green-400' : 'bg-gray-300'}`} title={op.active ? 'Active' : 'Inactive'}></span>
                        </td>
                        <td className="py-2 flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="destructive">Remove</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Settings Section */}
          {activeSection === "settings" && (
            <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950 rounded-2xl shadow-xl p-8 md:p-12 mt-4">
              <h2 className="font-semibold text-2xl mb-8 text-purple-800 dark:text-purple-200">Settings</h2>
              {/* Profile Settings */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 text-indigo-800 dark:text-indigo-200">Profile</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Name</label>
                    <input type="text" className="border rounded px-3 py-2 w-full" value={settingsProfile.name} onChange={e => handleSettingsChange('name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Email</label>
                    <input type="email" className="border rounded px-3 py-2 w-full" value={settingsProfile.email} onChange={e => handleSettingsChange('email', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Change Password</label>
                    <input type="password" className="border rounded px-3 py-2 w-full" value={settingsProfile.password} onChange={e => handleSettingsChange('password', e.target.value)} placeholder="New password" />
                  </div>
                </div>
              </div>
              {/* Notification Preferences */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 text-indigo-800 dark:text-indigo-200">Notifications</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={settingsNotifications.email} onChange={e => handleNotifChange('email', e.target.checked)} />
                    <span>Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={settingsNotifications.sms} onChange={e => handleNotifChange('sms', e.target.checked)} />
                    <span>SMS Notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={settingsNotifications.push} onChange={e => handleNotifChange('push', e.target.checked)} />
                    <span>Push Notifications</span>
                  </label>
                </div>
              </div>
              {/* Account Actions */}
              <div className="flex gap-4 mt-8">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:scale-105 transition-all" onClick={handleSettingsSave}>Save Changes</Button>
                <Button className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:scale-105 transition-all" onClick={() => { localStorage.removeItem('currentUser'); window.location.href = '/'; }}>Logout</Button>
                <Button className="bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold shadow hover:scale-105 transition-all" onClick={handleSettingsDelete}>Delete Account</Button>
              </div>
            </div>
          )}
          {/* Placeholder for other sections */}
          {!(activeSection === "dashboard" || activeSection === "sessions" || activeSection === "orders" || activeSection === "pricing" || activeSection === "photographers" || activeSection === "operators" || activeSection === "reports" || activeSection === "settings") && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-slate-700 text-gray-500 text-center">Section coming soon...</div>
          )}
          {/* Modal for viewing details/photos */}
          {modal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 w-full max-w-lg relative border border-purple-200 dark:border-slate-700">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl font-bold" onClick={() => setModal(null)}>&times;</button>
                {modal.type === "session" ? (
                  <div>
                    <h2 className="font-bold text-xl mb-2 text-purple-800 dark:text-purple-200">Session Details</h2>
                    <div className="mb-2"><span className="font-semibold">Session:</span> {modal.data.name}</div>
                    <div className="mb-2"><span className="font-semibold">Customer:</span> {modal.data.customerDetails.name}</div>
                    <div className="mb-2"><span className="font-semibold">Date:</span> {modal.data.date}</div>
                    <div className="mb-2"><span className="font-semibold">Location:</span> {modal.data.customerDetails.location}</div>
                    <div className="mb-2"><span className="font-semibold">Photographer:</span> {modal.data.customerDetails.photographer || "-"}</div>
                    <div className="mb-2"><span className="font-semibold">Status:</span> {modal.data.status}</div>
                    <div className="mb-2"><span className="font-semibold">Images:</span></div>
                    <div className="flex gap-2 flex-wrap">
                      {(modal.data.images || []).map((img: string, idx: number) => (
                        <img key={idx} src={img} alt="Session" className="w-20 h-20 object-cover rounded border" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="font-bold text-xl mb-2 text-purple-800 dark:text-purple-200">Order Details</h2>
                    <div className="mb-2"><span className="font-semibold">Order ID:</span> {modal.data.id}</div>
                    <div className="mb-2"><span className="font-semibold">Customer:</span> {modal.data.customer}</div>
                    <div className="mb-2"><span className="font-semibold">Date:</span> {modal.data.date}</div>
                    <div className="mb-2"><span className="font-semibold">Amount:</span> ${modal.data.amount.toFixed(2)}</div>
                    <div className="mb-2"><span className="font-semibold">Status:</span> {modal.data.status}</div>
                    <div className="mt-4 text-gray-500 text-sm">(Order photo preview coming soon...)</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardErrorBoundary>
  );
} 