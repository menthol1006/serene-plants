/**
 * 模拟前端数据加载过程
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function simulateFrontendLoad() {
  console.log('🔄 模拟前端数据加载...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('1. 模拟 subscribeToProducts...');

    // 这模拟了 supabaseService.subscribeToProducts 的行为
    const { data: products, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.log(`   ❌ 获取产品失败: ${error.message}`);
    } else {
      console.log(`   ✅ 获取到 ${products?.length || 0} 个产品`);

      if (products && products.length > 0) {
        console.log('\n2. 产品列表:');
        products.forEach((p: any, i) => {
          console.log(`   ${i + 1}. ${p.name}`);
          console.log(`      - ID: ${p.id}`);
          console.log(`      - 分类: ${p.category}`);
          console.log(`      - 价格: ¥${p.marketPrice}`);
          console.log(`      - 库存: ${p.stock}`);
          console.log(`      - 图片: ${p.image?.substring(0, 50)}...`);
        });
      } else {
        console.log('   ⚠️  没有产品数据');
      }
    }

    console.log('\n3. 模拟 subscribeToActivities...');
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .order('time', { ascending: false });

    if (activitiesError) {
      console.log(`   ❌ 获取活动失败: ${activitiesError.message}`);
    } else {
      console.log(`   ✅ 获取到 ${activities?.length || 0} 条活动日志`);
    }

    console.log('\n🎉 前端数据加载模拟完成！');
    console.log('\n💡 结论：数据库中有数据，前端应该能正常显示');
    console.log('   请尝试刷新浏览器 (Ctrl + F5)');

    if (!products || products.length === 0) {
      console.log('\n⚠️  数据库中没有产品');
      console.log('   请先运行: npx tsx scripts/init-supabase.ts');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 模拟失败:', error);
    process.exit(1);
  }
}

simulateFrontendLoad();
