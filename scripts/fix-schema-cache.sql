-- ================================================
-- 刷新 Supabase Schema Cache 和修复表结构
-- ================================================

-- 1. 通知 PostgREST 重新加载 schema
NOTIFY pgrst, 'reload schema';

-- 2. 如果表存在但列名不对，删除旧表
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS products;

-- 3. 重新创建 products 表（使用标准列名）
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

-- 4. 重新创建 activities 表（使用标准列名）
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  productName TEXT NOT NULL,
  action TEXT NOT NULL,
  amount TEXT,
  time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inventory', 'price', 'alert'))
);

-- 5. 启用 RLS 并设置策略
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Products 表权限
DROP POLICY IF EXISTS "Allow all for products" ON products;
CREATE POLICY "Allow all for products"
ON products
FOR ALL
USING (true)
WITH CHECK (true);

-- Activities 表权限
DROP POLICY IF EXISTS "Allow all for activities" ON activities;
CREATE POLICY "Allow all for activities"
ON activities
FOR ALL
USING (true)
WITH CHECK (true);

-- 6. 启用实时功能
BEGIN;
DROP publication IF EXISTS supabase_realtime;
CREATE publication supabase_realtime FOR TABLE products, activities;
COMMIT;

-- 7. 再次通知 PostgREST 重新加载
NOTIFY pgrst, 'reload schema';
