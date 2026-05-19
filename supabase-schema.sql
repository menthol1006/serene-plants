-- ================================================
-- Supabase 数据库完整设置
-- ================================================

-- 1. 删除已存在的表（如果有）以避免冲突
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS products;

-- ================================================
-- 2. 创建 products 表
-- ================================================
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  material TEXT NOT NULL,
  supplier TEXT NOT NULL,
  description TEXT NOT NULL,
  costPrice NUMERIC NOT NULL,
  marketPrice NUMERIC NOT NULL,
  stock INTEGER NOT NULL,
  image TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
  sku TEXT NOT NULL
);

-- ================================================
-- 3. 创建 activities 表
-- ================================================
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  productName TEXT NOT NULL,
  action TEXT NOT NULL,
  amount TEXT,
  time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inventory', 'price', 'alert'))
);

-- ================================================
-- 4. 启用 RLS (Row Level Security) 并设置策略
-- ================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Products 表权限策略
DROP POLICY IF EXISTS "Allow all for products" ON products;
CREATE POLICY "Allow all for products"
ON products
FOR ALL
USING (true)
WITH CHECK (true);

-- Activities 表权限策略
DROP POLICY IF EXISTS "Allow all for activities" ON activities;
CREATE POLICY "Allow all for activities"
ON activities
FOR ALL
USING (true)
WITH CHECK (true);

-- ================================================
-- 5. 启用实时功能
-- ================================================
BEGIN;
DROP publication IF EXISTS supabase_realtime;
CREATE publication supabase_realtime FOR TABLE products, activities;
COMMIT;

-- ================================================
-- 完成！现在运行 init-supabase.ts 来初始化数据
-- ================================================
