/**
 * 测试实时订阅功能
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function testRealtime() {
  console.log('🔄 测试实时订阅...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('1. 获取初始数据...');
    const { data: initialData } = await supabase.from('products').select('*');
    console.log(`   当前产品数: ${initialData?.length || 0}`);

    console.log('\n2. 启动实时订阅...');
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        console.log('\n📩 收到变更通知:');
        console.log(`   事件: ${payload.eventType}`);
        console.log(`   表名: ${payload.table}`);
        console.log(`   数据: ${payload.new?.name || payload.old?.name}`);
      })
      .subscribe((status) => {
        console.log(`   订阅状态: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('   ✅ 订阅成功！');
        }
      });

    console.log('\n3. 等待 5 秒，期间可以尝试在前端添加产品...');
    console.log('   按 Ctrl+C 退出测试\n');

    // 等待5秒
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 清理
    console.log('\n4. 清理订阅...');
    await supabase.removeChannel(channel);
    console.log('   ✅ 测试完成');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testRealtime();
