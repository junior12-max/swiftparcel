/*
# Add recipient_email and on_hold columns, tighten admin-only UPDATE/DELETE

1. Modified Tables
- `shipments`:
  - Added `recipient_email` (text, nullable) — recipient's email for EmailJS notifications.
  - Added `on_hold` (boolean, default false) — hold/release toggle for admin management.
2. Security Changes
- Replaced the wide-open UPDATE and DELETE policies on `shipments` and `tracking_events`
  with admin-only policies: only the authenticated user whose email matches the admin
  address (swiftparcel.support@gmail.com) may UPDATE or DELETE rows.
- SELECT and INSERT policies remain open to `anon, authenticated` so the public booking
  form and tracking search continue to work without a login.
3. Notes
- The admin email is checked via `auth.jwt() ->> 'email'` which reflects the signed-in
  user's email from their JWT. Only the admin account can modify shipment statuses,
  toggle hold/release, and edit tracking checkpoints.
- anon role retains SELECT + INSERT only (no UPDATE/DELETE), so the public cannot
  alter shipment data after creation.
*/

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_email text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS on_hold boolean NOT NULL DEFAULT false;

-- ─── shipments: tighten UPDATE to admin-only ───
DROP POLICY IF EXISTS "anon_update_shipments" ON shipments;
CREATE POLICY "admin_update_shipments"
ON shipments FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'swiftparcel.support@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'swiftparcel.support@gmail.com');

-- ─── shipments: tighten DELETE to admin-only ───
DROP POLICY IF EXISTS "anon_delete_shipments" ON shipments;
CREATE POLICY "admin_delete_shipments"
ON shipments FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'email' = 'swiftparcel.support@gmail.com');

-- ─── tracking_events: tighten UPDATE to admin-only ───
DROP POLICY IF EXISTS "anon_update_tracking_events" ON tracking_events;
CREATE POLICY "admin_update_tracking_events"
ON tracking_events FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'swiftparcel.support@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'swiftparcel.support@gmail.com');

-- ─── tracking_events: tighten DELETE to admin-only ───
DROP POLICY IF EXISTS "anon_delete_tracking_events" ON tracking_events;
CREATE POLICY "admin_delete_tracking_events"
ON tracking_events FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'email' = 'swiftparcel.support@gmail.com');
