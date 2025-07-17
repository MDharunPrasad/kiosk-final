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