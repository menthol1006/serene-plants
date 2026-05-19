/**
 * 专门测试产品数据获取
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function testProducts() {
  console.log('🔍 专门测试产品数据获取...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('1. 尝试获取产品数据...');
    console.log('   URL:', supabaseUrl);
    
    const start = Date.now();
    const { data, error, status, statusText } = await supabase
      .from('products')
      .select('*');
    const duration = Date.now() - start;
    
    console.log(`   请求耗时: ${duration}ms`);
    console.log(`   HTTP 状态: ${status} ${statusText}`);
    
    if (error) {
      console.log('   ❌ 错误:', error);
      console.log('   错误代码:', error.code);
      console.log('   错误消息:', error.message);
    } else {
      console.log(`   ✅ 成功获取 ${data?.length || 0} 个产品`);
      if (data && data.length > 0) {
        console.log('   产品列表:');
        data.forEach((p: any, i) => {
          console.log(`      ${i + 1}. ${p.name}`);
          console.log(`         - ID: ${p.id}`);
          console.log(`         - 价格: ${p.marketPrice}`);
          console.log(`         - 库存: ${p.stock}`);
        });
      }
    }

    console.log('\n2. 检查数据结构...');
    if (data && data.length > 0) {
      const firstProduct = data[0];
      console.log('   第一个产品的字段:', Object.keys(firstProduct));
      
      // 检查是否缺少必要字段
      const requiredFields = ['id', 'name', 'category', 'costPrice', 'marketPrice', 'stock', 'image'];
      const missingFields = requiredFields.filter(field => !(field in firstProduct));
      
      if (missingFields.length > 0) {
        console.log('   ⚠️  缺少字段:', missingFields);
      } else {
        console.log('   ✅ 所有必要字段都存在');
      }
    }

  } catch (err: any) {
    console.error('\n❌ 异常错误:', err);
    console.error('   错误堆栈:', err.stack);
  }

  process.exit(0);
}

testProducts();
