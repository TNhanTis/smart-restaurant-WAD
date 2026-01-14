-- Create shopping cart tables
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  session_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carts_customer_id ON carts(customer_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INT NOT NULL,
  special_requests TEXT,
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_menu_item_id ON cart_items(menu_item_id);

CREATE TABLE IF NOT EXISTS cart_item_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_item_id UUID NOT NULL REFERENCES cart_items(id) ON DELETE CASCADE,
  modifier_option_id UUID NOT NULL REFERENCES modifier_options(id),
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_item_modifiers_cart_item_id ON cart_item_modifiers(cart_item_id);
CREATE INDEX idx_cart_item_modifiers_modifier_option_id ON cart_item_modifiers(modifier_option_id);
