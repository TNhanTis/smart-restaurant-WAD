-- Add discount and tax columns to bill_requests table
-- Migration: 006_add_discount_tax_to_bill_requests

-- Add discount columns
ALTER TABLE bill_requests ADD COLUMN discount_type VARCHAR(20) DEFAULT 'none' CHECK (discount_type IN ('percentage', 'fixed', 'none'));
ALTER TABLE bill_requests ADD COLUMN discount_value DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bill_requests ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;

-- Add tax columns
ALTER TABLE bill_requests ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bill_requests ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0;

-- Add final amount (subtotal - discount + tips + tax)
ALTER TABLE bill_requests ADD COLUMN final_amount DECIMAL(12,2);

-- Add metadata
ALTER TABLE bill_requests ADD COLUMN discount_applied_by UUID REFERENCES users(id);
ALTER TABLE bill_requests ADD COLUMN discount_applied_at TIMESTAMP;

-- Update existing records with final_amount = total_amount
UPDATE bill_requests SET final_amount = total_amount WHERE final_amount IS NULL;

-- Add comments
COMMENT ON COLUMN bill_requests.discount_type IS 'Type of discount: percentage, fixed, or none';
COMMENT ON COLUMN bill_requests.discount_value IS 'Discount value (10 for 10% or 10000 for 10000đ)';
COMMENT ON COLUMN bill_requests.discount_amount IS 'Calculated discount amount in VND';
COMMENT ON COLUMN bill_requests.tax_rate IS 'Tax rate in percentage (e.g., 10 for 10%)';
COMMENT ON COLUMN bill_requests.tax_amount IS 'Calculated tax amount in VND';
COMMENT ON COLUMN bill_requests.final_amount IS 'Final amount after discount + tips + tax';
