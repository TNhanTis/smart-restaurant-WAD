-- Example SQL to seed modifier groups and assign to menu items
-- Run this in your database to see modifiers in ItemDetail page

-- First, check if you have any menu items
-- SELECT id, name FROM menu_items LIMIT 5;

-- Create modifier groups (if not exists)
INSERT INTO modifier_groups (id, restaurant_id, name, selection_type, is_required, min_selections, max_selections, status, created_at, updated_at)
VALUES 
  (gen_random_uuid(), (SELECT id FROM restaurants LIMIT 1), 'Size', 'single', true, 1, 1, 'active', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM restaurants LIMIT 1), 'Toppings', 'multiple', false, 0, 3, 'active', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM restaurants LIMIT 1), 'Spice Level', 'single', false, 0, 1, 'active', NOW(), NOW());

-- Get the IDs we just created (store in temp table)
CREATE TEMP TABLE temp_modifier_groups AS
SELECT id, name FROM modifier_groups 
WHERE name IN ('Size', 'Toppings', 'Spice Level')
ORDER BY created_at DESC
LIMIT 3;

-- Create modifier options
INSERT INTO modifier_options (id, group_id, name, price_adjustment, status, created_at)
SELECT 
  gen_random_uuid(),
  id,
  opt.name,
  opt.price,
  'active',
  NOW()
FROM temp_modifier_groups mg
CROSS JOIN LATERAL (
  VALUES 
    ('Small', 0::decimal),
    ('Medium', 2.00::decimal),
    ('Large', 4.00::decimal)
) AS opt(name, price)
WHERE mg.name = 'Size'

UNION ALL

SELECT 
  gen_random_uuid(),
  id,
  opt.name,
  opt.price,
  'active',
  NOW()
FROM temp_modifier_groups mg
CROSS JOIN LATERAL (
  VALUES 
    ('Extra Cheese', 1.50::decimal),
    ('Bacon', 2.00::decimal),
    ('Mushrooms', 1.00::decimal),
    ('Onions', 0.50::decimal)
) AS opt(name, price)
WHERE mg.name = 'Toppings'

UNION ALL

SELECT 
  gen_random_uuid(),
  id,
  opt.name,
  opt.price,
  'active',
  NOW()
FROM temp_modifier_groups mg
CROSS JOIN LATERAL (
  VALUES 
    ('Mild', 0::decimal),
    ('Medium', 0::decimal),
    ('Hot', 0::decimal),
    ('Extra Hot', 0.50::decimal)
) AS opt(name, price)
WHERE mg.name = 'Spice Level';

-- Assign modifier groups to menu items
-- Get first 3 menu items and assign modifiers to them
INSERT INTO menu_item_modifier_groups (menu_item_id, group_id)
SELECT 
  mi.id as menu_item_id,
  mg.id as group_id
FROM 
  (SELECT id FROM menu_items WHERE is_deleted = false ORDER BY created_at LIMIT 3) mi
CROSS JOIN
  temp_modifier_groups mg;

-- Verify the data
SELECT 
  mi.id,
  mi.name,
  mg.name as modifier_group,
  COUNT(mo.id) as option_count
FROM menu_items mi
JOIN menu_item_modifier_groups mimg ON mi.id = mimg.menu_item_id
JOIN modifier_groups mg ON mimg.group_id = mg.id
LEFT JOIN modifier_options mo ON mg.id = mo.group_id
GROUP BY mi.id, mi.name, mg.name
ORDER BY mi.name, mg.name;
