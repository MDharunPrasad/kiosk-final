import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthDialog from "@/components/AuthDialog";

const Index = () => {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to their dashboard
  useEffect(() => {
    if (user && isAuthenticated && !isLoading) {
      switch (user.role) {
        case "photographer":
          navigate("/photographer");
          break;
        case "operator":
          navigate("/operator");
          break;
        case "admin":
          navigate("/admin");
          break;
        default:
          break;
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, don't show auth dialog
  if (user && isAuthenticated) {
    return null;
  }

  // Handle successful login - Let the AuthContext handle navigation
  const handleLoginSuccess = (loggedInUser, token) => {
    console.log("Login successful:", loggedInUser, token);
    // Don't navigate here - let the useEffect handle it when the context updates
    // The AuthContext should already be updated by the LoginForm component
  };

  return <AuthDialog onLogin={handleLoginSuccess} />;
};

export default Index;