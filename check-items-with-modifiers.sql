-- Check which menu items have modifiers assigned
SELECT 
  mi.id,
  mi.name,
  mi.price,
  mi.status,
  COUNT(DISTINCT mimg.group_id) as modifier_group_count,
  STRING_AGG(DISTINCT mg.name, ', ') as modifier_groups
FROM menu_items mi
LEFT JOIN menu_item_modifier_groups mimg ON mi.id = mimg.menu_item_id
LEFT JOIN modifier_groups mg ON mimg.group_id = mg.id
WHERE mi.is_deleted = false
GROUP BY mi.id, mi.name, mi.price, mi.status
ORDER BY modifier_group_count DESC, mi.created_at;

-- If you want to see details of a specific item's modifiers:
-- Replace 'YOUR-ITEM-ID-HERE' with actual menu item ID
/*
SELECT 
  mi.name as item_name,
  mg.name as modifier_group,
  mg.is_required,
  mg.min_selections,
  mg.max_selections,
  mo.name as option_name,
  mo.price_adjustment
FROM menu_items mi
JOIN menu_item_modifier_groups mimg ON mi.id = mimg.menu_item_id
JOIN modifier_groups mg ON mimg.group_id = mg.id
JOIN modifier_options mo ON mg.id = mo.group_id
WHERE mi.id = 'YOUR-ITEM-ID-HERE'
  AND mo.status = 'active'
ORDER BY mg.name, mo.name;
*/
