import { useState, useEffect } from "react";
import { AuthDialog } from "@/components/AuthDialog";
import { PhotographerDashboard } from "@/components/PhotographerDashboard";
import { CounterStaffDashboard } from "@/components/CounterStaffDashboard";
import AuthService, { User } from "@/services/AuthService";

interface AuthState {
  user: User | null;
  token: string | null;
}

const Index = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
  });

  const authService = AuthService.getInstance();

  const handleLogin = (user: User, token: string) => {
    setAuthState({ user, token });
  };

  const handleLogout = () => {
    authService.logout();
    setAuthState({ user: null, token: null });
  };

  // Pass both user and token to dashboards for API calls
  if (authState.user?.role === "photographer") {
    return (
      <PhotographerDashboard 
        username={authState.user.username} 
        
       
      />
    );
  }

  if (authState.user?.role === "operator") {
    return (
      <CounterStaffDashboard 
        username={authState.user.username} 
   
       
      />
    );
  }

  if (authState.user?.role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-4">
            Welcome, {authState.user.username}!
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Token: {authState.token?.substring(0, 50)}...
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AuthDialog onLogin={handleLogin} />;
};

export default Index;