import { useState } from "react";
import { AuthDialog } from "@/components/AuthDialog";
import { PhotographerDashboard } from "@/components/PhotographerDashboard";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);

  const handleLogin = (role: string) => {
    setCurrentUser({ role });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (currentUser?.role === "photographer") {
    return <PhotographerDashboard />;
  }

  if (currentUser?.role === "counter-staff") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Counter Staff Dashboard</h1>
          <p className="text-muted-foreground mb-4">Welcome to the counter staff portal</p>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (currentUser?.role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-4">Welcome to the admin portal</p>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Photography Studio</h1>
          <p className="text-xl text-muted-foreground">Professional Photography Management System</p>
        </div>
        <AuthDialog onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default Index;
