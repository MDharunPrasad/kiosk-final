import { useState, useEffect } from "react";
import { AuthDialog } from "@/components/AuthDialog";
import { PhotographerDashboard } from "@/components/PhotographerDashboard";
import { CounterStaffDashboard } from "@/components/CounterStaffDashboard";
import AdminDashboard from "./AdminDashboard";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<{ role: string; username?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const handleLogin = (role: string, username?: string) => {
    setCurrentUser({ role, username });
    localStorage.setItem("currentUser", JSON.stringify({ role, username }));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  // Always clear currentUser in development for a fresh login experience
  if (import.meta.env.DEV) {
    localStorage.removeItem("currentUser");
  }

  const navigate = useNavigate();

  if (currentUser?.role === "photographer") {
    return (
      <>
        <PhotographerDashboard username={currentUser.username} />
      </>
    );
  }

  if (currentUser?.role === "operator") {
    return (
      <>
        <CounterStaffDashboard username={currentUser.username} />
      </>
    );
  }

  if (currentUser?.role === "admin") {
    return (
      <>
        <AdminDashboard />
      </>
    );
  }

  return (
    <>
      <AuthDialog onLogin={handleLogin} />
    </>
  );
};

export default Index;
