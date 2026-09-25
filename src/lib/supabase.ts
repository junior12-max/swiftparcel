import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Shipment = {
  id: string;
  tracking_code: string;
  sender_name: string;
  sender_address: string;
  recipient_name: string;
  recipient_address: string;
  recipient_email: string | null;
  pickup_address: string | null;
  delivery_address: string | null;
  package_count: number;
  package_type: string | null;
  status: string;
  current_location: string | null;
  on_hold: boolean;
  origin_coords: { lat: number; lng: number } | null;
  destination_coords: { lat: number; lng: number } | null;
  current_coords: { lat: number; lng: number } | null;
  route_progress: number;
  created_at: string;
  updated_at: string;
};

export type TrackingEvent = {
  id: string;
  shipment_id: string;
  step: number;
  label: string;
  description: string;
  location: string;
  completed: boolean;
  timestamp: string;
};
