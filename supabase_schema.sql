-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, -- Matches Supabase Auth.uid()
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  address TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'store_owner')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  address TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

-- 2. Create a View for Store Stats
CREATE OR REPLACE VIEW store_stats AS
SELECT 
  s.id,
  s.name,
  s.address,
  s.email,
  s.owner_id,
  COALESCE(AVG(r.rating), 0)::NUMERIC(3,2) as avg_rating,
  COUNT(r.id) as rating_count
FROM stores s
LEFT JOIN ratings r ON s.id = r.store_id
GROUP BY s.id;

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
