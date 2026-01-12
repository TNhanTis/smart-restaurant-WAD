-- ============================================
-- SMART RESTAURANT - COMPREHENSIVE SEED DATA
-- ============================================
-- Run this file after initial migration
-- psql -U postgres -d your_database -f seed-data.sql

-- ============================================
-- NOTES:
-- - Replace restaurant_id and owner_id with actual UUIDs from your database
-- - This seed assumes you have at least one user and one restaurant created
-- ============================================

BEGIN;

-- ============================================
-- 1. SEED RESTAURANTS (if not exists)
-- ============================================

-- Get or create a demo owner (assumes you have a user with this email)
DO $$
DECLARE
  demo_owner_id UUID;
  restaurant1_id UUID;
  restaurant2_id UUID;
  restaurant3_id UUID;
BEGIN
  -- Try to get existing demo owner, or create one
  SELECT id INTO demo_owner_id FROM users WHERE email = 'admin@restaurant.com' LIMIT 1;
  
  IF demo_owner_id IS NULL THEN
    -- Create demo owner if not exists
    INSERT INTO users (id, email, password_hash, full_name, phone, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'admin@restaurant.com',
      '$2b$10$YourHashedPasswordHere', -- Replace with actual hashed password
      'Demo Admin',
      '0123456789',
      NOW(),
      NOW()
    )
    RETURNING id INTO demo_owner_id;
    
    -- Assign admin role
    INSERT INTO user_roles (user_id, role_id)
    SELECT demo_owner_id, id FROM roles WHERE name = 'admin' LIMIT 1;
  END IF;

  -- Insert Restaurant 1: The Golden Spoon (Vietnamese)
  INSERT INTO restaurants (id, name, address, phone, owner_id, status, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'The Golden Spoon',
    '123 Le Loi Street, District 1, Ho Chi Minh City',
    '+84 28 3822 1234',
    demo_owner_id,
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO restaurant1_id;

  -- Insert Restaurant 2: Italian Corner
  INSERT INTO restaurants (id, name, address, phone, owner_id, status, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Italian Corner',
    '456 Nguyen Hue Boulevard, District 1, Ho Chi Minh City',
    '+84 28 3822 5678',
    demo_owner_id,
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO restaurant2_id;

  -- Insert Restaurant 3: Sushi Paradise
  INSERT INTO restaurants (id, name, address, phone, owner_id, status, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Sushi Paradise',
    '789 Dong Khoi Street, District 1, Ho Chi Minh City',
    '+84 28 3822 9999',
    demo_owner_id,
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO restaurant3_id;

  -- Store restaurant IDs for later use
  CREATE TEMP TABLE temp_restaurants AS
  SELECT id, name FROM restaurants WHERE owner_id = demo_owner_id;
END $$;

-- ============================================
-- 2. SEED TABLES FOR EACH RESTAURANT
-- ============================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM temp_restaurants LOOP
    -- Insert 15 tables per restaurant
    INSERT INTO tables (id, restaurant_id, table_number, capacity, location, description, status, created_at, updated_at)
    VALUES 
      -- Ground Floor - Window Side
      (gen_random_uuid(), r.id, 'T01', 2, 'Ground Floor - Window', 'Romantic window seat for two', 'active', NOW(), NOW()),
      (gen_random_uuid(), r.id, 'T02', 2, 'Ground Floor - Window', 'Cozy corner by the window', 'active', NOW(), NOW()),
      (gen_random_uuid(), r.id, 'T03', 4, 'Ground Floor - Window', 'Family table with city view', 'active', NOW(), NOW()),
      
      -- Ground Floor - Main Hall
      (gen_random_uuid(), r.id, 'T04', 4, 'Ground Floor - Main Hall', 'Central dining area', 'active', NOW(), NOW()),
      (gen_random_uuid(), r.id, 'T05', 4, 'Ground Floor - Main Hall', 'Standard family table', 'active', NOW(), NOW()),
      (gen_random_uuid(), r.id, 'T06', 6, 'Ground Floor - Main Hall', 'Large group table', 'active', NOW(), NOW()),
      (gen_random_uuid(), r.id, 'T07', 6, 'Ground Floor - Main Hall', 'Round table for gatherings', 'active', NOW(), NOW()),
      (gen_random_uuid(), r.id, 'T08', 8, 'Ground Floor - Main Hall', 'Extra large table', 'active', NOW(), NOW()),
      
      -- Second Floor - Terrace
      (gen_random_uuid(), r.id, 'T09', 2, 'Second Floor - Terrace', 'Outdoor terrace seating', 'active', NOW(), NOW()),
      (gen_random_uuid(), r.id, 'T10', 4, 'Second Floor - Terrace', 'Terrace with garden view', 'active', NOW(), NOW()),
      (gen_random_uuid(), r.id, 'T11', 4, 'Second Floor - Terrace', 'Open air dining', 'active', NOW(), NOW()),
      
      -- VIP Rooms
      (gen_random_uuid(), r.id, 'VIP1', 6, 'Private Room 1', 'VIP room with karaoke', 'active', NOW(), NOW()),
      (gen_random_uuid(), r.id, 'VIP2', 8, 'Private Room 2', 'Executive private dining', 'active', NOW(), NOW()),
      (gen_random_uuid(), r.id, 'VIP3', 10, 'Private Room 3', 'Large private party room', 'active', NOW(), NOW()),
      
      -- Bar Area
      (gen_random_uuid(), r.id, 'BAR1', 2, 'Bar Counter', 'High stool bar seating', 'active', NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ============================================
-- 3. SEED MENU CATEGORIES
-- ============================================

DO $$
DECLARE
  golden_spoon_id UUID;
  italian_id UUID;
  sushi_id UUID;
BEGIN
  SELECT id INTO golden_spoon_id FROM restaurants WHERE name = 'The Golden Spoon' LIMIT 1;
  SELECT id INTO italian_id FROM restaurants WHERE name = 'Italian Corner' LIMIT 1;
  SELECT id INTO sushi_id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1;

  -- Categories for The Golden Spoon (Vietnamese)
  IF golden_spoon_id IS NOT NULL THEN
    INSERT INTO menu_categories (id, restaurant_id, name, description, display_order, status, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), golden_spoon_id, 'Appetizers', 'Traditional Vietnamese starters', 1, 'active', NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, 'Phở & Noodles', 'Authentic Vietnamese noodle soups', 2, 'active', NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, 'Rice Dishes', 'Vietnamese rice specialties', 3, 'active', NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, 'Bánh Mì', 'Vietnamese sandwiches', 4, 'active', NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, 'Seafood', 'Fresh seafood dishes', 5, 'active', NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, 'Beverages', 'Drinks and smoothies', 6, 'active', NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, 'Desserts', 'Vietnamese desserts', 7, 'active', NOW(), NOW())
    ON CONFLICT (restaurant_id, name) DO NOTHING;
  END IF;

  -- Categories for Italian Corner
  IF italian_id IS NOT NULL THEN
    INSERT INTO menu_categories (id, restaurant_id, name, description, display_order, status, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), italian_id, 'Antipasti', 'Italian appetizers', 1, 'active', NOW(), NOW()),
      (gen_random_uuid(), italian_id, 'Pasta', 'Handmade pasta dishes', 2, 'active', NOW(), NOW()),
      (gen_random_uuid(), italian_id, 'Pizza', 'Wood-fired pizzas', 3, 'active', NOW(), NOW()),
      (gen_random_uuid(), italian_id, 'Mains', 'Main courses', 4, 'active', NOW(), NOW()),
      (gen_random_uuid(), italian_id, 'Beverages', 'Wines and drinks', 5, 'active', NOW(), NOW()),
      (gen_random_uuid(), italian_id, 'Dolci', 'Italian desserts', 6, 'active', NOW(), NOW())
    ON CONFLICT (restaurant_id, name) DO NOTHING;
  END IF;

  -- Categories for Sushi Paradise
  IF sushi_id IS NOT NULL THEN
    INSERT INTO menu_categories (id, restaurant_id, name, description, display_order, status, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), sushi_id, 'Appetizers', 'Japanese starters', 1, 'active', NOW(), NOW()),
      (gen_random_uuid(), sushi_id, 'Sushi', 'Nigiri and sashimi', 2, 'active', NOW(), NOW()),
      (gen_random_uuid(), sushi_id, 'Rolls', 'Maki rolls', 3, 'active', NOW(), NOW()),
      (gen_random_uuid(), sushi_id, 'Ramen', 'Japanese noodle soups', 4, 'active', NOW(), NOW()),
      (gen_random_uuid(), sushi_id, 'Beverages', 'Japanese drinks', 5, 'active', NOW(), NOW()),
      (gen_random_uuid(), sushi_id, 'Desserts', 'Japanese sweets', 6, 'active', NOW(), NOW())
    ON CONFLICT (restaurant_id, name) DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 4. SEED MENU ITEMS
-- ============================================

DO $$
DECLARE
  golden_spoon_id UUID;
  italian_id UUID;
  sushi_id UUID;
  cat_id UUID;
BEGIN
  SELECT id INTO golden_spoon_id FROM restaurants WHERE name = 'The Golden Spoon' LIMIT 1;
  SELECT id INTO italian_id FROM restaurants WHERE name = 'Italian Corner' LIMIT 1;
  SELECT id INTO sushi_id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1;

  -- ========== THE GOLDEN SPOON (Vietnamese) ==========
  IF golden_spoon_id IS NOT NULL THEN
    -- Appetizers
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = golden_spoon_id AND name = 'Appetizers' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Gỏi Cuốn (Spring Rolls)', 'Fresh spring rolls with shrimp and pork, served with peanut sauce', 65000, 10, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Chả Giò (Fried Rolls)', 'Crispy fried spring rolls with vegetables and meat', 70000, 12, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Gỏi Ngó Sen', 'Lotus stem salad with shrimp and pork', 85000, 15, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Nem Nướng', 'Grilled pork sausage skewers', 75000, 15, 'active', true, false, NOW(), NOW());

    -- Phở & Noodles
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = golden_spoon_id AND name = 'Phở & Noodles' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Phở Bò Đặc Biệt', 'Special beef phở with all cuts', 95000, 20, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Phở Gà', 'Chicken phở', 85000, 20, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Bún Bò Huế', 'Spicy beef noodle soup from Hue', 90000, 25, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Bún Chả Hà Nội', 'Grilled pork with rice noodles Hanoi style', 95000, 20, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Mì Quảng', 'Quang noodles with shrimp and pork', 90000, 22, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Hủ Tiếu Nam Vang', 'Phnom Penh style noodle soup', 85000, 20, 'active', false, false, NOW(), NOW());

    -- Rice Dishes
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = golden_spoon_id AND name = 'Rice Dishes' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Cơm Tấm Sườn Bì Chả', 'Broken rice with grilled pork, shredded pork skin, and egg cake', 85000, 18, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Cơm Gà Xối Mỡ', 'Chicken rice with crispy skin', 90000, 20, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Cơm Chiên Dương Châu', 'Yangzhou fried rice', 75000, 15, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Cơm Niêu Cá Kho', 'Clay pot rice with caramelized fish', 95000, 25, 'active', true, false, NOW(), NOW());

    -- Bánh Mì
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = golden_spoon_id AND name = 'Bánh Mì' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Bánh Mì Thịt', 'Vietnamese sandwich with grilled pork', 45000, 8, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Bánh Mì Gà', 'Vietnamese sandwich with chicken', 45000, 8, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Bánh Mì Đặc Biệt', 'Special Vietnamese sandwich with all toppings', 55000, 10, 'active', true, false, NOW(), NOW());

    -- Seafood
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = golden_spoon_id AND name = 'Seafood' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Tôm Rang Muối', 'Salt and pepper shrimp', 180000, 15, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Cá Kho Tộ', 'Caramelized fish in clay pot', 150000, 30, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Mực Xào Sa Tế', 'Stir-fried squid with satay sauce', 165000, 12, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Cua Rang Me', 'Tamarind fried crab', 220000, 20, 'active', true, false, NOW(), NOW());

    -- Beverages
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = golden_spoon_id AND name = 'Beverages' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Cà Phê Sữa Đá', 'Vietnamese iced coffee with condensed milk', 35000, 3, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Trà Đá', 'Iced tea', 15000, 2, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Nước Mía', 'Fresh sugarcane juice', 25000, 5, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Sinh Tố Bơ', 'Avocado smoothie', 45000, 5, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Nước Dừa', 'Fresh coconut water', 30000, 3, 'active', false, false, NOW(), NOW());

    -- Desserts
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = golden_spoon_id AND name = 'Desserts' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Chè Ba Màu', 'Three-color dessert with beans and coconut milk', 35000, 5, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Chè Thái', 'Thai-style mixed dessert', 40000, 7, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), golden_spoon_id, cat_id, 'Flan Caramen', 'Vietnamese caramel flan', 30000, 5, 'active', false, false, NOW(), NOW());
  END IF;

  -- ========== ITALIAN CORNER ==========
  IF italian_id IS NOT NULL THEN
    -- Antipasti
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = italian_id AND name = 'Antipasti' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), italian_id, cat_id, 'Bruschetta', 'Toasted bread with fresh tomatoes, garlic, and basil', 120000, 8, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Caprese Salad', 'Fresh mozzarella, tomatoes, and basil with balsamic', 150000, 7, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Prosciutto e Melone', 'Parma ham with cantaloupe', 180000, 5, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Antipasto Misto', 'Mixed Italian appetizer platter', 250000, 10, 'active', true, false, NOW(), NOW());

    -- Pasta
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = italian_id AND name = 'Pasta' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), italian_id, cat_id, 'Spaghetti Carbonara', 'Classic Roman pasta with egg, cheese, and pancetta', 180000, 15, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Fettuccine Alfredo', 'Creamy parmesan pasta', 170000, 12, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Penne Arrabbiata', 'Spicy tomato sauce pasta', 160000, 15, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Lasagna Bolognese', 'Layered pasta with meat sauce and béchamel', 220000, 25, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Spaghetti alle Vongole', 'Pasta with fresh clams', 250000, 18, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Ravioli di Ricotta', 'Ricotta cheese ravioli with sage butter', 200000, 15, 'active', false, false, NOW(), NOW());

    -- Pizza
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = italian_id AND name = 'Pizza' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), italian_id, cat_id, 'Margherita', 'Classic tomato, mozzarella, and basil', 180000, 12, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Quattro Stagioni', 'Four seasons pizza with various toppings', 250000, 15, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Diavola', 'Spicy salami pizza', 220000, 12, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Quattro Formaggi', 'Four cheese pizza', 240000, 12, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Prosciutto e Funghi', 'Ham and mushroom pizza', 230000, 15, 'active', false, false, NOW(), NOW());

    -- Mains
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = italian_id AND name = 'Mains' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), italian_id, cat_id, 'Osso Buco', 'Braised veal shanks in white wine', 380000, 35, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Saltimbocca alla Romana', 'Veal with prosciutto and sage', 350000, 20, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Pollo alla Parmigiana', 'Chicken parmesan', 280000, 25, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Bistecca Fiorentina', 'Florentine T-bone steak', 450000, 25, 'active', true, false, NOW(), NOW());

    -- Beverages
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = italian_id AND name = 'Beverages' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), italian_id, cat_id, 'Espresso', 'Italian espresso coffee', 45000, 2, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Cappuccino', 'Espresso with steamed milk', 55000, 3, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Limonata', 'Fresh lemonade', 40000, 5, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'San Pellegrino', 'Sparkling mineral water', 50000, 1, 'active', false, false, NOW(), NOW());

    -- Dolci
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = italian_id AND name = 'Dolci' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), italian_id, cat_id, 'Tiramisu', 'Classic Italian coffee dessert', 95000, 5, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Panna Cotta', 'Creamy Italian dessert with berry sauce', 85000, 5, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Gelato', 'Italian ice cream (2 scoops)', 70000, 3, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), italian_id, cat_id, 'Cannoli', 'Sicilian pastry with ricotta cream', 90000, 5, 'active', false, false, NOW(), NOW());
  END IF;

  -- ========== SUSHI PARADISE ==========
  IF sushi_id IS NOT NULL THEN
    -- Appetizers
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = sushi_id AND name = 'Appetizers' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), sushi_id, cat_id, 'Edamame', 'Steamed young soybeans with sea salt', 60000, 5, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Gyoza', 'Pan-fried dumplings', 85000, 8, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Agedashi Tofu', 'Deep-fried tofu in dashi broth', 75000, 10, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Takoyaki', 'Octopus balls', 90000, 12, 'active', false, false, NOW(), NOW());

    -- Sushi
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = sushi_id AND name = 'Sushi' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), sushi_id, cat_id, 'Maguro Nigiri', 'Tuna nigiri (2 pieces)', 120000, 5, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Sake Nigiri', 'Salmon nigiri (2 pieces)', 110000, 5, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Ebi Nigiri', 'Shrimp nigiri (2 pieces)', 95000, 5, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Unagi Nigiri', 'Eel nigiri (2 pieces)', 150000, 7, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Sashimi Moriawase', 'Assorted sashimi platter', 380000, 15, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Chirashi Don', 'Sashimi rice bowl', 280000, 12, 'active', false, false, NOW(), NOW());

    -- Rolls
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = sushi_id AND name = 'Rolls' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), sushi_id, cat_id, 'California Roll', 'Crab, avocado, and cucumber', 150000, 10, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Spicy Tuna Roll', 'Tuna with spicy mayo', 180000, 10, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Dragon Roll', 'Eel and cucumber topped with avocado', 220000, 15, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Rainbow Roll', 'California roll topped with assorted fish', 250000, 15, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Philadelphia Roll', 'Salmon, cream cheese, and cucumber', 170000, 10, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Tempura Roll', 'Deep-fried roll with shrimp tempura', 190000, 12, 'active', false, false, NOW(), NOW());

    -- Ramen
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = sushi_id AND name = 'Ramen' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), sushi_id, cat_id, 'Tonkotsu Ramen', 'Pork bone broth ramen', 150000, 15, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Shoyu Ramen', 'Soy sauce broth ramen', 140000, 15, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Miso Ramen', 'Miso broth ramen', 145000, 15, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Spicy Tantanmen', 'Spicy sesame ramen', 160000, 18, 'active', false, false, NOW(), NOW());

    -- Beverages
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = sushi_id AND name = 'Beverages' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), sushi_id, cat_id, 'Green Tea', 'Hot Japanese green tea', 30000, 2, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Matcha Latte', 'Green tea latte', 65000, 5, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Sake (Hot/Cold)', 'Japanese rice wine', 120000, 3, 'active', false, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Ramune', 'Japanese soda', 40000, 1, 'active', false, false, NOW(), NOW());

    -- Desserts
    SELECT id INTO cat_id FROM menu_categories WHERE restaurant_id = sushi_id AND name = 'Desserts' LIMIT 1;
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, is_deleted, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), sushi_id, cat_id, 'Mochi Ice Cream', 'Japanese rice cake ice cream (3 pieces)', 80000, 3, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Matcha Tiramisu', 'Green tea tiramisu', 95000, 5, 'active', true, false, NOW(), NOW()),
      (gen_random_uuid(), sushi_id, cat_id, 'Dorayaki', 'Red bean pancake', 60000, 5, 'active', false, false, NOW(), NOW());
  END IF;
