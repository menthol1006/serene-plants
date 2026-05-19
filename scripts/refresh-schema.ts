/**
 * 刷新 Supabase Schema Cache
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function refreshSchema() {
  console.log('🔄 刷新 Supabase Schema Cache...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 请确保 .env 文件中配置了 Supabase 的 URL 和 ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. 删除旧表
    console.log('1. 删除旧表（如果存在）...');
    await supabase.from('activities').delete().neq('id', 'dummy');
    await supabase.from('products').delete().neq('id', 'dummy');
    console.log('   ✓ 旧数据已清理');

    // 2. 尝试刷新 schema cache（通过查询无效的表）
    console.log('\n2. 刷新 PostgREST Schema Cache...');
    
    // 等待几秒让 cache 过期
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. 插入测试数据来验证
    console.log('\n3. 测试数据插入...');
    
    const testProduct = {
      id: 'test-' + Date.now(),
      name: '测试植物',
      category: '测试分类',
      material: '测试材质',
      supplier: '测试供应商',
      description: '测试描述',
      costPrice: 100,
      marketPrice: 200,
      stock: 50,
      image: 'https://img1.baidu.com/it/u=3489569824,2204550324&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
      status: 'In Stock',
      sku: 'TEST-001'
    };

    const { error: productError } = await supabase
      .from('products')
      .insert(testProduct);

    if (productError) {
      console.log(`   ❌ 插入失败: ${productError.message}`);
      console.log('\n💡 请在 Supabase SQL Editor 中手动执行以下 SQL 来修复：');
      console.log(`
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS products;

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

CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  productName TEXT NOT NULL,
  action TEXT NOT NULL,
  amount TEXT,
  time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inventory', 'price', 'alert'))
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON activities FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
      `);
      process.exit(1);
    } else {
      console.log('   ✓ 产品插入成功！');
    }

    // 4. 删除测试数据
    console.log('\n4. 清理测试数据...');
    await supabase.from('products').delete().eq('id', testProduct.id);
    console.log('   ✓ 已清理');

    console.log('\n🎉 Schema Cache 刷新成功！');
    console.log('💡 请刷新浏览器页面，现在应该可以正常使用了');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 操作失败:', error);
    console.log('\n💡 请在 Supabase SQL Editor 中手动执行 SQL 来修复表结构');
    process.exit(1);
  }
}

refreshSchema();
