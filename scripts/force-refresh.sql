-- 强制刷新 Supabase Schema Cache
-- 这个 SQL 会确保表被正确创建并通知 PostgREST 刷新缓存

-- 1. 删除所有旧表（清理可能的损坏结构）
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- 2. 重新创建 products 表（所有列名使用小写，避免大小写问题）
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    material TEXT NOT NULL,
    supplier TEXT NOT NULL,
    description TEXT NOT NULL,
    costprice NUMERIC NOT NULL,
    marketprice NUMERIC NOT NULL,
    stock INTEGER NOT NULL,
    image TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
    sku TEXT NOT NULL
);

-- 3. 重新创建 activities 表
CREATE TABLE activities (
    id TEXT PRIMARY KEY,
    productname TEXT NOT NULL,
    action TEXT NOT NULL,
    amount TEXT,
    time TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('inventory', 'price', 'alert'))
);

-- 4. 启用 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 5. 删除并重新创建策略
DROP POLICY IF EXISTS "allow_all_products" ON products;
DROP POLICY IF EXISTS "allow_all_activities" ON activities;

CREATE POLICY "allow_all_products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_activities" ON activities FOR ALL USING (true) WITH CHECK (true);

-- 6. 启用实时功能
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE products, activities;

-- 7. 通知 PostgREST 刷新 schema cache
NOTIFY pgrst, 'reload schema';

-- 8. 返回验证信息
SELECT 'Schema refreshed successfully!' as status;
SELECT 'products table created' as info FROM products LIMIT 0;
SELECT 'activities table created' as info FROM activities LIMIT 0;
