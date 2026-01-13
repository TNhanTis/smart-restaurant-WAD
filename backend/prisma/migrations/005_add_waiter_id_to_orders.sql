-- Add waiter_id column to orders table for tracking which waiter handled the order
-- This supports Task 3.19: Waiter Performance Tracking

-- Add waiter_id column (nullable since existing orders don't have a waiter assigned)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waiter_id UUID;

-- Create index for performance queries
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id ON orders(waiter_id);

-- Comment for documentation
COMMENT ON COLUMN orders.waiter_id IS 'ID of the waiter who accepted/handled this order';
