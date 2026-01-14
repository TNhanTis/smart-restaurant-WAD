-- Check current status of menu items
SELECT id, name, status, is_deleted, restaurant_id
FROM "MenuItems"
WHERE name LIKE '%Chả Giò%' OR name LIKE '%Fried Roll%';

-- Update all menu items to 'available' status
UPDATE "MenuItems"
SET status = 'available'
WHERE status IS NULL OR status != 'available';

-- Verify the update
SELECT id, name, status, is_deleted
FROM "MenuItems"
LIMIT 20;
