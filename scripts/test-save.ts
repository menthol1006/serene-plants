/**
 * 测试产品保存功能
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function testSave() {
  console.log('🧪 测试产品保存功能...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 缺少 Supabase 配置');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 测试产品数据
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
    sku: 'TEST-' + Date.now()
  };

  try {
    console.log('1. 测试插入产品...');
    console.log('   数据:', JSON.stringify(testProduct, null, 2));
    
    const { data, error, status, statusText } = await supabase
      .from('products')
      .insert(testProduct);
    
    console.log('\n2. 响应结果:');
    console.log('   status:', status);
    console.log('   statusText:', statusText);
    console.log('   error:', error);
    console.log('   data:', data);

    if (error) {
      console.log('\n❌ 保存失败！');
      console.log('   错误代码:', error.code);
      console.log('   错误消息:', error.message);
      
      if (error.code === 'PGRST204') {
        console.log('\n💡 这是 schema cache 问题！');
        console.log('   请在 Supabase SQL Editor 中执行：');
        console.log('   NOTIFY pgrst, \'reload schema\';');
      }
    } else {
      console.log('\n✅ 保存成功！');
      
      // 清理测试数据
      console.log('\n3. 清理测试数据...');
      await supabase.from('products').delete().eq('id', testProduct.id);
      console.log('   ✅ 已清理');
    }

  } catch (err: any) {
    console.error('\n❌ 异常错误:', err.message);
    console.error('   完整错误:', err);
  }

  process.exit(0);
}

testSave();
