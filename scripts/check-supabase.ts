/**
 * 检查 Supabase 表结构
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function checkSupabase() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 尝试查询现有表结构
    console.log('1. 尝试查询 Supabase 中的数据...\n');
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ 无法查询 products 表:', error.message);
      } else {
        console.log('✅ products 表存在，数据结构:');
        if (data && data.length > 0) {
          console.log('列名:', Object.keys(data[0]));
        } else {
          console.log('表存在但是空的');
        }
      }
    } catch (e: any) {
      console.log('❌ 查询失败:', e.message);
    }

    console.log('\n2. 列出所有可访问的表...');
    
    try {
      const { data, error } = await supabase
        .rpc('get_tables')
        .select('*')
        .limit(10);
      
      if (error) {
        console.log('⚠️ 无法直接列出所有表:', error.message);
      } else if (data) {
        console.log('表列表:', data);
      }
    } catch (e) {
      // 忽略这个方法
    }

    console.log('\n💡 建议:');
    console.log('1. 登录 Supabase 控制台');
    console.log('2. 进入项目');
    console.log('3. 点击左侧 "SQL Editor"');
    console.log('4. 粘贴以下 SQL 并执行：');
    console.log(`
-- 创建 products 表（使用正确的列名）
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  material TEXT NOT NULL,
  supplier TEXT NOT NULL,
  description TEXT NOT NULL,
  "costPrice" NUMERIC NOT NULL,
  "marketPrice" NUMERIC NOT NULL,
  stock INTEGER NOT NULL,
  image TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
  sku TEXT NOT NULL
);

-- 创建 activities 表
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  "productName" TEXT NOT NULL,
  action TEXT NOT NULL,
  amount TEXT,
  time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inventory', 'price', 'alert'))
);

-- 启用 RLS（Row Level Security）- 允许公开读写
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 允许所有人都可以读写产品表
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users"
ON products FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON products;
CREATE POLICY "Enable insert access for all users"
ON products FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON products;
CREATE POLICY "Enable update access for all users"
ON products FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON products;
CREATE POLICY "Enable delete access for all users"
ON products FOR DELETE
USING (true);

-- 允许所有人都可以读写活动日志表
DROP POLICY IF EXISTS "Enable read access for all users" ON activities;
CREATE POLICY "Enable read access for all users"
ON activities FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON activities;
CREATE POLICY "Enable insert access for all users"
ON activities FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON activities;
CREATE POLICY "Enable update access for all users"
ON activities FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON activities;
CREATE POLICY "Enable delete access for all users"
ON activities FOR DELETE
USING (true);

-- 启用实时功能
BEGIN;
DROP publication IF EXISTS supabase_realtime;
CREATE publication supabase_realtime FOR TABLE products, activities;
COMMIT;
    `);

  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkSupabase();
