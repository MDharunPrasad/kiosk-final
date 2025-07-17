import { createContext, useContext, useState, useEffect } from "react";
import AuthService from "@/services/AuthService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isLoading: true,
  });

  const authService = AuthService.getInstance();

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Use AuthService to get the initial auth state
        const initialState = authService.initializeAuth();
        
        setAuthState({
          user: initialState.user,
          token: initialState.token,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState({ user: null, token: null, isLoading: false });
      }
    };

    initializeAuth();
  }, [authService]);

  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Use AuthService to login
      const { user, token } = await authService.login(credentials);
      
      setAuthState({ user, token, isLoading: false });
      return { user, token };
    } catch (error) {
      setAuthState({ user: null, token: null, isLoading: false });
      throw error;
    }
  };

  const logout = () => {
    // Use AuthService to logout (it will clear localStorage)
    authService.logout();
    setAuthState({ user: null, token: null, isLoading: false });
  };

  const refreshToken = async () => {
    try {
      const newToken = await authService.refreshToken();
      const userData = authService.getUserData();
      
      setAuthState({
        user: userData,
        token: newToken,
        isLoading: false,
      });
      
      return newToken;
    } catch (error) {
      // If refresh fails, logout the user
      logout();
      throw error;
    }
  };

  const value = {
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: authService.isAuthenticated(),
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};