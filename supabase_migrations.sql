-- Stock Dashboard Supabase Migrations
-- Run these SQL commands in your Supabase SQL Editor

-- ================================================
-- 1. Create stock_metadata table
-- ================================================
CREATE TABLE IF NOT EXISTS stock_metadata (
    ticker TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    sector TEXT DEFAULT 'Unknown',
    market_cap BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) but allow all operations for now
ALTER TABLE stock_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
DROP POLICY IF EXISTS "Allow all" ON stock_metadata;
CREATE POLICY "Allow all" ON stock_metadata FOR ALL USING (true);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_stock_metadata_sector ON stock_metadata(sector);

-- ================================================
-- 2. Create stock_prices table
-- ================================================
CREATE TABLE IF NOT EXISTS stock_prices (
    ticker TEXT PRIMARY KEY REFERENCES stock_metadata(ticker) ON DELETE CASCADE,
    current_price DECIMAL(12,2),
    high_30d DECIMAL(12,2),
    high_3mo DECIMAL(12,2),
    high_6mo DECIMAL(12,2),
    high_1yr DECIMAL(12,2),
    change_7d DECIMAL(8,2),
    change_30d DECIMAL(8,2),
    change_90d DECIMAL(8,2),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
DROP POLICY IF EXISTS "Allow all" ON stock_prices;
CREATE POLICY "Allow all" ON stock_prices FOR ALL USING (true);

-- Add index for faster queries on updated_at
CREATE INDEX IF NOT EXISTS idx_stock_prices_updated_at ON stock_prices(updated_at);

-- ================================================
-- 3. Create helper function to update timestamp
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 4. Create triggers for auto-updating timestamps
-- ================================================
DROP TRIGGER IF EXISTS update_stock_metadata_updated_at ON stock_metadata;
CREATE TRIGGER update_stock_metadata_updated_at
    BEFORE UPDATE ON stock_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stock_prices_updated_at ON stock_prices;
CREATE TRIGGER update_stock_prices_updated_at
    BEFORE UPDATE ON stock_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Verification queries (optional - run after setup)
-- ================================================
-- Check tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check policies
-- SELECT * FROM pg_policies WHERE tablename IN ('stock_metadata', 'stock_prices');