END $$;

-- ============================================
-- 5. SUMMARY
-- ============================================

DO $$
DECLARE
  restaurant_count INT;
  table_count INT;
  category_count INT;
  item_count INT;
BEGIN
  SELECT COUNT(*) INTO restaurant_count FROM restaurants;
  SELECT COUNT(*) INTO table_count FROM tables;
  SELECT COUNT(*) INTO category_count FROM menu_categories;
  SELECT COUNT(*) INTO item_count FROM menu_items;

  RAISE NOTICE '======================================';
  RAISE NOTICE 'SEED DATA SUMMARY';
  RAISE NOTICE '======================================';
  RAISE NOTICE 'Restaurants: %', restaurant_count;
  RAISE NOTICE 'Tables: %', table_count;
  RAISE NOTICE 'Categories: %', category_count;
  RAISE NOTICE 'Menu Items: %', item_count;
  RAISE NOTICE '======================================';
END $$;

COMMIT;

-- ============================================
-- NOTES FOR USAGE:
-- ============================================
-- 1. Make sure you have at least one user created before running this
-- 2. Update the email 'admin@restaurant.com' if needed
-- 3. This creates 3 restaurants with comprehensive menus:
--    - The Golden Spoon (Vietnamese) - 35+ items
--    - Italian Corner (Italian) - 30+ items  
--    - Sushi Paradise (Japanese) - 30+ items
-- 4. Each restaurant gets 15 tables
-- 5. Total: ~95+ menu items across all restaurants
-- ============================================
