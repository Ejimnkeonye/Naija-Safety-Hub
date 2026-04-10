export interface UserProfile {
  uid: string;
  full_name: string;
  phone_number: string;
  role: 'Citizen' | 'Responder' | 'Admin';
  state: string;
  lga: string;
  language: string;
  agency_id?: string;
}

export interface Agency {
  id: string;
  name: string;
  type: 'SEMA' | 'Fire' | 'NSCDC' | 'Police' | 'FRSC' | 'Hospital' | 'NEMA' | 'NEMSAS';
  state: string;
  primary_phone: string;
  secondary_phone?: string;
  description: string;
}

export interface Incident {
  id: string;
  reporter_id: string;
  incident_type: 'Fire' | 'Flood' | 'Medical' | 'Security' | 'Road Crash' | 'Other';
  description: string;
  state: string;
  lga: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  audio_url?: string;
  status: 'New' | 'Acknowledged' | 'En route' | 'Resolved' | 'Closed';
  assigned_agency_id?: string;
  created_at: any;
  updated_at: any;
}

export interface ContentModule {
  id: string;
  title: string;
  category: string;
  state: string;
  language: string;
  summary: string;
  body: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  body: string;
  order_index: number;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: any;
}
