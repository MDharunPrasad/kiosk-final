export interface ApiSession {
  id: string;
  session_name?: string;
  tag_name?: string;
  photographer_id: number;
  customer_name?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  photos?:ApiPhoto[]
}

export interface ApiPhoto {
  id: string;
  session_id: number;
  file_path: string;
  edited_path?: string;
  uploaded_at: string;
  last_updated_at: string;
  image_data?:string
}

export interface PhotographerDashboardProps {
  username?: string;
}

export interface AuthContextType {
  user: {
    name?: string;
    username?: string;
    email?: string;
    role?: string;
    user_id?: number;
  } | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<any>;
  logout: () => void;
  refreshToken: () => Promise<string>;
}
