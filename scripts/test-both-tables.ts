/**
 * 测试产品表和活动表的访问
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function testTables() {
  console.log('🔍 测试两个表的访问...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. 测试 products 表
  console.log('1. 测试 products 表...');
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*');

  if (productsError) {
    console.log('   ❌ products 表访问失败:');
    console.log('   ', productsError);
  } else {
    console.log(`   ✅ products 表访问成功: ${products?.length || 0} 个产品`);
  }

  // 2. 测试 activities 表
  console.log('\n2. 测试 activities 表...');
  const { data: activities, error: activitiesError } = await supabase
    .from('activities')
    .select('*');

  if (activitiesError) {
    console.log('   ❌ activities 表访问失败:');
    console.log('   ', activitiesError);
  } else {
    console.log(`   ✅ activities 表访问成功: ${activities?.length || 0} 条记录`);
  }

  // 3. 诊断
  console.log('\n========================================');
  console.log('诊断结果:');
  console.log('========================================');

  if (!productsError && productsError) {
    console.log('❌ 只有 products 表有问题');
    console.log('💡 可能原因:');
    console.log('   1. products 表的 RLS 策略有问题');
    console.log('   2. products 表不存在或列名不匹配');
  } else if (productsError && !activitiesError) {
    console.log('❌ 两个表都失败');
    console.log('💡 可能原因:');
    console.log('   1. Supabase 连接配置问题');
    console.log('   2. 网络连接问题');
    console.log('   3. API 密钥错误');
  } else if (!productsError && !activitiesError) {
    console.log('✅ 两个表都访问正常');
    console.log('💡 问题可能是:');
    console.log('   1. 浏览器缓存');
    console.log('   2. 前端代码问题');
  }

  process.exit(0);
}

testTables();
