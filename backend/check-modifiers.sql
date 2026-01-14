-- Check the specific modifier options from the error
SELECT id, name, status 
FROM "ModifierOptions"
WHERE id IN (
  'a504c9d4-9df3-4692-8264-cbb0c97c81e6',
  'f8dc8118-c7f9-45db-bb53-7ba710d81609'
);

-- Check all modifier options status
SELECT status, COUNT(*) as count
FROM "ModifierOptions"
GROUP BY status;

-- Update all modifier options to 'active' if needed
UPDATE "ModifierOptions"
SET status = 'active'
WHERE status IS NULL OR status != 'active';

-- Verify
SELECT id, name, status 
FROM "ModifierOptions"
LIMIT 20;
