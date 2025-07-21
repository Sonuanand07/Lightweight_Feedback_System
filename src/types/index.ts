export interface User {
  id: number;
  username: string;
  email: string;
  role: 'manager' | 'employee';
  manager_id?: number;
  created_at: string;
}

export interface Feedback {
  id: number;
  employee_id: number;
  manager_id: number;
  strengths: string;
  improvements: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  acknowledged: boolean;
  created_at: string;
  updated_at: string;
  employee: User;
  manager: User;
}

export interface DashboardStats {
  total_feedback: number;
  positive_feedback: number;
  neutral_feedback: number;
  negative_feedback: number;
  unacknowledged_feedback: number;
}

export interface LoginRequest {
  username: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  role: 'manager' | 'employee';
  manager_id?: number;
}
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface FeedbackCreate {
  employee_id: number;
  strengths: string;
  improvements: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface FeedbackUpdate {
  strengths?: string;
  improvements?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}