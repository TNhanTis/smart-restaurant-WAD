-- Test data for order creation
-- First, let's check we have the necessary test data

-- Get a sample table ID
SELECT id, table_number FROM tables LIMIT 1;

-- Get a sample menu item with its price
SELECT id, name, price, status FROM menu_items WHERE status = 'available' LIMIT 3;

-- Get sample modifier options
SELECT mo.id, mo.name, mo.price_adjustment, mg.name as group_name
FROM modifier_options mo
JOIN modifier_groups mg ON mo.group_id = mg.id
WHERE mo.status = 'active'
LIMIT 3;
