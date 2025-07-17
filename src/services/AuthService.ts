// AuthService.js
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  username: string;
  role: string;
  user_id?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private static instance: AuthService;
  private baseURL: string = 'http://localhost:8002';
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user_data';

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Login failed: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      
      // Decode JWT token to get user info
      const user = this.decodeToken(data.access_token);
      
      // Store token and user data
      this.setToken(data.access_token);
      this.setUserData(user);
      
      return { user, token: data.access_token };
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Login failed');
    }
  }

  private decodeToken(token: string): User {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return {
        username: decoded.username,
        role: decoded.role,
        user_id: decoded.user_id,
      };
    } catch (error) {
      console.error('Token decode error:', error);
      throw new Error('Invalid token format');
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUserData(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Public method to get access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Public method to get user data
  getUserData(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  // Check if user is currently authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null && this.isTokenValid(token);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    console.log('User logged out');
  }

  // Helper method to get auth headers for API calls
  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Method to validate token (basic check)
  isTokenValid(token: string): boolean {
    if (!token) return false;
    
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      // Check if token has required fields
      if (!decoded.username || !decoded.role) return false;
      
      // Check if token is expired (if exp field exists)
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  // Method to refresh token if needed
  async refreshToken(): Promise<string> {
    const currentToken = this.getAccessToken();
    if (!currentToken) {
      throw new Error('No token to refresh');
    }
    
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data: LoginResponse = await response.json();
      
      // Decode new token and update user data
      const user = this.decodeToken(data.access_token);
      this.setToken(data.access_token);
      this.setUserData(user);
      
      return data.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear invalid token
      this.logout();
      throw error;
    }
  }

  // Method to initialize auth state from stored data
  initializeAuth(): AuthState {
    const token = this.getAccessToken();
    const user = this.getUserData();
    const isAuthenticated = this.isAuthenticated();
    
    return {
      user,
      token,
      isAuthenticated,
    };
  }
}

export default AuthService;