/**
 * 测试实时订阅功能
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function testSubscription() {
  console.log('🔄 测试实时订阅功能...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. 先获取初始数据
    console.log('1. 获取初始产品数据...');
    const { data: initialProducts } = await supabase
      .from('products')
      .select('*');
    
    console.log(`   ✅ 初始产品数: ${initialProducts?.length || 0}`);

    // 2. 测试实时订阅
    console.log('\n2. 启动实时订阅...');
    const channel = supabase
      .channel('test-products')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        console.log(`   📩 收到变更通知:`);
        console.log(`      事件类型: ${payload.eventType}`);
        console.log(`      表名: ${payload.table}`);
        console.log(`      数据: ${JSON.stringify(payload.new?.name || payload.old?.name)}`);
      })
      .subscribe((status) => {
        console.log(`   订阅状态: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('   ✅ 订阅成功！');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('   ❌ 订阅失败！');
        }
      });

    // 3. 等待3秒让订阅稳定
    console.log('\n3. 等待订阅稳定...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. 获取最新数据
    console.log('\n4. 获取最新数据...');
    const { data: latestProducts } = await supabase
      .from('products')
      .select('*');
    
    console.log(`   ✅ 最新产品数: ${latestProducts?.length || 0}`);
    if (latestProducts && latestProducts.length > 0) {
      console.log('   产品列表:');
      latestProducts.forEach((p: any) => {
        console.log(`      - ${p.name}`);
      });
    }

    // 5. 清理
    console.log('\n5. 清理订阅...');
    await supabase.removeChannel(channel);
    console.log('   ✅ 订阅已移除');

    console.log('\n🎉 实时订阅测试完成！');

    if (latestProducts && latestProducts.length > 0) {
      console.log('\n✅ 数据库中有产品，但前端可能没有正确加载');
      console.log('💡 可能的问题:');
      console.log('   1. 前端订阅逻辑有问题');
      console.log('   2. 初始数据获取失败');
      console.log('   3. 组件没有正确处理数据');
    } else {
      console.log('\n❌ 数据库中没有产品');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

testSubscription();
