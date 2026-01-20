-- Add discount and tax columns to bill_requests table
-- Run this in Supabase SQL Editor

-- Check if columns exist, add them if not
DO $$ 
BEGIN
    -- Add discount_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bill_requests' AND column_name = 'discount_type'
    ) THEN
        ALTER TABLE bill_requests ADD COLUMN discount_type VARCHAR(20) DEFAULT 'none';
    END IF;

    -- Add discount_value column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bill_requests' AND column_name = 'discount_value'
    ) THEN
        ALTER TABLE bill_requests ADD COLUMN discount_value DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Add discount_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bill_requests' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE bill_requests ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Add tax_rate column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bill_requests' AND column_name = 'tax_rate'
    ) THEN
        ALTER TABLE bill_requests ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
    END IF;

    -- Add tax_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bill_requests' AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE bill_requests ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Add final_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bill_requests' AND column_name = 'final_amount'
    ) THEN
        ALTER TABLE bill_requests ADD COLUMN final_amount DECIMAL(12,2);
    END IF;

    -- Add discount_applied_by column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bill_requests' AND column_name = 'discount_applied_by'
    ) THEN
        ALTER TABLE bill_requests ADD COLUMN discount_applied_by UUID;
    END IF;

    -- Add discount_applied_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bill_requests' AND column_name = 'discount_applied_at'
    ) THEN
        ALTER TABLE bill_requests ADD COLUMN discount_applied_at TIMESTAMP;
    END IF;

    -- Add foreign key constraint if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'bill_requests' 
        AND constraint_name = 'fk_discount_applied_by'
    ) THEN
        ALTER TABLE bill_requests 
        ADD CONSTRAINT fk_discount_applied_by 
        FOREIGN KEY (discount_applied_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;

END $$;

-- Update existing records to sync final_amount with total_amount
UPDATE bill_requests 
SET final_amount = total_amount 
WHERE final_amount IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN bill_requests.discount_type IS 'Type of discount: percentage, fixed, or none';
COMMENT ON COLUMN bill_requests.discount_value IS 'Discount value (percentage or fixed amount)';
COMMENT ON COLUMN bill_requests.discount_amount IS 'Calculated discount amount';
COMMENT ON COLUMN bill_requests.tax_rate IS 'Tax rate as percentage';
COMMENT ON COLUMN bill_requests.tax_amount IS 'Calculated tax amount';
COMMENT ON COLUMN bill_requests.final_amount IS 'Final amount after discount and tax';

SELECT 'Migration completed successfully!' as status;
