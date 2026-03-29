export enum View {
  INTRO = 'INTRO',
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  ORG_DETAILS = 'ORG_DETAILS',
  SIGNING = 'SIGNING',
  HEALTH = 'HEALTH',
  DYNAMIC = 'DYNAMIC',
  SERVICE = 'SERVICE',
  PROFILE = 'PROFILE',
  ORDERS = 'ORDERS',
}

export interface AuthProfile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  default_elder_id: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  profile: AuthProfile;
}

export interface Organization {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  beds: number;
  distance: string;
  tags: string[];
  image: string;
  status?: string | null;
}

export interface InstitutionServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlights: string[];
}

export interface InstitutionReviewItem {
  id: string;
  author_name: string;
  relation_label: string;
  stay_duration_label: string;
  content: string;
  created_at_label: string;
}

export interface InstitutionDetail {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  distance: string;
  rating: number;
  reviews_count: number;
  price: number;
  beds: number;
  care_type: string;
  description: string;
  image: string;
  tags: string[];
  services: InstitutionServiceItem[];
  reviews: InstitutionReviewItem[];
}

export interface HealthSummary {
  elder_id: string;
  elder_name: string;
  elder_avatar_url: string;
  status_text: string;
  last_sync_time: string;
  average_bpm: number;
  current_bpm: number;
  current_blood_pressure: string;
  blood_pressure_level: string;
  warning_title?: string | null;
  warning_message?: string | null;
}

export interface HealthPoint {
  x: number;
  label: string;
  systolic: number;
  diastolic: number;
  bpm: number;
  blood_pressure_display: string;
}

export interface HealthMetrics {
  elder_id: string;
  range: '7d' | '30d';
  points: HealthPoint[];
}

export interface DynamicComment {
  id: string;
  user: string;
  text: string;
  time: string;
  timestamp: number;
}

export interface DynamicItem {
  id: string;
  type: 'diet' | 'activity' | 'health';
  time: string;
  timestamp: number;
  title: string;
  location: string;
  content: string;
  image?: string | null;
  is_liked: boolean;
  likes: number;
  comments: DynamicComment[];
}

export interface ServiceLog {
  id: string;
  time: string;
  title: string;
  description: string;
  status: 'done' | 'pending';
  icon: string;
  image?: string | null;
  extra?: string | null;
}

export interface Order {
  id: string;
  order_no: string;
  service_name: string;
  org_name: string;
  price: number;
  date: string;
  status: 'active' | 'completed' | 'pending';
  type: 'base' | 'pro';
}

export interface AssistantSuggestion {
  id: string;
  label: string;
  prompt: string;
}

export interface AssistantSession {
  id: string;
  title: string;
  updated_at: string;
}

export interface AssistantMessage {
  id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  model_name?: string | null;
  error_state?: boolean;
  created_at?: string | null;
}
