-- Check menu item "Gỏi Cuốn (Spring Rolls)"
SELECT id, name, status 
FROM "menu_items" 
WHERE name LIKE '%Gỏi Cuốn%' OR name LIKE '%Spring Roll%';

-- Check modifier groups assigned to this item
SELECT mg.id, mg.name, mg.status, mimg.menu_item_id
FROM "modifier_groups" mg
JOIN "menu_item_modifier_groups" mimg ON mimg.group_id = mg.id
WHERE mimg.menu_item_id = '110db8ee-2cee-4747-ad4e-0e80ca9b5e2a';

-- Check modifier options for these groups
SELECT mo.id, mo.name, mo.status, mo.group_id
FROM "modifier_options" mo
WHERE mo.group_id IN (
  SELECT mimg.group_id
  FROM "menu_item_modifier_groups" mimg
  WHERE mimg.menu_item_id = '110db8ee-2cee-4747-ad4e-0e80ca9b5e2a'
);

-- Check all modifier options status
SELECT status, COUNT(*) as count
FROM "modifier_options"
GROUP BY status;
