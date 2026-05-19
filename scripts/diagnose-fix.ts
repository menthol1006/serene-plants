/**
 * Supabase Schema 诊断和修复脚本
 * 这个脚本会：
 * 1. 检查当前表结构
 * 2. 重新创建表（使用前端兼容的列名）
 * 3. 刷新 schema cache
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// 前端代码使用的列名
const PRODUCT_COLUMNS = {
  id: 'text',
  name: 'text',
  category: 'text',
  material: 'text',
  supplier: 'text',
  description: 'text',
  costPrice: 'numeric',
  marketPrice: 'numeric',
  stock: 'integer',
  image: 'text',
  status: 'text',
  sku: 'text'
};

const ACTIVITY_COLUMNS = {
  id: 'text',
  productName: 'text',
  action: 'text',
  amount: 'text',
  time: 'text',
  type: 'text'
};

async function diagnoseAndFix() {
  console.log('🔍 开始诊断 Supabase Schema...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 请确保 .env 文件中配置了 Supabase');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. 检查表是否存在
    console.log('1. 检查现有表结构...');
    
    // 尝试查询 products 表
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productError) {
      console.log(`   ❌ products 表有问题: ${productError.message}`);
      console.log('   💡 需要重新创建表\n');
    } else {
      console.log('   ✅ products 表存在');
      if (productData && productData.length > 0) {
        console.log(`   列名: ${Object.keys(productData[0]).join(', ')}`);
      }
    }

    // 尝试查询 activities 表
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('*')
      .limit(1);
    
    if (activityError) {
      console.log(`   ❌ activities 表有问题: ${activityError.message}`);
      console.log('   💡 需要重新创建表\n');
    } else {
      console.log('   ✅ activities 表存在');
      if (activityData && activityData.length > 0) {
        console.log(`   列名: ${Object.keys(activityData[0]).join(', ')}`);
      }
    }

    // 2. 生成修复 SQL
    console.log('\n2. 生成修复 SQL...');
    
    const createProductsSQL = `
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
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
  status TEXT NOT NULL,
  sku TEXT NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_policy" ON products;
CREATE POLICY "products_policy" ON products FOR ALL USING (true) WITH CHECK (true);
    `.trim();

    const createActivitiesSQL = `
DROP TABLE IF EXISTS activities CASCADE;

CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  "productName" TEXT NOT NULL,
  action TEXT NOT NULL,
  amount TEXT,
  time TEXT NOT NULL,
  type TEXT NOT NULL
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activities_policy" ON activities;
CREATE POLICY "activities_policy" ON activities FOR ALL USING (true) WITH CHECK (true);
    `.trim();

    console.log('   SQL 已准备好');

    // 3. 显示需要执行的 SQL
    console.log('\n3. 请在 Supabase SQL Editor 中执行以下 SQL：\n');
    console.log('='.repeat(60));
    console.log(createProductsSQL);
    console.log('\n---\n');
    console.log(createActivitiesSQL);
    console.log('\n---\n');
    console.log('NOTIFY pgrst, \'reload schema\';');
    console.log('='.repeat(60));

    console.log('\n\n💡 或者，你可以尝试以下方法刷新 cache：');
    console.log('   1. 在 Supabase Dashboard 中进入 Table Editor');
    console.log('   2. 手动创建一个测试行');
    console.log('   3. 然后删除它');
    console.log('   4. 这会强制刷新 schema cache');
    
    console.log('\n🔄 如果上述方法都不行，请尝试：');
    console.log('   1. 登录 Supabase Dashboard');
    console.log('   2. 进入你的项目');
    console.log('   3. 点击左侧 "Database" -> "Replication"');
    console.log('   4. 关闭并重新启用实时功能');
    console.log('   5. 这会强制刷新整个 schema cache');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 诊断失败:', error);
    process.exit(1);
  }
}

diagnoseAndFix();
