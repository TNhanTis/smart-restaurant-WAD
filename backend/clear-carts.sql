-- Delete all cart item modifiers first (foreign key constraint)
DELETE FROM "cart_item_modifiers";

-- Then delete all cart items
DELETE FROM "cart_items";

-- Verify
SELECT COUNT(*) as remaining_cart_items FROM "cart_items";
SELECT COUNT(*) as remaining_modifiers FROM "cart_item_modifiers";
