/*
# Create shipments and tracking_events tables (single-tenant, no auth)

1. New Tables
- `shipments`: Stores parcel shipment bookings
  - `id` (uuid, primary key)
  - `tracking_code` (text, unique, not null) — the tracking number shown to users (e.g. SP-9900)
  - `sender_name` (text, not null)
  - `sender_address` (text, not null)
  - `recipient_name` (text, not null)
  - `recipient_address` (text, not null)
  - `package_count` (integer, not null, default 1)
  - `status` (text, not null, default 'pending') — pending, picked_up, in_transit, out_for_delivery, delivered
  - `origin_coords` (jsonb) — { lat, lng } for map display
  - `destination_coords` (jsonb) — { lat, lng } for map display
  - `current_coords` (jsonb) — { lat, lng } current location on route
  - `route_progress` (integer, default 0) — 0 to 100 percentage
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- `tracking_events`: Step-by-step delivery milestones for each shipment
  - `id` (uuid, primary key)
  - `shipment_id` (uuid, foreign key to shipments)
  - `step` (integer, not null) — ordering
  - `label` (text, not null) — e.g. "Order Received"
  - `description` (text)
  - `location` (text)
  - `completed` (boolean, default false)
  - `timestamp` (timestamptz)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text UNIQUE NOT NULL,
  sender_name text NOT NULL,
  sender_address text NOT NULL,
  recipient_name text NOT NULL,
  recipient_address text NOT NULL,
  package_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  origin_coords jsonb,
  destination_coords jsonb,
  current_coords jsonb,
  route_progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_shipments" ON shipments;
CREATE POLICY "anon_select_shipments" ON shipments FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_shipments" ON shipments;
CREATE POLICY "anon_insert_shipments" ON shipments FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_shipments" ON shipments;
CREATE POLICY "anon_update_shipments" ON shipments FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_shipments" ON shipments;
CREATE POLICY "anon_delete_shipments" ON shipments FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  step integer NOT NULL,
  label text NOT NULL,
  description text,
  location text,
  completed boolean NOT NULL DEFAULT false,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tracking_events" ON tracking_events;
CREATE POLICY "anon_select_tracking_events" ON tracking_events FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tracking_events" ON tracking_events;
CREATE POLICY "anon_insert_tracking_events" ON tracking_events FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tracking_events" ON tracking_events;
CREATE POLICY "anon_update_tracking_events" ON tracking_events FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tracking_events" ON tracking_events;
CREATE POLICY "anon_delete_tracking_events" ON tracking_events FOR DELETE
TO anon, authenticated USING (true);
