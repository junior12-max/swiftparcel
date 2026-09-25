/*
# Add missing columns to shipments table

1. Modified Tables
- `shipments`: Added four new nullable columns to match the requested schema:
  - `pickup_address` (text) — pickup location address; backfilled from `sender_address`
  - `delivery_address` (text) — delivery destination address; backfilled from `recipient_address`
  - `package_type` (text) — type of package (e.g. 'standard', 'express', 'bulk', 'corporate')
  - `current_location` (text) — human-readable current location text (e.g. 'Denver, CO')
2. Data Migration
- Existing rows: `pickup_address` and `delivery_address` backfilled from `sender_address` / `recipient_address` so no data is lost.
3. Security
- No policy changes. RLS already enabled with anon+authenticated CRUD (no-auth app).
4. Notes
- The existing `sender_address` / `recipient_address` columns are kept (not dropped) to preserve data integrity. New writes populate both old and new columns.
*/

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS pickup_address text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS delivery_address text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS package_type text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS current_location text;

-- Backfill new columns from existing data
UPDATE shipments SET pickup_address = sender_address WHERE pickup_address IS NULL;
UPDATE shipments SET delivery_address = recipient_address WHERE delivery_address IS NULL;
UPDATE shipments SET current_location = 'In transit' WHERE current_location IS NULL AND status != 'delivered';
UPDATE shipments SET current_location = 'Delivered' WHERE current_location IS NULL AND status = 'delivered';
