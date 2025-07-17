import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Welcome, {user?.username}!
        </p>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Token: {token?.substring(0, 50)}...
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
};